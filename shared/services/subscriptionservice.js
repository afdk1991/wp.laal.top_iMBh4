/**
 * 订阅服务
 * 版本: v1.0.0.0
 * 说明: 管理用户订阅的创建、查询、更新和删除
 */

class SubscriptionService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 创建订阅
   * @param {Object} subscriptionData - 订阅数据
   * @returns {Promise<Object>} 创建的订阅
   */
  async createSubscription(subscriptionData) {
    try {
      const subscriptionId = `SUB${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO subscriptions (subscriptionId, userId, packageId, packageName, subscribeTime, expireTime, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          subscriptionId,
          subscriptionData.userId,
          subscriptionData.packageId,
          subscriptionData.packageName,
          subscriptionData.subscribeTime || now,
          subscriptionData.expireTime,
          subscriptionData.status || 'active',
          now,
          now,
        ],
      );

      return {
        ...subscriptionData,
        subscriptionId,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('创建订阅错误:', error);
      throw error;
    }
  }

  /**
   * 获取订阅
   * @param {string} subscriptionId - 订阅ID
   * @returns {Promise<Object>} 订阅信息
   */
  async getSubscription(subscriptionId) {
    try {
      const subscriptions = await this.db.execute(
        'SELECT * FROM subscriptions WHERE subscriptionId = ?',
        [subscriptionId],
      );

      if (subscriptions.length === 0) {
        return null;
      }

      return subscriptions[0];
    } catch (error) {
      console.error('获取订阅错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的订阅列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 分页选项
   * @returns {Promise<Object>} 订阅列表和分页信息
   */
  async getUserSubscriptions(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const subscriptions = await this.db.execute(
        'SELECT * FROM subscriptions WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [userId, parseInt(limit, 10), parseInt(offset, 10)],
      );

      const totalResult = await this.db.execute(
        'SELECT COUNT(*) as total FROM subscriptions WHERE userId = ?',
        [userId],
      );
      const total = totalResult[0].total;

      return {
        subscriptions,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取用户订阅错误:', error);
      throw error;
    }
  }

  /**
   * 更新订阅状态
   * @param {string} subscriptionId - 订阅ID
   * @param {Object} updates - 更新内容
   * @returns {Promise<Object>} 更新后的订阅
   */
  async updateSubscription(subscriptionId, updates) {
    try {
      const updateFields = [];
      const updateValues = [];

      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(updates.status);
      }
      if (updates.expireTime !== undefined) {
        updateFields.push('expireTime = ?');
        updateValues.push(updates.expireTime);
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(subscriptionId);

        const sql = `UPDATE subscriptions SET ${updateFields.join(', ')} WHERE subscriptionId = ?`;
        await this.db.run(sql, updateValues);
      }

      return this.getSubscription(subscriptionId);
    } catch (error) {
      console.error('更新订阅错误:', error);
      throw error;
    }
  }

  /**
   * 删除订阅
   * @param {string} subscriptionId - 订阅ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deleteSubscription(subscriptionId) {
    try {
      await this.db.run(
        'DELETE FROM subscriptions WHERE subscriptionId = ?',
        [subscriptionId],
      );

      return true;
    } catch (error) {
      console.error('删除订阅错误:', error);
      throw error;
    }
  }

  /**
   * 检查订阅是否过期
   * @param {string} subscriptionId - 订阅ID
   * @returns {Promise<boolean>} 是否过期
   */
  async checkSubscriptionExpiry(subscriptionId) {
    try {
      const subscription = await this.getSubscription(subscriptionId);
      if (!subscription) {
        return true;
      }

      const now = new Date();
      const expireTime = new Date(subscription.expireTime);
      
      if (now > expireTime) {
        await this.updateSubscription(subscriptionId, { status: 'expired' });
        return true;
      }

      return false;
    } catch (error) {
      console.error('检查订阅过期错误:', error);
      throw error;
    }
  }
}

module.exports = SubscriptionService;
