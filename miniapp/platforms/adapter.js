const PLATFORM_WECHAT = 'wechat';
const PLATFORM_ALIPAY = 'alipay';
const PLATFORM_BAIDU = 'baidu';
const PLATFORM_BYTEDANCE = 'bytedance';
const PLATFORM_JD = 'jd';
const PLATFORM_MEITUAN = 'meituan';
const PLATFORM_PINDUODUO = 'pinduoduo';
const PLATFORM_KUAISHOU = 'kuaishou';
const PLATFORM_HUAWEI = 'huawei';
const PLATFORM_XIAOMI = 'xiaomi';
const PLATFORM_OPPO = 'oppo';
const PLATFORM_QQ = 'qq';

function getPlatform() {
  if (typeof tt !== 'undefined') {
    return PLATFORM_BYTEDANCE;
  } else if (typeof swan !== 'undefined') {
    return PLATFORM_BAIDU;
  } else if (typeof my !== 'undefined') {
    return PLATFORM_ALIPAY;
  } else if (typeof wx !== 'undefined') {
    return PLATFORM_WECHAT;
  } else if (typeof jd !== 'undefined') {
    return PLATFORM_JD;
  } else if (typeof mt !== 'undefined') {
    return PLATFORM_MEITUAN;
  } else if (typeof PDD !== 'undefined') {
    return PLATFORM_PINDUODUO;
  } else if (typeof ks !== 'undefined') {
    return PLATFORM_KUAISHOU;
  } else if (typeof qh !== 'undefined') {
    return PLATFORM_HUAWEI;
  } else if (typeof mi !== 'undefined') {
    return PLATFORM_XIAOMI;
  } else if (typeof qapp !== 'undefined') {
    return PLATFORM_OPPO;
  } else if (typeof qq !== 'undefined') {
    return PLATFORM_QQ;
  }
  return PLATFORM_WECHAT;
}

const platform = getPlatform();

function getApi() {
  switch (platform) {
    case PLATFORM_ALIPAY:
      return my;
    case PLATFORM_BAIDU:
      return swan;
    case PLATFORM_BYTEDANCE:
      return tt;
    case PLATFORM_JD:
      return jd;
    case PLATFORM_MEITUAN:
      return mt;
    case PLATFORM_PINDUODUO:
      return PDD;
    case PLATFORM_KUAISHOU:
      return ks;
    case PLATFORM_HUAWEI:
      return qh;
    case PLATFORM_XIAOMI:
      return mi;
    case PLATFORM_OPPO:
      return qapp;
    case PLATFORM_QQ:
      return qq;
    case PLATFORM_WECHAT:
    default:
      return wx;
  }
}

const api = getApi();

