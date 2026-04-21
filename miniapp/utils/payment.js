const platformAdapter = require('../platforms/adapter.js');

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

async function requestPayment(orderInfo) {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    const callbacks = {
      success: (res) => resolve(res),
      fail: (err) => reject(err),
      complete: () => {}
    };

    if (platform === 'alipay') {
      api.tradePay({
        tradeNO: orderInfo.tradeNO,
        ...callbacks
      });
    } else if (platform === 'baidu') {
      api.pay({
        orderInfo: orderInfo.orderInfo,
        ...callbacks
      });
    } else if (platform === 'bytedance') {
      api.pay({
        orderInfo: orderInfo.orderInfo,
        ...callbacks
      });
    } else {
      api.requestPayment({
        ...orderInfo,
        ...callbacks
      });
    }
  });
}

module.exports = { requestPayment };
