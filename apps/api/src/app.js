const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware/error');
const apiOptimizer = require('./utils/apiOptimizer');
const { securityAudit } = require('./middleware/securityAudit');
const { apiKeyMiddleware, optionalApiKeyMiddleware } = require('./middleware/apiKey');
const { swaggerSpec, swaggerUi } = require('./utils/swagger');
const i18n = require('./config/i18n');
const { getVersionInfo } = require('../../../shared/utils/version.js');

const app = express();

// 加载版本信息
const versionInfo = getVersionInfo();
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// 添加版本信息到响应头
app.use((req, res, next) => {
  res.setHeader('X-App-Version', versionInfo.fullVersion);
  res.setHeader('X-API-Version', '1.0.0');
  next();
});

// 版本兼容性检查中间件
app.use((req, res, next) => {
  const clientVersion = req.headers['x-client-version'];
  if (clientVersion) {
    // 简单的版本兼容性检查
    const clientParts = clientVersion.split('.').map(Number);
    const serverParts = versionInfo.version.split('.').map(Number);
    
    // 检查主版本号是否兼容
    if (clientParts[0] !== serverParts[0]) {
      console.warn(`Version compatibility warning: client=${clientVersion}, server=${versionInfo.version}`);
      // 可以在这里添加报警逻辑
    }
  }
  next();
});

app.use(helmet());

app.use(cors());

app.use(securityAudit);

app.use(apiOptimizer.compression);
app.use(apiOptimizer.rateLimiter);
app.use(apiOptimizer.requestLogger);
app.use(apiOptimizer.optimizeResponseTime);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(i18n.init);

app.use(apiOptimizer.cacheControl);
app.use(apiOptimizer.corsOptimizer);
app.use(apiOptimizer.versionControl);

app.use(apiOptimizer.batchProcessor);

app.use(`${API_PREFIX}/api-docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 添加版本信息端点
app.get(`${API_PREFIX}/version`, (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: versionInfo
  });
});

// 添加API密钥验证中间件
app.use(`${API_PREFIX}/ai`, apiKeyMiddleware);
app.use(`${API_PREFIX}/blockchain`, apiKeyMiddleware);
app.use(`${API_PREFIX}/5g`, apiKeyMiddleware);
app.use(`${API_PREFIX}/admin`, apiKeyMiddleware);

// 其他接口使用可选API密钥验证
app.use(`${API_PREFIX}/user`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/shop`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/product`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/order`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/payment`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/ride`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/food`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/errand`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/logistics`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/analytics`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/dispatch`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/coupon`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/membership`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/growth`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/social`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/notification`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/content`, optionalApiKeyMiddleware);
app.use(`${API_PREFIX}/compliance`, optionalApiKeyMiddleware);

app.use(API_PREFIX, routes);

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`MIXMLAAL API Server Version: ${versionInfo.fullVersion}`);
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;