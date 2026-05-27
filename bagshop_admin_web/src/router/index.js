// src/router/index.js 完整修复代码
import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Orders from '../views/Orders.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: Login, meta: { isPublic: true } },
    { path: '/', name: 'dashboard', component: Dashboard },
    { path: '/orders', name: 'orders', component: Orders },
    
    // 🌟 统一使用这个路径，确保文件名 UserManage.vue 大小写正确
    { 
      path: '/user-manage', 
      name: 'UserManage', 
      component: () => import('../views/UserManage.vue') 
    },
    
    { path: '/products', component: () => import('../views/Products.vue') },
    { path: '/diy', component: () => import('../views/DiyManager.vue') },
    { path: '/headlines', component: () => import('../views/Headlines.vue') },
    { path: '/coupons', component: () => import('../views/Coupons.vue') },
    { path: '/community', component: () => import('../views/Community.vue') },
    { path: '/cs', component: () => import('../views/CustomerService.vue') }
    // 🌟 删除原来的 /users 路径，防止冲突
  ]
})

// 🌟 修复：将 next() 改为 return 模式以消除警告
router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token')
  if (!to.meta.isPublic && !token) {
    // 未登录且访问私有页面，重定向到登录
    return { name: 'login' }
  }
  // 允许通行
  return true
})

export default router