const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const NodeCache = require('node-cache');
const { Sequelize } = require('sequelize');

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

const PORT = process.env.OPERATION_PLATFORM_PORT || 3018;

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

// 数据库连接
const sequelize = new Sequelize(
  process.env.MYSQL_DATABASE || 'mixmlaal',
  process.env.MYSQL_USER || 'mixmlaal',
  process.env.MYSQL_PASSWORD || 'mixmlaal',
  {
    host: process.env.MYSQL_HOST || 'mysql',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

// 测试数据库连接
const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('数据库连接成功');
  } catch (error) {
    logger.error('数据库连接失败:', error);
  }
};

testDbConnection();

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟运营数据
const generateOperationData = () => {
  return {
    totalUsers: Math.floor(Math.random() * 10000) + 50000,
    totalOrders: Math.floor(Math.random() * 5000) + 20000,
    totalRevenue: Math.floor(Math.random() * 1000000) + 5000000,
    activeUsers: Math.floor(Math.random() * 1000) + 5000,
    pendingOrders: Math.floor(Math.random() * 500) + 1000,
    completedOrders: Math.floor(Math.random() * 1000) + 4000,
    averageOrderValue: Math.floor(Math.random() * 100) + 500,
    userGrowthRate: (Math.random() * 10).toFixed(2),
    orderGrowthRate: (Math.random() * 15).toFixed(2),
    revenueGrowthRate: (Math.random() * 20).toFixed(2)
  };
};

// 模拟用户数据
const generateUserData = () => {
  return [
    { id: 1, username: 'user1', email: 'user1@example.com', status: 'active', lastLogin: new Date().toISOString() },
    { id: 2, username: 'user2', email: 'user2@example.com', status: 'active', lastLogin: new Date().toISOString() },
    { id: 3, username: 'user3', email: 'user3@example.com', status: 'inactive', lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 4, username: 'user4', email: 'user4@example.com', status: 'active', lastLogin: new Date().toISOString() },
    { id: 5, username: 'user5', email: 'user5@example.com', status: 'active', lastLogin: new Date().toISOString() }
  ];
};

// 模拟订单数据
const generateOrderData = () => {
  return [
    { id: 1, orderId: 'ORD-2026-001', userId: 1, amount: 500, status: 'completed', createdAt: new Date().toISOString() },
    { id: 2, orderId: 'ORD-2026-002', userId: 2, amount: 1000, status: 'pending', createdAt: new Date().toISOString() },
    { id: 3, orderId: 'ORD-2026-003', userId: 3, amount: 300, status: 'canceled', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 4, orderId: 'ORD-2026-004', userId: 4, amount: 800, status: 'completed', createdAt: new Date().toISOString() },
    { id: 5, orderId: 'ORD-2026-005', userId: 5, amount: 1200, status: 'pending', createdAt: new Date().toISOString() }
  ];
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'operation-platform',
    timestamp: new Date().toISOString(),
    local_cache_size: localCache.getStats().keys,
    redis_connected: redisClient ? redisClient.isReady : false
  });
});

// 版本信息
app.get('/version', (req, res) => {
  res.json({ 
    version: '0.0.0.4',
    service: 'operation-platform' 
  });
});

// 获取运营数据
app.get('/dashboard', (req, res) => {
  try {
    const operationData = generateOperationData();
    
    // 缓存数据
    localCache.set('operation:dashboard', operationData);
    if (redisClient && redisClient.isReady) {
      redisClient.set('operation:dashboard', JSON.stringify(operationData), {
        EX: 300
      });
    }
    
    res.json({
      status: 'success',
      data: operationData
    });
  } catch (error) {
    logger.error('获取运营数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 获取用户数据
app.get('/users', (req, res) => {
  try {
    const userData = generateUserData();
    
    // 缓存数据
    localCache.set('operation:users', userData);
    if (redisClient && redisClient.isReady) {
      redisClient.set('operation:users', JSON.stringify(userData), {
        EX: 300
      });
    }
    
    res.json({
      status: 'success',
      data: userData
    });
  } catch (error) {
    logger.error('获取用户数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 获取订单数据
app.get('/orders', (req, res) => {
  try {
    const orderData = generateOrderData();
    
    // 缓存数据
    localCache.set('operation:orders', orderData);
    if (redisClient && redisClient.isReady) {
      redisClient.set('operation:orders', JSON.stringify(orderData), {
        EX: 300
      });
    }
    
    res.json({
      status: 'success',
      data: orderData
    });
  } catch (error) {
    logger.error('获取订单数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 获取服务状态
app.get('/services', (req, res) => {
  try {
    const services = [
      { name: 'user-service', status: 'healthy', responseTime: Math.floor(Math.random() * 100) + 50 },
      { name: 'ride-service', status: 'healthy', responseTime: Math.floor(Math.random() * 100) + 50 },
      { name: 'ecommerce-service', status: 'healthy', responseTime: Math.floor(Math.random() * 100) + 50 },
      { name: 'payment-service', status: 'healthy', responseTime: Math.floor(Math.random() * 100) + 50 },
      { name: 'order-service', status: 'healthy', responseTime: Math.floor(Math.random() * 100) + 50 }
    ];
    
    res.json({
      status: 'success',
      data: services
    });
  } catch (error) {
    logger.error('获取服务状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 导出数据
app.get('/export', (req, res) => {
  try {
    const { type } = req.query;
    
    let data;
    switch (type) {
      case 'users':
        data = generateUserData();
        break;
      case 'orders':
        data = generateOrderData();
        break;
      case 'dashboard':
        data = generateOperationData();
        break;
      default:
        data = { message: 'Invalid export type' };
    }
    
    res.json({
      status: 'success',
      data,
      exportTime: new Date().toISOString()
    });
  } catch (error) {
    logger.error('导出数据错误:', error);
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
  
  // 接收运营数据请求
  socket.on('request_dashboard_data', () => {
    const operationData = generateOperationData();
    socket.emit('dashboard_data', operationData);
  });
  
  // 接收用户数据请求
  socket.on('request_user_data', () => {
    const userData = generateUserData();
    socket.emit('user_data', userData);
  });
  
  // 接收订单数据请求
  socket.on('request_order_data', () => {
    const orderData = generateOrderData();
    socket.emit('order_data', orderData);
  });
  
  // 断开连接处理
  socket.on('disconnect', () => {
    logger.info(`WebSocket连接断开: ${socket.id}`);
  });
});

// 定期发送运营数据更新
setInterval(() => {
  const operationData = generateOperationData();
  io.emit('dashboard_update', operationData);
}, 30000); // 每30秒更新一次

// 启动服务
server.listen(PORT, () => {
  logger.info(`Operation Platform Service started on port ${PORT}`);
  console.log(`Operation Platform Service started on port ${PORT}`);
});

module.exports = app;