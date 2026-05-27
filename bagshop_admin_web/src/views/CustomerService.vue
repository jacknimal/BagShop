<template>
  <div class="cs-console">
    <el-container class="cs-container">
      <el-aside width="300px" class="user-list-aside">
        <div class="search-header">
          <el-input v-model="userQuery" placeholder="搜索联系人..." prefix-icon="Search" clearable />
        </div>
        
        <el-scrollbar>
          <div 
            v-for="user in filteredUsers" 
            :key="user.user_id" 
            :class="['user-item', { active: currentUser?.user_id === user.user_id }]"
            @click="selectUser(user)"
          >
            <el-badge :value="user.unread_count" :hidden="user.unread_count === 0" class="avatar-badge">
              <el-avatar :size="40">{{ user.username.charAt(0).toUpperCase() }}</el-avatar>
            </el-badge>
            <div class="user-info">
              <div class="info-top">
                <span class="username">{{ user.username }}</span>
                <span class="time">{{ user.last_time }}</span>
              </div>
              <div class="last-msg">{{ user.last_msg }}</div>
            </div>
          </div>
        </el-scrollbar>
      </el-aside>

      <el-main class="chat-main">
        <template v-if="currentUser">
          <div class="chat-header">
            <h3>与 {{ currentUser.username }} 对话中</h3>
            <el-tag size="small" type="success">在线</el-tag>
          </div>

          <el-scrollbar ref="msgScroll" class="msg-content">
            <div v-for="msg in messages" :key="msg.id" :class="['msg-wrapper', msg.is_me ? 'msg-me' : 'msg-user']">
              <el-avatar :size="32" class="msg-avatar">
                {{ msg.is_me ? 'A' : currentUser.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="msg-bubble">
                <div class="msg-text">{{ msg.content }}</div>
                <div class="msg-time">{{ msg.time }}</div>
              </div>
            </div>
          </el-scrollbar>

          <div class="chat-input-area">
            <el-input
              v-model="inputText"
              type="textarea"
              :rows="3"
              placeholder="请输入回复内容... (回车发送)"
              @keyup.enter.exact.prevent="handleSend"
            />
            <div class="input-footer">
              <span class="tip">Enter 发送 / Ctrl+Enter 换行</span>
              <el-button type="primary" @click="handleSend" :disabled="!inputText.trim()">发送消息</el-button>
            </div>
          </div>
        </template>
        
        <div v-else class="empty-state">
          <el-empty description="请从左侧选择一个用户开始交流" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import request from '../utils/request'
import { ElMessage } from 'element-plus'

const userQuery = ref('')
const userList = ref([])
const currentUser = ref(null)
const messages = ref([])
const inputText = ref('')
const msgScroll = ref(null)
const loading = ref(false)

// 过滤搜索结果
const filteredUsers = computed(() => {
  return userList.value.filter(u => u.username.toLowerCase().includes(userQuery.value.toLowerCase()))
})

// 获取用户列表
const fetchUserList = async () => {
  const res = await request.get('/admin/chat/users/')
  userList.value = res.data.data
}

// 选择用户并获取聊天历史
const selectUser = async (user) => {
  currentUser.value = user
  await fetchChatHistory()
  // 选完后前端手动清零红点
  user.unread_count = 0
}

const fetchChatHistory = async () => {
  if (!currentUser.value) return
  
  // 🌟 修改点 1：使用管理端专用接口 /admin/chat/history/
  const res = await request.get('/admin/chat/history/', { 
    params: { target_id: currentUser.value.user_id } 
  })
  
  // 🌟 修改点 2：必须使用 res.data.data 才能拿到数组
  if (res.data && res.data.code === 200) {
    messages.value = res.data.data
    scrollToBottom()
  }
}

const handleSend = async () => {
  if (!inputText.value.trim()) return
  
  const content = inputText.value
  inputText.value = '' // 先清空

  try {
    const res = await request.post('/admin/chat/send/', {
      user_id: currentUser.value.user_id,
      content: content
    })
    
    if (res.data.code === 200) {
      // 本地立即插入一条消息，增强体验
      messages.value.push({
        id: Date.now(),
        is_me: true,
        content: content,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
    }
  } catch (err) {
    ElMessage.error('消息发送失败')
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgScroll.value) {
      msgScroll.value.setScrollTop(99999)
    }
  })
}

// 轮询：每5秒刷新一次消息，模拟实时感
onMounted(() => {
  fetchUserList()
  setInterval(() => {
    fetchUserList()
    if (currentUser.value) fetchChatHistory()
  }, 5000)
})
</script>

<style scoped>
.cs-console { height: calc(100vh - 100px); background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
.cs-container { height: 100%; }

/* 左侧联系人 */
.user-list-aside { border-right: 1px solid #f0f0f0; background: #fafafa; display: flex; flex-direction: column; }
.search-header { padding: 15px; background: #fff; border-bottom: 1px solid #f0f0f0; }
.user-item { display: flex; padding: 15px; cursor: pointer; transition: 0.2s; border-bottom: 1px solid #f5f5f5; }
.user-item:hover { background: #f0f2f5; }
.user-item.active { background: #e6f7ff; border-right: 3px solid #1890ff; }
.user-info { margin-left: 12px; flex: 1; overflow: hidden; }
.info-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.username { font-weight: bold; font-size: 14px; color: #333; }
.time { font-size: 12px; color: #999; }
.last-msg { font-size: 12px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* 右侧聊天窗 */
.chat-main { display: flex; flex-direction: column; padding: 0; position: relative; background: #f4f7fc; }
.chat-header { padding: 15px 25px; background: #fff; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 10px; }
.msg-content { flex: 1; padding: 20px; }
.msg-wrapper { display: flex; margin-bottom: 20px; }
.msg-user { flex-direction: row; }
.msg-me { flex-direction: row-reverse; }
.msg-bubble { max-width: 70%; margin: 0 12px; }
.msg-user .msg-bubble .msg-text { background: #fff; color: #333; border-radius: 0 12px 12px 12px; }
.msg-me .msg-bubble .msg-text { background: #1890ff; color: #fff; border-radius: 12px 0 12px 12px; }
.msg-text { padding: 10px 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 14px; line-height: 1.5; }
.msg-time { font-size: 11px; color: #999; margin-top: 5px; text-align: inherit; }

/* 输入区 */
.chat-input-area { background: #fff; padding: 15px 20px; border-top: 1px solid #f0f0f0; }
.input-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
.tip { font-size: 12px; color: #999; }
.empty-state { height: 100%; display: flex; align-items: center; justify-content: center; background: #fff; }
</style>