import { defineConfig } from '@umijs/max';
import { resolve } from 'path';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: 'MIXMLAAL Admin',
    locale: 'zh-CN',
    logo: '/logo.svg',
  },
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          path: '/user/login',
          name: 'login',
          component: './User/Login',
        },
        {
          path: '/user/register',
          name: 'register',
          component: './User/Register',
        },
      ],
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      icon: 'Dashboard',
      component: './Dashboard',
    },
    {
      path: '/admin',
      name: 'admin',
      icon: 'User',
      access: 'canAdmin',
      routes: [
        {
          path: '/admin/user',
          name: 'user',
          component: './Admin/User',
        },
        {
          path: '/admin/role',
          name: 'role',
          component: './Admin/Role',
        },
        {
          path: '/admin/permission',
          name: 'permission',
          component: './Admin/Permission',
        },
      ],
    },
    {
      path: '/statistics',
      name: 'statistics',
      icon: 'LineChart',
      component: './Statistics',
    },
    {
      path: '/profile',
      name: 'profile',
      icon: 'User',
      component: './Profile',
    },
    {
      path: '*',
      component: './404',
    },
  ],
  npmClient: 'npm',
  proxy: {
    '/api': {
      target: 'http://localhost:8081',
      changeOrigin: true,
    },
  },
  mock: false,
});
