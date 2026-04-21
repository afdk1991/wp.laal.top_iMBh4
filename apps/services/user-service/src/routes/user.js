/**
 * 用户路由
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const sqliteDB = require('../../../../src/open/api/utils/database.sqlite');
const cacheService = require('../../../../src/open/api/utils/cache');
const logger = require('../../../../src/open/api/utils/logger');
const kafkaService = require('../utils/kafka');

// 获取用户信息
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 尝试从缓存获取
    const cacheKey = `user:profile:${userId}`;
    const cachedProfile = await cacheService.get(cacheKey);

    if (cachedProfile) {
      return res.status(200).json({
        status: 'success',
        data: JSON.parse(cachedProfile),
      });
    }

    // 从数据库获取
    const users = await sqliteDB.execute('SELECT userId, phone, email, nickname, avatar, gender, birthday, level, points, balance, status, createdAt, updatedAt FROM users WHERE userId = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在',
      });
    }

    const user = users[0];

    // 缓存用户信息
    await cacheService.set(cacheKey, JSON.stringify(user), 60 * 60);

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error) {
    logger.error('获取用户信息失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户信息失败',
    });
  }
});

// 更新用户信息
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nickname, avatar, gender, birthday, email } = req.body;

    const updates = [];
    const params = [];

    if (nickname) {
      updates.push('nickname = ?');
      params.push(nickname);
    }
    if (avatar) {
      updates.push('avatar = ?');
      params.push(avatar);
    }
    if (gender) {
      updates.push('gender = ?');
      params.push(gender);
    }
    if (birthday) {
      updates.push('birthday = ?');
      params.push(birthday);
    }
    if (email) {
      updates.push('email = ?');
      params.push(email);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '没有需要更新的信息',
      });
    }

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(userId);

    const sql = `UPDATE users SET ${updates.join(', ')} WHERE userId = ?`;
    await sqliteDB.run(sql, params);

    // 清除缓存
    await cacheService.del(`user:profile:${userId}`);

    // 获取更新后的用户信息
    const users = await sqliteDB.execute('SELECT userId, phone, email, nickname, avatar, gender, birthday, level, points, balance, status, createdAt, updatedAt FROM users WHERE userId = ?', [userId]);

    // 发送 Kafka 消息
    try {
      await kafkaService.sendMessage('user-updated', {
        userId,
        updates: { nickname, avatar, gender, birthday, email },
        timestamp: new Date().toISOString(),
      }, userId);
    } catch (kafkaError) {
      logger.warn('发送 Kafka 消息失败:', kafkaError.message);
    }

    res.status(200).json({
      status: 'success',
      message: '用户信息更新成功',
      data: users[0],
    });
  } catch (error) {
    logger.error('更新用户信息失败:', error);
    res.status(500).json({
      status: 'error',
      message: '更新用户信息失败',
    });
  }
});

// 获取用户余额
router.get('/balance', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 尝试从缓存获取
    const cacheKey = `user:balance:${userId}`;
    const cachedBalance = await cacheService.get(cacheKey);

    if (cachedBalance) {
      return res.status(200).json({
        status: 'success',
        data: {
          balance: parseFloat(cachedBalance),
        },
      });
    }

    // 从数据库获取
    const users = await sqliteDB.execute('SELECT balance FROM users WHERE userId = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在',
      });
    }

    const balance = users[0].balance;

    // 缓存余额
    await cacheService.set(cacheKey, balance.toString(), 5 * 60);

    res.status(200).json({
      status: 'success',
      data: {
        balance,
      },
    });
  } catch (error) {
    logger.error('获取用户余额失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户余额失败',
    });
  }
});

// 获取用户积分
router.get('/points', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    // 尝试从缓存获取
    const cacheKey = `user:points:${userId}`;
    const cachedPoints = await cacheService.get(cacheKey);

    if (cachedPoints) {
      return res.status(200).json({
        status: 'success',
        data: {
          points: parseInt(cachedPoints, 10),
        },
      });
    }

    // 从数据库获取
    const users = await sqliteDB.execute('SELECT points FROM users WHERE userId = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在',
      });
    }

    const points = users[0].points;

    // 缓存积分
    await cacheService.set(cacheKey, points.toString(), 5 * 60);

    res.status(200).json({
      status: 'success',
      data: {
        points,
      },
    });
  } catch (error) {
    logger.error('获取用户积分失败:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户积分失败',
    });
  }
});

// 更新密码
router.put('/password', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要参数',
      });
    }

    // 查找用户
    const users = await sqliteDB.execute('SELECT password FROM users WHERE userId = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在',
      });
    }

    const user = users[0];

    // 验证旧密码
    const bcrypt = require('bcrypt');
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        status: 'error',
        message: '旧密码错误',
      });
    }

    // 加密新密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // 更新密码
    await sqliteDB.run(
      'UPDATE users SET password = ?, updatedAt = ? WHERE userId = ?',
      [hashedPassword, new Date().toISOString(), userId],
    );

    res.status(200).json({
      status: 'success',
      message: '密码更新成功',
    });
  } catch (error) {
    logger.error('更新密码失败:', error);
    res.status(500).json({
      status: 'error',
      message: '更新密码失败',
    });
  }
});

module.exports = router;
