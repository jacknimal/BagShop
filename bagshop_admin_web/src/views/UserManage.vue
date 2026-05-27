<template>
  <div class="user-manage">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">👥 会员用户综合管理</span>
          <div class="search-bar">
            <el-input 
              v-model="searchKeyword" 
              placeholder="搜索账号/昵称/手机号" 
              style="width: 280px; margin-right: 10px;" 
              clearable 
              @clear="fetchUsers"
            />
            <el-button type="primary" @click="fetchUsers">查询</el-button>
          </div>
        </div>
      </template>

      <el-table :data="userList" border stripe v-loading="loading">
        <el-table-column prop="id" label="UID" width="70"></el-table-column>
        <el-table-column label="头像" width="80">
          <template #default="scope">
            <el-avatar 
              :size="40" 
              :src="formatAvatar(scope.row.avatar)"
            >
              <img src="/static/logo.png" />
            </el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="登录账号" width="120"></el-table-column>
        <el-table-column prop="nickname" label="昵称" width="120"></el-table-column>
        <el-table-column prop="phone" label="手机号" width="130"></el-table-column>
        <el-table-column label="账号状态" width="100">
          <template #default="scope">
            <el-switch 
              v-model="scope.row.is_active" 
              active-color="#13ce66" 
              inactive-color="#ff4949"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        
        <el-table-column prop="date_joined" label="注册时间" width="160"></el-table-column>

        <el-table-column label="操作" min-width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="openEdit(scope.row)">编辑资料</el-button>
            <el-button size="small" type="warning" plain @click="openResetPwd(scope.row)">重置密码</el-button>
            <el-button size="small" type="success" plain @click="viewHistory(scope.row)">订单历史</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="editVisible" title="修改会员完整资料" width="500px">
      <el-form :model="editForm" label-width="90px" v-if="editForm">
        <el-form-item label="会员头像">
          <div style="display: flex; align-items: center;">
            <el-avatar :size="50" :src="formatAvatar(editForm.avatar)" style="margin-right: 15px;"></el-avatar>
            <el-input v-model="editForm.avatar" placeholder="输入头像图片URL地址" size="small"></el-input>
          </div>
        </el-form-item>
    
        <el-form-item label="登录账号">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        
        <el-form-item label="会员昵称">
          <el-input v-model="editForm.nickname" placeholder="设置用户昵称"></el-input>
        </el-form-item>
    
        <el-form-item label="电子邮箱">
          <el-input v-model="editForm.email" placeholder="用户用于找回密码的邮箱"></el-input>
        </el-form-item>
    
        <el-form-item label="手机号码">
          <el-input v-model="editForm.phone" placeholder="绑定手机号"></el-input>
        </el-form-item>
    
        <el-form-item label="会员性别">
          <el-radio-group v-model="editForm.gender">
            <el-radio label="male">男</el-radio>
            <el-radio label="female">女</el-radio>
            <el-radio label="unknown">保密</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存全部修改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="pwdVisible" title="危险操作：重置密码" width="400px">
      <el-form label-width="80px">
        <el-form-item label="目标用户">
          <el-tag>{{ currentUser?.username }}</el-tag>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="newPassword" placeholder="请输入6位以上新密码" show-password></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="danger" @click="submitResetPwd">确认重置</el-button>
      </template>
    </el-dialog>
	<el-dialog v-model="historyVisible" :title="'用户 [' + currentUser?.username + '] 的订单历史'" width="800px">
	  <el-table :data="userOrders" border stripe v-loading="historyLoading" max-height="450px">
	    <el-table-column prop="order_number" label="订单号" width="180"></el-table-column>
	    <el-table-column prop="total_price" label="总金额" width="100">
	      <template #default="scope">￥{{ scope.row.total_price }}</template>
	    </el-table-column>
	    <el-table-column prop="status" label="状态" width="100">
	      <template #default="scope">
	        <el-tag :type="scope.row.status === 'paid' ? 'success' : 'info'">
	          {{ scope.row.status === 'pending' ? '待支付' : (scope.row.status === 'paid' ? '待发货' : '已完成') }}
	        </el-tag>
	      </template>
	    </el-table-column>
	    <el-table-column prop="created_at" label="下单时间" width="160"></el-table-column>
	    <el-table-column prop="address" label="收货地址" show-overflow-tooltip></el-table-column>
	  </el-table>
	  <template #footer>
	    <el-button @click="historyVisible = false">关闭</el-button>
	  </template>
	</el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const userList = ref([])
