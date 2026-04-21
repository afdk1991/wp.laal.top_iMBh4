/**
 * 钱包服务
 * 版本: v1.0.0.0
 * 说明: 管理用户钱包、充值、提现、交易记录
 */

class WalletService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 获取用户钱包
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 钱包信息
   */
  async getWallet(userId) {
    try {
      const wallets = await this.db.execute(
        'SELECT * FROM user_wallets WHERE user_id = ?',
        [userId],
      );

      if (wallets.length === 0) {
        return this.createWallet(userId);
      }

      return wallets[0];
    } catch (error) {
      console.error('获取钱包错误:', error);
      throw error;
    }
  }

  /**
   * 创建钱包
   * @param {string} userId - 用户ID
   * @returns {Promise<Object>} 创建的钱包
   */
  async createWallet(userId) {
    try {
      const walletId = `WALLET${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO user_wallets (user_id, balance, frozen_amount, total_recharge, total_consume, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, 0.00, 0.00, 0.00, 0.00, now, now],
      );

      return {
        user_id: userId,
        balance: 0.00,
        frozen_amount: 0.00,
        total_recharge: 0.00,
        total_consume: 0.00,
      };
    } catch (error) {
      console.error('创建钱包错误:', error);
      throw error;
    }
  }

  /**
   * 充值
   * @param {string} userId - 用户ID
   * @param {number} amount - 充值金额
   * @param {string} method - 充值方式
   * @returns {Promise<Object>} 交易记录
   */
  async recharge(userId, amount, method = 'wechat') {
    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore + parseFloat(amount);

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, total_recharge = total_recharge + ?, updated_at = ? WHERE user_id = ?`,
        [balanceAfter, amount, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 1, amount, balanceBefore, balanceAfter, 'recharge', `充值${amount}元`, now],
      );

      return {
        transactionId,
        userId,
        type: 1,
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: now,
      };
    } catch (error) {
      console.error('充值错误:', error);
      throw error;
    }
  }

  /**
   * 消费
   * @param {string} userId - 用户ID
   * @param {number} amount - 消费金额
   * @param {string} relatedId - 关联业务ID
   * @param {string} relatedType - 关联业务类型
   * @param {string} remark - 备注
   * @returns {Promise<Object>} 交易记录
   */
  async consume(userId, amount, relatedId, relatedType, remark = '') {
    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore - parseFloat(amount);

      if (balanceAfter < 0) {
        throw new Error('余额不足');
      }

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, total_consume = total_consume + ?, updated_at = ? WHERE user_id = ?`,
        [balanceAfter, amount, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_id, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 2, amount, balanceBefore, balanceAfter, relatedId, relatedType, remark, now],
      );

      return {
        transactionId,
        userId,
        type: 2,
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: now,
      };
    } catch (error) {
      console.error('消费错误:', error);
      throw error;
    }
  }

  /**
   * 退款
   * @param {string} userId - 用户ID
   * @param {number} amount - 退款金额
   * @param {string} relatedId - 关联业务ID
   * @param {string} relatedType - 关联业务类型
   * @returns {Promise<Object>} 交易记录
   */
  async refund(userId, amount, relatedId, relatedType) {
    try {
      const wallet = await this.getWallet(userId);
      const balanceBefore = parseFloat(wallet.balance);
      const balanceAfter = balanceBefore + parseFloat(amount);

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, updated_at = ? WHERE user_id = ?`,
        [balanceAfter, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_id, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 3, amount, balanceBefore, balanceAfter, relatedId, relatedType, '退款', now],
      );

      return {
        transactionId,
        userId,
        type: 3,
        amount,
        balanceBefore,
        balanceAfter,
        createdAt: now,
      };
    } catch (error) {
      console.error('退款错误:', error);
      throw error;
    }
  }

  /**
   * 获取交易记录
   * @param {string} userId - 用户ID
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 交易记录列表
   */
  async getTransactions(userId, options = {}) {
    try {
      const { page = 1, limit = 20, type = null } = options;
      const offset = (page - 1) * limit;

      let sql = 'SELECT * FROM wallet_transactions WHERE user_id = ?';
      const params = [userId];

      if (type !== null) {
        sql += ' AND type = ?';
        params.push(type);
      }

      sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit, 10), parseInt(offset, 10));

      const transactions = await this.db.execute(sql, params);

      let countSql = 'SELECT COUNT(*) as total FROM wallet_transactions WHERE user_id = ?';
      const countParams = [userId];

      if (type !== null) {
        countSql += ' AND type = ?';
        countParams.push(type);
      }

      const totalResult = await this.db.execute(countSql, countParams);
      const total = totalResult[0].total;

      return {
        transactions,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取交易记录错误:', error);
      throw error;
    }
  }

  /**
   * 提现
   * @param {string} userId - 用户ID
   * @param {number} amount - 提现金额
   * @param {string} bankCard - 银行卡号
   * @returns {Promise<Object>} 提现记录
   */
  async withdraw(userId, amount, bankCard) {
    try {
      const wallet = await this.getWallet(userId);
      const balance = parseFloat(wallet.balance);

      if (balance < parseFloat(amount)) {
        throw new Error('余额不足，无法提现');
      }

      const minWithdrawal = 100;
      if (parseFloat(amount) < minWithdrawal) {
        throw new Error(`最低提现金额为${minWithdrawal}元`);
      }

      const frozenAmount = parseFloat(wallet.frozen_amount) + parseFloat(amount);
      const newBalance = balance - parseFloat(amount);

      await this.db.run(
        `UPDATE user_wallets SET balance = ?, frozen_amount = ?, updated_at = ? WHERE user_id = ?`,
        [newBalance, frozenAmount, new Date().toISOString(), userId],
      );

      const transactionId = `TXN${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO wallet_transactions (transaction_id, user_id, type, amount, balance_before, balance_after, related_type, remark, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [transactionId, userId, 4, amount, balance, newBalance, 'withdraw', `提现到银行卡${bankCard}`, now],
      );

      return {
        transactionId,
        userId,
        type: 4,
        amount,
        status: 'pending',
        createdAt: now,
      };
    } catch (error) {
      console.error('提现错误:', error);
      throw error;
    }
  }
}

module.exports = WalletService;