<template>
  <div class="order-track-container">
    <!-- 顶部导航栏 -->
    <div class="header">
      <button class="back-button" @click="goBack">← 返回</button>
      <h1>订单追踪</h1>
    </div>

    <!-- 地图容器 -->
    <div class="map-container">
      <div id="map" class="map"></div>
      <div class="map-controls">
        <div class="control-item">
          <span class="control-label">实时位置:</span>
          <span class="control-value">{{ currentLocation }}</span>
        </div>
        <div class="control-item">
          <span class="control-label">预计送达:</span>
          <span class="control-value">{{ estimatedTime }}</span>
        </div>
      </div>
    </div>

    <!-- 配送状态 -->
    <div class="delivery-status">
      <h2>配送状态</h2>
      <div class="status-timeline">
        <div 
          v-for="(step, index) in statusSteps" 
          :key="index"
          class="status-step"
          :class="{ active: step.status === 'active', completed: step.status === 'completed' }"
        >
          <div class="step-icon">
            <uni-icon :type="step.icon" size="24" :color="step.status === 'completed' ? '#4caf50' : '#9e9e9e'"></uni-icon>
          </div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-time">{{ step.time }}</div>
          </div>
          <div class="step-line" v-if="index < statusSteps.length - 1"></div>
        </div>
      </div>
    </div>

    <!-- 配送信息 -->
    <div class="delivery-info">
      <h2>配送信息</h2>
      <div class="info-item">
        <span class="label">司机姓名:</span>
        <span class="value">{{ driverInfo?.name || '未知' }}</span>
      </div>
      <div class="info-item">
        <span class="label">联系电话:</span>
        <span class="value">{{ driverInfo?.phone || '未知' }}</span>
      </div>
      <div class="info-item">
        <span class="label">车辆信息:</span>
        <span class="value">{{ driverInfo?.vehicle || '未知' }}</span>
      </div>
      <div class="info-item">
        <span class="label">当前状态:</span>
        <span class="value">{{ currentStatus }}</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="action-section">
      <button class="action-button" @click="callDriver">
        <uni-icon type="phone" size="20"></uni-icon>
        联系司机
      </button>
      <button class="action-button" @click="refreshLocation">
        <uni-icon type="refresh" size="20"></uni-icon>
        刷新位置
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCustomerStore } from '../../store/customer';

const customerStore = useCustomerStore();
const currentLocation = ref('北京市朝阳区建国路88号');
const estimatedTime = ref('20分钟');
const currentStatus = ref('配送中');

// 配送状态步骤
const statusSteps = ref([
  {
    title: '订单已创建',
    time: '2023-12-01 10:00:00',
    status: 'completed',
    icon: 'success'
  },
  {
    title: '订单已确认',
    time: '2023-12-01 10:05:00',
    status: 'completed',
    icon: 'success'
  },
  {
    title: '商品已打包',
    time: '2023-12-01 10:10:00',
    status: 'completed',
    icon: 'success'
  },
  {
    title: '配送中',
    time: '2023-12-01 10:15:00',
    status: 'active',
    icon: 'refresh'
  },
  {
    title: '已送达',
    time: '',
    status: 'pending',
    icon: 'time'
  }
]);

// 司机信息
const driverInfo = ref({
  name: '张三',
  phone: '13800138000',
  vehicle: '京A12345 福田奥铃CTS'
});

// 返回
const goBack = () => {
  uni.navigateBack();
};

// 联系司机
const callDriver = () => {
  uni.makePhoneCall({
    phoneNumber: driverInfo.value.phone
  });
};

// 刷新位置
const refreshLocation = () => {
  // 这里可以调用API刷新位置
  uni.showToast({
    title: '位置已刷新',
    duration: 2000
  });
};

// 初始化地图
const initMap = () => {
  // 这里应该使用高德地图或百度地图API初始化地图
  // 暂时使用模拟数据
  const mapElement = document.getElementById('map');
  if (mapElement) {
    mapElement.style.backgroundColor = '#e0e0e0';
    mapElement.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
        <div style="text-align: center;">
          <div style="font-size: 24px; margin-bottom: 16px;">地图加载中...</div>
          <div style="font-size: 14px;">正在获取实时位置</div>
        </div>
      </div>
    `;
    
    // 模拟地图加载完成
    setTimeout(() => {
      mapElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666;">
          <div style="text-align: center;">
            <div style="font-size: 24px; margin-bottom: 16px;">地图已加载</div>
            <div style="font-size: 14px;">司机当前位置: ${currentLocation.value}</div>
          </div>
        </div>
      `;
    }, 1000);
  }
};

// 页面加载时初始化
onMounted(async () => {
  // 获取订单ID
  const orderId = uni.getStorageSync('orderId') || uni.getLaunchOptionsSync().query.id;
  if (orderId) {
    // 这里可以调用API获取订单追踪信息
    // const result = await customerStore.trackOrder(orderId);
    // if (result.success) {
    //   // 更新追踪信息
    // }
  }
  
  // 初始化地图
  initMap();
});
</script>

<style scoped>
.order-track-container {
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

.map-container {
  background-color: white;
  margin-bottom: 12px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 300px;
  background-color: #e0e0e0;
}

.map-controls {
  padding: 12px;
  background-color: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.control-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.control-label {
  color: #666;
}

.control-value {
  color: #333;
  font-weight: 500;
}

.delivery-status,
.delivery-info {
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

.status-timeline {
  position: relative;
  padding-left: 30px;
}

.status-step {
  position: relative;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
}

.step-icon {
  position: absolute;
  left: -30px;
  top: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #9e9e9e;
  z-index: 1;
}

.status-step.active .step-icon {
  border-color: #2196f3;
  background-color: #e3f2fd;
}

.status-step.completed .step-icon {
  border-color: #4caf50;
  background-color: #e8f5e8;
}

.step-content {
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.step-time {
  font-size: 12px;
  color: #666;
}

.step-line {
  position: absolute;
  left: -20px;
  top: 24px;
  width: 2px;
  height: calc(100% + 8px);
  background-color: #e0e0e0;
}

.status-step.completed .step-line {
  background-color: #4caf50;
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

.action-section {
  background-color: white;
  padding: 16px;
  display: flex;
  gap: 12px;
  position: sticky;
  bottom: 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.action-button {
  flex: 1;
  padding: 12px;
  border: 1px solid #34c759;
  border-radius: 4px;
  background-color: white;
  color: #34c759;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-button:hover {
  background-color: #34c759;
  color: white;
}
</style>