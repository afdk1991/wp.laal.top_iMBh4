const platformAdapter = require('../platforms/adapter.js');

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

async function login() {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    if (platform === 'alipay') {
      api.getAuthCode({
        scopes: ['auth_user'],
        success: (res) => {
          resolve({ code: res.authCode });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === 'bytedance') {
      api.login({
        success: (res) => {
          resolve({ code: res.code });
        },
        fail: (err) => reject(err)
      });
    } else {
      api.login({
        success: (res) => {
          resolve({ code: res.code });
        },
        fail: (err) => reject(err)
      });
    }
  });
}

async function getUserInfo() {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    if (platform === 'wechat') {
      api.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    } else {
      api.getUserInfo({
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    }
  });
}

module.exports = { login, getUserInfo };
