import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: {
      id: 1,
      name: '管理员',
      avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
      role: 'admin'
    },
    token: localStorage.getItem('token') || '',
    permissions: ['dashboard', 'users', 'roles', 'permissions', 'statistics']
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    }
  },
  actions: {
    login(token, user) {
      this.token = token
      this.user = user
      localStorage.setItem('token', token)
    },
    logout() {
      this.token = ''
      this.user = {}
      localStorage.removeItem('token')
    },
    updateUser(user) {
      this.user = { ...this.user, ...user }
    }
  }
})