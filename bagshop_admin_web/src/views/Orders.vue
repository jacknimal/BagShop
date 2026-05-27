<template>
  <div class="orders-manager">
    <el-tabs v-model="topTab" type="border-card">
      
      <el-tab-pane label="订单表" name="orderTable">
        <el-card class="box-card" shadow="never" style="border: none;">
          <template #header>
            <div class="card-header">
              <span class="title">📦 订单管理系统</span>
              <div class="search-area">
                <el-input v-model="searchQuery" placeholder="订单号/收货人" style="width: 250px; margin-right: 10px;" clearable @clear="fetchOrders" />
                <el-button type="primary" @click="fetchOrders">查询</el-button>
              </div>
            </div>
          </template>

          <el-tabs v-model="activeStatus" @tab-click="handleStatusClick">
            <el-tab-pane label="全部订单" name="all"></el-tab-pane>
            <el-tab-pane label="待支付" name="pending"></el-tab-pane>
            <el-tab-pane label="已支付(待发货)" name="paid"></el-tab-pane>
            <el-tab-pane label="已发货" name="shipped"></el-tab-pane>
            <el-tab-pane label="已完成" name="completed"></el-tab-pane>
          </el-tabs>

          <el-table :data="orderList" border stripe v-loading="loading" style="width: 100%">
            <el-table-column type="expand">
              <template #default="props">
                <div class="order-detail">
                  <h4>商品明细：</h4>
                  <el-table :data="props.row.items" size="small" border>
                    <el-table-column label="商品图" width="80">
                      <template #default="scope">
                        <el-image :src="scope.row.product.image_url" style="width:40px;height:40px" />
                      </template>
                    </el-table-column>
                    <el-table-column prop="product.name" label="商品名称"></el-table-column>
                    <el-table-column prop="price" label="单价"></el-table-column>
                    <el-table-column prop="quantity" label="数量" width="80"></el-table-column>
                    <el-table-column label="定制信息">
                      <template #default="scope">
                        <span v-if="scope.row.diy_data" class="diy-info">{{ scope.row.diy_data }}</span>
                        <span v-else class="text-grey">标准款</span>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="order_number" label="订单号" width="180"></el-table-column>
            <el-table-column prop="total_price" label="总额(元)" width="100"></el-table-column>
            
            <el-table-column label="收货信息" min-width="200">
              <template #default="scope">
                <div><strong>{{ scope.row.receiver_name }}</strong> {{ scope.row.receiver_phone }}</div>
                <div class="address-text">{{ scope.row.address }}</div>
              </template>
            </el-table-column>

            <el-table-column label="订单状态" width="120">
              <template #default="scope">
                <el-tag :type="statusTypeMap[scope.row.status]">
                  {{ statusLabelMap[scope.row.status] }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="created_at" label="下单时间" width="160"></el-table-column>

            <el-table-column label="管理操作" width="180" fixed="right">
              <template #default="scope">
                <el-button 
                  v-if="scope.row.status === 'paid'" 
                  type="primary" 
                  size="small" 
                  @click="handleShip(scope.row)"
                >点击发货</el-button>
                
                <el-dropdown @command="(cmd) => handleCommand(cmd, scope.row)" style="margin-left: 10px;">
                  <el-button size="small">更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">修改状态</el-dropdown-item>
                      <el-dropdown-item command="delete" divided style="color: #f56c6c">删除记录</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="售后订单" name="afterSales">
        <el-card class="box-card" shadow="never" style="border: none;">
          <template #header>
            <div class="card-header">
              <span class="title">🛠️ 售后申请处理</span>
              <el-button @click="fetchAfterSales">刷新列表</el-button>
            </div>
          </template>

          <el-table :data="afterSalesList" border stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="order_number" label="关联订单号" width="180"></el-table-column>
            <el-table-column prop="product_names" label="涉及商品" min-width="150"></el-table-column>
            <el-table-column prop="service_type" label="售后类型" width="100">
              <template #default="scope">
                <el-tag effect="plain">{{ scope.row.service_type }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="申请原因" min-width="200" show-overflow-tooltip></el-table-column>
            
            <el-table-column label="处理状态" width="140">
              <template #default="scope">
                <el-select v-model="scope.row.status" size="small" @change="updateAfterSalesStatus(scope.row)">
                  <el-option label="待处理" value="pending"></el-option>
                  <el-option label="处理中" value="processing"></el-option>
                  <el-option label="已完成" value="completed"></el-option>
                  <el-option label="已拒绝" value="rejected"></el-option>
                </el-select>
              </template>
            </el-table-column>
            
            <el-table-column prop="created_at" label="申请时间" width="160"></el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="DIY成品审核" name="diyAudit">
        <el-card class="box-card" shadow="never" style="border: none;">
          <template #header>
            <div class="card-header">
              <span class="title">🎨 DIY成品审核与管理</span>
              <el-button @click="fetchDiyAuditList">刷新列表</el-button>
            </div>
          </template>

          <el-table :data="diyAuditList" border stripe v-loading="loading" style="width: 100%">
            <el-table-column prop="user" label="申请用户" width="120"></el-table-column>
            <el-table-column label="基础商品" width="180">
              <template #default="scope">
                <div style="display: flex; align-items: center;">
                  <el-image :src="scope.row.product_image" style="width: 40px; height: 40px; margin-right: 10px; border-radius: 4px;"></el-image>
                  <span>{{ scope.row.product_name }}</span>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="定制详情" min-width="250">
              <template #default="scope">
                <div v-if="scope.row.diy_data && scope.row.diy_data.selections">
                  <div v-for="(val, key) in scope.row.diy_data.selections" :key="key">
                    <span v-if="val && val.name" style="font-size: 12px; color: #666;">
                      {{ translateKey(key) }}: {{ val.name }}
                    </span>
                  </div>
                  <div v-if="scope.row.diy_data.monogram_text" style="font-size: 12px; color: #333; font-weight: bold;">
                    刻字: {{ scope.row.diy_data.monogram_text }}
                  </div>
                  <div style="color:#ff2442; font-weight:bold; margin-top:4px; font-size: 13px;">
                    定制总额: ￥{{ scope.row.diy_data.price }}
                  </div>
                  <div style="margin-top: 8px;">
                    <el-button size="small" type="primary" plain @click="openAuditDetail(scope.row)">
                      查看图片与详情
                    </el-button>
                  </div>
                </div>
                <span v-else>{{ scope.row.diy_data }}</span>
              </template>
            </el-table-column>
            
            <el-table-column label="审核状态" width="140">
              <template #default="scope">
                <el-select v-model="scope.row.status" size="small" @change="updateDiyAuditStatus(scope.row)">
                  <el-option label="待审核" value="pending"></el-option>
                  <el-option label="已通过" value="approved"></el-option>
                  <el-option label="已拒绝" value="rejected"></el-option>
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="商家反馈(拒接原因等)" min-width="220">
              <template #default="scope">
                <el-input 
                  v-model="scope.row.admin_feedback" 
                  size="small" 
                  placeholder="输入反馈" 
                  @keyup.enter="updateDiyAuditStatus(scope.row)"
                >
                  <template #append>
                    <el-button @click="updateDiyAuditStatus(scope.row)">保存</el-button>
                  </template>
                </el-input>
              </template>
            </el-table-column>
            
            <el-table-column prop="created_at" label="提交时间" width="160"></el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

    </el-tabs>

    <el-dialog v-model="editVisible" title="强制修改订单状态" width="350px">
      <el-form label-width="80px">
        <el-form-item label="当前订单">#{{ currentOrder?.order_number }}</el-form-item>
        <el-form-item label="变更状态">
          <el-select v-model="targetStatus" style="width:100%">
            <el-option v-for="(label, value) in statusLabelMap" :key="value" :label="label" :value="value"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitStatusUpdate">确认更改</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="auditDetailVisible" title="定制详情预览" width="500px">
      <div v-if="currentAuditDetail" class="audit-detail-container">
        <div class="base-info">
          <el-image :src="currentAuditDetail.product_image" style="width: 80px; height: 80px; border-radius: 8px;"></el-image>
          <div style="margin-left: 15px;">
            <h3 style="margin: 0 0 5px 0;">{{ currentAuditDetail.product_name }}</h3>
            <p style="margin: 0; color: #ff2442; font-weight: bold;">总计：￥{{ currentAuditDetail.diy_data.price }}</p>
          </div>
        </div>
        <el-divider border-style="dashed" />
        <h4 style="margin-bottom: 15px;">用户选配清单：</h4>
        <div class="selection-list">
          <div v-for="(val, key) in currentAuditDetail.diy_data.selections" :key="key" class="selection-item">
            <template v-if="val && val.name">
              <div class="sel-label">{{ translateKey(key) }}</div>
              <div class="sel-value">
                <span style="margin-right: 10px;">{{ val.name }} <span v-if="val.add_price > 0" style="color:#ff8e7e; font-size: 12px;">(+￥{{val.add_price}})</span></span>
                
                <div v-if="val.option_type === 'color' || val.value.startsWith('#')" 
                     :style="{backgroundColor: val.value, width:'30px', height:'30px', borderRadius:'4px', border:'1px solid #ddd', display:'inline-block', verticalAlign:'middle'}"></div>
                
                <el-image v-else-if="val.value && (val.value.startsWith('http') || val.value.startsWith('/'))" 
                          :src="val.value" 
                          :preview-src-list="[val.value]"
                          fit="cover"
                          style="width: 40px; height: 40px; border-radius: 4px; vertical-align: middle; cursor: pointer; border: 1px solid #eee;">
                </el-image>
              </div>
            </template>
          </div>
          <div v-if="currentAuditDetail.diy_data.monogram_text" class="selection-item">
            <div class="sel-label">个性刻字</div>
            <div class="sel-value" style="font-weight: bold; color: #333;">{{ currentAuditDetail.diy_data.monogram_text }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'

const route = useRoute()
const topTab = ref('orderTable') 
const loading = ref(false)

// --- 订单表相关数据与方法 ---
const orderList = ref([])
const activeStatus = ref('all')
const searchQuery = ref('')
const editVisible = ref(false)
const currentOrder = ref(null)
const targetStatus = ref('')

const statusLabelMap = {
  pending: '待支付',
  paid: '已支付/待发货',
  shipped: '已发货',
  completed: '已完成'
}

const statusTypeMap = {
  pending: 'warning',
  paid: 'danger',
  shipped: 'primary',
  completed: 'success'
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/order/list/', {
      params: { status: activeStatus.value, keyword: searchQuery.value }
    })
    orderList.value = res.data.data
  } finally {
    loading.value = false
  }
}

