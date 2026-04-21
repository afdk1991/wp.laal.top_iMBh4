<template>
  <div class="order-list-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <h1>我的订单</h1>
    </div>

    <!-- 订单状态筛选 -->
    <div class="filter-tabs">
      <button 
        class="filter-tab" 
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        全部
      </button>
      <button 
        class="filter-tab" 
        :class="{ active: activeTab === 'pending' }"
        @click="activeTab = 'pending'"
      >
        待处理
      </button>
      <button 
        class="filter-tab" 
        :class="{ active: activeTab === 'processing' }"
        @click="activeTab = 'processing'"
      >
        处理中
      </button>
      <button 
        class="filter-tab" 
        :class="{ active: activeTab === 'completed' }"
        @click="activeTab = 'completed'"
      >
        已完成
      </button>
    </div>

    <!-- 订单列表 -->
    <div class="order-list">
      <div v-if="customerStore.loading" class="loading">加载中...</div>
      <div v-else-if="filteredOrders.length === 0" class="empty">暂无订单</div>
      <div v-else class="order-items">
        <div 
          v-for="order in filteredOrders" 
          :key="order.id"
          class="order-item"
          @click="goToOrderDetail(order.id)"
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
          <div class="order-actions">
            <button 
              v-if="order.status === 'pending'"
              class="action-button primary"
              @click.stop="payOrder(order.id)"
            >
              立即支付
            </button>
            <button 
              v-if="order.status === 'processing'"
              class="action-button secondary"
              @click.stop="trackOrder(order.id)"
            >
              追踪订单
            </button>
            <button 
              v-if="order.status === 'completed'"
              class="action-button secondary"
              @click.stop="viewOrder(order.id)"
            >
              查看详情
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useCustomerStore } from '../../store/customer';

const customerStore = useCustomerStore();
const activeTab = ref('all');

// 过滤订单
const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return customerStore.orders;
  } else {
    return customerStore.orders.filter(order => order.status === activeTab.value);
  }
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

// 跳转到订单详情
const goToOrderDetail = (orderId) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
};

// 支付订单
const payOrder = (orderId) => {
  uni.navigateTo({ url: `/pages/payment/payment?orderId=${orderId}` });
};

// 追踪订单
const trackOrder = (orderId) => {
  uni.navigateTo({ url: `/pages/order/track?orderId=${orderId}` });
};

// 查看订单
const viewOrder = (orderId) => {
  uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
};

// 页面加载时获取订单
onMounted(async () => {
  if (customerStore.isLoggedIn) {
    await customerStore.getOrders();
  } else {
    // 未登录，跳转到登录页面
    uni.navigateTo({ url: '/pages/login/login' });
  }
});
</script>

<style scoped>
.order-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #34c759;
  color: white;
  padding: 16px;
  text-align: center;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
}

.filter-tabs {
  display: flex;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
}

.filter-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: none;
  font-size: 14px;
  color: #666;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab.active {
  color: #34c759;
  border-bottom-color: #34c759;
}

.order-list {
  padding: 16px;
}

.loading,
.empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s ease;
}

.order-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-no {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.order-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
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
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  font-size: 14px;
}

.info-item .label {
  width: 80px;
  color: #666;
}

.info-item .value {
  flex: 1;
  color: #333;
}

.order-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background-color: #34c759;
  color: white;
  border-color: #34c759;
}

.action-button.secondary {
  background-color: #f5f5f5;
  color: #333;
  border-color: #ddd;
}

.action-button:hover {
  opacity: 0.8;
}
</style>