<template>
  <div class="community-manager">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span class="title">💬 社区生态综合管理</span>
          <div class="search-bar">
            <el-select 
              v-model="searchForm.user_id" 
              placeholder="按发布者过滤" 
              clearable 
              filterable 
              style="width: 180px; margin-right: 10px;" 
              @change="fetchPosts"
            >
              <el-option v-for="u in userList" :key="u.id" :label="u.username" :value="u.id"></el-option>
            </el-select>
            <el-input v-model="searchForm.keyword" placeholder="搜索关键词..." style="width: 220px; margin-right: 10px;" clearable @clear="fetchPosts" />
            <el-button type="primary" @click="fetchPosts">查询</el-button>
          </div>
        </div>
      </template>

      <el-table :data="postList" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="60"></el-table-column>
        <el-table-column label="封面图" width="90">
          <template #default="scope">
            <el-image :src="scope.row.image_url" fit="cover" class="post-img" :preview-src-list="[scope.row.image_url]"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" show-overflow-tooltip></el-table-column>
        <el-table-column prop="author" label="发布人" width="110"></el-table-column>
        
        <el-table-column label="显示状态" width="100">
          <template #default="scope">
            <el-switch 
              v-model="scope.row.is_active" 
              active-color="#13ce66" 
              inactive-color="#ff4949"
              @change="handleStatusChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>

        <el-table-column prop="likes_count" label="点赞" width="70"></el-table-column>
        <el-table-column prop="created_at" label="发布于" width="150"></el-table-column>

        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <div class="op-buttons">
              <el-button size="small" type="success" plain @click="viewDetail(scope.row)">详情</el-button>
              <el-button size="small" type="primary" plain @click="openComments(scope.row)">评论({{ scope.row.comment_count || 0 }})</el-button>
              <el-button size="small" type="danger" plain @click="handleDeletePost(scope.row)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="detailVisible" title="笔记详情内容审核" width="600px" top="5vh">
      <div class="post-detail-content" v-if="currentPost">
        <h2 class="detail-title">{{ currentPost.title }}</h2>
        <div class="author-info">
          <el-tag size="small">发布人：{{ currentPost.author }}</el-tag>
          <span class="detail-time">时间：{{ currentPost.created_at }}</span>
        </div>
        <el-divider content-position="left">文字内容</el-divider>
        <div class="detail-text">{{ currentPost.content }}</div>
        <el-divider content-position="left">配图</el-divider>
        <div class="detail-images">
          <el-image :src="currentPost.image_url" fit="contain" style="width: 100%; border-radius: 8px;"></el-image>
        </div>
      </div>
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="danger" @click="handleDeletePost(currentPost)">违规删除</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="commentDrawer" :title="`评论管理 - ${currentPost?.title}`" size="450px">
      <div class="comment-list" v-loading="commentLoading">
        <el-empty v-if="commentList.length === 0" description="暂无评论内容" />
        <div v-for="comment in commentList" :key="comment.id" class="comment-item">
          <div class="comment-top">
            <span class="c-user">{{ comment.username }}</span>
            <span class="c-time">{{ comment.created_at }}</span>
          </div>
          <div class="c-content">{{ comment.content }}</div>
          <div class="c-actions">
            <el-button type="text" style="color: #f56c6c;" @click="handleDeleteComment(comment)">删除</el-button>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import request from '../utils/request'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const postList = ref([])
const userList = ref([])
const searchForm = reactive({ user_id: '', keyword: '' })

const detailVisible = ref(false)
const commentDrawer = ref(false)
const commentLoading = ref(false)
const commentList = ref([])
const currentPost = ref(null)

// 🌟 修复：获取用户列表，用于搜索下拉框
const fetchUsers = async () => {
  try {
    const res = await request.get('/users/')
    userList.value = res.data
  } catch (err) {
    console.error('获取用户列表失败', err)
  }
}

const fetchPosts = async () => {
  loading.value = true
  try {
    const res = await request.get('/admin/community/posts/', { params: searchForm })
    postList.value = res.data.data
  } finally {
    loading.value = false
  }
}

const viewDetail = (row) => {
  currentPost.value = row
  detailVisible.value = true
}

const handleStatusChange = async (row) => {
  try {
    const res = await request.post('/admin/community/post/status/', { 
      id: row.id, 
      is_active: row.is_active 
    })
    if (res.data.code === 200) ElMessage.success(res.data.msg)
  } catch (err) {
    row.is_active = !row.is_active
  }
}

const openComments = async (row) => {
  currentPost.value = row
  commentDrawer.value = true
  commentLoading.value = true
  try {
    const res = await request.get('/admin/community/comments/', { params: { post_id: row.id } })
    commentList.value = res.data.data
  } finally {
    commentLoading.value = false
  }
}

const handleDeleteComment = (comment) => {
  ElMessageBox.confirm('确定删除该评论吗？', '警告').then(async () => {
    const res = await request.post('/admin/community/comment/delete/', { id: comment.id })
    if (res.data.code === 200) {
      ElMessage.success('评论已删除')
      openComments(currentPost.value) // 刷新评论列表
    }
  })
}

const handleDeletePost = (row) => {
  ElMessageBox.confirm(`确定删除这条动态吗？`, '警告', { type: 'error' }).then(async () => {
    const res = await request.post('/community/post/delete/', { post_id: row.id })
    if (res.data.code === 200) {
      ElMessage.success('动态已删除')
      if (detailVisible.value) detailVisible.value = false
      fetchPosts()
    }
  })
}

onMounted(() => {
  fetchUsers() // 🌟 修复：组件加载时立即获取用户列表
  fetchPosts()
})
</script>

<style scoped>
.card-header { display: flex; justify-content: space-between; align-items: center; }
.title { font-weight: bold; font-size: 18px; }
.post-img { width: 45px; height: 45px; border-radius: 4px; cursor: pointer; }
.op-buttons { display: flex; gap: 5px; justify-content: flex-start; }

/* 详情展示样式 */
.detail-title { margin-bottom: 10px; font-size: 20px; color: #333; }
.author-info { margin-bottom: 20px; color: #999; font-size: 13px; display: flex; justify-content: space-between; }
.detail-text { line-height: 1.8; color: #444; white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 6px; }

/* 评论样式 */
.comment-item { padding: 15px 0; border-bottom: 1px dashed #eee; }
.comment-top { display: flex; justify-content: space-between; margin-bottom: 8px; }
.c-user { font-weight: bold; color: #409EFF; }
.c-time { font-size: 12px; color: #999; }
.c-actions { text-align: right; }
</style>