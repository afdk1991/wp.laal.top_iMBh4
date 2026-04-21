/**
 * 物流轨迹模型
 * 版本: v1.0.0.0
 * 说明: 物流轨迹信息模型
 */

'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class LogisticsTrack extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LogisticsTrack.belongsTo(models.Logistics, {
        foreignKey: 'logisticsId',
        as: 'logistics',
      });
    }
  }

  LogisticsTrack.init({
    // 轨迹ID
    trackId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    // 物流ID
    logisticsId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'logistics',
        key: 'logisticsId',
      },
    },
    // 时间点
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // 地点
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 状态
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // 描述
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    // 创建时间
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'LogisticsTrack',
    tableName: 'logistics_tracks',
    timestamps: true,
    indexes: [
      {
        name: 'idx_logistics_id',
        fields: ['logisticsId'],
      },
      {
        name: 'idx_timestamp',
        fields: ['timestamp'],
      },
    ],
  });

  return LogisticsTrack;
};
