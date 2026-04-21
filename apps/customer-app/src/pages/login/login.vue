<template>
  <div class="login-container">
    <div class="login-form">
      <h2>登录</h2>
      <uni-forms :model="form" ref="formRef">
        <uni-forms-item label="用户名" name="username" required>
          <uni-easyinput v-model="form.username" placeholder="请输入用户名"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item label="密码" name="password" required>
          <uni-easyinput v-model="form.password" type="password" placeholder="请输入密码"></uni-easyinput>
        </uni-forms-item>
        <uni-forms-item>
          <button class="login-button" @click="login" :disabled="loading">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </uni-forms-item>
        <div class="register-link">
          还没有账号？<text @click="goToRegister">立即注册</text>
        </div>
      </uni-forms>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useCustomerStore } from '../../store/customer';

const customerStore = useCustomerStore();
const formRef = ref(null);
const loading = ref(false);
const error = ref('');

const form = reactive({
  username: '',
  password: ''
});

const login = async () => {
  if (!form.username || !form.password) {
    error.value = '请输入用户名和密码';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await customerStore.login(form.username, form.password);
    if (result.success) {
      // 登录成功，跳转到首页
      uni.switchTab({ url: '/pages/index/index' });
    } else {
      error.value = result.message;
    }
  } catch (err) {
    error.value = '登录失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  uni.navigateTo({ url: '/pages/register/register' });
};
</script>

<style scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
  padding: 20px;
}

.login-form {
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

.login-button {
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

.login-button:hover {
  background-color: #28a745;
}

.login-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.register-link text {
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