const searchKeyword = ref('')
const pwdVisible = ref(false)
const currentUser = ref(null)
const newPassword = ref('')

// 🌟 新增：编辑相关状态
const editVisible = ref(false)
const editForm = ref(null)

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/users/list/', { params: { keyword: searchKeyword.value } })
    userList.value = res.data.data //
  } finally {
    loading.value = false
  }
}

// 🌟 修复：处理头像路径（防止 /static 开头的路径加载失败）
const formatAvatar = (url) => {
  if (!url) return '/static/logo.png'
  if (url.startsWith('http')) return url
  // 根据 request.js 中的 baseURL 补全地址，假设 Django 在 8000 端口
  return `http://127.0.0.1:8000${url}`
}

// 🌟 修复：实现编辑弹窗打开逻辑
const openEdit = (row) => {
  currentUser.value = row
  editForm.value = { ...row } // 使用展开运算符进行浅拷贝，防止修改影响列表
  editVisible.value = true
}

// 🌟 修复：实现保存修改逻辑（调用后端已有的 profile/update 接口）
const submitEdit = async () => {
  try {
    // 🌟 核心修复：调用新增的 admin 专用更新接口，并传入完整的 ID 和数据
    const res = await request.post('/admin/user/update_full/', {
      id: editForm.value.id, // 必须传 ID，后端才知道改谁
      nickname: editForm.value.nickname,
      email: editForm.value.email, // 包含邮箱
      phone: editForm.value.phone,
      gender: editForm.value.gender,
      avatar: editForm.value.avatar // 包含头像地址
    })
    
    if (res.data.code === 200) {
      ElMessage.success('会员资料已同步至数据库')
      editVisible.value = false
      fetchUsers() // 重新拉取列表，查看更新后的结果
    }
  } catch (err) {
    ElMessage.error('更新失败，请检查网络或权限')
  }
}

const handleStatusChange = async (row) => {
  try {
    const res = await request.post('/admin/users/status/', { id: row.id, is_active: row.is_active })
    if (res.data.code === 200) ElMessage.success(`用户 ${row.username} 状态已更新`)
  } catch (err) {
    row.is_active = !row.is_active
  }
}

const openResetPwd = (row) => {
  currentUser.value = row
  newPassword.value = ''
  pwdVisible.value = true
}

const submitResetPwd = async () => {
  if (newPassword.value.length < 6) return ElMessage.error('密码太短了，至少6位')
  const res = await request.post('/admin/users/reset_pwd/', { 
    id: currentUser.value.id, 
    password: newPassword.value 
  })
  if (res.data.code === 200) {
    ElMessage.success('用户密码已强行重置')
    pwdVisible.value = false
  }
}

const historyVisible = ref(false)
const historyLoading = ref(false)
const userOrders = ref([])

// 🌟 修复：点击订单历史不再跳转，改为弹窗展示
const viewHistory = async (row) => {
  currentUser.value = row
  historyVisible.value = true
  historyLoading.value = true
  
  try {
    // 调用后台接口，传入当前行用户的 ID 进行精准查询
    const res = await request.get('/admin/order/list/', { 
      params: { user_id: row.id } 
    })
    
    if (res.data.code === 200) {
      userOrders.value = res.data.data
    } else {
      ElMessage.error('获取订单历史失败')
    }
  } catch (err) {
    ElMessage.error('网络错误，无法获取订单')
  } finally {
    historyLoading.value = false
  }
}

onMounted(fetchUsers)
</script>