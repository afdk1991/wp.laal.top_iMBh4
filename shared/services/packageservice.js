/**
 * 服务套餐服务
 * 版本: v1.0.0.0
 * 说明: 管理服务套餐的创建、查询、更新和删除
 */

class PackageService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 创建服务套餐
   * @param {Object} packageData - 套餐数据
   * @returns {Promise<Object>} 创建的套餐
   */
  async createPackage(packageData) {
    try {
      const packageId = `PACKAGE${Date.now()}`;
      const now = new Date().toISOString();

      await this.db.run(
        `INSERT INTO servicePackages (packageId, userId, rideId, foodOrderId, rideInfo, foodInfo, totalAmount, paymentMethod, status, paymentStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          packageId,
          packageData.userId,
          packageData.rideId,
          packageData.foodOrderId,
          JSON.stringify(packageData.rideInfo),
          JSON.stringify(packageData.foodInfo),
          packageData.totalAmount,
          packageData.paymentMethod || 'online',
          packageData.status || 'pending',
          packageData.paymentStatus || 'unpaid',
          now,
          now,
        ],
      );

      return {
        ...packageData,
        packageId,
        createdAt: now,
        updatedAt: now
      };
    } catch (error) {
      console.error('创建服务套餐错误:', error);
      throw error;
    }
  }

  /**
   * 获取服务套餐
   * @param {string} packageId - 套餐ID
   * @returns {Promise<Object>} 套餐信息
   */
  async getPackage(packageId) {
    try {
      const packages = await this.db.execute(
        'SELECT * FROM servicePackages WHERE packageId = ?',
        [packageId],
      );

      if (packages.length === 0) {
        return null;
      }

      return packages[0];
    } catch (error) {
      console.error('获取服务套餐错误:', error);
      throw error;
    }
  }

  /**
   * 获取用户的服务套餐列表
   * @param {string} userId - 用户ID
   * @param {Object} options - 分页选项
   * @returns {Promise<Object>} 套餐列表和分页信息
   */
  async getUserPackages(userId, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const offset = (page - 1) * limit;

      const packages = await this.db.execute(
        'SELECT * FROM servicePackages WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [userId, parseInt(limit, 10), parseInt(offset, 10)],
      );

      const totalResult = await this.db.execute(
        'SELECT COUNT(*) as total FROM servicePackages WHERE userId = ?',
        [userId],
      );
      const total = totalResult[0].total;

      return {
        packages,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      console.error('获取用户服务套餐错误:', error);
      throw error;
    }
  }

  /**
   * 更新服务套餐状态
   * @param {string} packageId - 套餐ID
   * @param {Object} updates - 更新内容
   * @returns {Promise<Object>} 更新后的套餐
   */
  async updatePackage(packageId, updates) {
    try {
      const updateFields = [];
      const updateValues = [];

      if (updates.status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(updates.status);
      }
      if (updates.paymentStatus !== undefined) {
        updateFields.push('paymentStatus = ?');
        updateValues.push(updates.paymentStatus);
      }

      if (updateFields.length > 0) {
        updateFields.push('updatedAt = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(packageId);

        const sql = `UPDATE servicePackages SET ${updateFields.join(', ')} WHERE packageId = ?`;
        await this.db.run(sql, updateValues);
      }

      return this.getPackage(packageId);
    } catch (error) {
      console.error('更新服务套餐错误:', error);
      throw error;
    }
  }

  /**
   * 删除服务套餐
   * @param {string} packageId - 套餐ID
   * @returns {Promise<boolean>} 是否删除成功
   */
  async deletePackage(packageId) {
    try {
      await this.db.run(
        'DELETE FROM servicePackages WHERE packageId = ?',
        [packageId],
      );

      return true;
    } catch (error) {
      console.error('删除服务套餐错误:', error);
      throw error;
    }
  }
}

module.exports = PackageService;
