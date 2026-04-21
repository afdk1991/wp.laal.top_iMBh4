/**
 * 安全中间件
 * 版本: v1.0.0.0
 */

const { RateLimiterMemory } = require('rate-limiter-flexible');

// 速率限制配置
const rateLimiter = new RateLimiterMemory({
  points: 100, // 每IP允许的请求数
  duration: 60, // 时间窗口（秒）
});

/**
 * 速率限制中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const rateLimit = async (req, res, next) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    await rateLimiter.consume(ip);
    next();
  } catch (error) {
    res.status(429).json({
      status: 'error',
      message: '请求过于频繁，请稍后再试',
    });
  }
};

/**
 * XSS 防护中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const xssProtection = (req, res, next) => {
  // 设置 X-XSS-Protection 头部
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // 对请求体进行简单的 XSS 过滤
  if (req.body) {
    sanitizeBody(req.body);
  }

  next();
};

/**
 * 递归清理对象中的 XSS 内容
 * @param {Object} obj - 要清理的对象
 */
const sanitizeBody = obj => {
  if (typeof obj === 'string') {
    return obj
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\//g, '&#x2F;');
  } else if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      obj[index] = sanitizeBody(item);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach(key => {
      obj[key] = sanitizeBody(obj[key]);
    });
  }
  return obj;
};

/**
 * CSRF 防护中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const csrfProtection = (req, res, next) => {
  // 对于 POST、PUT、DELETE 请求，验证 CSRF Token
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;

    // 这里简化处理，实际应该验证 token 的有效性
    // 生产环境中应该使用更复杂的 CSRF 防护机制
    if (!csrfToken) {
      return res.status(403).json({
        status: 'error',
        message: '缺少 CSRF Token',
      });
    }
  }

  next();
};

/**
 * 内容安全策略中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const contentSecurityPolicy = (req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self'; " +
    "font-src 'self'; " +
    "object-src 'none'; " +
    "frame-src 'none'; " +
    'upgrade-insecure-requests;',
  );
  next();
};

/**
 * 严格传输安全中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const strictTransportSecurity = (req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};

/**
 * 点击劫持防护中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const clickjackingProtection = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
};

module.exports = {
  rateLimit,
  xssProtection,
  csrfProtection,
  contentSecurityPolicy,
  strictTransportSecurity,
  clickjackingProtection,
};
