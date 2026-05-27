import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // 你的 Django 后端地址
  timeout: 5000
})

// 请求拦截器：自动在请求头加入 Token
service.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers['Authorization'] = 'Token ' + token // Django Token 认证格式
  }
  return config
})

export default service