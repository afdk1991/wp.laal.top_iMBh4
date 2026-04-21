<template>
  <div class="profile-container">
    <!-- 顶部用户信息 -->
    <div class="user-info-section">
      <div class="user-avatar">
        <uni-icon type="person" size="48" color="#34c759"></uni-icon>
      </div>
      <div class="user-details" v-if="customerStore.isLoggedIn">
        <div class="user-name">{{ customerStore.userInfo?.name || '用户' }}</div>
        <div class="user-username">{{ customerStore.userInfo?.username }}</div>
      </div>
      <div class="user-details" v-else>
        <div class="login-prompt" @click="goToLogin">点击登录</div>
        <div class="login-desc">登录后享受更多服务</div>
      </div>
    </div>

    <!-- 订单统计 -->
    <div class="order-stats" v-if="customerStore.isLoggedIn">
      <div class="stat-item" @click="goToOrderList('all')">
        <div class="stat-icon">
          <uni-icon type="list" size="24" color="#34c759"></uni-icon>
        </div>
        <div class="stat-text">全部订单</div>
        <div class="stat-count">{{ customerStore.orders.length }}</div>
      </div>
      <div class="stat-item" @click="goToOrderList('pending')">
        <div class="stat-icon">
          <uni-icon type="time" size="24" color="#ff9800"></uni-icon>
        </div>
        <div class="stat-text">待处理</div>
        <div class="stat-count">{{ customerStore.pendingOrders.length }}</div>
      </div>
      <div class="stat-item" @click="goToOrderList('processing')">
        <div class="stat-icon">
          <uni-icon type="refresh" size="24" color="#2196f3"></uni-icon>
        </div>
        <div class="stat-text">处理中</div>
        <div class="stat-count">{{ customerStore.processingOrders.length }}</div>
      </div>
      <div class="stat-item" @click="goToOrderList('completed')">
        <div class="stat-icon">
          <uni-icon type="success" size="24" color="#4caf50"></uni-icon>
        </div>
        <div class="stat-text">已完成</div>
        <div class="stat-count">{{ customerStore.completedOrders.length }}</div>
      </div>
    </div>

    <!-- 功能列表 -->
    <div class="feature-list">
      <div class="feature-section">
        <div class="feature-item" @click="addressManagement">
          <div class="feature-icon">
            <uni-icon type="location" size="24" color="#34c759"></uni-icon>
          </div>
          <div class="feature-text">地址管理</div>
          <uni-icon type="right" size="20" color="#999"></uni-icon>
        </div>
        <div class="feature-item" @click="paymentManagement">
          <div class="feature-icon">
            <uni-icon type="creditcard" size="24" color="#34c759"></uni-icon>
          </div>
          <div class="feature-text">支付管理</div>
          <uni-icon type="right" size="20" color="#999"></uni-icon>
        </div>
        <div class="feature-item" @click="couponManagement">
          <div class="feature-icon">
            <uni-icon type="gift" size="24" color="#34c759"></uni-icon>
          </div>
          <div class="feature-text">优惠券</div>
          <uni-icon type="right" size="20" color="#999"></uni-icon>
        </div>
      </div>
      
      <div class="feature-section">
        <div class="feature-item" @click="customerService">
          <div class="feature-icon">
            <uni-icon type="chat" size="24" color="#34c759"></uni-icon>
          </div>
          <div class="feature-text">客服中心</div>
          <uni-icon type="right" size="20" color="#999"></uni-icon>
        </div>
        <div class="feature-item" @click="feedback">
          <div class="feature-icon">
            <uni-icon type="compose" size="24" color="#34c759"></uni-icon>
          </div>
          <div class="feature-text">意见反馈</div>
          <uni-icon type="right" size="20" color="#999"></uni-icon>
        </div>
        <div class="feature-item" @click="aboutUs">
          <div class="feature-icon">
            <uni-icon type="info" size="24" color="#34c759"></uni-icon>
          </div>
          <div class="feature-text">关于我们</div>
          <uni-icon type="right" size="20" color="#999"></uni-icon>
        </div>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <button 
      v-if="customerStore.isLoggedIn"
      class="logout-button"
      @click="logout"
    >
      退出登录
    </button>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useCustomerStore } from '../../store/customer';

const customerStore = useCustomerStore();

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' });
};

// 跳转到订单列表
const goToOrderList = (status) => {
  uni.switchTab({ url: '/pages/order/list' });
  // 这里可以通过全局状态或本地存储传递状态参数
  uni.setStorageSync('orderStatus', status);
};

// 地址管理
const addressManagement = () => {
  if (!customerStore.isLoggedIn) {
    goToLogin();
    return;
  }
  uni.showToast({
    title: '地址管理功能开发中',
    duration: 2000
  });
};

// 支付管理
const paymentManagement = () => {
  if (!customerStore.isLoggedIn) {
    goToLogin();
    return;
  }
  uni.showToast({
    title: '支付管理功能开发中',
    duration: 2000
  });
};

// 优惠券管理
const couponManagement = () => {
  if (!customerStore.isLoggedIn) {
    goToLogin();
    return;
  }
  uni.showToast({
    title: '优惠券功能开发中',
    duration: 2000
  });
};

// 客服中心
const customerService = () => {
  uni.showToast({
    title: '客服中心功能开发中',
    duration: 2000
  });
};

// 意见反馈
const feedback = () => {
  if (!customerStore.isLoggedIn) {
    goToLogin();
    return;
  }
  uni.showToast({
    title: '意见反馈功能开发中',
    duration: 2000
  });
};

// 关于我们
const aboutUs = () => {
  uni.showToast({
    title: '关于我们功能开发中',
    duration: 2000
  });
};

// 退出登录
const logout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        customerStore.logout();
        uni.switchTab({ url: '/pages/index/index' });
      }
    }
  });
};

// 页面加载时检查登录状态
onMounted(() => {
  customerStore.checkLoginStatus();
  if (customerStore.isLoggedIn) {
    customerStore.getOrders();
  }
});
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-info-section {
  background-color: #34c759;
  color: white;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.user-details {
  text-align: center;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-username {
  font-size: 14px;
  opacity: 0.8;
}

.login-prompt {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  cursor: pointer;
  text-decoration: underline;
}

.login-desc {
  font-size: 14px;
  opacity: 0.8;
}

.order-stats {
  display: flex;
  background-color: white;
  margin: 12px 0;
  padding: 16px;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-icon {
  margin-bottom: 8px;
}

.stat-text {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-count {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.feature-list {
  margin: 12px 0;
}

.feature-section {
  background-color: white;
  margin-bottom: 12px;
}

.feature-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.feature-item:last-child {
  border-bottom: none;
}

.feature-item:hover {
  background-color: #f5f5f5;
}

.feature-icon {
  margin-right: 16px;
}

.feature-text {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.logout-button {
  width: 90%;
  margin: 24px auto;
  padding: 12px;
  background-color: white;
  color: #f44336;
  border: 1px solid #f44336;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #f44336;
  color: white;
}
</style>