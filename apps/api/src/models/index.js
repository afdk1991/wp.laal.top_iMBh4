const sequelize = require('../config/db').sequelize;
const { DataTypes } = require('sequelize');

const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(50), unique: true },
  password: { type: DataTypes.STRING(100) },
  name: { type: DataTypes.STRING(50) },
  phone: { type: DataTypes.STRING(20) },
  email: { type: DataTypes.STRING(100) },
  role: { type: DataTypes.ENUM('admin', 'user', 'delivery'), defaultValue: 'user' },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
  avatar: { type: DataTypes.STRING(500) },
  membershipLevel: { type: DataTypes.ENUM('normal', 'bronze', 'silver', 'gold', 'platinum'), defaultValue: 'normal' },
  points: { type: DataTypes.INTEGER, defaultValue: 0 },
  growthPoints: { type: DataTypes.INTEGER, defaultValue: 0 },
  wechatOpenid: { type: DataTypes.STRING(100), unique: true },
  qqOpenid: { type: DataTypes.STRING(100), unique: true },
  googleOpenid: { type: DataTypes.STRING(100), unique: true },
  thirdPartyProvider: { type: DataTypes.ENUM('wechat', 'qq', 'google', 'none'), defaultValue: 'none' }
}, { tableName: 'users', timestamps: true });

const Address = sequelize.define('Address', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  name: { type: DataTypes.STRING(50) },
  phone: { type: DataTypes.STRING(20) },
  address: { type: DataTypes.STRING(255) },
  latitude: { type: DataTypes.DECIMAL(10, 8) },
  longitude: { type: DataTypes.DECIMAL(11, 8) },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { tableName: 'addresses', timestamps: true });

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderNo: { type: DataTypes.STRING(50), unique: true },
  userId: { type: DataTypes.INTEGER },
  addressId: { type: DataTypes.INTEGER },
  deliveryManId: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('mall', 'food', 'errand', 'ride'), defaultValue: 'mall' },
  status: { type: DataTypes.ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunding'), defaultValue: 'pending' },
  totalAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  remark: { type: DataTypes.STRING(500) },
  payTime: { type: DataTypes.DATE },
  deliveryTime: { type: DataTypes.DATE }
}, { tableName: 'orders', timestamps: true });

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER },
  productId: { type: DataTypes.INTEGER },
  productName: { type: DataTypes.STRING(100) },
  price: { type: DataTypes.DECIMAL(10, 2) },
  quantity: { type: DataTypes.INTEGER },
  subtotal: { type: DataTypes.DECIMAL(10, 2) }
}, { tableName: 'order_items', timestamps: true });

const DeliveryTrack = sequelize.define('DeliveryTrack', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER },
  deliveryManId: { type: DataTypes.INTEGER },
  latitude: { type: DataTypes.DECIMAL(10, 8) },
  longitude: { type: DataTypes.DECIMAL(11, 8) },
  status: { type: DataTypes.STRING(50) },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'delivery_tracks', timestamps: false });

const Product = sequelize.define('Product', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  categoryId: { type: DataTypes.INTEGER },
  images: { type: DataTypes.TEXT },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 0 },
  sales: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'products', timestamps: true });

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  icon: { type: DataTypes.STRING(100) },
  sort: { type: DataTypes.INTEGER, defaultValue: 0 }
}, { tableName: 'categories', timestamps: true });

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  productId: { type: DataTypes.INTEGER },
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
}, { tableName: 'carts', timestamps: true });

const Payment = sequelize.define('Payment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  paymentNo: { type: DataTypes.STRING(50), unique: true },
  orderNo: { type: DataTypes.STRING(50) },
  userId: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.DECIMAL(10, 2) },
  method: { type: DataTypes.ENUM('wechat', 'alipay', 'wallet', 'card') },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded') },
  transactionId: { type: DataTypes.STRING(100) }
}, { tableName: 'payments', timestamps: true });

const Wallet = sequelize.define('Wallet', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  frozenBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
}, { tableName: 'wallets', timestamps: true });

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  walletId: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('recharge', 'payment', 'refund', 'withdraw', 'bonus') },
  amount: { type: DataTypes.DECIMAL(10, 2) },
  balance: { type: DataTypes.DECIMAL(10, 2) },
  status: { type: DataTypes.ENUM('pending', 'completed', 'failed') },
  remark: { type: DataTypes.STRING(255) }
}, { tableName: 'wallet_transactions', timestamps: true });

const Shop = sequelize.define('Shop', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  description: { type: DataTypes.TEXT },
  logo: { type: DataTypes.STRING(500) },
  address: { type: DataTypes.STRING(255) },
  phone: { type: DataTypes.STRING(20) },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 5.0 },
  status: { type: DataTypes.ENUM('open', 'closed', 'suspended'), defaultValue: 'open' }
}, { tableName: 'shops', timestamps: true });

