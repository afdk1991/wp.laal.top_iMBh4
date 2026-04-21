/**
 * MIXMLAAL API Gateway
 * 版本: v2.0.0.0
 * 说明: 增强版API网关，集成服务发现、配置中心、高级路由和监控
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { body, query, param, validationResult } = require('express-validator');
const Consul = require('consul');
const winston = require('winston');
const promClient = require('prom-client');
require('dotenv').config();

const app = express();
const PORT = process.env.API_GATEWAY_PORT || 3000;
const METRICS_PORT = process.env.METRICS_PORT || 9091;

// 配置Prometheus指标
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

// 定义自定义指标
const httpRequestCounter = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status', 'service']
});

const httpRequestDurationHistogram = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status', 'service'],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5]
});

const serviceHealthGauge = new promClient.Gauge({
  name: 'service_health',
  help: 'Service health status (1=healthy, 0=unhealthy)',
  labelNames: ['service']
});

// 注册指标
register.registerMetric(httpRequestCounter);
register.registerMetric(httpRequestDurationHistogram);
register.registerMetric(serviceHealthGauge);

// 配置日志
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'api-gateway.log' })
  ]
});

// 配置Consul
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'consul',
  port: process.env.CONSUL_PORT || 8500
});

// 中间件配置
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
    }
  }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Response-Time', 'X-Service-Url', 'X-Request-Id'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 限流配置
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试',
    code: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // 跳过健康检查的限流
    return req.path === '/api/v1/health' || req.path === '/health';
  }
});
app.use('/api', limiter);

// 服务配置
const services = {
  user: process.env.USER_SERVICE_URL || 'http://user-service:3001',
  ride: process.env.RIDE_SERVICE_URL || 'http://ride-service:3002',
  ecommerce: process.env.ECOMMERCE_SERVICE_URL || 'http://ecommerce-service:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
  order: process.env.ORDER_SERVICE_URL || 'http://order-service:3005',
  social: process.env.SOCIAL_SERVICE_URL || 'http://social-service:3006',
  portal: process.env.PORTAL_SERVICE_URL || 'http://portal-service:3007',
  food: process.env.FOOD_SERVICE_URL || 'http://food-service:3009',
  errand: process.env.ERRAND_SERVICE_URL || 'http://errand-service:3010',
  common: process.env.COMMON_SERVICE_URL || 'http://common-service:3008',
  transaction: process.env.TRANSACTION_SERVICE_URL || 'http://transaction-service:3011',
};

// 服务健康检查
const healthChecks = {};
// 服务响应时间
const serviceResponseTimes = {};
// 服务实例列表
const serviceInstances = {};

// 从Consul获取服务实例
const discoverServices = async () => {
  try {
    for (const serviceName of Object.keys(services)) {
      const result = await consul.catalog.service.nodes(serviceName);
      if (result && result.length > 0) {
        serviceInstances[serviceName] = result.map(instance => ({
          id: instance.ServiceID,
          address: instance.ServiceAddress,
          port: instance.ServicePort
        }));
        logger.info(`Discovered ${result.length} instances for service ${serviceName}`);
      }
    }
  } catch (error) {
    logger.error('Service discovery failed:', error);
  }
};

// 定期检查服务健康状态
setInterval(async () => {
  for (const [service, url] of Object.entries(services)) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      const endTime = Date.now();
      healthChecks[service] = response.data.status === 'success' || response.data.status === 'ok';
      serviceResponseTimes[service] = endTime - startTime;
      logger.info(`Service ${service} health check: ${healthChecks[service]}, response time: ${serviceResponseTimes[service]}ms`);
    } catch (error) {
      healthChecks[service] = false;
      serviceResponseTimes[service] = Infinity;
      logger.warn(`Service ${service} health check failed: ${error.message}`);
    }
  }
  
  // 定期从Consul发现服务
  await discoverServices();
}, 5000);

// 服务发现和负载均衡
const getServiceUrl = service => {
  // 检查服务是否健康
  if (healthChecks[service] !== false) {
    return services[service];
  }
  // 如果服务不健康，返回错误
  throw new Error(`Service ${service} is unavailable`);
};

// 智能负载均衡（基于响应时间）
const getOptimalServiceUrl = service => {
  // 检查是否有多个实例
  if (serviceInstances[service] && serviceInstances[service].length > 0) {
    // 简单的轮询负载均衡
    const instances = serviceInstances[service];
    const index = Math.floor(Math.random() * instances.length);
    const instance = instances[index];
    return `http://${instance.address}:${instance.port}`;
  }
  // 回退到默认服务URL
  return getServiceUrl(service);
};

// 请求验证中间件
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: '请求参数验证失败',
        errors: errors.array()
      });
    }
    next();
  };
};

// 代理请求到微服务
const proxyRequest = async (req, res, service) => {
  try {
    const serviceUrl = getOptimalServiceUrl(service);
    const url = `${serviceUrl}${req.originalUrl.replace(`/api/v1/${service}`, '')}`;

    const config = {
      method: req.method,
      url,
      headers: {
        ...req.headers,
        host: new URL(serviceUrl).host,
        'X-Forwarded-For': req.ip,
        'X-Request-Id': req.headers['x-request-id'] || Date.now().toString(),
        'X-Gateway-Version': '2.0.0.0',
        'X-Gateway-Host': req.hostname
      },
      data: req.body,
      timeout: 30000,
      maxRedirects: 3
    };

    const startTime = Date.now();
    const response = await axios(config);
    const endTime = Date.now();
    
    // 记录响应时间
    serviceResponseTimes[service] = endTime - startTime;
    
    // 添加响应头
    res.setHeader('X-Response-Time', (endTime - startTime).toString());
    res.setHeader('X-Service-Url', serviceUrl);
    res.setHeader('X-Request-Id', config.headers['X-Request-Id']);
    
    // 复制响应头
    Object.keys(response.headers).forEach(header => {
      if (!['content-length', 'content-encoding', 'transfer-encoding', 'connection'].includes(header.toLowerCase())) {
        res.setHeader(header, response.headers[header]);
      }
    });
    
    res.status(response.status).json(response.data);
    logger.info(`${req.method} ${req.originalUrl} -> ${serviceUrl} ${response.status} ${endTime - startTime}ms`);
  } catch (error) {
    if (error.message.includes('Service')) {
      logger.error(`Service ${service} unavailable: ${error.message}`);
      return res.status(503).json({
        status: 'error',
        message: error.message,
        code: 503
      });
    }
    const statusCode = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || '服务内部错误';
    logger.error(`${req.method} ${req.originalUrl} -> Error: ${errorMessage} (${statusCode})`);
    res.status(statusCode).json({
      status: 'error',
      message: errorMessage,
      code: statusCode
    });
  }
};

// 路由配置
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    service: 'api-gateway',
    version: '2.0.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/v1/health', async (req, res) => {
  const healthStatus = {
    status: 'success',
    timestamp: new Date().toISOString(),
    gateway: {
      version: '2.0.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage()
    },
    services: {},
    consul: {
      connected: false
    },
    nacos: {
      connected: false
    }
  };

  // 检查Consul连接
  try {
    await consul.status.leader();
    healthStatus.consul.connected = true;
  } catch (error) {
    healthStatus.consul.connected = false;
    healthStatus.consul.error = error.message;
  }

  // 检查Nacos连接
  try {
    const nacosUrl = `http://${process.env.NACOS_HOST || 'nacos'}:${process.env.NACOS_PORT || 8848}`;
    await axios.get(`${nacosUrl}/nacos/v1/console/health`, { timeout: 2000 });
    healthStatus.nacos.connected = true;
  } catch (error) {
    healthStatus.nacos.connected = false;
    healthStatus.nacos.error = error.message;
  }

  for (const [service, url] of Object.entries(services)) {
    try {
      const startTime = Date.now();
      const response = await axios.get(`${url}/health`, { timeout: 3000 });
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      healthStatus.services[service] = {
        status: response.data.status === 'success' || response.data.status === 'ok' ? 'healthy' : 'unhealthy',
        responseTime: responseTime,
        url: url,
        instances: serviceInstances[service] || []
      };
    } catch (error) {
      healthStatus.services[service] = {
        status: 'unavailable',
        responseTime: Infinity,
        url: url,
        error: error.message,
        instances: serviceInstances[service] || []
      };
    }
  }

  // 检查是否所有服务都健康
  const allHealthy = Object.values(healthStatus.services).every(service => service.status === 'healthy');
  if (!allHealthy) {
    healthStatus.status = 'degraded';
  }

  res.json(healthStatus);
});

// 服务路由 - 带参数验证
app.use('/api/v1/user', validateRequest([
  param('id').optional().isMongoId().withMessage('无效的用户ID')
]), (req, res) => proxyRequest(req, res, 'user'));

app.use('/api/v1/ride', validateRequest([
  query('latitude').optional().isFloat().withMessage('无效的纬度'),
  query('longitude').optional().isFloat().withMessage('无效的经度')
]), (req, res) => proxyRequest(req, res, 'ride'));

app.use('/api/v1/shop', validateRequest([
  query('category').optional().isString().withMessage('无效的分类')
]), (req, res) => proxyRequest(req, res, 'ecommerce'));

app.use('/api/v1/payment', validateRequest([
  body('amount').optional().isFloat({ min: 0.01 }).withMessage('无效的金额')
]), (req, res) => proxyRequest(req, res, 'payment'));

app.use('/api/v1/order', validateRequest([
  param('id').optional().isString().withMessage('无效的订单ID')
]), (req, res) => proxyRequest(req, res, 'order'));

app.use('/api/v1/social', (req, res) => proxyRequest(req, res, 'social'));
app.use('/api/v1/portal', (req, res) => proxyRequest(req, res, 'portal'));
app.use('/api/v1/food', (req, res) => proxyRequest(req, res, 'food'));
app.use('/api/v1/errand', (req, res) => proxyRequest(req, res, 'errand'));
app.use('/api/v1/common', (req, res) => proxyRequest(req, res, 'common'));
app.use('/api/v1/transaction', (req, res) => proxyRequest(req, res, 'transaction'));

// 404处理
app.use((req, res) => {
  logger.warn(`404 - ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: '接口不存在',
    code: 404,
    path: req.originalUrl
  });
});

// Prometheus指标中间件
app.use((req, res, next) => {
  const start = Date.now();
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    const duration = (Date.now() - start) / 1000;
    const service = req.path.split('/')[3] || 'gateway';
    
    httpRequestCounter.inc({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      service: service
    });
    
    httpRequestDurationHistogram.observe({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      service: service
    }, duration);
    
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
});

// 定期更新服务健康状态
setInterval(() => {
  Object.entries(healthChecks).forEach(([service, status]) => {
    serviceHealthGauge.set({ service }, status ? 1 : 0);
  });
}, 10000);

// Prometheus指标导出端点
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error exporting metrics:', error);
    res.status(500).end();
  }
});

// 错误处理
app.use((err, req, res, _next) => {
  logger.error(`Gateway error: ${err.message}`, { stack: err.stack });
  res.status(500).json({
    status: 'error',
    message: '网关内部错误',
    code: 500,
    timestamp: new Date().toISOString()
  });
});

// 启动服务
app.listen(PORT, '0.0.0.0', async () => {
  logger.info(`API Gateway v2.0.0.0 running on port ${PORT}`);
  logger.info('Health check available at: /api/v1/health');
  
  // 初始健康检查
  Object.keys(services).forEach(service => {
    healthChecks[service] = true;
  });
  
  // 初始服务发现
  await discoverServices();
  
  logger.info('API Gateway initialized successfully');
});

// 优雅关闭
process.on('SIGINT', async () => {
  logger.info('Shutting down API Gateway...');
  // 可以在这里添加清理逻辑
  process.exit(0);
});

module.exports = app;
