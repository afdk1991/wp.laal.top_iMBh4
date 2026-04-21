<template>
  <div class="index-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="user-info">
        <div v-if="customerStore.isLoggedIn" class="greeting" :class="{ 'animate-fade-in': true }">
          欢迎，{{ customerStore.userInfo?.name || '用户' }}！
        </div>
        <div v-else class="login-prompt" :class="{ 'animate-fade-in': true }">
          <text @click="goToLogin" class="login-link">登录/注册</text> 享受更多服务
        </div>
      </div>
      <div class="header-actions">
        <uni-icon type="search" size="24" @click="search" class="header-icon"></uni-icon>
        <uni-icon type="bell" size="24" @click="notifications" class="header-icon"></uni-icon>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="quick-actions">
      <div class="action-item" @click="createOrder" :class="{ 'animate-scale-in': true }">
        <div class="action-icon">
          <uni-icon type="compose" size="32" color="#34c759"></uni-icon>
        </div>
        <div class="action-text">下单</div>
      </div>
      <div class="action-item" @click="goToOrderList" :class="{ 'animate-scale-in': true, 'delay-100': true }">
        <div class="action-icon">
          <uni-icon type="list" size="32" color="#34c759"></uni-icon>
        </div>
        <div class="action-text">订单</div>
      </div>
      <div class="action-item" @click="trackOrder" :class="{ 'animate-scale-in': true, 'delay-200': true }">
        <div class="action-icon">
          <uni-icon type="location" size="32" color="#34c759"></uni-icon>
        </div>
        <div class="action-text">追踪</div>
      </div>
      <div class="action-item" @click="customerService" :class="{ 'animate-scale-in': true, 'delay-300': true }">
        <div class="action-icon">
          <uni-icon type="chat" size="32" color="#34c759"></uni-icon>
        </div>
        <div class="action-text">客服</div>
      </div>
    </div>

    <!-- 最近订单 -->
    <div class="recent-orders" v-if="customerStore.isLoggedIn && customerStore.orders.length > 0" :class="{ 'animate-fade-in': true }">
      <div class="section-header">
        <h3>最近订单</h3>
        <text @click="goToOrderList" class="view-all">查看全部</text>
      </div>
      <div class="order-list">
        <div 
          v-for="(order, index) in recentOrders" 
          :key="order.id"
          class="order-item"
          @click="goToOrderDetail(order.id)"
          :class="{ 'animate-slide-in': true, 'delay-' + (index * 100): true }"
        >
          <div class="order-header">
            <span class="order-no">订单号: {{ order.order_no }}</span>
            <span :class="['order-status', order.status]">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="order-info">
            <div class="info-item">
              <span class="label">配送地址:</span>
              <span class="value">{{ order.customer_address }}</span>
            </div>
            <div class="info-item">
              <span class="label">金额:</span>
              <span class="value">¥{{ order.total_amount }}</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(order.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 个性化推荐 -->
    <div class="recommended-services" :class="{ 'animate-fade-in': true, 'delay-200': true }">
      <div class="section-header">
        <h3>个性化推荐</h3>
      </div>
      <div v-if="loading" class="loading-container">
        <uni-icon type="spinner" size="32" color="#34c759" :class="{ 'spin': true }"></uni-icon>
        <text class="loading-text">加载推荐中...</text>
      </div>
      <div v-else-if="recommendations.length > 0" class="service-list">
        <div 
          v-for="(service, index) in recommendations" 
          :key="service.id"
          class="service-item"
          @click="handleServiceClick(service)"
          :class="{ 'animate-slide-in': true, 'delay-' + (index * 100): true }"
        >
          <div class="service-icon">
            <uni-icon 
              :type="getServiceIcon(service.type)" 
              size="24" 
              color="#34c759"
            ></uni-icon>
          </div>
          <div class="service-info">
            <div class="service-title">{{ service.name }}</div>
            <div class="service-desc">{{ service.description }}</div>
          </div>
          <uni-icon type="right" size="20" color="#999"></uni-icon>
        </div>
      </div>
      <div v-else class="empty-recommendations">
        <uni-icon type="info-circle" size="32" color="#999"></uni-icon>
        <text class="empty-text">暂无推荐内容</text>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useCustomerStore } from '../../store/customer';

const customerStore = useCustomerStore();
const loading = ref(false);
const recommendations = ref([]);

// 最近订单（最多显示3个）
const recentOrders = computed(() => {
  return [...customerStore.orders].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);
});

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    delivered: '已送达',
    cancelled: '已取消',
    paid: '已支付'
  };
  return statusMap[status] || status;
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 获取服务图标
const getServiceIcon = (type) => {
  const iconMap = {
    service: 'star',
    food: 'spoon',
    nearby: 'location',
    default: 'info'
  };
  return iconMap[type] || iconMap.default;
};

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' });
};

// 搜索
const search = () => {
  uni.showToast({
    title: '搜索功能开发中',
    duration: 2000
  });
};

// 通知
const notifications = () => {
  uni.showToast({
    title: '通知功能开发中',
    duration: 2000
  });
};

// 创建订单
const createOrder = () => {
  if (!customerStore.isLoggedIn) {
    goToLogin();
    return;
  }
  uni.showToast({
    title: '下单功能开发中',
    duration: 2000
  });
};

// 跳转到订单列表
const goToOrderList = () => {
  if (!customerStore.isLoggedIn) {
    goToLogin();
    return;
  }
  uni.switchTab({ url: '/pages/order/list' });
};

// 追踪订单
const trackOrder = () => {
  if (!customerStore.isLoggedIn) {
    goToLogin();
    return;
  }
  uni.showToast({
    title: '追踪功能开发中',
    duration: 2000
  });
};

