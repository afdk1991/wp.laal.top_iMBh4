<template>
  <div class="app-container">
    <el-container class="app-container__main">
      <el-aside width="200px" class="app-container__sidebar">
        <div class="sidebar-logo">
          <h1>后台管理</h1>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          router
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><HomeFilled /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/users">
            <el-icon><UserFilled /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/roles">
            <el-icon><Position /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/permissions">
            <el-icon><Lock /></el-icon>
            <span>权限管理</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-container>
        <el-header class="app-container__header">
          <div class="header-left">
            <el-button type="primary" link @click="toggleSidebar">
              <el-icon><Menu /></el-icon>
            </el-button>
          </div>
          <div class="header-right">
            <el-dropdown>
              <span class="user-info">
                <el-avatar :size="32" :src="userAvatar"></el-avatar>
                <span>{{ userName }}</span>
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleProfile">个人资料</el-dropdown-item>
                  <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        <el-main class="app-container__content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { HomeFilled, UserFilled, Position, Lock, DataAnalysis, Menu, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const activeMenu = computed(() => {
  return router.currentRoute.value.path
})

const isSidebarCollapsed = ref(false)
const userName = ref('管理员')
const userAvatar = ref('https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png')

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const handleMenuSelect = (key) => {
  router.push(key)
}

const handleProfile = () => {
  // 跳转到个人资料页面
  console.log('跳转到个人资料页面')
}

const handleLogout = () => {
  // 退出登录逻辑
  console.log('退出登录')
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

.app-container__main {
  height: 100%;
}

.app-container__sidebar {
  background-color: #001529;
  color: #fff;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #1f2d3d;
}

.sidebar-logo h1 {
  font-size: 18px;
  margin: 0;
}

.el-menu-vertical-demo {
  border-right: none;
}

.el-menu {
  background-color: #001529;
  color: #fff;
}

.el-menu-item {
  color: rgba(255, 255, 255, 0.7);
}

.el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.el-menu-item.is-active {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.2);
}

.app-container__header {
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info span {
  margin-left: 10px;
}

.app-container__content {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
}
</style>