<template>
  <div class="register-container">
    <div class="register-form">
      <h2>注册</h2>
      <uni-forms :model="form" ref="formRef">
        <uni-forms-item label="用户名" name="username" required>
          <uni-easyinput v-model="form.username" placeholder="请输入用户名"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="密码" name="password" required>
          <uni-easyinput v-model="form.password" type="password" placeholder="请输入密码"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="确认密码" name="confirmPassword" required>
          <uni-easyinput v-model="form.confirmPassword" type="password" placeholder="请确认密码"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="姓名" name="name" required>
          <uni-easyinput v-model="form.name" placeholder="请输入姓名"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="电话" name="phone" required>
          <uni-easyinput v-model="form.phone" placeholder="请输入电话"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item>
          <button class="register-button" @click="register" :disabled="loading">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </uni-forms-item>
        <div class="login-link">
          已有账号？<text @click="goToLogin">立即登录</text>
        </div>
      </uni-forms>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const formRef = ref(null);
const loading = ref(false);
const error = ref('');

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  name: '',
  phone: ''
});

const register = async () => {
  // 表单验证
  if (!form.username || !form.password || !form.confirmPassword || !form.name || !form.phone) {
    error.value = '请填写所有必填字段';
    return;
  }

  if (form.password !== form.confirmPassword) {
    error.value = '两次输入的密码不一致';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, {
      username: form.username,
      password: form.password,
      name: form.name,
      role: 'customer',
      phone: form.phone
    });

    if (response.data.code === 200) {
      // 注册成功，跳转到登录页面
      uni.showToast({
        title: '注册成功，请登录',
        duration: 2000
      });
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/login' });
      }, 2000);
    } else {
      error.value = response.data.message;
    }
  } catch (err) {
    error.value = '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  uni.navigateTo({ url: '/pages/login/login' });
};
</script>

<style scoped>
.register-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  padding: 20px;
}

.register-form {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #304156;
}

.register-button {
  width: 100%;
  padding: 12px;
  background-color: #34c759;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.register-button:hover {
  background-color: #28a745;
}

.register-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.login-link text {
  color: #34c759;
  cursor: pointer;
}

.error-message {
  margin-top: 15px;
  color: #f56c6c;
  text-align: center;
  font-size: 14px;
}
</style>