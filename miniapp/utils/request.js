const { getPlatform, getApi } = require('../platforms/adapter.js');

function request(options) {
  const api = getApi();
  const platform = getPlatform();
  const defaultOptions = {
    timeout: 30000,
    header: {
      'Content-Type': 'application/json'
    }
  };

  if (platform === 'alipay') {
    return new Promise((resolve, reject) => {
      api.request({
        ...defaultOptions,
        ...options,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    });
  }

  return new Promise((resolve, reject) => {
    api.request({
      ...defaultOptions,
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function get(url, params = {}, options = {}) {
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  const fullUrl = queryString ? `${url}?${queryString}` : url;
  return request({
    url: fullUrl,
    method: 'GET',
    ...options
  });
}

function post(url, data = {}, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  });
}

module.exports = { request, get, post };
