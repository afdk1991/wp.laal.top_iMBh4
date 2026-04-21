/**
 * 用户服务 - 微服务架构
 * 版本: v1.0.0.0
 */

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 初始化数据库
const sqliteDB = require('../../../../src/open/api/utils/database.sqlite');

// 初始化缓存
const cacheService = require('../../../../src/open/api/utils/cache');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const aiRoutes = require('./routes/ai');

// 导入中间件
const authMiddleware = require('./middleware/auth');
const securityMiddleware = require('./middleware/security');
const enhancedSecurity = require('../../../../src/open/api/middleware/enhanced-security');

// 导入工具
const logger = require('../../../../src/open/api/utils/logger');
const kafkaService = require('./utils/kafka');

// 创建 Express 应用
const app = express();

// 服务配置
const PORT = process.env.USER_SERVICE_PORT || 3001;
const SERVICE_NAME = 'user-service';

// 中间件配置
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:3001'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 安全中间件
app.use(securityMiddleware.rateLimit);
app.use(securityMiddleware.xssProtection);
app.use(securityMiddleware.csrfProtection);

// 增强安全中间件
app.use(enhancedSecurity.securityLogger);
app.use(enhancedSecurity.encryptSensitiveData);
app.use(enhancedSecurity.decryptSensitiveData);
app.use(enhancedSecurity.validateApiKey);

// 健康检查
app.get('/health', async (req, res) => {
  try {
    const dbStatus = await sqliteDB.healthCheck();
    const cacheStatus = await cacheService.healthCheck();

    res.status(200).json({
      status: 'success',
      data: {
        service: SERVICE_NAME,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbStatus,
        cache: cacheStatus,
      },
    });
  } catch (error) {
    logger.error('健康检查失败:', error);
    res.status(503).json({
      status: 'error',
      data: {
        service: SERVICE_NAME,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
    });
  }
});

// API 路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', authMiddleware.authenticate, userRoutes);
app.use('/api/v1/ai', authMiddleware.authenticate, aiRoutes);

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '接口不存在',
  });
});

// 错误处理中间件
app.use((err, req, res) => {
  logger.error('服务错误:', err);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误',
  });
});

// 消息处理函数
const handleKafkaMessage = async ({ topic, message }) => {
  try {
    const { value } = message;
    const parsedValue = value ? JSON.parse(value) : null;

    switch (topic) {
      case 'user-registered':
        logger.info('处理用户注册消息:', parsedValue);
        // 处理用户注册逻辑
        break;
      case 'user-updated':
        logger.info('处理用户更新消息:', parsedValue);
        // 处理用户更新逻辑
        break;
      case 'user-deleted':
        logger.info('处理用户删除消息:', parsedValue);
        // 处理用户删除逻辑
        break;
      default:
        logger.info('未知主题消息:', topic);
    }
  } catch (error) {
    logger.error('处理 Kafka 消息失败:', error);
  }
};

// 启动服务
const startServer = async () => {
  try {
    // 初始化数据库
    await sqliteDB.initDB();
    logger.info('数据库初始化成功');

    // 初始化缓存
    await cacheService.init();
    logger.info('缓存服务初始化成功');

    // 初始化 Kafka
    try {
      // 创建必要的主题
      const topics = ['user-registered', 'user-updated', 'user-deleted', 'user-login', 'user-logout'];
      for (const topic of topics) {
        await kafkaService.createTopic(topic);
      }

      // 初始化生产者
      await kafkaService.initProducer();

      // 初始化消费者
      await kafkaService.initConsumer('user-service-group', topics, handleKafkaMessage);

      logger.info('Kafka 服务初始化成功');
    } catch (kafkaError) {
      logger.warn('Kafka 初始化失败，服务将继续运行:', kafkaError.message);
    }

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`${SERVICE_NAME} 服务启动成功，监听端口: ${PORT}`);
      logger.info(`健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('服务启动失败:', error);
    process.exit(1);
  }
};

// 启动服务
startServer();

module.exports = { app };
