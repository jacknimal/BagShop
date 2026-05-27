<template>
  <div class="diy-manager">
    <el-card>
      <template #header>
        <div class="card-header">
          <span class="title">🎨 DIY 定制原料库管理</span>
          <div class="header-ops">
            <el-select v-model="selectedProductId" placeholder="选择底包进行配置" @change="fetchOptions" style="width: 250px; margin-right: 15px;">
              <el-option v-for="item in diyProducts" :key="item.id" :label="item.name" :value="item.id"></el-option>
            </el-select>
            <el-button type="primary" :disabled="!selectedProductId" @click="openAdd">添加定制选项</el-button>
          </div>
        </div>
      </template>

      <el-table :data="optionList" border stripe v-loading="loading">
        <el-table-column label="选项类型" width="120">
          <template #default="scope">
            <el-tag size="small">{{ getTypeName(scope.row.option_type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="选项名称" width="180"></el-table-column>
        <el-table-column label="内容/预览" width="150">
          <template #default="scope">
            <div v-if="scope.row.option_type === 'color'" :style="{backgroundColor: scope.row.value, width:'30px', height:'20px', borderRadius:'4px', border:'1px solid #ddd'}"></div>
            <el-image v-else :src="scope.row.value" fit="cover" style="width: 40px; height: 40px; border-radius: 4px;">
              <template #error><div class="image-slot">无图</div></template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column label="附加价格" width="120">
          <template #default="scope">￥{{ scope.row.add_price }}</template>
        </el-table-column>
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="openEdit(scope.row)">编辑</el-button>
            <el-popconfirm title="确定删除这个选项吗？" @confirm="handleDelete(scope.row.id)">
              <template #reference>
                <el-button size="small" type="danger" plain>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? '编辑选项' : '新增定制项'" width="450px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="定制类型">
          <el-select v-model="form.option_type" placeholder="请选择类别" style="width: 100%">
            <el-option label="面料材质" value="material"></el-option>
            <el-option label="外观颜色" value="color"></el-option>
            <el-option label="主题图案" value="theme"></el-option>
            <el-option label="内衬花色" value="lining"></el-option>
            <el-option label="五金配件" value="hardware"></el-option>
            <el-option label="个性刻制" value="monogram"></el-option>
            <el-option label="配饰挂件" value="accessory"></el-option>
            <el-option label="型号尺寸" value="size"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="form.name" placeholder="如：意大利头层牛皮 / 玫瑰金扣"></el-input>
        </el-form-item>
        <el-form-item :label="form.option_type === 'color' ? '颜色代码' : '图片地址'">
          <el-input v-model="form.value" :placeholder="form.option_type === 'color' ? '#FFFFFF' : 'http://...'"></el-input>
        </el-form-item>
        <el-form-item label="附加价格">
          <el-input-number v-model="form.add_price" :min="0" style="width: 100%"></el-input-number>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确认保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const diyProducts = ref([])
const selectedProductId = ref(null)
const optionList = ref([])
const dialogVisible = ref(false)
const editId = ref(null)

const form = ref({
  option_type: 'color',
  name: '',
  value: '',
  add_price: 0
})

const getTypeName = (key) => {
  const map = {
    material: '面料材质', color: '外观颜色', theme: '主题图案', lining: '内衬花色',
    hardware: '五金配件', monogram: '个性刻制', accessory: '配饰挂件', size: '型号尺寸'
  }
  return map[key] || key
}

// 获取所有标记为 DIY 的基础包列表
const fetchDiyProducts = async () => {
  const res = await request.get('/products/', { params: { is_admin: 1 } })
  diyProducts.value = res.data.filter(p => p.is_diy)
}

// 获取当前底包的定制选项
const fetchOptions = async () => {
  // 🌟 核心修复：把 selectedProductId.ref 改为 selectedProductId.value
  if (!selectedProductId.value) return 
  
  loading.value = true
  try {
    const res = await request.get('/diy/options/', { params: { product_id: selectedProductId.value } })
    optionList.value = res.data
  } finally {
    loading.value = false
  }
}

const openAdd = () => {
  editId.value = null
  form.value = { option_type: 'color', name: '', value: '', add_price: 0 }
  dialogVisible.value = true
}

const openEdit = (row) => {
  editId.value = row.id
  form.value = { ...row }
  dialogVisible.value = true
}

const handleSave = async () => {
  try {
    // 🌟 后端需要支持 save_diy_option 接口
    const res = await request.post('/admin/diy/option/save/', {
      id: editId.value,
      product_id: selectedProductId.value,
      ...form.value
    })
    if (res.data.code === 200) {
      ElMessage.success('保存成功')
      dialogVisible.value = false
      fetchOptions()
    }
  } catch (err) { ElMessage.error('保存失败') }
}

const handleDelete = async (id) => {
  const res = await request.post('/admin/diy/option/delete/', { id })
  if (res.data.code === 200) {
    ElMessage.success('已删除')
    fetchOptions()
  }
}

onMounted(fetchDiyProducts)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-weight: bold; font-size: 18px; color: #409EFF; }
</style>