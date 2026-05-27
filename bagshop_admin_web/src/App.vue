<template>
  <router-view v-if="route.path === '/login'"></router-view>

  <el-container class="admin-layout" v-else>
    <el-aside width="240px" class="sidebar">
      <div class="logo-box">
        <span class="logo-icon">👜</span>
        <span class="logo-text">箱包高定后台</span>
      </div>
      
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        background-color="#1e1e2d"
        text-color="#a2a3b7"
        active-text-color="#ffffff"
        router
      >
        <el-menu-item index="/">📊 仪表盘</el-menu-item>
        <el-menu-item index="/products">👜 商品管理</el-menu-item>
		<el-menu-item index="/orders">📦 订单管理</el-menu-item> 
        <el-menu-item index="/diy">🎨 DIY库管理</el-menu-item>
        <el-menu-item index="/headlines">📰 商城头条</el-menu-item>
        <el-menu-item index="/coupons">🎟️ 优惠券管理</el-menu-item>
        <el-menu-item index="/user-manage">👥 用户管理</el-menu-item>
        <el-menu-item index="/community">💬 社区管理</el-menu-item>
        <el-menu-item index="/cs">🎧 在线客服</el-menu-item>
        
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="top-header">
        <div class="header-left">
          <span class="breadcrumb">当前位置：{{ currentPageName }}</span>
        </div>
        <div class="header-right">
          <el-badge is-dot class="notice-item">🔔</el-badge>
          <el-dropdown @command="handleCommand">
            <div class="user-profile">
              <el-avatar size="small" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100"></el-avatar>
              <span class="username">{{ adminName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const adminName = localStorage.getItem('admin_user') || '管理员'

const currentPageName = computed(() => {
  const map = {
    '/': '仪表盘',
    '/products': '商品管理',
	'/orders': '订单管理',
    '/diy': 'DIY库管理',
    '/headlines': '商城头条',
    '/coupons': '优惠券管理',
    '/user-manage': '用户管理',
    '/community': '社区管理',
    '/cs': '在线客服',
    '/permissions': '权限管理'
  }
  return map[route.path] || '未知页面'
})

const handleCommand = (command) => {
  if (command === 'logout') {
    localStorage.clear()
    router.push('/login')
  }
}
</script>

<style scoped>
.admin-layout { height: 100vh; }
.sidebar { background-color: #1e1e2d; }
.logo-box { height: 60px; display: flex; align-items: center; padding: 0 20px; background: #1b1b28; color: white; font-weight: bold; }
.el-menu-vertical { border-right: none; }
.top-header { background: #fff; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; }
.main-content { background-color: #f4f7fc; padding: 20px; }
.user-profile { display: flex; align-items: center; cursor: pointer; margin-left: 20px; }
.username { margin-left: 8px; font-size: 14px; }
</style>