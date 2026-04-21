import { defineStore } from 'pinia';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    isLoggedIn: false,
    userInfo: null,
    token: uni.getStorageSync('customer_token') || '',
    orders: [],
    currentOrder: null,
    loading: false,
    error: ''
  }),

  getters: {
    hasOrders: (state) => state.orders.length > 0,
    pendingOrders: (state) => state.orders.filter(order => order.status === 'pending'),
    processingOrders: (state) => state.orders.filter(order => order.status === 'processing'),
    completedOrders: (state) => state.orders.filter(order => order.status === 'completed')
  },

  actions: {
    async login(username, password) {
      try {
        this.loading = true;
        this.error = '';
        
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          username,
          password
        });

        if (response.data.code === 200) {
          const { token, user } = response.data.data;
          this.token = token;
          this.userInfo = user;
          this.isLoggedIn = true;
          uni.setStorageSync('customer_token', token);
          uni.setStorageSync('customer_user', JSON.stringify(user));
          
          return { success: true };
        } else {
          this.error = response.data.message;
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        this.error = '登录失败，请稍后重试';
        return { success: false, message: '登录失败，请稍后重试' };
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.isLoggedIn = false;
      this.userInfo = null;
      this.token = '';
      this.orders = [];
      this.currentOrder = null;
      uni.removeStorageSync('customer_token');
      uni.removeStorageSync('customer_user');
    },

    checkLoginStatus() {
      const token = uni.getStorageSync('customer_token');
      const userInfo = uni.getStorageSync('customer_user');
      
      if (token && userInfo) {
        this.token = token;
        this.userInfo = JSON.parse(userInfo);
        this.isLoggedIn = true;
      }
    },

    async getOrders() {
      try {
        this.loading = true;
        this.error = '';
        
        const response = await axios.get(`${API_BASE_URL}/customer/orders`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        if (response.data.code === 200) {
          this.orders = response.data.data.items;
        }
      } catch (error) {
        this.error = '获取订单列表失败';
      } finally {
        this.loading = false;
      }
    },

    async getOrderDetail(orderId) {
      try {
        this.loading = true;
        this.error = '';
        
        const response = await axios.get(`${API_BASE_URL}/customer/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        if (response.data.code === 200) {
          this.currentOrder = response.data.data;
          return { success: true, data: response.data.data };
        } else {
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        this.error = '获取订单详情失败';
        return { success: false, message: '获取订单详情失败' };
      } finally {
        this.loading = false;
      }
    },

    async trackOrder(orderId) {
      try {
        this.loading = true;
        this.error = '';
        
        const response = await axios.get(`${API_BASE_URL}/customer/orders/${orderId}/track`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        if (response.data.code === 200) {
          return { success: true, data: response.data.data };
        } else {
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        this.error = '获取订单追踪失败';
        return { success: false, message: '获取订单追踪失败' };
      } finally {
        this.loading = false;
      }
    },

    async createOrder(orderData) {
      try {
        this.loading = true;
        this.error = '';
        
        const response = await axios.post(`${API_BASE_URL}/customer/orders`, orderData, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        if (response.data.code === 200) {
          // 添加新订单到列表
          this.orders.unshift(response.data.data);
          return { success: true, data: response.data.data };
        } else {
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        this.error = '创建订单失败';
        return { success: false, message: '创建订单失败' };
      } finally {
        this.loading = false;
      }
    },

    async payOrder(orderId, paymentMethod) {
      try {
        this.loading = true;
        this.error = '';
        
        const response = await axios.post(`${API_BASE_URL}/customer/orders/${orderId}/pay`, {
          payment_method: paymentMethod
        }, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });

        if (response.data.code === 200) {
          // 更新订单状态
          const orderIndex = this.orders.findIndex(order => order.id === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex].status = 'paid';
          }
          return { success: true, data: response.data.data };
        } else {
          return { success: false, message: response.data.message };
        }
      } catch (error) {
        this.error = '支付失败';
        return { success: false, message: '支付失败' };
      } finally {
        this.loading = false;
      }
    }
  }
});