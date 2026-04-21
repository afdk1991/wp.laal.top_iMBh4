/**
 * 验证中间件
 * 版本: v1.0.0.0
 */

/**
 * 验证注册请求
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const validateRegister = (req, res, next) => {
  const { phone, password, smsCode } = req.body;

  // 验证手机号
  if (!phone) {
    return res.status(400).json({
      status: 'error',
      message: '手机号不能为空',
    });
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      status: 'error',
      message: '手机号格式错误',
    });
  }

  // 验证密码
  if (!password) {
    return res.status(400).json({
      status: 'error',
      message: '密码不能为空',
    });
  }

  // 验证密码长度
  if (password.length < 6 || password.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: '密码长度必须在6-20个字符之间',
    });
  }

  // 验证短信验证码
  if (!smsCode) {
    return res.status(400).json({
      status: 'error',
      message: '短信验证码不能为空',
    });
  }

  // 验证短信验证码格式
  if (!/^\d{6}$/.test(smsCode)) {
    return res.status(400).json({
      status: 'error',
      message: '短信验证码格式错误',
    });
  }

  next();
};

/**
 * 验证登录请求
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const validateLogin = (req, res, next) => {
  const { phone, password } = req.body;

  // 验证手机号
  if (!phone) {
    return res.status(400).json({
      status: 'error',
      message: '手机号不能为空',
    });
  }

  // 验证手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      status: 'error',
      message: '手机号格式错误',
    });
  }

  // 验证密码
  if (!password) {
    return res.status(400).json({
      status: 'error',
      message: '密码不能为空',
    });
  }

  next();
};

/**
 * 验证更新用户信息请求
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const validateUpdateProfile = (req, res, next) => {
  const { nickname, gender, email } = req.body;

  // 验证昵称
  if (nickname && (nickname.length < 2 || nickname.length > 20)) {
    return res.status(400).json({
      status: 'error',
      message: '昵称长度必须在2-20个字符之间',
    });
  }

  // 验证性别
  if (gender && !['male', 'female', 'other'].includes(gender)) {
    return res.status(400).json({
      status: 'error',
      message: '性别必须是 male、female 或 other',
    });
  }

  // 验证邮箱
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: '邮箱格式错误',
      });
    }
  }

  next();
};

/**
 * 验证更新密码请求
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const validateUpdatePassword = (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  // 验证旧密码
  if (!oldPassword) {
    return res.status(400).json({
      status: 'error',
      message: '旧密码不能为空',
    });
  }

  // 验证新密码
  if (!newPassword) {
    return res.status(400).json({
      status: 'error',
      message: '新密码不能为空',
    });
  }

  // 验证新密码长度
  if (newPassword.length < 6 || newPassword.length > 20) {
    return res.status(400).json({
      status: 'error',
      message: '新密码长度必须在6-20个字符之间',
    });
  }

  next();
};

/**
 * 验证刷新令牌请求
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const validateRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      status: 'error',
      message: '刷新令牌不能为空',
    });
  }

  next();
};

/**
 * 验证通用ID参数
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 * @param {string} id - 路由参数中的ID
 */
const validateIdParam = (req, res, next, id) => {
  if (!id || typeof id !== 'string' || id.length === 0) {
    return res.status(400).json({
      status: 'error',
      message: '无效的ID参数',
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateUpdatePassword,
  validateRefreshToken,
  validateIdParam,
};
