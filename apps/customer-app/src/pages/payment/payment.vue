<template>
  <div class="payment-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-button" @click="goBack">← 返回</button>
      <h1>支付</h1>
    </div>

    <!-- 订单信息 -->
    <div class="order-info">
      <h2>订单信息</h2>
      <div class="info-item">
        <span class="label">订单编号:</span>
        <span class="value">{{ order?.order_no }}</span>
      </div>
      <div class="info-item">
        <span class="label">订单金额:</span>
        <span class="value amount">¥{{ order?.total_amount || 0 }}</span>
      </div>
    </div>

    <!-- 支付方式 -->
    <div class="payment-methods">
      <h2>选择支付方式</h2>
      <div class="method-list">
        <div 
          v-for="method in paymentMethods" 
          :key="method.id"
          class="method-item"
          :class="{ active: selectedMethod === method.id }"
          @click="selectedMethod = method.id"
        >
          <div class="method-icon">
            <uni-icon :type="method.icon" size="32" :color="method.color"></uni-icon>
          </div>
          <div class="method-info">
            <div class="method-name">{{ method.name }}</div>
            <div class="method-desc">{{ method.description }}</div>
          </div>
          <div class="method-select">
            <uni-icon 
              :type="selectedMethod === method.id ? 'radio-selected' : 'radio'" 
              size="20" 
              :color="selectedMethod === method.id ? '#34c759' : '#999'"
            ></uni-icon>
          </div>
        </div>
      </div>
    </div>

    <!-- 支付按钮 -->
    <div class="payment-action">
      <div class="payment-amount">
        <span class="label">支付金额:</span>
        <span class="value">¥{{ order?.total_amount || 0 }}</span>
      </div>
      <button class="pay-button" @click="pay" :disabled="loading">
        {{ loading ? '支付中...' : '立即支付' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCustomerStore } from '../../store/customer';

const customerStore = useCustomerStore();
const order = ref(null);
const selectedMethod = ref('wechat');
const loading = ref(false);

// 支付方式
const paymentMethods = ref([
  {
    id: 'wechat',
    name: '微信支付',
    description: '推荐使用微信支付',
    icon: 'chat',
    color: '#07C160'
  },
  {
    id: 'alipay',
    name: '支付宝',
    description: '使用支付宝支付',
    icon: 'star',
    color: '#1677FF'
  },
  {
    id: 'card',
    name: '银行卡',
    description: '使用银行卡支付',
    icon: 'creditcard',
    color: '#FF6B35'
  }
]);

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 支付
const pay = async () => {
  loading.value = true;
  
  try {
    // 获取订单ID
    const orderId = uni.getLaunchOptionsSync().query.orderId;
    if (!orderId) {
      uni.showToast({
        title: '订单ID不存在',
        duration: 2000
      });
      return;
    }
    
    // 调用支付API
    const result = await customerStore.payOrder(orderId, selectedMethod.value);
    if (result.success) {
      uni.showToast({
        title: '支付成功',
        duration: 2000
      });
      setTimeout(() => {
        uni.navigateTo({ url: `/pages/order/detail?id=${orderId}` });
      }, 2000);
    } else {
      uni.showToast({
        title: '支付失败: ' + result.message,
        duration: 2000
      });
    }
  } catch (error) {
    uni.showToast({
      title: '支付失败，请稍后重试',
      duration: 2000
    });
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取订单信息
onMounted(async () => {
  // 获取订单ID
  const orderId = uni.getLaunchOptionsSync().query.orderId;
  if (orderId) {
    const result = await customerStore.getOrderDetail(orderId);
    if (result.success) {
      order.value = result.data;
    } else {
      uni.showToast({
        title: '获取订单信息失败',
        duration: 2000
      });
    }
  }
});
</script>

<style scoped>
.payment-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #34c759;
  color: white;
  padding: 16px;
  display: flex;
  align-items: center;
}

.back-button {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  margin-right: 16px;
  cursor: pointer;
}

.header h1 {
  font-size: 18px;
  font-weight: 600;
}

.order-info {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

.payment-methods {
  background-color: white;
  padding: 16px;
  margin-bottom: 12px;
}

h2 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item .label {
  color: #666;
}

.info-item .value {
  color: #333;
}

.info-item .amount {
  font-size: 18px;
  font-weight: 600;
  color: #f44336;
}

.method-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.method-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.method-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.method-item.active {
  border-color: #34c759;
  background-color: rgba(52, 199, 89, 0.1);
}

.method-icon {
  margin-right: 16px;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.method-desc {
  font-size: 12px;
  color: #666;
}

.method-select {
  margin-left: 16px;
}

.payment-action {
  background-color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.payment-amount {
  display: flex;
  align-items: center;
  gap: 8px;
}

.payment-amount .label {
  font-size: 14px;
  color: #666;
}

.payment-amount .value {
  font-size: 18px;
  font-weight: 600;
  color: #f44336;
}

.pay-button {
  padding: 12px 32px;
  background-color: #34c759;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pay-button:hover {
  background-color: #28a745;
}

.pay-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>