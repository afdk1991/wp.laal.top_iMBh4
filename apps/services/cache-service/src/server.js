const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const dotenv = require('dotenv');
const { createClient } = require('redis');
const NodeCache = require('node-cache');

// 加载环境变量
dotenv.config();

// 配置日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();
const PORT = process.env.CACHE_SERVICE_PORT || 3015;

// 本地缓存
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Redis客户端
let redisClient;

// 初始化Redis连接
const initRedis = async () => {
  try {
    const redisHost = process.env.REDIS_HOST || 'redis';
    const redisPort = process.env.REDIS_PORT || 6379;
    
    redisClient = createClient({
      url: `redis://${redisHost}:${redisPort}`
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis客户端错误:', err);
    });
    
    await redisClient.connect();
    logger.info('Redis连接成功');
  } catch (error) {
    logger.error('Redis初始化失败:', error);
  }
};

// 初始化Redis连接
initRedis();

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'cache-service',
    timestamp: new Date().toISOString(),
    local_cache_size: localCache.getStats().keys,
    redis_connected: redisClient ? redisClient.isReady : false
  });
});

// 版本信息
app.get('/version', (req, res) => {
  res.json({ 
    version: '0.0.0.4',
    service: 'cache-service' 
  });
});

// 设置缓存
app.post('/cache/set', async (req, res) => {
  try {
    const { key, value, ttl = 300, level = 'both' } = req.body;
    
    // 设置本地缓存
    if (level === 'local' || level === 'both') {
      localCache.set(key, value, ttl);
    }
    
    // 设置Redis缓存
    if (level === 'redis' || level === 'both') {
      if (redisClient && redisClient.isReady) {
        await redisClient.set(key, JSON.stringify(value), {
          EX: ttl
        });
      }
    }
    
    res.json({
      status: 'success',
      message: '缓存设置成功'
    });
  } catch (error) {
    logger.error('设置缓存错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 获取缓存
app.get('/cache/get', async (req, res) => {
  try {
    const { key, level = 'both' } = req.query;
    
    let value = null;
    
    // 从本地缓存获取
    if (level === 'local' || level === 'both') {
      value = localCache.get(key);
      if (value) {
        return res.json({
          status: 'success',
          data: value,
          source: 'local'
        });
      }
    }
    
    // 从Redis缓存获取
    if ((level === 'redis' || level === 'both') && !value) {
      if (redisClient && redisClient.isReady) {
        const redisValue = await redisClient.get(key);
        if (redisValue) {
          value = JSON.parse(redisValue);
          // 将Redis缓存同步到本地缓存
          localCache.set(key, value);
          return res.json({
            status: 'success',
            data: value,
            source: 'redis'
          });
        }
      }
    }
    
    res.json({
      status: 'success',
      data: null,
      source: 'none'
    });
  } catch (error) {
    logger.error('获取缓存错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 删除缓存
app.delete('/cache/delete', async (req, res) => {
  try {
    const { key, level = 'both' } = req.query;
    
    // 删除本地缓存
    if (level === 'local' || level === 'both') {
      localCache.del(key);
    }
    
    // 删除Redis缓存
    if (level === 'redis' || level === 'both') {
      if (redisClient && redisClient.isReady) {
        await redisClient.del(key);
      }
    }
    
    res.json({
      status: 'success',
      message: '缓存删除成功'
    });
  } catch (error) {
    logger.error('删除缓存错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 清除所有缓存
app.post('/cache/clear', async (req, res) => {
  try {
    const { level = 'both' } = req.body;
    
    // 清除本地缓存
    if (level === 'local' || level === 'both') {
      localCache.flushAll();
    }
    
    // 清除Redis缓存
    if (level === 'redis' || level === 'both') {
      if (redisClient && redisClient.isReady) {
        await redisClient.flushAll();
      }
    }
    
    res.json({
      status: 'success',
      message: '缓存清除成功'
    });
  } catch (error) {
    logger.error('清除缓存错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 获取缓存状态
app.get('/cache/status', (req, res) => {
  try {
    const localStats = localCache.getStats();
    const redisConnected = redisClient ? redisClient.isReady : false;
    
    res.json({
      status: 'success',
      data: {
        local_cache: {
          keys: localStats.keys,
          hits: localStats.hits,
          misses: localStats.misses,
          ratio: localStats.hits / (localStats.hits + localStats.misses) || 0
        },
        redis: {
          connected: redisConnected
        }
      }
    });
  } catch (error) {
    logger.error('获取缓存状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 启动服务
app.listen(PORT, () => {
  logger.info(`Cache Service started on port ${PORT}`);
  console.log(`Cache Service started on port ${PORT}`);
});

module.exports = app;