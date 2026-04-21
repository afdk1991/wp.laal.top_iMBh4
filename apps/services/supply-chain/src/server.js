const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
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
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.SUPPLY_CHAIN_PORT || 3017;

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

// 模拟仓储数据
const generateWarehouseData = () => {
  const warehouses = [
    {
      id: 'warehouse1',
      name: '北京仓库',
      location: '北京市朝阳区',
      capacity: 10000,
      used: Math.floor(Math.random() * 8000) + 2000,
      temperature: Math.floor(Math.random() * 10) + 15,
      humidity: Math.floor(Math.random() * 30) + 40
    },
    {
      id: 'warehouse2',
      name: '上海仓库',
      location: '上海市浦东新区',
      capacity: 15000,
      used: Math.floor(Math.random() * 12000) + 3000,
      temperature: Math.floor(Math.random() * 10) + 15,
      humidity: Math.floor(Math.random() * 30) + 40
    },
    {
      id: 'warehouse3',
      name: '广州仓库',
      location: '广州市天河区',
      capacity: 12000,
      used: Math.floor(Math.random() * 9600) + 2400,
      temperature: Math.floor(Math.random() * 10) + 15,
      humidity: Math.floor(Math.random() * 30) + 40
    },
    {
      id: 'warehouse4',
      name: '成都仓库',
      location: '成都市武侯区',
      capacity: 8000,
      used: Math.floor(Math.random() * 6400) + 1600,
      temperature: Math.floor(Math.random() * 10) + 15,
      humidity: Math.floor(Math.random() * 30) + 40
    }
  ];
  return warehouses;
};

// 模拟供应链数据
const generateSupplyChainData = () => {
  const supplyChain = [
    {
      id: 'order1',
      orderId: 'ORD-2026-001',
      status: 'in_transit',
      origin: '北京仓库',
      destination: '上海市浦东新区',
      estimatedArrival: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      currentLocation: '南京市',
      progress: 60
    },
    {
      id: 'order2',
      orderId: 'ORD-2026-002',
      status: 'delivered',
      origin: '上海仓库',
      destination: '杭州市西湖区',
      estimatedArrival: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      currentLocation: '杭州市西湖区',
      progress: 100
    },
    {
      id: 'order3',
      orderId: 'ORD-2026-003',
      status: 'processing',
      origin: '广州仓库',
      destination: '深圳市南山区',
      estimatedArrival: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      currentLocation: '广州仓库',
      progress: 20
    },
    {
      id: 'order4',
      orderId: 'ORD-2026-004',
      status: 'in_transit',
      origin: '成都仓库',
      destination: '重庆市渝中区',
      estimatedArrival: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      currentLocation: '遂宁市',
      progress: 40
    }
  ];
  return supplyChain;
};

// 预测需求
const predictDemand = (productId, days) => {
  // 简单的需求预测模型
  const baseDemand = 100;
  const demandVariation = Math.sin(days / 7) * 30;
  const trend = days * 2;
  
  return {
    productId,
    predictedDemand: Math.max(0, Math.floor(baseDemand + demandVariation + trend)),
    predictedTime: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  };
};

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'supply-chain',
    timestamp: new Date().toISOString(),
    local_cache_size: localCache.getStats().keys,
    redis_connected: redisClient ? redisClient.isReady : false
  });
});

// 版本信息
app.get('/version', (req, res) => {
  res.json({ 
    version: '0.0.0.4',
    service: 'supply-chain' 
  });
});

// 获取仓储数据
app.get('/warehouse', (req, res) => {
  try {
    const warehouseData = generateWarehouseData();
    
    // 缓存数据
    localCache.set('warehouse:data', warehouseData);
    if (redisClient && redisClient.isReady) {
      redisClient.set('warehouse:data', JSON.stringify(warehouseData), {
        EX: 300
      });
    }
    
    res.json({
      status: 'success',
      data: warehouseData
    });
  } catch (error) {
    logger.error('获取仓储数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 获取供应链数据
app.get('/supply-chain', (req, res) => {
  try {
    const supplyChainData = generateSupplyChainData();
    
    // 缓存数据
    localCache.set('supply-chain:data', supplyChainData);
    if (redisClient && redisClient.isReady) {
      redisClient.set('supply-chain:data', JSON.stringify(supplyChainData), {
        EX: 300
      });
    }
    
    res.json({
      status: 'success',
      data: supplyChainData
    });
  } catch (error) {
    logger.error('获取供应链数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 预测需求
app.post('/demand/predict', (req, res) => {
  try {
    const { productId, days } = req.body;
    
    const prediction = predictDemand(productId, days);
    
    // 缓存预测结果
    localCache.set(`demand:predict:${productId}:${days}`, prediction);
    if (redisClient && redisClient.isReady) {
      redisClient.set(`demand:predict:${productId}:${days}`, JSON.stringify(prediction), {
        EX: 3600
      });
    }
    
    res.json({
      status: 'success',
      data: prediction
    });
  } catch (error) {
    logger.error('预测需求错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 更新仓储状态
app.post('/warehouse/update', (req, res) => {
  try {
    const { warehouseId, temperature, humidity, used } = req.body;
    
    const update = {
      warehouseId,
      temperature,
      humidity,
      used,
      timestamp: new Date().toISOString()
    };
    
    // 广播更新到WebSocket客户端
    io.emit('warehouse_update', update);
    
    res.json({
      status: 'success',
      data: update
    });
  } catch (error) {
    logger.error('更新仓储状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// 更新订单状态
app.post('/order/update', (req, res) => {
  try {
    const { orderId, status, currentLocation, progress } = req.body;
    
    const update = {
      orderId,
      status,
      currentLocation,
      progress,
      timestamp: new Date().toISOString()
    };
    
    // 广播更新到WebSocket客户端
    io.emit('order_update', update);
    
    res.json({
      status: 'success',
      data: update
    });
  } catch (error) {
    logger.error('更新订单状态错误:', error);
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
  
  // 接收仓储数据请求
  socket.on('request_warehouse_data', () => {
    const warehouseData = generateWarehouseData();
    socket.emit('warehouse_data', warehouseData);
  });
  
  // 接收供应链数据请求
  socket.on('request_supply_chain_data', () => {
    const supplyChainData = generateSupplyChainData();
    socket.emit('supply_chain_data', supplyChainData);
  });
  
  // 断开连接处理
  socket.on('disconnect', () => {
    logger.info(`WebSocket连接断开: ${socket.id}`);
  });
});

// 定期发送仓储数据更新
setInterval(() => {
  const warehouseData = generateWarehouseData();
  io.emit('warehouse_update', warehouseData);
}, 60000); // 每60秒更新一次

// 定期发送供应链数据更新
setInterval(() => {
  const supplyChainData = generateSupplyChainData();
  io.emit('supply_chain_update', supplyChainData);
}, 30000); // 每30秒更新一次

// 启动服务
server.listen(PORT, () => {
  logger.info(`Supply Chain Service started on port ${PORT}`);
  console.log(`Supply Chain Service started on port ${PORT}`);
});

module.exports = app;