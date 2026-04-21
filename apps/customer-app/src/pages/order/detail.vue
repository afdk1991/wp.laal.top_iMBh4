<template>
  <div class="order-detail-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-button" @click="goBack">← 返回</button>
      <h1>订单详情</h1>
    </div>

    <!-- 订单状态 -->
    <div class="order-status-section">
      <div class="status-icon">
        <uni-icon 
          :type="getStatusIcon(order?.status)" 
          size="48" 
          :color="getStatusColor(order?.status)"
        ></uni-icon>
      </div>
      <div class="status-text">
        {{ getStatusText(order?.status) }}
      </div>
      <div class="status-desc">
        {{ getStatusDescription(order?.status) }}
      </div>
    </div>

    <!-- 订单信息 -->
    <div class="order-info-section">
      <h2>订单信息</h2>
      <div class="info-item">
        <span class="label">订单编号:</span>
        <span class="value">{{ order?.order_no }}</span>
      </div>
      <div class="info-item">
        <span class="label">下单时间:</span>
        <span class="value">{{ formatDate(order?.created_at) }}</span>
      </div>
      <div class="info-item">
        <span class="label">支付方式:</span>
        <span class="value">{{ order?.payment_method || '未支付' }}</span>
      </div>
      <div class="info-item">
        <span class="label">支付时间:</span>
        <span class="value">{{ order?.paid_at ? formatDate(order.paid_at) : '未支付' }}</span>
      </div>
    </div>

    <!-- 配送信息 -->
    <div class="delivery-section">
      <h2>配送信息</h2>
      <div class="info-item">
        <span class="label">收货人:</span>
        <span class="value">{{ order?.customer_name }}</span>
      </div>
      <div class="info-item">
        <span class="label">联系电话:</span>
        <span class="value">{{ order?.customer_phone }}</span>
      </div>
      <div class="info-item">
        <span class="label">配送地址:</span>
        <span class="value">{{ order?.customer_address }}</span>
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="goods-section">
      <h2>商品信息</h2>
      <div class="goods-list">
        <div v-for="(item, index) in order?.items" :key="index" class="goods-item">
          <div class="goods-info">
            <div class="goods-name">{{ item.name }}</div>
            <div class="goods-desc">{{ item.description }}</div>
          </div>
          <div class="goods-price">
            <div class="price">¥{{ item.price }}</div>
            <div class="quantity">x{{ item.quantity }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 费用信息 -->
    <div class="cost-section">
      <h2>费用信息</h2>
      <div class="cost-item">
        <span class="label">商品总额:</span>
        <span class="value">¥{{ order?.total_amount || 0 }}</span>
      </div>
      <div class="cost-item">
        <span class="label">配送费:</span>
        <span class="value">¥{{ order?.delivery_fee || 0 }}</span>
      </div>
      <div class="cost-item total">
        <span class="label">合计:</span>
        <span class="value">¥{{ order?.total_amount ? order.total_amount + (order.delivery_fee || 0) : 0 }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <button 
        v-if="order?.status === 'pending'"
        class="action-button primary"
        @click="payOrder"
      >
        立即支付
      </button>
      <button 
        v-if="order?.status === 'processing'"
        class="action-button secondary"
        @click="trackOrder"
      >
        追踪订单
      </button>
      <button 
        v-if="order?.status === 'completed'"
        class="action-button secondary"
        @click="confirmReceipt"
      >
        确认收货
      </button>
      <button 
        v-if="order?.status === 'pending'"
        class="action-button danger"
        @click="cancelOrder"
      >
        取消订单
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCustomerStore } from '../../store/customer';

const customerStore = useCustomerStore();
const order = ref(null);

// 获取订单ID
const orderId = uni.getStorageSync('orderId') || uni.getLaunchOptionsSync().query.id;

// 获取状态图标
const getStatusIcon = (status) => {
  const iconMap = {
    pending: 'time',
    processing: 'refresh',
    delivered: 'success',
    cancelled: 'close',
    paid: 'star'
  };
  return iconMap[status] || 'help';
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    pending: '#ff9800',
    processing: '#2196f3',
    delivered: '#4caf50',
    cancelled: '#f44336',
    paid: '#ffc107'
  };
  return colorMap[status] || '#9e9e9e';
};

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    delivered: '已送达',
    cancelled: '已取消',
    paid: '已支付'
  };
  return statusMap[status] || '未知状态';
};

// 获取状态描述
const getStatusDescription = (status) => {
  const descMap = {
    pending: '您的订单正在等待处理',
    processing: '您的订单正在配送中',
    delivered: '您的订单已送达',
    cancelled: '您的订单已取消',
    paid: '您的订单已支付'
  };
  return descMap[status] || '';
};

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('zh-CN');
};

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 支付订单
const payOrder = () => {
  uni.navigateTo({ url: `/pages/payment/payment?orderId=${orderId}` });
};

// 追踪订单
const trackOrder = () => {
  uni.navigateTo({ url: `/pages/order/track?orderId=${orderId}` });
};

// 确认收货
const confirmReceipt = () => {
  uni.showModal({
    title: '确认收货',
    content: '确认您已收到商品吗？',
    success: (res) => {
      if (res.confirm) {
        // 这里可以调用确认收货的API
        uni.showToast({
          title: '确认收货成功',
          duration: 2000
        });
      }
    }
  });
};

// 取消订单
const cancelOrder = () => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消此订单吗？',
    success: (res) => {
      if (res.confirm) {
        // 这里可以调用取消订单的API
        uni.showToast({
          title: '订单已取消',
          duration: 2000
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 2000);
      }
    }
  });
};

// 页面加载时获取订单详情
onMounted(async () => {
  if (orderId) {
    const result = await customerStore.getOrderDetail(orderId);
    if (result.success) {
      order.value = result.data;
    } else {
      uni.showToast({
        title: '获取订单详情失败',
        duration: 2000
      });
    }
  }
});
</script>

<style scoped>
.order-detail-container {
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

.order-status-section {
  background-color: white;
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 12px;
}

.status-icon {
  margin-bottom: 16px;
}

.status-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.status-desc {
  font-size: 14px;
  color: #666;
}

.order-info-section,
.delivery-section,
.goods-section,
.cost-section {
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

.info-item,
.cost-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-item .label,
.cost-item .label {
  color: #666;
}

.info-item .value,
.cost-item .value {
  color: #333;
}

.goods-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.goods-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.goods-info {
  flex: 1;
}

.goods-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.goods-desc {
  font-size: 12px;
  color: #666;
}

.goods-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.price {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.quantity {
  font-size: 12px;
  color: #666;
}

.cost-item.total {
  border-top: 1px solid #e0e0e0;
  padding-top: 12px;
  margin-top: 12px;
  font-weight: 600;
}

.action-section {
  background-color: white;
  padding: 16px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.action-button {
  padding: 10px 20px;
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

.action-button.danger {
  background-color: #f5f5f5;
  color: #f44336;
  border-color: #f44336;
}

.action-button:hover {
  opacity: 0.8;
}
</style>