<template>
  <div class="coupon-manager">
    <el-tabs v-model="activeTab" type="border-card">
      
      <el-tab-pane label="优惠券模板管理" name="templates">
        <div class="op-header">
          <el-button type="success" @click="handleAddTemplate">发布新优惠券</el-button>
          <el-button @click="fetchTemplates">刷新列表</el-button>
        </div>
        
        <el-table :data="templates" border stripe v-loading="loading">
          <el-table-column prop="id" label="ID" width="70"></el-table-column>
          <el-table-column prop="name" label="优惠券名称" min-width="150"></el-table-column>
          <el-table-column label="面额 / 门槛" width="180">
            <template #default="scope">
              <span class="money-text">¥{{ scope.row.discount_amount }}</span>
              <el-tag size="small" type="info" style="margin-left: 10px;">满 {{ scope.row.min_spend }} 可用</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="库存(剩余/总量)" width="150">
            <template #default="scope">
              <span :class="scope.row.remain_count < 10 ? 'warning-count' : ''">
                {{ scope.row.remain_count }} / {{ scope.row.total_count || '不限' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="valid_days" label="领后有效天数" width="120"></el-table-column>
          <el-table-column label="上架状态" width="100">
            <template #default="scope">
              <el-switch v-model="scope.row.is_active" @change="toggleTemplateActive(scope.row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditTemplate(scope.row)">修改规则</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="用户优惠券管理" name="userRecords">
        <div class="op-header search-box">
          <el-input 
            v-model="userSearch" 
            placeholder="搜索用户名" 
            style="width: 250px; margin-right: 10px;"
            clearable
            @clear="fetchUserCoupons"
          ></el-input>
          <el-button type="primary" @click="fetchUserCoupons">查询记录</el-button>
          <el-button type="warning" @click="handleManualIssue">手动发放优惠券</el-button>
        </div>

        <el-table :data="userCoupons" border stripe v-loading="loading">
          <el-table-column prop="id" label="记录ID" width="80"></el-table-column>
          <el-table-column prop="username" label="用户名" width="130"></el-table-column>
          <el-table-column prop="coupon_name" label="持有优惠券" min-width="150"></el-table-column>
          <el-table-column label="当前状态" width="130">
            <template #default="scope">
              <el-tag :type="statusMap[scope.row.status].type">
                {{ statusMap[scope.row.status].label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="expires_at" label="过期时间" width="180"></el-table-column>
          <el-table-column label="快速管理" width="180">
            <template #default="scope">
              <el-button size="small" type="primary" plain @click="handleEditUserCoupon(scope.row)">调整/延期</el-button>
              <el-button size="small" type="danger" plain @click="handleDeleteUserCoupon(scope.row)">作废</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="tempDialogVisible" :title="tempDialogTitle" width="500px">
      <el-form :model="tempForm" label-width="110px">
        <el-form-item label="优惠券名称">
          <el-input v-model="tempForm.name" placeholder="如：春季焕新30元满减券"></el-input>
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="抵扣金额">
              <el-input-number v-model="tempForm.discount_amount" :min="1" style="width:100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低消费">
              <el-input-number v-model="tempForm.min_spend" :min="0" style="width:100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="发放数量">
              <el-input-number v-model="tempForm.remain_count" :min="0" style="width:100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="有效天数">
              <el-input-number v-model="tempForm.valid_days" :min="1" style="width:100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="是否上架">
          <el-switch v-model="tempForm.is_active"></el-switch>
          <span class="form-tip">关闭后用户将无法在领券中心看到此券</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="tempDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTemplate">确认保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="userCouponVisible" :title="ucDialogTitle" width="450px">
      <el-form :model="ucForm" label-width="100px">
        <template v-if="!ucForm.id">
          <el-form-item label="发放给用户">
            <el-select v-model="ucForm.user_id" filterable placeholder="搜索用户名" style="width:100%">
              <el-option v-for="u in userList" :key="u.id" :label="u.username" :value="u.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择优惠券">
            <el-select v-model="ucForm.coupon_id" placeholder="选择发布的模板" style="width:100%">
              <el-option v-for="t in templates" :key="t.id" :label="t.name" :value="t.id"></el-option>
            </el-select>
          </el-form-item>
        </template>
        
        <el-form-item label="使用状态">
          <el-radio-group v-model="ucForm.status">
            <el-radio label="unused">未使用</el-radio>
            <el-radio label="used">已使用</el-radio>
            <el-radio label="expired">已过期</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="过期日期">
          <el-date-picker 
            v-model="ucForm.expires_at" 
            type="datetime" 
            style="width:100%" 
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="调整过期截止时间"
          ></el-date-picker>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="userCouponVisible = false">取消</el-button>
        <el-button type="primary" @click="submitUserCoupon">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 状态数据 ---
const activeTab = ref('templates')
const loading = ref(false)
const userSearch = ref('')
const templates = ref([])
const userCoupons = ref([])
const userList = ref([]) // 用于手动发券时的用户选择

const statusMap = {
  unused: { label: '未使用', type: 'success' },
  used: { label: '已使用', type: 'info' },
  expired: { label: '已过期', type: 'danger' }
}

// --- 模板表单 ---
const tempDialogVisible = ref(false)
const tempDialogTitle = ref('发布新优惠券')
const tempForm = reactive({
  id: null, name: '', discount_amount: 10, min_spend: 100, remain_count: 100, valid_days: 7, is_active: true
})

// --- 用户券管理表单 ---
const userCouponVisible = ref(false)
const ucDialogTitle = ref('手动发放优惠券')
const ucForm = reactive({
  id: null, user_id: null, coupon_id: null, status: 'unused', expires_at: ''
})

// --- 数据加载 ---
const fetchTemplates = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/coupons/')
    templates.value = res.data.data
  } finally {
    loading.value = false
  }
}

const fetchUserCoupons = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/user_coupons/', { params: { keyword: userSearch.value } })
    userCoupons.value = res.data.data
  } finally {
    loading.value = false
  }
}

