/**
 * 认证路由
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();
const sqliteDB = require('../../../../src/open/api/utils/database.sqlite');
const cacheService = require('../../../../src/open/api/utils/cache');
const logger = require('../../../../src/open/api/utils/logger');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../middleware/auth');
const kafkaService = require('../utils/kafka');

// 注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password, smsCode } = req.body;

    if (!phone || !password || !smsCode) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }

    // 验证短信验证码（这里简化处理，实际应该验证真实的短信验证码）
    if (smsCode !== '123456') {
      return res.status(400).json({
        status: 'error',
        message: '验证码错误',
      });
    }

    // 检查用户是否已存在
    const existingUser = await sqliteDB.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existingUser.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: '用户已存在',
      });
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 生成用户ID
    const userId = `USER${Date.now()}${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    // 创建用户
    await sqliteDB.run(
      'INSERT INTO users (userId, phone, password, status, createdAt, updatedAt) VALUES (?, ?, ?, 1, ?, ?)',
      [userId, phone, hashedPassword, now, now],
    );

    // 生成 token
    const accessToken = generateAccessToken({ userId, phone });
    const refreshToken = generateRefreshToken({ userId, phone });

    // 缓存 refresh token
    await cacheService.set(`refresh_token:${userId}`, refreshToken, 7 * 24 * 60 * 60);

    // 发送 Kafka 消息
    try {
      await kafkaService.sendMessage('user-registered', {
        userId,
        phone,
        timestamp: new Date().toISOString(),
      }, userId);
    } catch (kafkaError) {
      logger.warn('发送 Kafka 消息失败:', kafkaError.message);
    }

    res.status(201).json({
      status: 'success',
      message: '注册成功',
      data: {
        userId,
        phone,
        token: accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    logger.error('注册失败:', error);
    res.status(500).json({
      status: 'error',
      message: '注册失败',
    });
  }
});

// 登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }

    // 查找用户
    const users = await sqliteDB.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: '账号或密码错误',
      });
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'error',
        message: '账号或密码错误',
      });
    }

    // 生成 token
    const accessToken = generateAccessToken({ userId: user.userId, phone: user.phone });
    const refreshToken = generateRefreshToken({ userId: user.userId, phone: user.phone });

    // 缓存 refresh token
    await cacheService.set(`refresh_token:${user.userId}`, refreshToken, 7 * 24 * 60 * 60);

    // 发送 Kafka 消息
    try {
      await kafkaService.sendMessage('user-login', {
        userId: user.userId,
        phone: user.phone,
        timestamp: new Date().toISOString(),
      }, user.userId);
    } catch (kafkaError) {
      logger.warn('发送 Kafka 消息失败:', kafkaError.message);
    }

    res.status(200).json({
      status: 'success',
      message: '登录成功',
      data: {
        token: accessToken,
        refreshToken,
        user: {
          userId: user.userId,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          level: user.level,
          points: user.points,
          balance: user.balance,
        },
      },
    });
  } catch (error) {
    logger.error('登录失败:', error);
    res.status(500).json({
      status: 'error',
      message: '登录失败',
    });
  }
});

// 登出
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: '缺少认证令牌',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        message: '无效的认证令牌',
      });
    }

    // 从缓存中删除 refresh token
    await cacheService.del(`refresh_token:${decoded.userId}`);

    // 将 access token 加入黑名单
    await cacheService.set(`blacklist:${token}`, '1', 24 * 60 * 60);

    // 发送 Kafka 消息
    try {
      await kafkaService.sendMessage('user-logout', {
        userId: decoded.userId,
        timestamp: new Date().toISOString(),
      }, decoded.userId);
    } catch (kafkaError) {
      logger.warn('发送 Kafka 消息失败:', kafkaError.message);
    }

    res.status(200).json({
      status: 'success',
      message: '登出成功',
    });
  } catch (error) {
    logger.error('登出失败:', error);
    res.status(500).json({
      status: 'error',
      message: '登出失败',
    });
  }
});

// 刷新 token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        message: '缺少刷新令牌',
      });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({
        status: 'error',
        message: '无效的刷新令牌',
      });
    }

    // 验证 refresh token 是否在缓存中
    const cachedRefreshToken = await cacheService.get(`refresh_token:${decoded.userId}`);
    if (!cachedRefreshToken || cachedRefreshToken !== refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: '刷新令牌已过期',
      });
    }

    // 生成新的 token
    const accessToken = generateAccessToken({ userId: decoded.userId, phone: decoded.phone });
    const newRefreshToken = generateRefreshToken({ userId: decoded.userId, phone: decoded.phone });

    // 更新缓存中的 refresh token
    await cacheService.set(`refresh_token:${decoded.userId}`, newRefreshToken, 7 * 24 * 60 * 60);

    res.status(200).json({
      status: 'success',
      message: '令牌刷新成功',
      data: {
        token: accessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    logger.error('刷新令牌失败:', error);
    res.status(500).json({
      status: 'error',
      message: '刷新令牌失败',
    });
  }
});

module.exports = router;
