// 测试脚本，用于检查API服务启动过程
console.log('开始测试API服务启动...');

// 测试导入
console.log('测试导入模块...');
try {
  const express = require('express');
  console.log('✅ express 导入成功');
} catch (error) {
  console.error('❌ express 导入失败:', error.message);
}

try {
  const helmet = require('helmet');
  console.log('✅ helmet 导入成功');
} catch (error) {
  console.error('❌ helmet 导入失败:', error.message);
}

try {
  const morgan = require('morgan');
  console.log('✅ morgan 导入成功');
} catch (error) {
  console.error('❌ morgan 导入失败:', error.message);
}

try {
  const session = require('express-session');
  console.log('✅ express-session 导入成功');
} catch (error) {
  console.error('❌ express-session 导入失败:', error.message);
}

try {
  const passport = require('passport');
  console.log('✅ passport 导入成功');
} catch (error) {
  console.error('❌ passport 导入失败:', error.message);
}

try {
  const { cors, rateLimit, apiKeyAuth, optionalApiKeyAuth } = require('./src/middleware/api-security');
  console.log('✅ api-security 导入成功');
} catch (error) {
  console.error('❌ api-security 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

try {
  require('dotenv').config();
  console.log('✅ dotenv 导入成功');
} catch (error) {
  console.error('❌ dotenv 导入失败:', error.message);
}

try {
  const { swaggerUi, specs } = require('./src/config/swagger');
  console.log('✅ swagger 导入成功');
} catch (error) {
  console.error('❌ swagger 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

try {
  const configCenter = require('./src/utils/config');
  console.log('✅ config 导入成功');
} catch (error) {
  console.error('❌ config 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

try {
  const { httpLogger, errorLogger, businessLogger } = require('./src/utils/logger');
  console.log('✅ logger 导入成功');
} catch (error) {
  console.error('❌ logger 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

try {
  const { performanceMonitor, errorMonitor, traceMiddleware, startMetricsReporter, getMetrics } = require('./src/utils/monitor');
  console.log('✅ monitor 导入成功');
} catch (error) {
  console.error('❌ monitor 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

try {
  const cacheService = require('./src/utils/cache');
  console.log('✅ cache 导入成功');
} catch (error) {
  console.error('❌ cache 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

try {
  const alertSystem = require('./src/utils/alerts');
  console.log('✅ alerts 导入成功');
} catch (error) {
  console.error('❌ alerts 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

try {
  const sqliteDB = require('./src/utils/database.sqlite');
  console.log('✅ database.sqlite 导入成功');
} catch (error) {
  console.error('❌ database.sqlite 导入失败:', error.message);
  console.error('错误堆栈:', error.stack);
}

console.log('测试完成');
