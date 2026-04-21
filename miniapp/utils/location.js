const platformAdapter = require('../platforms/adapter.js');

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

function getLocation(options = {}) {
  const api = getApi();
  const platform = getPlatform();

  const defaultOptions = {
    type: 'gcj02',
    success: () => {},
    fail: () => {}
  };

  return new Promise((resolve, reject) => {
    if (platform === 'alipay') {
      api.getLocation({
        ...defaultOptions,
        ...options,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            speed: res.speed,
            accuracy: res.accuracy
          });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === 'baidu') {
      api.getLocation({
        ...defaultOptions,
        ...options,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            speed: res.speed,
            accuracy: res.accuracy
          });
        },
        fail: (err) => reject(err)
      });
    } else {
      api.getLocation({
        ...defaultOptions,
        ...options,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    }
  });
}

function openLocation(latitude, longitude, name, address) {
  const api = getApi();
  const platform = getPlatform();

  if (platform === 'alipay') {
    api.openLocation({
      latitude,
      longitude,
      name,
      address
    });
  } else {
    api.openLocation({
      latitude,
      longitude,
      name,
      address
    });
  }
}

module.exports = { getLocation, openLocation };
