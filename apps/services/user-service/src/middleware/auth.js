/**
 * 认证中间件
 * 版本: v1.0.0.0
 */

const jwt = require('jsonwebtoken');
const cacheService = require('../../../../src/open/api/utils/cache');

// JWT 配置
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// 启动时验证JWT密钥
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('错误: JWT_SECRET 必须设置且至少32个字符');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  console.error('错误: JWT_REFRESH_SECRET 必须设置且至少32个字符');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

/**
 * 生成 Access Token
 * @param {Object} payload - Token 载荷
 * @returns {string} - JWT Token
 */
const generateAccessToken = payload => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mixmlaal-api',
    audience: 'mixmlaal-client',
  });
};

/**
 * 生成 Refresh Token
 * @param {Object} payload - Token 载荷
 * @returns {string} - JWT Token
 */
const generateRefreshToken = payload => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'mixmlaal-api',
      audience: 'mixmlaal-client',
    },
  );
};

/**
 * 验证 Token
 * @param {string} token - JWT Token
 * @returns {Object|null} - 解码后的 Token 载荷
 */
const verifyToken = token => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET);
    } catch (refreshError) {
      return null;
    }
  }
};

/**
 * 认证中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: '缺少认证令牌',
      });
    }

    const token = authHeader.split(' ')[1];

    // 检查 token 是否在黑名单中
    const isBlacklisted = await cacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(401).json({
        status: 'error',
        message: '认证令牌已过期',
      });
    }

    // 验证 token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: '无效的认证令牌',
      });
    }

    // 将用户信息添加到请求对象
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: '认证失败',
    });
  }
};

/**
 * 可选认证中间件（用于可选认证的接口）
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    // 检查 token 是否在黑名单中
    const isBlacklisted = await cacheService.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return next();
    }

    // 验证 token
    const decoded = verifyToken(token);
    if (!decoded) {
      return next();
    }

    // 将用户信息添加到请求对象
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
    };

    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  authenticate,
  optionalAuthenticate,
};
