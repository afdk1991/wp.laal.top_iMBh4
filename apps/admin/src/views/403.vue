<template>
  <div class="error-container">
    <el-card class="error-card">
      <div class="error-content">
        <el-icon class="error-icon"><Warning /></el-icon>
        <h1>403</h1>
        <p>您没有权限访问此页面</p>
        <el-button type="primary" @click="goBack">返回首页</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Warning } from '@element-plus/icons-vue'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.error-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
}

.error-card {
  width: 400px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-content {
  text-align: center;
  padding: 40px 0;
}

.error-icon {
  font-size: 64px;
  color: #f56c6c;
  margin-bottom: 20px;
}

.error-content h1 {
  font-size: 48px;
  margin: 0 0 16px 0;
  color: #303133;
}

.error-content p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 32px;
}
</style>