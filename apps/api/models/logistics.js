/**
 * 物流模型
 * 版本: v1.0.0.0
 * 说明: 物流信息模型
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Logistics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Logistics.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order',
      });

      Logistics.hasMany(models.LogisticsTrack, {
        foreignKey: 'logisticsId',
        as: 'tracks',
      });
    }
  }

  Logistics.init({
    // 物流ID
    logisticsId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    // 订单ID
    orderId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Orders',
        key: 'orderId',
      },
    },
    // 物流公司
    carrier: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 运单号
    trackingNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 物流状态
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'shipped', 'in_transit', 'delivered', 'failed', 'returned']],
      },
    },
    // 预计送达时间
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // 实际送达时间
    actualDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // 创建时间
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // 更新时间
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'Logistics',
    tableName: 'logistics',
    timestamps: true,
    indexes: [
      {
        name: 'idx_order_id',
        fields: ['orderId'],
      },
      {
        name: 'idx_tracking_number',
        fields: ['trackingNumber'],
      },
      {
        name: 'idx_status',
        fields: ['status'],
      },
    ],
  });

  return Logistics;
};
