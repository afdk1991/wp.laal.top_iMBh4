const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const dotenv = require('dotenv');

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
const PORT = process.env.RIDE_SERVICE_PORT || 3002;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'ride-service',
    timestamp: new Date().toISOString() 
  });
});

// 版本信息
app.get('/version', (req, res) => {
  res.json({ 
    version: '0.0.0.4',
    service: 'ride-service' 
  });
});

// 模拟路由
app.get('/rides', (req, res) => {
  res.json({
    status: 'success',
    data: []
  });
});

app.post('/rides', (req, res) => {
  res.json({
    status: 'success',
    data: {
      rideId: `RIDE${Date.now()}`,
      ...req.body
    }
  });
});

// 启动服务
app.listen(PORT, () => {
  logger.info(`Ride Service started on port ${PORT}`);
  console.log(`Ride Service started on port ${PORT}`);
});

module.exports = app;