// 加载所有普通用户列表 (需后端配合提供简单的用户列表接口)
// src/views/Coupons.vue 中的方法

const fetchAllUsers = async () => {
  try {
    // 这里的 /users/ 会拼接成 http://127.0.0.1:8000/api/users/
    const res = await request.get('/users/') 
    // 直接赋值，因为后端返回的就是 [{id:1, username:'xxx'}, ...] 这种格式
    userList.value = res.data 
  } catch (error) {
    ElMessage.error('无法加载用户列表，请检查后端接口')
  }
}

// --- 业务逻辑：模板管理 ---
const handleAddTemplate = () => {
  tempDialogTitle.value = '发布新优惠券模板'
  Object.assign(tempForm, { id: null, name: '', discount_amount: 10, min_spend: 100, remain_count: 100, valid_days: 7, is_active: true })
  tempDialogVisible.value = true
}

const handleEditTemplate = (row) => {
  tempDialogTitle.value = '修改优惠券规则'
  Object.assign(tempForm, row)
  tempDialogVisible.value = true
}

const submitTemplate = async () => {
  if (!tempForm.name) return ElMessage.warning('名称必填')
  const res = await request.post('/admin/coupon/save/', tempForm)
  if (res.data.code === 200) {
    ElMessage.success(res.data.msg)
    tempDialogVisible.value = false
    fetchTemplates()
  }
}

const toggleTemplateActive = async (row) => {
  await request.post('/admin/coupon/save/', row)
  ElMessage.info(`优惠券 ${row.name} 状态已更新`)
}

// --- 业务逻辑：用户券管理 ---
const handleManualIssue = () => {
  ucDialogTitle.value = '为用户手动补发优惠券'
  Object.assign(ucForm, { id: null, user_id: null, coupon_id: null, status: 'unused', expires_at: '' })
  fetchAllUsers()
  userCouponVisible.value = true
}

const handleEditUserCoupon = (row) => {
  ucDialogTitle.value = '调整用户券状态与有效期'
  Object.assign(ucForm, {
    id: row.id,
    status: row.status,
    expires_at: row.expires_at
  })
  userCouponVisible.value = true
}

const submitUserCoupon = async () => {
  const res = await request.post('/admin/user_coupon/save/', ucForm)
  if (res.data.code === 200) {
    ElMessage.success(res.data.msg)
    userCouponVisible.value = false
    fetchUserCoupons()
  }
}

const handleDeleteUserCoupon = (row) => {
  ElMessageBox.confirm(`确定要作废用户 ${row.username} 的这张券吗？`, '警告', { type: 'warning' }).then(async () => {
    // 逻辑：直接删除记录或改为 expired
    const res = await request.post('/admin/user_coupon/save/', { id: row.id, status: 'expired' })
    if (res.data.code === 200) {
      ElMessage.success('已作废该优惠券')
      fetchUserCoupons()
    }
  })
}

onMounted(() => {
  fetchTemplates()
  fetchUserCoupons()
})
</script>

<style scoped>
.coupon-manager { background: transparent; }
.op-header { margin-bottom: 20px; }
.search-box { display: flex; align-items: center; background: #fff; padding: 15px; border-radius: 4px; border-bottom: 1px solid #f0f0f0; }

.money-text { font-size: 18px; font-weight: bold; color: #ff2442; }
.warning-count { color: #e6a23c; font-weight: bold; }
.form-tip { font-size: 12px; color: #999; margin-left: 10px; }
</style>