const handleStatusClick = () => fetchOrders()

const handleShip = (row) => {
  ElMessageBox.confirm(`确定要为订单 ${row.order_number} 进行发货处理吗？`, '提示').then(async () => {
    const res = await request.post('/admin/order/update/', { id: row.id, status: 'shipped' })
    if (res.data.code === 200) {
      ElMessage.success('已标记为已发货')
      fetchOrders()
    }
  })
}

const handleCommand = (cmd, row) => {
  if (cmd === 'edit') {
    currentOrder.value = row
    targetStatus.value = row.status
    editVisible.value = true
  } else if (cmd === 'delete') {
    ElMessageBox.confirm('确定删除该订单记录？此操作不可逆', '警告', { type: 'error' }).then(async () => {
      const res = await request.post('/admin/order/delete/', { id: row.id })
      if (res.data.code === 200) {
        ElMessage.success('订单已删除')
        fetchOrders()
      }
    })
  }
}

const submitStatusUpdate = async () => {
  const res = await request.post('/admin/order/update/', { id: currentOrder.value.id, status: targetStatus.value })
  if (res.data.code === 200) {
    ElMessage.success('修改成功')
    editVisible.value = false
    fetchOrders()
  }
}

// --- 售后订单相关数据与方法 ---
const afterSalesList = ref([])

