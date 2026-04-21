/**
 * 通知服务
 * 版本: v1.0.0.0
 * 说明: 管理系统通知、订单通知、支付通知、营销通知的创建和发送
 */

class NotificationService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 创建通知
   * @param {Object} notificationData - 通知数据
   * @returns {Promise<Object>} 创建的通知
   */
  async createNotification(notificationData) {
    try {
      const notificationId = `NOTIF${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO notifications (notification_id, user_id, type, title, content, data, read, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          notificationId,
          notificationData.userId,
          notificationData.type,
          notificationData.title,
          notificationData.content,
          JSON.stringify(notificationData.data || {}),
          0,
          now,
        ],
      );

      return {
        notificationId,
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        content: notificationData.content,
        data: notificationData.data || {},
        read: false,
        createdAt: now,
      };
    } catch (error) {
      console.error('创建通知错误:', error);
      throw error;
    }
  }

  /**
   * 获取通知列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 通知列表
   */
  async getNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type = null, unreadOnly = false } = options;
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM notifications WHERE user_id = ?';
      const params = [userId];

      if (type !== null) {
        sql += ' AND type = ?';
        params.push(type);
      }

      if (unreadOnly) {
        sql += ' AND read = 0';
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const notifications = await this.db.execute(sql, params);

      const parsedNotifications = notifications.map(n => ({
        ...n,
        data: typeof n.data === 'string' ? JSON.parse(n.data) : n.data,
      }));

      let countSql = 'SELECT COUNT(*) as total FROM notifications WHERE user_id = ?';
      const countParams = [userId];

      if (type !== null) {
        countSql += ' AND type = ?';
        countParams.push(type);
      }

      if (unreadOnly) {
        countSql += ' AND read = 0';
      }

      const totalResult = await this.db.execute(countSql, countParams);
      const total = totalResult[0].total;

      return {
        notifications: parsedNotifications,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取通知列表错误:', error);
      throw error;
    }
  }

  /**
   * 获取未读通知数量
   * @param {string} userId - 用户ID
   * @returns {Promise<number>} 未读数量
   */
  async getUnreadCount(userId) {
    try {
      const result = await this.db.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0',
        [userId],
      );
      return result[0].count;
    } catch (error) {
      console.error('获取未读数量错误:', error);
      throw error;
    }
  }

  /**
   * 标记通知为已读
   * @param {string} notificationId - 通知ID
   * @returns {Promise<boolean>} 是否成功
   */
  async markAsRead(notificationId) {
    try {
      await this.db.run(
        'UPDATE notifications SET read = 1 WHERE notification_id = ?',
        [notificationId],
      );
      return true;
    } catch (error) {
      console.error('标记已读错误:', error);
      throw error;
    }
  }

  /**
   * 标记所有通知为已读
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 是否成功
   */
  async markAllAsRead(userId) {
    try {
      await this.db.run(
        'UPDATE notifications SET read = 1 WHERE user_id = ? AND read = 0',
        [userId],
      );
      return true;
    } catch (error) {
      console.error('标记全部已读错误:', error);
      throw error;
    }
  }

  /**
   * 删除通知
   * @param {string} notificationId - 通知ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteNotification(notificationId) {
    try {
      await this.db.run(
        'DELETE FROM notifications WHERE notification_id = ?',
        [notificationId],
      );
      return true;
    } catch (error) {
      console.error('删除通知错误:', error);
      throw error;
    }
  }

  /**
   * 批量删除通知
   * @param {string} userId - 用户ID
   * @param {Array<string>} notificationIds - 通知ID数组
   * @returns {Promise<number>} 删除数量
   */
  async batchDeleteNotifications(userId, notificationIds) {
    try {
      const placeholders = notificationIds.map(() => '?').join(',');
      const result = await this.db.run(
        `DELETE FROM notifications WHERE user_id = ? AND notification_id IN (${placeholders})`,
        [userId, ...notificationIds],
      );
      return result.changes || 0;
    } catch (error) {
      console.error('批量删除通知错误:', error);
      throw error;
    }
  }

  /**
   * 发送订单通知
   * @param {string} userId - 用户ID
   * @param {Object} orderInfo - 订单信息
   * @param {string} action - 操作类型
   * @returns {Promise<Object>} 通知
   */
  async sendOrderNotification(userId, orderInfo, action) {
    const templates = {
      created: {
        title: '订单已创建',
        content: `您的订单${orderInfo.orderId}已创建，预计金额${orderInfo.estimatedPrice}元`,
      },
      paid: {
        title: '支付成功',
        content: `您的订单${orderInfo.orderId}已支付成功`,
      },
      accepted: {
        title: '订单已接单',
        content: `司机已接单，预计${orderInfo.estimatedTime}分钟到达`,
      },
      arrived: {
        title: '司机已到达',
        content: `司机已到达出发地，请注意查看`,
      },
      started: {
        title: '行程已开始',
        content: `您的行程已开始，请注意安全`,
      },
      completed: {
        title: '订单已完成',
        content: `您的订单${orderInfo.orderId}已完成，感谢使用`,
      },
      cancelled: {
        title: '订单已取消',
        content: `您的订单${orderInfo.orderId}已取消`,
      },
    };

    const template = templates[action] || templates.created;

    return this.createNotification({
      userId,
      type: 'order',
      title: template.title,
      content: template.content,
      data: { orderId: orderInfo.orderId, action },
    });
  }

  /**
   * 发送支付通知
   * @param {string} userId - 用户ID
   * @param {Object} paymentInfo - 支付信息
   * @param {string} status - 支付状态
   * @returns {Promise<Object>} 通知
   */
  async sendPaymentNotification(userId, paymentInfo, status) {
    const templates = {
      success: {
        title: '支付成功',
        content: `您已成功支付${paymentInfo.amount}元，支付单号${paymentInfo.paymentId}`,
      },
      failed: {
        title: '支付失败',
        content: `您的支付${paymentInfo.paymentId}失败了，请重新支付`,
      },
      refunded: {
        title: '退款到账',
        content: `您的退款${paymentInfo.refundId}已到账，请查收`,
      },
    };

    const template = templates[status] || templates.success;

    return this.createNotification({
      userId,
      type: 'payment',
      title: template.title,
      content: template.content,
      data: { paymentId: paymentInfo.paymentId, status },
    });
  }

  /**
   * 发送系统通知
   * @param {string} userId - 用户ID
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @returns {Promise<Object>} 通知
   */
  async sendSystemNotification(userId, title, content) {
    return this.createNotification({
      userId,
      type: 'system',
      title,
      content,
      data: {},
    });
  }

  /**
   * 广播营销通知
   * @param {string} title - 标题
   * @param {string} content - 内容
   * @param {Array<string>} targetUserIds - 目标用户ID数组
   * @returns {Promise<number>} 发送数量
   */
  async broadcastPromotion(title, content, targetUserIds = []) {
    try {
      let sql = 'SELECT user_id FROM users WHERE status = 1';
      const params = [];

      if (targetUserIds.length > 0) {
        const placeholders = targetUserIds.map(() => '?').join(',');
        sql = `SELECT user_id FROM users WHERE status = 1 AND user_id IN (${placeholders})`;
        params.push(...targetUserIds);
      }

      const users = await this.db.execute(sql, params);
      const now = new Date().toISOString();
      let count = 0;

      for (const user of users) {
        await this.db.run(
          `INSERT INTO notifications (notification_id, user_id, type, title, content, data, read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [`NOTIF${Date.now()}${count}`, user.user_id, 'promotion', title, content, '{}', 0, now],
        );
        count++;
      }

      return count;
    } catch (error) {
      console.error('广播营销通知错误:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;