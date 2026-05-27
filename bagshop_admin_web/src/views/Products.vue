<template>
  <div class="products-manager">
    <el-tabs v-model="activeTab" type="border-card">
      
      <el-tab-pane label="商品列表" name="productList">
        <div class="table-header-box">
          <el-form :inline="true" :model="searchForm" class="search-bar">
            <el-form-item label="名称">
              <el-input v-model="searchForm.keyword" placeholder="搜索商品名称" clearable></el-input>
            </el-form-item>
            <el-form-item label="所属分类">
              <el-select v-model="searchForm.category" placeholder="全部" clearable style="width: 150px">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="fetchProducts">查询</el-button>
              <el-button type="success" @click="handleAddProduct">添加新商品</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="products" border stripe v-loading="loading" style="width: 100%">
          <el-table-column prop="id" label="ID" width="70"></el-table-column>
          <el-table-column label="主图" width="100">
            <template #default="scope">
              <el-image :src="scope.row.image_url" fit="cover" class="table-img"></el-image>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="商品名称" min-width="180"></el-table-column>
          <el-table-column prop="category_name" label="所属分类" width="120"></el-table-column>
          <el-table-column prop="price" label="价格" width="100"></el-table-column>
          <el-table-column prop="stock" label="库存" width="90"></el-table-column>
          <el-table-column label="标签设置" width="220">
            <template #default="scope">
              <el-tag :type="scope.row.is_active ? 'success' : 'info'" size="small">
                {{ scope.row.is_active ? '上架中' : '已下架' }}
              </el-tag>
              <el-tag v-if="scope.row.is_new" type="danger" size="small" style="margin-left: 5px;">新品</el-tag>
              <el-tag v-if="scope.row.is_diy" type="warning" size="small" style="margin-left: 5px;">DIY款</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="handleEditProduct(scope.row)">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDeleteProduct(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="分类管理" name="categoryList">
        <div class="op-header">
          <el-button type="primary" @click="handleAddCategory">新增分类项目</el-button>
        </div>

        <el-table :data="categories" border stripe style="width: 100%; margin-top: 15px;">
          <el-table-column prop="id" label="ID" width="80"></el-table-column>
          <el-table-column prop="name" label="分类名称"></el-table-column>
          <el-table-column prop="sort_order" label="排序权重" width="120">
            <template #default="scope">
              <el-tag type="info">{{ scope.row.sort_order }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180">
            <template #default="scope">
              <el-button size="small" @click="handleEditCategory(scope.row)">修改</el-button>
              <el-button size="small" type="danger" @click="handleDeleteCategory(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="productDialogVisible" :title="productDialogTitle" width="750px">
      <el-form :model="productForm" label-width="120px" class="dialog-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称">
              <el-input v-model="productForm.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属分类">
              <el-select v-model="productForm.category" placeholder="请选择" style="width: 100%">
                <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格 (元)">
              <el-input-number v-model="productForm.price" :precision="2" :step="0.1" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存量">
              <el-input-number v-model="productForm.stock" style="width: 100%"></el-input-number>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="主图链接">
          <el-input v-model="productForm.image_url" placeholder="/static/xxx.png"></el-input>
        </el-form-item>

        <el-form-item label="主图视频链接">
          <el-input v-model="productForm.video_url" placeholder="可选填：例如 /media/videos/shop.mp4"></el-input>
        </el-form-item>

        <el-form-item label="状态设置">
          <el-checkbox v-model="productForm.is_active">是否上架</el-checkbox>
          <el-checkbox v-model="productForm.is_new">新品首发</el-checkbox>
          <el-checkbox v-model="productForm.is_diy">DIY基础款</el-checkbox>
        </el-form-item>

        <el-form-item label="商品描述">
          <el-input type="textarea" :rows="3" v-model="productForm.description"></el-input>
        </el-form-item>

        <el-form-item label="详情图(英文逗号分隔)">
          <el-input type="textarea" :rows="3" v-model="productForm.detail_image_urls"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="productDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitProduct">提交保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="catDialogVisible" :title="catDialogTitle" width="400px">
      <el-form :model="catForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="catForm.name" placeholder="例如：斜挎包"></el-input>
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="catForm.sort_order" :min="0"></el-input-number>
          <div class="tip">数字越小，在小程序分类栏中越靠前</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="catDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCategory">确认提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 基础状态 ---
const activeTab = ref('productList')
const loading = ref(false)
const products = ref([])
const categories = ref([])

// --- 商品搜索与表单 ---
const searchForm = reactive({ keyword: '', category: '' })
const productDialogVisible = ref(false)
const productDialogTitle = ref('新增商品')
const productForm = reactive({
  id: null,
  name: '',
  category: null,
  price: 0,
  stock: 0,
  image_url: '',
  video_url: '',
  is_active: true,
  is_new: false,
  is_diy: false,
  description: '',
  detail_image_urls: ''
})

// --- 分类表单 ---
const catDialogVisible = ref(false)
const catDialogTitle = ref('新增分类')
const catForm = reactive({ id: null, name: '', sort_order: 0 })

// --- 数据获取方法 ---
const fetchCategories = async () => {
  try {
    const res = await request.get('/categories/')
    categories.value = res.data
  } catch (err) {
    ElMessage.error('加载分类失败')
  }
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await request.get('/products/', {
      params: { 
        keyword: searchForm.keyword, 
        category_id: searchForm.category,
        is_admin: true // 告诉后端这是管理员在查询，不要过滤掉 DIY 商品
      }
    })
    products.value = res.data
  } catch (err) {
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

// --- 商品管理逻辑 ---
const handleAddProduct = () => {
  productDialogTitle.value = '新增商品'
  Object.assign(productForm, {
    id: null, name: '', category: null, price: 0, stock: 0, 
    image_url: '', video_url: '', is_active: true, is_new: false, 
    is_diy: false, description: '', detail_image_urls: ''
  })
  productDialogVisible.value = true
}

const handleEditProduct = (row) => {
  productDialogTitle.value = '编辑商品'
  // 回显数据：必须将表格行数据复制到表单对象中
  Object.assign(productForm, {
    id: row.id,
    name: row.name,
    category: row.category, // 这里对应的是分类 ID
    price: row.price,
    stock: row.stock,
    image_url: row.image_url,
    video_url: row.video_url || '',
    is_active: row.is_active,
    is_new: row.is_new,
    is_diy: row.is_diy,
    description: row.description || '',
    detail_image_urls: row.detail_image_urls || ''
  })
  productDialogVisible.value = true
}

const submitProduct = async () => {
  if (!productForm.name || !productForm.category) {
    return ElMessage.warning('商品名称和分类不能为空')
  }
  try {
    const res = await request.post('/product/save/', productForm)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      productDialogVisible.value = false
      fetchProducts()
    }
  } catch (err) {
    ElMessage.error('保存商品失败')
  }
}

const handleDeleteProduct = (row) => {
  ElMessageBox.confirm(`确定要永久删除商品 "${row.name}" 吗？`, '警告', { type: 'warning' }).then(async () => {
    const res = await request.post('/product/delete/', { id: row.id })
    if (res.data.code === 200) {
      ElMessage.success('已删除')
      fetchProducts()
    }
  })
}

// --- 分类管理逻辑 ---
const handleAddCategory = () => {
  catDialogTitle.value = '新增分类'
  Object.assign(catForm, { id: null, name: '', sort_order: 0 })
  catDialogVisible.value = true
}

const handleEditCategory = (row) => {
  catDialogTitle.value = '编辑分类'
  Object.assign(catForm, { id: row.id, name: row.name, sort_order: row.sort_order })
  catDialogVisible.value = true
}

const submitCategory = async () => {
  if (!catForm.name) return ElMessage.warning('分类名称不能为空')
  try {
    const res = await request.post('/category/save/', catForm)
    if (res.data.code === 200) {
      ElMessage.success(res.data.msg)
      catDialogVisible.value = false
      fetchCategories()
    }
  } catch (err) {
    ElMessage.error('保存分类失败')
  }
}

const handleDeleteCategory = (row) => {
  ElMessageBox.confirm(`确定删除分类 "${row.name}" 吗？如果分类下有关联商品将无法删除。`, '警告', { type: 'warning' }).then(async () => {
    const res = await request.post('/category/delete/', { id: row.id })
    if (res.data.code === 200) {
      ElMessage.success('已删除')
      fetchCategories()
    } else {
      ElMessage.error(res.data.msg)
    }
  })
}

// --- 初始化 ---
onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.products-manager { background: transparent; }
.table-header-box { margin-bottom: 20px; }
.search-bar { background: #f9f9f9; padding: 15px; border-radius: 4px; }
.op-header { margin-bottom: 10px; }
.table-img { width: 50px; height: 50px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
.dialog-form { padding-top: 10px; }
.tip { font-size: 12px; color: #999; margin-top: 5px; }
</style>