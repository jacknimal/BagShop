<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <span class="logo">👜</span>
          <h2 class="title">箱包后台管理系统</h2>
        </div>
      </template>
      
      <el-form :model="loginForm" :rules="rules" ref="loginRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" placeholder="管理员账号" prefix-icon="User"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password></el-input>
        </el-form-item>
        <el-button type="primary" class="login-submit" :loading="loading" @click="handleLogin">进入系统</el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
// 注意：如果报错找不到图标，需要先执行 npm install @element-plus/icons-vue
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loginRef = ref(null)
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

import request from '../utils/request' // 引入刚才创建的工具

const handleLogin = async () => {
  try {
    // 调用管理员专用登录接口
    const res = await request.post('/admin/login/', loginForm)
    if (res.data.code === 200) {
      localStorage.setItem('admin_token', res.data.token)
      localStorage.setItem('admin_user', res.data.username)
      router.push('/')
    } else {
      ElMessage.error(res.data.msg)
    }
  } catch (error) {
    ElMessage.error('登录失败，请联系总管')
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1e1e2d 0%, #2c3e50 100%);
}
.login-card {
  width: 400px;
  border-radius: 12px;
}
.login-header {
  text-align: center;
}
.title {
  margin-top: 10px;
  font-size: 20px;
  color: #333;
}
.login-submit {
  width: 100%;
  margin-top: 10px;
  background-color: #ff2442;
  border: none;
}
</style>