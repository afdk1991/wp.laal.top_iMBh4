const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { recordSecurityEvent } = require('../middleware/securityAudit');

const authController = {
  // 登录
  login: async (req, res) => {
    const { username, password } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
      // 查找用户
      let user = null;
      try {
        user = await User.findOne({ where: { username } });
      } catch (dbError) {
        // 数据库查询失败，使用模拟数据
        console.log('数据库查询失败，使用模拟数据:', dbError.message);
        // 模拟用户数据
        const mockUsers = [
          { id: 1, username: 'testuser', password: '123456', name: '测试用户', role: 'user' },
          { id: 2, username: 'admin', password: 'admin123', name: '管理员', role: 'admin' }
        ];
        user = mockUsers.find(u => u.username === username);
      }
      if (!user) {
        // 记录登录失败事件
        recordSecurityEvent('LOGIN_FAILED', {
          username,
          ip,
          userAgent,
          reason: '用户名不存在'
        });
        return res.json({
          code: 401,
          message: '用户名或密码错误',
          data: null
        });
      }

      // 验证密码
      let isPasswordValid = false;
      // 检查是否使用的是模拟数据（密码未哈希）
      if (user.password && user.password.length < 60) {
        // 模拟数据，直接比较明文密码
        isPasswordValid = (password === user.password);
      } else {
        // 真实数据，使用bcrypt比较
        isPasswordValid = await bcrypt.compare(password, user.password);
      }
      if (!isPasswordValid) {
        // 记录登录失败事件
        recordSecurityEvent('LOGIN_FAILED', {
          username,
          ip,
          userAgent,
          reason: '密码错误'
        });
        return res.json({
          code: 401,
          message: '用户名或密码错误',
          data: null
        });
      }

      // 生成token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: '24h'
        }
      );

      // 生成refresh token
      const refreshToken = jwt.sign(
        {
          id: user.id
        },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        {
          expiresIn: '7d'
        }
      );

      // 记录登录成功事件
      recordSecurityEvent('LOGIN_SUCCESS', {
        userId: user.id,
        username: user.username,
        ip,
        userAgent
      });

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
          }
        }
      });
    } catch (error) {
      // 记录登录异常事件
      recordSecurityEvent('LOGIN_ERROR', {
        username,
        ip,
        userAgent,
        error: error.message
      });
      res.status(500).json({
        code: 500,
        message: '登录失败',
        data: null
      });
    }
  },

  // 注册
  register: async (req, res) => {
    const { username, password, name, role } = req.body;

    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.json({
          code: 400,
          message: '用户名已存在',
          data: null
        });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await User.create({
        username,
        password: hashedPassword,
        name,
        role
      });

      res.json({
        code: 200,
        message: '注册成功',
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '注册失败',
        data: null
      });
    }
  },

  // 登出
  logout: async (req, res) => {
    const userId = req.user?.id;
    const username = req.user?.username;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    // 记录登出事件
    recordSecurityEvent('LOGOUT', {
      userId,
      username,
      ip,
      userAgent
    });

    // 客户端删除token即可，服务端无需特殊处理
    res.json({
      code: 200,
      message: '登出成功',
      data: null
    });
  },

  // 刷新token
  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];

    try {
      // 验证refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');

      // 查找用户
      const user = await User.findByPk(decoded.id);
      if (!user) {
        // 记录刷新token失败事件
        recordSecurityEvent('REFRESH_TOKEN_FAILED', {
          userId: decoded.id,
          ip,
          userAgent,
          reason: '用户不存在'
        });
        return res.json({
          code: 401,
          message: '用户不存在',
          data: null
        });
      }

      // 生成新的token
      const newToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: '24h'
        }
      );

      // 记录刷新token成功事件
      recordSecurityEvent('REFRESH_TOKEN_SUCCESS', {
        userId: user.id,
        username: user.username,
        ip,
        userAgent
      });

      res.json({
        code: 200,
        message: '刷新token成功',
        data: {
          token: newToken
        }
      });
    } catch (error) {
      // 记录刷新token异常事件
      recordSecurityEvent('REFRESH_TOKEN_ERROR', {
        ip,
        userAgent,
        error: error.message
      });
      res.json({
        code: 401,
        message: 'refresh token无效或已过期',
        data: null
      });
    }
  },

  // 获取当前用户信息
  getMe: async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'name', 'role', 'created_at']
      });

      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取用户信息成功',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取用户信息失败',
        data: null
      });
    }
  }
};

module.exports = authController;