const fetchAfterSales = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/after_sales/list/')
    afterSalesList.value = res.data.data
  } finally {
    loading.value = false
  }
}

const updateAfterSalesStatus = async (row) => {
  try {
    const res = await request.post('/admin/after_sales/update/', { 
      id: row.id, 
      status: row.status 
    })
    if (res.data.code === 200) {
      ElMessage.success('售后状态已更新')
      fetchAfterSales()
    }
  } catch (err) {
    ElMessage.error('更新失败')
  }
}

// --- DIY成品审核相关数据与方法 ---
const diyAuditList = ref([])

const fetchDiyAuditList = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/diy_finished/list/')
    diyAuditList.value = res.data.data
  } finally {
    loading.value = false
  }
}

const updateDiyAuditStatus = async (row) => {
  try {
    const res = await request.post('/admin/diy_finished/update/', { 
      id: row.id, 
      status: row.status,
      admin_feedback: row.admin_feedback
    })
    if (res.data.code === 200) {
      ElMessage.success('审核处理与反馈已保存')
    }
  } catch (err) {
    ElMessage.error('更新失败')
  }
}

// 🌟 新增：图片与详情弹窗的控制逻辑
const auditDetailVisible = ref(false)
const currentAuditDetail = ref(null)

const openAuditDetail = (row) => {
  currentAuditDetail.value = row
  auditDetailVisible.value = true
}

const translateKey = (key) => {
  const map = {
    material: '面料材质', color: '外观颜色', theme: '主题图案', lining: '内衬花色',
    hardware: '五金配件', monogram: '个性刻制', accessory: '配饰挂件', size: '型号尺寸'
  }
  return map[key] || key
}

// --- 初始化 ---
onMounted(() => {
  if (route.query.topTab) {
    topTab.value = route.query.topTab
  }
  if (route.query.status) {
    activeStatus.value = route.query.status
  }
  
  fetchOrders()
  fetchAfterSales()
  fetchDiyAuditList() 
})
</script>

<style scoped>
/* 保留原样式 */
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-weight: bold; font-size: 18px; }
.order-detail { padding: 20px; background: #fafafa; }
.address-text { font-size: 12px; color: #666; margin-top: 5px; }
.diy-info { color: #ff2442; font-size: 12px; }
.text-grey { color: #999; font-size: 12px; }

:deep(.el-tabs--border-card) {
  border: none;
  background-color: transparent;
}
:deep(.el-tabs--border-card > .el-tabs__header) {
  background-color: transparent;
  border-bottom: none;
}

/* 🌟 新增：详情弹窗专属样式 */
.audit-detail-container .base-info { display: flex; align-items: center; }
.selection-list { margin-top: 10px; }
.selection-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #f9f9f9; }
.selection-item:last-child { border-bottom: none; }
.sel-label { color: #666; font-size: 14px; width: 80px; font-weight: bold;}
.sel-value { flex: 1; text-align: right; display: flex; justify-content: flex-end; align-items: center; font-size: 14px; color: #333; }
</style>