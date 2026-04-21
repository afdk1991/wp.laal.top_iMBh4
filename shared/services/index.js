/**
 * 共享服务模块导出
 * 版本: v1.0.0.0
 */

const PackageService = require('./packageservice');
const SubscriptionService = require('./subscriptionservice');
const WalletService = require('./walletservice');
const NotificationService = require('./notificationservice');
const AnalyticsService = require('./analyticsservice');

module.exports = {
  PackageService,
  SubscriptionService,
  WalletService,
  NotificationService,
  AnalyticsService,
};