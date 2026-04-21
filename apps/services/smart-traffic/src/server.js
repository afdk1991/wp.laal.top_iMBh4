const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const NodeCache = require('node-cache');
const math = require('mathjs');

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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.SMART_TRAFFIC_PORT || 3016;

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

// 模拟交通数据
const generateTrafficData = () => {
  const roads = [
    { id: 'road1', name: '中山路', length: 5000, speed: Math.floor(Math.random() * 40) + 20, congestion: Math.floor(Math.random() * 100) },
    { id: 'road2', name: '解放路', length: 3000, speed: Math.floor(Math.random() * 40) + 20, congestion: Math.floor(Math.random() * 100) },
    { id: 'road3', name: '人民路', length: 4000, speed: Math.floor(Math.random() * 40) + 20, congestion: Math.floor(Math.random() * 100) },
    { id: 'road4', name: '建国路', length: 6000, speed: Math.floor(Math.random() * 40) + 20, congestion: Math.floor(Math.random() * 100) },
    { id: 'road5', name: '和平路', length: 2500, speed: Math.floor(Math.random() * 40) + 20, congestion: Math.floor(Math.random() * 100) }
  ];
  return roads;
};

// 预测交通状况
const predictTraffic = (roadId, hours) => {
  // 简单的线性预测模型
  const baseSpeed = 30;
  const baseCongestion = 50;
  const speedVariation = Math.sin(hours / 4) * 10;
  const congestionVariation = Math.cos(hours / 4) * 20;
  
  return {
    roadId,
    predictedSpeed: Math.max(10, Math.min(60, baseSpeed + speedVariation)),
    predictedCongestion: Math.max(0, Math.min(100, baseCongestion + congestionVariation)),
    predictedTime: new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
  };
};

// 规划最优路径
const planRoute = (start, end) => {
  // 简单的路径规划算法
  const routes = [
    {
      id: 'route1',
      path: [start, 'road1', 'road3', end],
      distance: 8000,
      estimatedTime: 12,
      congestionLevel: 3
    },
    {
      id: 'route2',
      path: [start, 'road2', 'road4', end],
      distance: 9000,
      estimatedTime: 15,
      congestionLevel: 2
    },
    {
      id: 'route3',
      path: [start, 'road5', 'road1', 'road3', end],
      distance: 10500,
      estimatedTime: 18,
      congestionLevel: 1
    }
  ];
  
  // 选择最优路径（时间最短）
  return routes.sort((a, b) => a.estimatedTime - b.estimatedTime)[0];
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'smart-traffic',
    timestamp: new Date().toISOString(),
    local_cache_size: localCache.getStats().keys,
    redis_connected: redisClient ? redisClient.isReady : false
  });
});

// 版本信息
app.get('/version', (req, res) => {
  res.json({ 
    version: '0.0.0.4',
    service: 'smart-traffic' 
  });
});

// 获取实时交通数据
app.get('/traffic/realtime', (req, res) => {
  try {
    const trafficData = generateTrafficData();
    
    // 缓存数据
    localCache.set('traffic:realtime', trafficData);
    if (redisClient && redisClient.isReady) {
      redisClient.set('traffic:realtime', JSON.stringify(trafficData), {
        EX: 300
      });
    }
    
    res.json({
      status: 'success',
      data: trafficData
    });
  } catch (error) {
    logger.error('获取实时交通数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 预测交通状况
app.post('/traffic/predict', (req, res) => {
  try {
    const { roadId, hours } = req.body;
    
    const prediction = predictTraffic(roadId, hours);
    
    // 缓存预测结果
    localCache.set(`traffic:predict:${roadId}:${hours}`, prediction);
    if (redisClient && redisClient.isReady) {
      redisClient.set(`traffic:predict:${roadId}:${hours}`, JSON.stringify(prediction), {
        EX: 3600
      });
    }
    
    res.json({
      status: 'success',
      data: prediction
    });
  } catch (error) {
    logger.error('预测交通状况错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 规划路径
app.post('/route/plan', (req, res) => {
  try {
    const { start, end } = req.body;
    
    const route = planRoute(start, end);
    
    // 缓存路径规划结果
    localCache.set(`route:${start}:${end}`, route);
    if (redisClient && redisClient.isReady) {
      redisClient.set(`route:${start}:${end}`, JSON.stringify(route), {
        EX: 1800
      });
    }
    
    res.json({
      status: 'success',
      data: route
    });
  } catch (error) {
    logger.error('规划路径错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 检测交通事件
app.post('/traffic/event/detect', (req, res) => {
  try {
    const { location, timestamp, eventType } = req.body;
    
    const event = {
      id: `event-${Date.now()}`,
      location,
      timestamp,
      eventType,
      status: 'active',
      severity: Math.floor(Math.random() * 5) + 1
    };
    
    // 广播事件到WebSocket客户端
    io.emit('traffic_event', event);
    
    res.json({
      status: 'success',
      data: event
    });
  } catch (error) {
    logger.error('检测交通事件错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// WebSocket连接处理
io.on('connection', (socket) => {
  logger.info(`新的WebSocket连接: ${socket.id}`);
  
  // 发送连接成功消息
  socket.emit('connection_success', {
    message: '连接成功',
    socket_id: socket.id
  });
  
  // 接收实时交通数据请求
  socket.on('request_traffic_data', () => {
    const trafficData = generateTrafficData();
    socket.emit('traffic_data', trafficData);
  });
  
  // 接收路径规划请求
  socket.on('request_route', (data) => {
    const { start, end } = data;
    const route = planRoute(start, end);
    socket.emit('route_result', route);
  });
  
  // 断开连接处理
  socket.on('disconnect', () => {
    logger.info(`WebSocket连接断开: ${socket.id}`);
  });
});

// 定期发送交通数据更新
setInterval(() => {
  const trafficData = generateTrafficData();
  io.emit('traffic_update', trafficData);
}, 30000); // 每30秒更新一次

// 启动服务
server.listen(PORT, () => {
  logger.info(`Smart Traffic Service started on port ${PORT}`);
  console.log(`Smart Traffic Service started on port ${PORT}`);
});

module.exports = app;