const platformAdapter = {
  platform,
  api,

  request(options) {
    return api.request(options);
  },

  navigateTo(options) {
    return api.navigateTo(options);
  },

  showToast(options) {
    const toastOptions = { ...options };
    if (platform === PLATFORM_ALIPAY) {
      toastOptions.content = options.title;
      delete toastOptions.title;
    }
    return api.showToast(toastOptions);
  },

  setStorageSync(key, data) {
    return api.setStorageSync(key, data);
  },

  getStorageSync(key) {
    return api.getStorageSync(key);
  },

  login(options) {
    return api.login(options);
  },

  getUserProfile(options) {
    if (platform === PLATFORM_WECHAT) {
      return api.getUserProfile(options);
    } else {
      return api.getUserInfo(options);
    }
  },

  createSelectorQuery() {
    return api.createSelectorQuery();
  },

  getSystemInfoSync() {
    if (platform === PLATFORM_WECHAT) {
      return wx.getSystemInfoSync();
    } else if (platform === PLATFORM_ALIPAY) {
      return my.getSystemInfoSync();
    } else if (platform === PLATFORM_BAIDU) {
      return swan.getSystemInfoSync();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.getSystemInfoSync();
    } else if (platform === PLATFORM_QQ) {
      return qq.getSystemInfoSync();
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.getSystemInfoSync();
    }
    return {};
  },

  showLoading(options = {}) {
    const loadingOptions = { ...options };
    if (platform === PLATFORM_ALIPAY) {
      loadingOptions.content = options.title || '';
      delete loadingOptions.title;
    }
    return api.showLoading(loadingOptions);
  },

  hideLoading() {
    return api.hideLoading();
  },

  getStorageInfoSync() {
    if (platform === PLATFORM_WECHAT) {
      return wx.getStorageInfoSync();
    } else if (platform === PLATFORM_ALIPAY) {
      return my.getStorageInfoSync();
    } else if (platform === PLATFORM_BAIDU) {
      return swan.getStorageInfoSync();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.getStorageInfoSync();
    } else if (platform === PLATFORM_QQ) {
      return qq.getStorageInfoSync();
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.getStorageInfoSync();
    }
    return {};
  },

  canIUse(schema) {
    if (platform === PLATFORM_WECHAT) {
      return wx.canIUse(schema);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.canIUse(schema);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.canIUse(schema);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.canIUse(schema);
    } else if (platform === PLATFORM_QQ) {
      return qq.canIUse(schema);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.canIUse(schema);
    }
    return false;
  },

  getDeviceInfo() {
    const sysInfo = this.getSystemInfoSync();
    return {
      platform: platform,
      brand: sysInfo.brand || '',
      model: sysInfo.model || '',
      system: sysInfo.system || '',
      version: sysInfo.version || '',
      screenWidth: sysInfo.screenWidth || 375,
      screenHeight: sysInfo.screenHeight || 812,
      statusBarHeight: sysInfo.statusBarHeight || 20,
      safeArea: sysInfo.safeArea || {},
    };
  },

  isTransparentTitle() {
    if (platform === PLATFORM_WECHAT) {
      return wx.canIUse('pageMeta.default-toolbar');
    }
    return false;
  },

  setNavigationBarTitle(title) {
    return api.setNavigationBarTitle({ title });
  },

  showNavigationBarLoading() {
    if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
      return wx.showNavigationBarLoading();
    } else if (platform === PLATFORM_ALIPAY) {
      return my.showNavigationBarLoading();
    } else if (platform === PLATFORM_BAIDU) {
      return swan.showNavigationBarLoading();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.showNavigationBarLoading();
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.showNavigationBarLoading();
    }
  },

  hideNavigationBarLoading() {
    if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
      return wx.hideNavigationBarLoading();
    } else if (platform === PLATFORM_ALIPAY) {
      return my.hideNavigationBarLoading();
    } else if (platform === PLATFORM_BAIDU) {
      return swan.hideNavigationBarLoading();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.hideNavigationBarLoading();
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.hideNavigationBarLoading();
    }
  },

  pageScrollTo(options = {}) {
    if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
      return wx.pageScrollTo(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.pageScrollTo(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.pageScrollTo(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.pageScrollTo(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.pageScrollTo(options);
    }
  },

  getStorage(options) {
    if (platform === PLATFORM_WECHAT) {
      return wx.getStorage(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.getStorage(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.getStorage(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.getStorage(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.getStorage(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.getStorage(options);
    }
  },

  setStorage(options) {
    if (platform === PLATFORM_WECHAT) {
      return wx.setStorage(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.setStorage(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.setStorage(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.setStorage(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.setStorage(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.setStorage(options);
    }
  },

  removeStorage(options) {
    if (platform === PLATFORM_WECHAT) {
      return wx.removeStorage(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.removeStorage(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.removeStorage(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.removeStorage(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.removeStorage(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.removeStorage(options);
    }
  },

  clearStorage() {
    if (platform === PLATFORM_WECHAT) {
      return wx.clearStorage();
    } else if (platform === PLATFORM_ALIPAY) {
      return my.clearStorage();
    } else if (platform === PLATFORM_BAIDU) {
      return swan.clearStorage();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.clearStorage();
    } else if (platform === PLATFORM_QQ) {
      return qq.clearStorage();
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.clearStorage();
    }
  },

  getLocation(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.getLocation(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.getLocation(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.getLocation(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.getLocation(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.getLocation(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.getLocation(options);
    }
  },

  chooseImage(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.chooseImage(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.chooseImage(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.chooseImage(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.chooseImage(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.chooseImage(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.chooseImage(options);
    }
  },

  previewImage(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.previewImage(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.previewImage(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.previewImage(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.previewImage(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.previewImage(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.previewImage(options);
    }
  },

  makePhoneCall(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.makePhoneCall(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.makePhoneCall(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.makePhoneCall(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.makePhoneCall(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.makePhoneCall(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.makePhoneCall(options);
    }
  },

  scanCode(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.scanCode(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.scanCode(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.scanCode(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.scanCode(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.scanCode(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.scanCode(options);
    }
  },

  getUserInfo(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.getUserInfo(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.getUserInfo(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.getUserInfo(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.getUserInfo(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.getUserInfo(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.getUserInfo(options);
    }
  },

  getPhoneNumber(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.getPhoneNumber(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.getPhoneNumber(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.getPhoneNumber(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.getPhoneNumber(options);
    }
  },

  showShareMenu(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.showShareMenu(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.showShareMenu(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.showShareMenu(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.showShareMenu(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.showShareMenu(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.showShareMenu(options);
    }
  },

  hideShareMenu() {
    if (platform === PLATFORM_WECHAT) {
      return wx.hideShareMenu();
    } else if (platform === PLATFORM_ALIPAY) {
      return my.hideShareMenu();
    } else if (platform === PLATFORM_BAIDU) {
      return swan.hideShareMenu();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.hideShareMenu();
    } else if (platform === PLATFORM_QQ) {
      return qq.hideShareMenu();
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.hideShareMenu();
    }
  },

  updateShareMenu(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.updateShareMenu(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.updateShareMenu(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.updateShareMenu(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.updateShareMenu(options);
    }
  },

  getShareInfo(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.getShareInfo(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.getShareInfo(options);
    }
  },

  createVideoContext(videoId) {
    if (platform === PLATFORM_WECHAT) {
      return wx.createVideoContext(videoId);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.createVideoContext(videoId);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.createVideoContext(videoId);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.createVideoContext(videoId);
    } else if (platform === PLATFORM_QQ) {
      return qq.createVideoContext(videoId);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.createVideoContext(videoId);
    }
  },

  createLivePlayerContext(videoId) {
    if (platform === PLATFORM_WECHAT) {
      return wx.createLivePlayerContext(videoId);
    } else if (platform === PLATFORM_QQ) {
      return qq.createLivePlayerContext(videoId);
    }
  },

  createCameraContext() {
    if (platform === PLATFORM_WECHAT) {
      return wx.createCameraContext();
    } else if (platform === PLATFORM_ALIPAY) {
      return my.createCameraContext();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.createCameraContext();
    }
  },

  createMapContext(mapId) {
    if (platform === PLATFORM_WECHAT) {
      return wx.createMapContext(mapId);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.createMapContext(mapId);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.createMapContext(mapId);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.createMapContext(mapId);
    } else if (platform === PLATFORM_QQ) {
      return qq.createMapContext(mapId);
    }
  },

  chooseAddress(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.chooseAddress(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.chooseAddress(options);
    }
  },

  addCard(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.addCard(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.addCard(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.addCard(options);
    }
  },

  openCard(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.openCard(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.openCard(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.openCard(options);
    }
  },

  openUrl(options = {}) {
    if (platform === PLATFORM_ALIPAY) {
      return my.openUrl(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.openUrl(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.openUrl(options);
    }
  },

  setClipboardData(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.setClipboardData(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.setClipboardData(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.setClipboardData(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.setClipboardData(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.setClipboardData(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.setClipboardData(options);
    }
  },

  getClipboardData(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return wx.getClipboardData(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return my.getClipboardData(options);
    } else if (platform === PLATFORM_BAIDU) {
      return swan.getClipboardData(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.getClipboardData(options);
    } else if (platform === PLATFORM_QQ) {
      return qq.getClipboardData(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return ks.getClipboardData(options);
    }
  },

  makeImagePreview(options = {}) {
    if (platform === PLATFORM_ALIPAY) {
      return my.makeImagePreview(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return tt.previewImage(options);
    }
  },

  choosePhoneContact(options = {}) {
    if (platform === PLATFORM_ALIPAY) {
      return my.choosePhoneContact(options);
    } else if (platform === PLATFORM_WECHAT) {
      return wx.chooseContact(options);
    }
  },

  aliPayTradeap(params, callback) {
    if (platform === PLATFORM_ALIPAY) {
      return my.tradePay(params, callback);
    }
  },

  pddGoodsDetail(goodsId) {
    if (platform === PLATFORM_PINDUODUO) {
      return PDD.router.navigate({ url: `/pages/goods/detail?goods_id=${goodsId}` });
    }
  },

  pddGroupDetail(groupId) {
    if (platform === PLATFORM_PINDUODUO) {
      return PDD.router.navigate({ url: `/pages/group/detail?group_id=${groupId}` });
    }
  },

  mtStoreDetail(storeId) {
    if (platform === PLATFORM_MEITUAN) {
      return mt.router.navigate({ url: `/pages/store/detail?store_id=${storeId}` });
    }
  },

  mtCouponReceive(couponId) {
    if (platform === PLATFORM_MEITUAN) {
      return mt.router.navigate({ url: `/pages/coupon/receive?coupon_id=${couponId}` });
    }
  },

  qqSetHeaderImage(imageUrl) {
    if (platform === PLATFORM_QQ) {
      return qq.setNavigationBarTitle({ title: '' });
    }
  },

  ksVideoPlay(videoId) {
    if (platform === PLATFORM_KUAISHOU) {
      const videoContext = ks.createVideoContext(videoId);
      videoContext.play();
      return videoContext;
    }
  },

  ksVideoPause(videoId) {
    if (platform === PLATFORM_KUAISHOU) {
      const videoContext = ks.createVideoContext(videoId);
      videoContext.pause();
      return videoContext;
    }
  },
};

module.exports = platformAdapter;
