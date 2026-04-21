const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const userRoutes = require('./user');
const roleRoutes = require('./role');
const permissionRoutes = require('./permission');
const shopRoutes = require('./shop');
const orderRoutes = require('./order');
const paymentRoutes = require('./payment');
const rideRoutes = require('./ride');
const foodRoutes = require('./food');
const errandRoutes = require('./errand');
const logisticsRoutes = require('./logistics');
const analyticsRoutes = require('./analytics');
const blockchainRoutes = require('./blockchain');
const fiveGRoutes = require('./fiveG');
const aiRoutes = require('./ai');
const contentRoutes = require('./shop');
const mapRoutes = require('./map');
const complianceRoutes = require('./compliance');

// 新增模块路由
const adminRoutes = require('./admin');
const appRoutes = require('./app');
const blogRoutes = require('./blog');
const centerRoutes = require('./center');
const cloudRoutes = require('./cloud');
const dataRoutes = require('./data');
const dhRoutes = require('./dh');
const dnpjRoutes = require('./dnpj');
const fwqRoutes = require('./fwq');
const gyRoutes = require('./gy');
const helpRoutes = require('./help');
const imgRoutes = require('./img');
const loginRoutes = require('./login');
const mallRoutes = require('./mall');
const marketRoutes = require('./market');
const mobileRoutes = require('./mobile');
const mRoutes = require('./m');
const newsRoutes = require('./news');
const payRoutes = require('./pay');
const portalRoutes = require('./portal');
const secureRoutes = require('./secure');
const serviceRoutes = require('./service');
const sjRoutes = require('./sj');
const spRoutes = require('./sp');
const statsRoutes = require('./stats');
const storeRoutes = require('./store');
const supportRoutes = require('./support');
const devRoutes = require('./dev');
const testRoutes = require('./test');
const videoRoutes = require('./video');
const wpRoutes = require('./wp');
const xwRoutes = require('./xw');
const ypRoutes = require('./yp');
const yyRoutes = require('./yy');

const { authMiddleware } = require('../middleware/auth');

// 路由配置，不包含API_PREFIX，由app.js统一添加
router.use('/auth', authRoutes);

router.use('/user', authMiddleware, userRoutes);
router.use('/role', authMiddleware, roleRoutes);
router.use('/permission', authMiddleware, permissionRoutes);

router.use('/shop', shopRoutes);
router.use('/product', authMiddleware, shopRoutes);
router.use('/cart', authMiddleware, shopRoutes);
router.use('/order', authMiddleware, orderRoutes);
router.use('/payment', authMiddleware, paymentRoutes);
router.use('/wallet', authMiddleware, paymentRoutes);

router.use('/ride', rideRoutes);
router.use('/food', foodRoutes);
router.use('/errand', errandRoutes);
router.use('/map', mapRoutes);

router.use('/logistics', authMiddleware, logisticsRoutes);
router.use('/analytics', authMiddleware, analyticsRoutes);
router.use('/dispatch', authMiddleware, rideRoutes);

router.use('/blockchain', blockchainRoutes);
router.use('/5g', fiveGRoutes);

router.use('/coupon', authMiddleware, paymentRoutes);
router.use('/membership', authMiddleware, centerRoutes);
router.use('/growth', authMiddleware, userRoutes);

router.use('/social', authMiddleware, userRoutes);
router.use('/notification', authMiddleware, userRoutes);

router.use('/ai', aiRoutes);
router.use('/content', contentRoutes);
router.use('/compliance', authMiddleware, complianceRoutes);

// 新增模块路由
router.use('/admin', authMiddleware, adminRoutes);
router.use('/app', appRoutes);
router.use('/blog', blogRoutes);
router.use('/center', authMiddleware, centerRoutes);
router.use('/cloud', cloudRoutes);
router.use('/data', authMiddleware, dataRoutes);
router.use('/dh', dhRoutes);
router.use('/dnpj', dnpjRoutes);
router.use('/fwq', fwqRoutes);
router.use('/gy', gyRoutes);
router.use('/help', helpRoutes);
router.use('/img', imgRoutes);
router.use('/login', loginRoutes);
router.use('/mall', mallRoutes);
router.use('/market', marketRoutes);
router.use('/mobile', mobileRoutes);
router.use('/m', mRoutes);
router.use('/news', newsRoutes);
router.use('/pay', authMiddleware, payRoutes);
router.use('/portal', portalRoutes);
router.use('/secure', authMiddleware, secureRoutes);
router.use('/service', serviceRoutes);
router.use('/sj', sjRoutes);
router.use('/sp', spRoutes);
router.use('/stats', authMiddleware, statsRoutes);
router.use('/store', storeRoutes);
router.use('/support', supportRoutes);
router.use('/dev', devRoutes);
router.use('/test', testRoutes);
router.use('/video', videoRoutes);
router.use('/wp', wpRoutes);
router.use('/xw', xwRoutes);
router.use('/yp', ypRoutes);
router.use('/yy', yyRoutes);

router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'OK',
    data: {
      status: 'healthy',
      timestamp: Date.now()
    }
  });
});

module.exports = router;