const Driver = sequelize.define('Driver', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  name: { type: DataTypes.STRING(50) },
  phone: { type: DataTypes.STRING(20) },
  idCard: { type: DataTypes.STRING(18) },
  licenseNumber: { type: DataTypes.STRING(20) },
  status: { type: DataTypes.ENUM('online', 'offline', 'busy'), defaultValue: 'offline' },
  rating: { type: DataTypes.DECIMAL(2, 1), defaultValue: 5.0 },
  vehicleId: { type: DataTypes.INTEGER }
}, { tableName: 'drivers', timestamps: true });

const DriverVehicle = sequelize.define('DriverVehicle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  driverId: { type: DataTypes.INTEGER },
  plateNumber: { type: DataTypes.STRING(20) },
  vehicleType: { type: DataTypes.INTEGER },
  brand: { type: DataTypes.STRING(50) },
  model: { type: DataTypes.STRING(50) },
  color: { type: DataTypes.STRING(20) },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { tableName: 'driver_vehicles', timestamps: true });

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100) },
  type: { type: DataTypes.ENUM('discount', 'cash'), defaultValue: 'discount' },
  value: { type: DataTypes.DECIMAL(10, 2) },
  minAmount: { type: DataTypes.DECIMAL(10, 2) },
  totalCount: { type: DataTypes.INTEGER },
  remainCount: { type: DataTypes.INTEGER },
  startTime: { type: DataTypes.DATE },
  endTime: { type: DataTypes.DATE },
  status: { type: DataTypes.ENUM('active', 'inactive', 'expired'), defaultValue: 'active' }
}, { tableName: 'coupons', timestamps: true });

const UserCoupon = sequelize.define('UserCoupon', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  couponId: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('unused', 'used', 'expired'), defaultValue: 'unused' },
  usedAt: { type: DataTypes.DATE },
  orderId: { type: DataTypes.INTEGER }
}, { tableName: 'user_coupons', timestamps: true });

const MembershipLevel = sequelize.define('MembershipLevel', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50) },
  level: { type: DataTypes.INTEGER },
  minGrowth: { type: DataTypes.INTEGER },
  discount: { type: DataTypes.DECIMAL(3, 2) },
  pointsMultiplier: { type: DataTypes.DECIMAL(3, 2), defaultValue: 1.0 }
}, { tableName: 'membership_levels', timestamps: true });

const GrowthTask = sequelize.define('GrowthTask', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100) },
  type: { type: DataTypes.ENUM('daily', 'once') },
  growthValue: { type: DataTypes.INTEGER },
  points: { type: DataTypes.INTEGER },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
}, { tableName: 'growth_tasks', timestamps: true });

const UserTaskProgress = sequelize.define('UserTaskProgress', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  taskId: { type: DataTypes.INTEGER },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('ongoing', 'completed', 'rewarded') },
  completedAt: { type: DataTypes.DATE }
}, { tableName: 'user_task_progress', timestamps: true });

const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  title: { type: DataTypes.STRING(100) },
  content: { type: DataTypes.TEXT },
  type: { type: DataTypes.ENUM('system', 'order', 'promotion', 'social') },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  readAt: { type: DataTypes.DATE }
}, { tableName: 'notifications', timestamps: true });

const Role = sequelize.define('Role', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  code: { type: DataTypes.STRING(50), unique: true },
  description: { type: DataTypes.STRING(255) }
}, { tableName: 'roles', timestamps: true });

const Permission = sequelize.define('Permission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(50), allowNull: false },
  code: { type: DataTypes.STRING(50), unique: true },
  type: { type: DataTypes.ENUM('menu', 'button', 'api') },
  url: { type: DataTypes.STRING(255) },
  method: { type: DataTypes.STRING(10) }
}, { tableName: 'permissions', timestamps: true });

const UserRole = sequelize.define('UserRole', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  roleId: { type: DataTypes.INTEGER }
}, { tableName: 'user_roles', timestamps: false });

const RolePermission = sequelize.define('RolePermission', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  roleId: { type: DataTypes.INTEGER },
  permissionId: { type: DataTypes.INTEGER }
}, { tableName: 'role_permissions', timestamps: false });

const Post = sequelize.define('Post', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  content: { type: DataTypes.TEXT },
  images: { type: DataTypes.TEXT },
  likes: { type: DataTypes.INTEGER, defaultValue: 0 },
  comments: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.ENUM('active', 'deleted'), defaultValue: 'active' }
}, { tableName: 'posts', timestamps: true });

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  postId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  content: { type: DataTypes.TEXT },
  parentId: { type: DataTypes.INTEGER }
}, { tableName: 'comments', timestamps: true });

