<template>
  <div class="dashboard-container">
    <el-card class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>系统概览</span>
        </div>
      </template>
      <div class="dashboard-stats">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ userCount }}</div>
                <div class="stat-label">用户总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ orderCount }}</div>
                <div class="stat-label">订单总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ roleCount }}</div>
                <div class="stat-label">角色数量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-value">{{ permissionCount }}</div>
                <div class="stat-label">权限数量</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div class="dashboard-charts">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>用户增长趋势</span>
              </template>
              <div ref="userChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>订单分布</span>
              </template>
              <div ref="orderChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

const userChart = ref(null)
const orderChart = ref(null)
const userCount = ref(1200)
const orderCount = ref(5800)
const roleCount = ref(10)
const permissionCount = ref(50)

onMounted(() => {
  initUserChart()
  initOrderChart()
})

const initUserChart = () => {
  const chart = echarts.init(userChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 190, 300, 500, 800, 1200],
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
}

const initOrderChart = () => {
  const chart = echarts.init(orderChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '订单类型',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 2000, name: '网约车' },
        { value: 1800, name: '出租车' },
        { value: 1200, name: '配送' },
        { value: 800, name: '其他' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  chart.setOption(option)
}
</script>

<style scoped>
.dashboard-container {
  width: 100%;
}

.dashboard-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-stats {
  margin-bottom: 20px;
}

.stat-card {
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.dashboard-charts {
  margin-top: 20px;
}

.chart-card {
  height: 300px;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 250px;
}
</style>