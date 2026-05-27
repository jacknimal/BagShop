<template>
  <div class="headlines-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">📰 商城头条管理</span>
          <el-button type="success" @click="handleAdd">发布新头条</el-button>
        </div>
      </template>

      <el-table :data="headlineList" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="70"></el-table-column>
        <el-table-column prop="title" label="公告标题" min-width="150"></el-table-column>
        
        <el-table-column label="宣传图预览" width="180">
          <template #default="scope">
            <div class="img-preview-box">
              <el-image 
                v-for="(img, index) in splitImages(scope.row.image_paths)" 
                :key="index"
                :src="img" 
                fit="cover" 
                class="mini-img"
                :preview-src-list="splitImages(scope.row.image_paths)"
              ></el-image>
              <span v-if="!scope.row.image_paths" class="text-grey">无图片</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="target_url" label="跳转路径" width="150"></el-table-column>
        
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.is_active ? 'success' : 'info'">
              {{ scope.row.is_active ? '正在显示' : '已隐藏' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="发布时间" width="160"></el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="headlineForm" label-width="100px">
        <el-form-item label="公告标题">
          <el-input v-model="headlineForm.title" placeholder="请输入抓人眼球的标题"></el-input>
        </el-form-item>
        
        <el-form-item label="是否显示">
          <el-switch v-model="headlineForm.is_active" active-text="显示" inactive-text="隐藏"></el-switch>
        </el-form-item>

        <el-form-item label="宣传图路径">
          <el-input 
            type="textarea" 
            v-model="headlineForm.image_paths" 
            placeholder="多张请用英文逗号分隔，例如：/static/ad1.png, /static/ad2.png"
            :rows="3"
          ></el-input>
          <div class="input-tip">支持本地相对路径或外部网络 URL</div>
        </el-form-item>

        <el-form-item label="跳转链接">
          <el-input v-model="headlineForm.target_url" placeholder="例如：/pages/product/detail?id=10"></el-input>
        </el-form-item>

        <el-form-item label="详情内容">
          <el-input 
            type="textarea" 
            v-model="headlineForm.content" 
            placeholder="请输入公告的详细描述内容..."
            :rows="5"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const headlineList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('发布新头条')

const headlineForm = reactive({
  id: null,
  title: '',
  content: '',
  image_paths: '',
  target_url: '',
  is_active: true
})

// 获取列表数据
const fetchList = async () => {
  loading.value = true
  const res = await request.get('/admin/headlines/')
  headlineList.value = res.data.data
  loading.value = false
}

// 辅助方法：切分图片路径
const splitImages = (pathStr) => {
  if (!pathStr) return []
  return pathStr.split(',').map(s => s.trim()).filter(s => s !== '')
}

// 新增与编辑逻辑
const handleAdd = () => {
  dialogTitle.value = '发布新头条'
  Object.assign(headlineForm, { id: null, title: '', content: '', image_paths: '', target_url: '', is_active: true })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '编辑头条信息'
  Object.assign(headlineForm, row)
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!headlineForm.title) return ElMessage.warning('标题不能为空')
  
  const res = await request.post('/admin/headline/save/', headlineForm)
  if (res.data.code === 200) {
    ElMessage.success(res.data.msg)
    dialogVisible.value = false
    fetchList()
  }
}

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除头条 "${row.title}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await request.post('/admin/headline/delete/', { id: row.id })
    if (res.data.code === 200) {
      ElMessage.success('已成功删除')
      fetchList()
    }
  })
}

onMounted(fetchList)
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-header .title { font-weight: bold; font-size: 18px; }

/* 图片预览样式 */
.img-preview-box { display: flex; gap: 5px; flex-wrap: wrap; }
.mini-img { width: 40px; height: 40px; border-radius: 4px; cursor: zoom-in; border: 1px solid #eee; }

.text-grey { color: #999; font-size: 12px; }
.input-tip { font-size: 12px; color: #999; margin-top: 4px; }
</style>