// 客服
const customerService = () => {
  uni.showToast({
    title: '客服功能开发中',
    duration: 2000
  });
};

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
};

// 处理服务点击
const handleServiceClick = (service) => {
  uni.showToast({
    title: `您点击了${service.name}`,
    duration: 2000
  });
};

// 获取个性化推荐
const getRecommendations = async () => {
  if (!customerStore.isLoggedIn) {
    // 未登录状态的默认推荐
    recommendations.value = [
      {
        type: 'service',
        id: '1',
        name: '限时配送',
        description: '30分钟内送达'
      },
      {
        type: 'service',
        id: '2',
        name: 'VIP会员',
        description: '享受更多优惠'
      },
      {
        type: 'service',
        id: '3',
        name: '优惠券',
        description: '领取更多折扣'
      }
    ];
    return;
  }

  loading.value = true;
  try {
    // 调用AI服务获取个性化推荐
    const response = await uni.request({
      url: '/api/dispatch/recommendations',
      method: 'POST',
      data: {
        user: {
          id: customerStore.userInfo?.id,
          name: customerStore.userInfo?.name,
          role: customerStore.userInfo?.role
        },
        context: {
          type: 'home',
          location: null // 可以从定位服务获取
        },
        history: customerStore.orders.slice(0, 5) // 最近5个订单
      }
    });

    if (response.statusCode === 200 && response.data.code === 200) {
      recommendations.value = response.data.data;
    } else {
      // 失败时使用默认推荐
      recommendations.value = [
        {
          type: 'service',
          id: '1',
          name: '限时配送',
          description: '30分钟内送达'
        },
        {
          type: 'service',
          id: '2',
          name: 'VIP会员',
          description: '享受更多优惠'
        },
        {
          type: 'service',
          id: '3',
          name: '优惠券',
          description: '领取更多折扣'
        }
      ];
    }
  } catch (error) {
    console.error('获取推荐失败:', error);
    // 错误时使用默认推荐
    recommendations.value = [
      {
        type: 'service',
        id: '1',
        name: '限时配送',
        description: '30分钟内送达'
      },
      {
        type: 'service',
        id: '2',
        name: 'VIP会员',
        description: '享受更多优惠'
      },
      {
        type: 'service',
        id: '3',
        name: '优惠券',
        description: '领取更多折扣'
      }
    ];
  } finally {
    loading.value = false;
  }
};

// 页面加载时检查登录状态并获取订单和推荐
onMounted(async () => {
  customerStore.checkLoginStatus();
  if (customerStore.isLoggedIn) {
    await customerStore.getOrders();
  }
  await getRecommendations();
});
</script>

<style scoped>
.index-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #34c759;
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  flex: 1;
}

.greeting {
  font-size: 18px;
  font-weight: 600;
}

.login-prompt {
  font-size: 14px;
}

.login-link {
  color: #fff;
  font-weight: 500;
  text-decoration: underline;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-link:hover {
  color: #f0f0f0;
}

.header-actions {
  display: flex;
  gap: 16px;
}

.header-icon {
  transition: all 0.2s ease;
  cursor: pointer;
}

.header-icon:hover {
  transform: scale(1.1);
}

.quick-actions {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  background-color: white;
  margin: 12px 0;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}

.action-item:hover {
  background-color: rgba(52, 199, 89, 0.05);
  transform: translateY(-2px);
}

.action-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: rgba(52, 199, 89, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-item:hover .action-icon {
  background-color: rgba(52, 199, 89, 0.2);
  transform: scale(1.05);
}

.action-text {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.recent-orders {
  background-color: white;
  margin: 12px 0;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.view-all {
  font-size: 14px;
  color: #34c759;
  cursor: pointer;
  transition: all 0.2s ease;
}

.view-all:hover {
  color: #28a745;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.order-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  background-color: #fff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.order-no {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.order-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.order-status.pending {
  background-color: #f0f0f0;
  color: #666;
}

.order-status.processing {
  background-color: #e3f2fd;
  color: #1976d2;
}

.order-status.delivered {
  background-color: #e8f5e8;
  color: #388e3c;
}

.order-status.cancelled {
  background-color: #ffebee;
  color: #d32f2f;
}

.order-status.paid {
  background-color: #fff3e0;
  color: #f57c00;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item {
  display: flex;
  font-size: 12px;
}

.info-item .label {
  width: 80px;
  color: #666;
}

.info-item .value {
  flex: 1;
  color: #333;
}

.recommended-services {
  background-color: white;
  margin: 12px 0;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.service-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fafafa;
}

.service-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  background-color: #fff;
}

.service-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(52, 199, 89, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: all 0.3s ease;
}

.service-item:hover .service-icon {
  background-color: rgba(52, 199, 89, 0.2);
  transform: scale(1.05);
}

.service-info {
  flex: 1;
}

.service-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.service-desc {
  font-size: 12px;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 12px;
}

.loading-text {
  font-size: 14px;
  color: #666;
}

.empty-recommendations {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  gap: 12px;
}

.empty-text {
  font-size: 14px;
  color: #999;
}

/* 动画效果 */
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-in-out;
}

.animate-slide-in {
  animation: slideIn 0.5s ease-in-out;
}

.spin {
  animation: spin 1s linear infinite;
}

/* 延迟动画 */
.delay-100 {
  animation-delay: 0.1s;
}

.delay-200 {
  animation-delay: 0.2s;
}

.delay-300 {
  animation-delay: 0.3s;
}

.delay-400 {
  animation-delay: 0.4s;
}

.delay-500 {
  animation-delay: 0.5s;
}

/* 动画关键帧 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>