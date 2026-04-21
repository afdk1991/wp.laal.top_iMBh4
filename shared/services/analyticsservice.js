/**
 * 统计服务
 * 版本: v1.0.0.0
 * 说明: 提供数据统计分析、报表生成、趋势分析等功能
 */

class AnalyticsService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 获取平台概览统计
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 概览统计数据
   */
  async getOverview(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;

      let userSql = 'SELECT COUNT(*) as total FROM users WHERE status = 1';
      let orderSql = 'SELECT COUNT(*) as total FROM shop_orders';
      let salesSql = 'SELECT SUM(actual_amount) as total FROM shop_orders WHERE status = 3';
      let rideSql = 'SELECT COUNT(*) as total FROM ride_orders WHERE status = 3';

      const params = [];
      if (startDate && endDate) {
        userSql += ' AND created_at >= ? AND created_at <= ?';
        orderSql += ' AND created_at >= ? AND created_at <= ?';
        salesSql += ' AND created_at >= ? AND created_at <= ?';
        rideSql += ' AND created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate, startDate, endDate, startDate, endDate, startDate, endDate);
      }

      const [users, orders, sales, rides] = await Promise.all([
        this.db.execute(userSql, params),
        this.db.execute(orderSql, params),
        this.db.execute(salesSql, params),
        this.db.execute(rideSql, params),
      ]);

      const totalUsers = users[0]?.total || 0;
      const totalOrders = orders[0]?.total || 0;
      const totalSales = parseFloat(sales[0]?.total || 0);
      const totalRides = rides[0]?.total || 0;

      return {
        totalUsers,
        totalOrders,
        totalSales,
        totalRides,
        averageOrderValue: totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('获取概览统计错误:', error);
      throw error;
    }
  }

  /**
   * 获取订单趋势数据
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 趋势数据
   */
  async getOrderTrend(options = {}) {
    try {
      const { period = 'day', startDate = null, endDate = null, limit = 30 } = options;

      let dateFormat, dateGroup;
      switch (period) {
        case 'hour':
          dateFormat = '%Y-%m-%d %H:00';
          dateGroup = '%Y-%m-%d %H';
          break;
        case 'week':
          dateFormat = '%Y-%u';
          dateGroup = '%Y-%u';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          dateGroup = '%Y-%m';
          break;
        default:
          dateFormat = '%Y-%m-%d';
          dateGroup = '%Y-%m-%d';
      }

      let sql = `
        SELECT
          DATE_FORMAT(created_at, '${dateFormat}') as date,
          COUNT(*) as orderCount,
          SUM(actual_amount) as totalAmount
        FROM shop_orders
        WHERE 1=1
      `;
      const params = [];

      if (startDate && endDate) {
        sql += ' AND created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      sql += ` GROUP BY DATE_FORMAT(created_at, '${dateGroup}') ORDER BY date DESC LIMIT ?`;
      params.push(parseInt(limit, 10));

      const results = await this.db.execute(sql, params);

      return results.map(r => ({
        date: r.date,
        orderCount: r.orderCount,
        totalAmount: parseFloat(r.totalAmount || 0),
      }));
    } catch (error) {
      console.error('获取订单趋势错误:', error);
      throw error;
    }
  }

  /**
   * 获取服务类型分布
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 分布数据
   */
  async getServiceDistribution(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;

      const conditions = [];
      const params = [];

      if (startDate && endDate) {
        conditions.push('created_at >= ? AND created_at <= ?');
        params.push(startDate, endDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const [rides, foods, malls] = await Promise.all([
        this.db.execute(
          `SELECT COUNT(*) as count, SUM(actual_price) as revenue FROM ride_orders ${whereClause}`,
          params,
        ),
        this.db.execute(
          `SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM shop_orders ${whereClause}`,
          params,
        ),
      ]);

      return [
        { service: 'ride', count: rides[0]?.count || 0, revenue: parseFloat(rides[0]?.revenue || 0) },
        { service: 'food', count: foods[0]?.count || 0, revenue: parseFloat(foods[0]?.revenue || 0) },
        { service: 'mall', count: malls[0]?.count || 0, revenue: parseFloat(malls[0]?.revenue || 0) },
      ];
    } catch (error) {
      console.error('获取服务分布错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户增长数据
   * @param {Object} options - 查询选项
   * @returns {Promise<Array>} 增长数据
   */
  async getUserGrowth(options = {}) {
    try {
      const { period = 'day', startDate = null, endDate = null, limit = 30 } = options;

      let dateFormat, dateGroup;
      switch (period) {
        case 'week':
          dateFormat = '%Y-%u';
          dateGroup = '%Y-%u';
          break;
        case 'month':
          dateFormat = '%Y-%m';
          dateGroup = '%Y-%m';
          break;
        default:
          dateFormat = '%Y-%m-%d';
          dateGroup = '%Y-%m-%d';
      }

      let sql = `
        SELECT
          DATE_FORMAT(created_at, '${dateFormat}') as date,
          COUNT(*) as userCount
        FROM users
        WHERE status = 1
      `;
      const params = [];

      if (startDate && endDate) {
        sql += ' AND created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      sql += ` GROUP BY DATE_FORMAT(created_at, '${dateGroup}') ORDER BY date DESC LIMIT ?`;
      params.push(parseInt(limit, 10));

      const results = await this.db.execute(sql, params);

      return results.map(r => ({
        date: r.date,
        userCount: r.userCount,
      }));
    } catch (error) {
      console.error('获取用户增长错误:', error);
      throw error;
    }
  }

  /**
   * 获取销售排行榜
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 排行榜数据
   */
  async getSalesRanking(options = {}) {
    try {
      const { period = 'day', startDate = null, endDate = null, limit = 10 } = options;

      let dateCondition = '';
      const params = [];

      if (startDate && endDate) {
        dateCondition = 'AND created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      const [topProducts, topMerchants] = await Promise.all([
        this.db.execute(
          `SELECT
            oi.product_id,
            oi.product_name,
            SUM(oi.quantity) as totalQuantity,
            SUM(oi.total_amount) as totalRevenue
          FROM order_items oi
          JOIN shop_orders o ON oi.order_id = o.order_id
          WHERE o.status = 3 ${dateCondition}
          GROUP BY oi.product_id, oi.product_name
          ORDER BY totalRevenue DESC
          LIMIT ?`,
          [...params, parseInt(limit, 10)],
        ),
        this.db.execute(
          `SELECT
            o.merchant_id,
            COUNT(*) as orderCount,
            SUM(o.actual_amount) as totalRevenue
          FROM shop_orders o
          WHERE o.status = 3 ${dateCondition}
          GROUP BY o.merchant_id
          ORDER BY totalRevenue DESC
          LIMIT ?`,
          [...params, parseInt(limit, 10)],
        ),
      ]);

      return {
        topProducts: topProducts.map(p => ({
          productId: p.product_id,
          productName: p.product_name,
          totalQuantity: p.totalQuantity,
          totalRevenue: parseFloat(p.totalRevenue || 0),
        })),
        topMerchants: topMerchants.map(m => ({
          merchantId: m.merchant_id,
          orderCount: m.orderCount,
          totalRevenue: parseFloat(m.totalRevenue || 0),
        })),
      };
    } catch (error) {
      console.error('获取销售排行错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户活跃度统计
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 活跃度数据
   */
  async getUserActivity(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;

      let dateCondition = '';
      const params = [];

      if (startDate && endDate) {
        dateCondition = 'AND created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      const [dailyActive, weeklyActive, monthlyActive] = await Promise.all([
        this.db.execute(
          `SELECT COUNT(DISTINCT user_id) as count
           FROM wallet_transactions
           WHERE type = 2 ${dateCondition}
           AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
          params,
        ),
        this.db.execute(
          `SELECT COUNT(DISTINCT user_id) as count
           FROM wallet_transactions
           WHERE type = 2 ${dateCondition}
           AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
          params,
        ),
        this.db.execute(
          `SELECT COUNT(DISTINCT user_id) as count
           FROM wallet_transactions
           WHERE type = 2 ${dateCondition}
           AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`,
          params,
        ),
      ]);

      return {
        dailyActive: dailyActive[0]?.count || 0,
        weeklyActive: weeklyActive[0]?.count || 0,
        monthlyActive: monthlyActive[0]?.count || 0,
      };
    } catch (error) {
      console.error('获取用户活跃度错误:', error);
      throw error;
    }
  }

  /**
   * 获取转化率数据
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 转化率数据
   */
  async getConversionRates(options = {}) {
    try {
      const { startDate = null, endDate = null } = options;

      let dateCondition = '';
      const params = [];

      if (startDate && endDate) {
        dateCondition = 'AND created_at >= ? AND created_at <= ?';
        params.push(startDate, endDate);
      }

      const [views, carts, checkouts, orders] = await Promise.all([
        this.db.execute(
          `SELECT COUNT(*) as count FROM browse_history WHERE 1=1 ${dateCondition}`,
          params,
        ),
        this.db.execute(
          `SELECT COUNT(*) as count FROM shopping_carts WHERE 1=1 ${dateCondition}`,
          params,
        ),
        this.db.execute(
          `SELECT COUNT(*) as count FROM shop_orders WHERE status >= 0 ${dateCondition}`,
          params,
        ),
        this.db.execute(
          `SELECT COUNT(*) as count FROM shop_orders WHERE status = 3 ${dateCondition}`,
          params,
        ),
      ]);

      const viewCount = views[0]?.count || 0;
      const cartCount = carts[0]?.count || 0;
      const checkoutCount = checkouts[0]?.count || 0;
      const orderCount = orders[0]?.count || 0;

      return {
        viewToCart: viewCount > 0 ? ((cartCount / viewCount) * 100).toFixed(2) : 0,
        cartToCheckout: cartCount > 0 ? ((checkoutCount / cartCount) * 100).toFixed(2) : 0,
        checkoutToOrder: checkoutCount > 0 ? ((orderCount / checkoutCount) * 100).toFixed(2) : 0,
        overallConversion: viewCount > 0 ? ((orderCount / viewCount) * 100).toFixed(2) : 0,
      };
    } catch (error) {
      console.error('获取转化率错误:', error);
      throw error;
    }
  }
}

module.exports = AnalyticsService;