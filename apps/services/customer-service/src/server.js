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

const PORT = process.env.CUSTOMER_SERVICE_PORT || 3019;

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

// 模拟工单数据
const generateTicketData = () => {
  return [
    { id: 1, ticketId: 'TICKET-2026-001', userId: 1, title: '订单未送达', status: 'open', priority: 'high', createdAt: new Date().toISOString() },
    { id: 2, ticketId: 'TICKET-2026-002', userId: 2, title: '退款申请', status: 'in_progress', priority: 'medium', createdAt: new Date().toISOString() },
    { id: 3, ticketId: 'TICKET-2026-003', userId: 3, title: '账户登录问题', status: 'closed', priority: 'low', createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: 4, ticketId: 'TICKET-2026-004', userId: 4, title: '商品质量问题', status: 'open', priority: 'high', createdAt: new Date().toISOString() },
    { id: 5, ticketId: 'TICKET-2026-005', userId: 5, title: '优惠券使用问题', status: 'in_progress', priority: 'medium', createdAt: new Date().toISOString() }
  ];
};

// 模拟智能客服回复
const generateChatResponse = (message) => {
  const responses = {
    '你好': '您好！很高兴为您服务，有什么可以帮助您的吗？',
    '订单': '关于订单问题，请问您的订单号是多少？',
    '退款': '关于退款问题，请问您的退款原因是什么？',
    '登录': '关于登录问题，请问您遇到了什么具体问题？',
    '商品': '关于商品问题，请问您购买的是什么商品？',
    '优惠券': '关于优惠券问题，请问您的优惠券代码是什么？'
  };
  
  for (const [key, value] of Object.entries(responses)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  return '抱歉，我不太理解您的问题，请您详细描述一下，好吗？';
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'customer-service',
    timestamp: new Date().toISOString(),
    local_cache_size: localCache.getStats().keys,
    redis_connected: redisClient ? redisClient.isReady : false
  });
});

// 版本信息
app.get('/version', (req, res) => {
  res.json({ 
    version: '0.0.0.4',
    service: 'customer-service' 
  });
});

// 获取工单列表
app.get('/tickets', (req, res) => {
  try {
    const ticketData = generateTicketData();
    
    // 缓存数据
    localCache.set('customer:tickets', ticketData);
    if (redisClient && redisClient.isReady) {
      redisClient.set('customer:tickets', JSON.stringify(ticketData), {
        EX: 300
      });
    }
    
    res.json({
      status: 'success',
      data: ticketData
    });
  } catch (error) {
    logger.error('获取工单列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 创建工单
app.post('/tickets', (req, res) => {
  try {
    const { userId, title, description, priority } = req.body;
    
    const newTicket = {
      id: Date.now(),
      ticketId: `TICKET-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      userId,
      title,
      description,
      status: 'open',
      priority: priority || 'medium',
      createdAt: new Date().toISOString()
    };
    
    // 广播新工单到WebSocket客户端
    io.emit('new_ticket', newTicket);
    
    res.json({
      status: 'success',
      data: newTicket
    });
  } catch (error) {
    logger.error('创建工单错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 更新工单状态
app.put('/tickets/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignee } = req.body;
    
    const update = {
      id,
      status,
      assignee,
      updatedAt: new Date().toISOString()
    };
    
    // 广播工单更新到WebSocket客户端
    io.emit('ticket_update', update);
    
    res.json({
      status: 'success',
      data: update
    });
  } catch (error) {
    logger.error('更新工单状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 智能客服聊天
app.post('/chat', (req, res) => {
  try {
    const { message, userId } = req.body;
    
    const response = generateChatResponse(message);
    
    const chatMessage = {
      id: Date.now(),
      userId,
      message,
      response,
      timestamp: new Date().toISOString()
    };
    
    // 广播聊天消息到WebSocket客户端
    io.emit('chat_message', chatMessage);
    
    res.json({
      status: 'success',
      data: chatMessage
    });
  } catch (error) {
    logger.error('智能客服聊天错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 获取客服统计数据
app.get('/stats', (req, res) => {
  try {
    const stats = {
      totalTickets: 150,
      openTickets: 30,
      inProgressTickets: 50,
      closedTickets: 70,
      averageResolutionTime: 24,
      customerSatisfaction: 4.5
    };
    
    res.json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    logger.error('获取客服统计数据错误:', error);
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
  
  // 接收工单列表请求
  socket.on('request_tickets', () => {
    const ticketData = generateTicketData();
    socket.emit('tickets', ticketData);
  });
  
  // 接收聊天消息
  socket.on('chat_message', (data) => {
    const { message, userId } = data;
    const response = generateChatResponse(message);
    const chatMessage = {
      id: Date.now(),
      userId,
      message,
      response,
      timestamp: new Date().toISOString()
    };
    socket.emit('chat_response', chatMessage);
  });
  
  // 断开连接处理
  socket.on('disconnect', () => {
    logger.info(`WebSocket连接断开: ${socket.id}`);
  });
});

// 定期发送工单统计更新
setInterval(() => {
  const stats = {
    totalTickets: 150 + Math.floor(Math.random() * 10),
    openTickets: 30 + Math.floor(Math.random() * 5),
    inProgressTickets: 50 + Math.floor(Math.random() * 5),
    closedTickets: 70 + Math.floor(Math.random() * 5),
    averageResolutionTime: 24 + Math.floor(Math.random() * 5),
    customerSatisfaction: (4.0 + Math.random() * 1.0).toFixed(1)
  };
  io.emit('stats_update', stats);
}, 60000); // 每60秒更新一次

// 启动服务
server.listen(PORT, () => {
  logger.info(`Customer Service System started on port ${PORT}`);
  console.log(`Customer Service System started on port ${PORT}`);
});

module.exports = app;