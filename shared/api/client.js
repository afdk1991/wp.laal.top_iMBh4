/**
 * API客户端
 * 版本: v1.0.0.0
 * 说明: 前端统一API请求封装
 */

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';
console.log('API_BASE_URL:', API_BASE_URL);
const API_VERSION = 'v1';

/**
 * 获取存储的Token
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem('access_token');
}

/**
 * 设置Token
 * @param {string} token - Access Token
 * @param {string} refreshToken - Refresh Token
 */
function setToken(token, refreshToken) {
  localStorage.setItem('access_token', token);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
}

/**
 * 清除Token
 */
function clearToken() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

/**
 * 刷新Token
 * @returns {Promise<boolean>}
 */
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    clearToken();
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (data.status === 'success') {
      setToken(data.data.token, data.data.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('刷新Token失败:', error);
  }

  clearToken();
  return false;
}

/**
 * 统一请求封装
 * @param {string} endpoint - API端点
 * @param {Object} options - 请求选项
 * @returns {Promise<Object>}
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // 添加认证头
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 处理请求体
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    let response = await fetch(url, config);

    // Token过期，尝试刷新
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        config.headers.Authorization = `Bearer ${getToken()}`;
        response = await fetch(url, config);
      } else {
        // 刷新失败，跳转到登录
        window.location.href = '/login.html';
        throw new Error('登录已过期，请重新登录');
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '请求失败');
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

/**
 * GET请求
 * @param {string} endpoint - API端点
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>}
 */
function get(endpoint, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return request(url, { method: 'GET' });
}

/**
 * POST请求
 * @param {string} endpoint - API端点
 * @param {Object} body - 请求体
 * @returns {Promise<Object>}
 */
function post(endpoint, body = {}) {
  return request(endpoint, { method: 'POST', body });
}

/**
 * PUT请求
 * @param {string} endpoint - API端点
 * @param {Object} body - 请求体
 * @returns {Promise<Object>}
 */
function put(endpoint, body = {}) {
  return request(endpoint, { method: 'PUT', body });
}

/**
 * DELETE请求
 * @param {string} endpoint - API端点
 * @returns {Promise<Object>}
 */
function del(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

/**
 * 上传文件
 * @param {string} endpoint - API端点
 * @param {FormData} formData - 表单数据
 * @returns {Promise<Object>}
 */
function _upload(endpoint, formData) {
  return request(endpoint, {
    method: 'POST',
    body: formData,
    headers: {}, // 让浏览器自动设置Content-Type
  });
}

// API模块定义
const API = {
  // 认证相关
  auth: {
    login: (phone, password) => post('/auth/login', { phone, password }),
    register: data => post('/auth/register', data),
    logout: () => post('/auth/logout'),
    sendSms: (phone, type) => post('/auth/sms/send', { phone, type }),
    getProfile: () => get('/auth/profile'),
    updateProfile: data => put('/auth/profile', data),
  },

  // 用户相关
  user: {
    getInfo: () => get('/user/info'),
    updateInfo: data => put('/user/info', data),
    getAddresses: () => get('/user/addresses'),
    addAddress: data => post('/user/addresses', data),
    updateAddress: (id, data) => put(`/user/addresses/${id}`, data),
    deleteAddress: id => del(`/user/addresses/${id}`),
  },

  // 出行相关
  ride: {
    estimate: (from, to, type) => post('/ride/estimate', { from, to, type }),
    request: data => post('/ride/request', data),
    getStatus: rideId => get(`/ride/${rideId}/status`),
    cancel: (rideId, reason) => post(`/ride/${rideId}/cancel`, { reason }),
    getHistory: params => get('/ride/history', params),
    searchLocation: (keywords, lng, lat) => get('/ride/search-location', { keywords, lng, lat }),
    reverseGeocode: (lng, lat) => get('/ride/reverse-geocode', { lng, lat }),
  },

  // 电商相关
  shop: {
    getCategories: () => get('/shop/categories'),
    getProducts: params => get('/shop/products', params),
    getProduct: id => get(`/shop/products/${id}`),
    createOrder: data => post('/shop/orders', data),
    getOrders: params => get('/shop/orders', params),
    getOrder: id => get(`/shop/orders/${id}`),
  },

  // 支付相关
  payment: {
    create: data => post('/payment/create', data),
    getStatus: (paymentId, channel) => get(`/payment/status/${paymentId}`, { channel }),
    refund: data => post('/payment/refund', data),
  },

  // 社交相关
  social: {
    getPosts: params => get('/social/posts', params),
    getPost: id => get(`/social/posts/${id}`),
    createPost: data => post('/social/posts', data),
    getComments: (postId, params) => get(`/social/posts/${postId}/comments`, params),
    createComment: (postId, data) => post(`/social/posts/${postId}/comments`, data),
  },

  // 通知相关
  notification: {
    getList: params => get('/notification/list', params),
    getUnreadCount: () => get('/notification/unread-count'),
    markAsRead: id => post(`/notification/${id}/read`),
    markAllAsRead: () => post('/notification/read-all'),
    delete: id => del(`/notification/${id}`),
  },

  // 钱包相关
  wallet: {
    getInfo: () => get('/wallet/info'),
    recharge: data => post('/wallet/recharge', data),
    withdraw: data => post('/wallet/withdraw', data),
    getTransactions: params => get('/wallet/transactions', params),
  },

  // 统计相关
  analytics: {
    getOverview: params => get('/analytics/overview', params),
    getOrderTrend: params => get('/analytics/order-trend', params),
    getServiceDistribution: params => get('/analytics/service-distribution', params),
    getUserGrowth: params => get('/analytics/user-growth', params),
    getSalesRanking: params => get('/analytics/sales-ranking', params),
  },
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, getToken, setToken, clearToken, request };
} else {
  window.API = API;
  window.APIClient = { getToken, setToken, clearToken, request };
}
