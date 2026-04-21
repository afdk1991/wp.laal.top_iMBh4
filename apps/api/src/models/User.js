const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'user', 'delivery'),
    allowNull: false,
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    allowNull: false,
    defaultValue: 'active'
  },
  avatar: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  wechatOpenid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  wechatUnionid: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  qqOpenid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  googleOpenid: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  thirdPartyProvider: {
    type: DataTypes.ENUM('wechat', 'qq', 'google', 'none'),
    allowNull: false,
    defaultValue: 'none'
  },
  thirdPartyId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  membershipLevel: {
    type: DataTypes.ENUM('normal', 'bronze', 'silver', 'gold', 'platinum'),
    allowNull: false,
    defaultValue: 'normal'
  },
  membershipExpiry: {
    type: DataTypes.DATE,
    allowNull: true
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  growthPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '成长值，用于会员等级提升'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true
});

module.exports = User;