const Like = sequelize.define('Like', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  postId: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('post', 'comment') }
}, { tableName: 'likes', timestamps: true });

const Collection = sequelize.define('Collection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  productId: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('product', 'shop') }
}, { tableName: 'collections', timestamps: true });

const Review = sequelize.define('Review', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER },
  productId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  rating: { type: DataTypes.INTEGER },
  content: { type: DataTypes.TEXT },
  images: { type: DataTypes.TEXT }
}, { tableName: 'reviews', timestamps: true });

const Refund = sequelize.define('Refund', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  refundNo: { type: DataTypes.STRING(50), unique: true },
  orderId: { type: DataTypes.INTEGER },
  userId: { type: DataTypes.INTEGER },
  amount: { type: DataTypes.DECIMAL(10, 2) },
  reason: { type: DataTypes.TEXT },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected', 'refunded') },
  processedAt: { type: DataTypes.DATE }
}, { tableName: 'refunds', timestamps: true });

const Logistics = sequelize.define('Logistics', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orderId: { type: DataTypes.INTEGER },
  trackingNo: { type: DataTypes.STRING(50), unique: true },
  carrier: { type: DataTypes.STRING(50) },
  status: { type: DataTypes.STRING(50) },
  currentLocation: { type: DataTypes.STRING(255) }
}, { tableName: 'logistics', timestamps: true });

const RideLocation = sequelize.define('RideLocation', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  driverId: { type: DataTypes.INTEGER },
  orderId: { type: DataTypes.INTEGER },
  latitude: { type: DataTypes.DECIMAL(10, 8) },
  longitude: { type: DataTypes.DECIMAL(11, 8) },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { tableName: 'ride_locations', timestamps: false });

const PointHistory = sequelize.define('PointHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  type: { type: DataTypes.ENUM('earn', 'spend') },
  points: { type: DataTypes.INTEGER },
  balance: { type: DataTypes.INTEGER },
  remark: { type: DataTypes.STRING(255) }
}, { tableName: 'point_histories', timestamps: true });

const BrowseHistory = sequelize.define('BrowseHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER },
  productId: { type: DataTypes.INTEGER },
  stayDuration: { type: DataTypes.INTEGER }
}, { tableName: 'browse_histories', timestamps: true });

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

Address.hasMany(Order, { foreignKey: 'addressId' });
Order.belongsTo(Address, { foreignKey: 'addressId' });

User.hasMany(Order, { foreignKey: 'deliveryManId', as: 'deliveryMan' });
Order.belongsTo(User, { foreignKey: 'deliveryManId', as: 'deliveryMan' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Order.hasMany(DeliveryTrack, { foreignKey: 'orderId' });
DeliveryTrack.belongsTo(Order, { foreignKey: 'orderId' });

Product.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

User.hasMany(Cart, { foreignKey: 'userId' });
Cart.belongsTo(User, { foreignKey: 'userId' });
Cart.belongsTo(Product, { foreignKey: 'productId' });

Order.belongsToMany(Coupon, { through: 'order_coupons' });

User.belongsToMany(Role, { through: UserRole, foreignKey: 'userId' });
Role.belongsToMany(User, { through: UserRole, foreignKey: 'roleId' });

Role.belongsToMany(Permission, { through: RolePermission, foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: 'permissionId' });

User.hasMany(Post, { foreignKey: 'userId' });
Post.belongsTo(User, { foreignKey: 'userId' });

Post.hasMany(Comment, { foreignKey: 'postId' });
Comment.belongsTo(Post, { foreignKey: 'postId' });
Comment.belongsTo(User, { foreignKey: 'userId', as: 'author' });

Post.hasMany(Like, { foreignKey: 'postId' });
Like.belongsTo(Post, { foreignKey: 'postId' });
Like.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

Driver.hasOne(DriverVehicle, { foreignKey: 'driverId' });
DriverVehicle.belongsTo(Driver, { foreignKey: 'driverId' });

User.hasMany(RideLocation, { foreignKey: 'driverId', as: 'locations' });
RideLocation.belongsTo(User, { foreignKey: 'driverId', as: 'driver' });

Order.hasMany(RideLocation, { foreignKey: 'orderId' });
RideLocation.belongsTo(Order, { foreignKey: 'orderId' });

module.exports = {
  sequelize,
  User, Address, Order, OrderItem, DeliveryTrack,
  Product, Category, Cart,
  Payment, Wallet, WalletTransaction,
  Shop, Driver, DriverVehicle,
  Coupon, UserCoupon, MembershipLevel, GrowthTask, UserTaskProgress,
  Notification, Role, Permission, UserRole, RolePermission,
  Post, Comment, Like, Collection, Review, Refund, Logistics, RideLocation,
  PointHistory, BrowseHistory
};
