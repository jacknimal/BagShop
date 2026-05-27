<template>
  <view class="chat-container">
    <view class="limit-tip" v-if="chatType === 'user' && !isMutual && mySentCount >= 1">
      ⚠️ 对方未回关，已达到打招呼上限
    </view>

    <scroll-view scroll-y class="msg-list" :scroll-into-view="scrollId">
      <view class="msg-row" v-for="(m, index) in messages" :key="index" :class="m.is_me ? 'me' : 'other'" :id="'msg-'+index">
        
        <view class="avatar-box" v-if="!m.is_me">
          <view class="chat-avatar cs-avatar" v-if="chatType === 'cs'">🎧</view>
          <image class="chat-avatar" src="/static/logo.png" mode="aspectFill" v-else></image>
        </view>
        
        <view class="msg-bubble">{{ m.content }}</view>
        
        <image class="chat-avatar" src="/static/logo.png" mode="aspectFill" v-if="m.is_me"></image>
      </view>
    </scroll-view>

    <view class="input-area">
      <input 
        class="chat-input" 
        v-model="inputText" 
        :placeholder="canSend ? '发送消息...' : '等待对方回复后可继续聊天'" 
        :disabled="!canSend"
        confirm-type="send" 
        @confirm="sendMessage"
      />
      <button class="send-btn" :class="{ 'disabled-btn': !canSend }" @click="sendMessage">发送</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      chatType: 'cs', // 判断是客服(cs)还是用户(user)
      targetId: '',
      targetName: '',
      inputText: '',
      messages: [],
      scrollId: '',
      // 控制私信状态的变量
      isMutual: false,
      mySentCount: 0,
      timer: null
    }
  },
  computed: {
    // 🌟 核心拦截计算：是否允许发送消息
    canSend() {
      if (this.chatType === 'cs') return true; // 跟客服聊天，永远不限制
      if (this.isMutual) return true;          // 互关好友，随便发
      if (this.mySentCount < 1) return true;   // 还没发过，可以发1条
      return false;                            // 其他情况，锁死！
    }
  },
  onLoad(options) {
    this.chatType = options.type || 'cs';
    
    if (this.chatType === 'user') {
      this.targetId = options.target_id;
      this.targetName = options.name || '私信';
      uni.setNavigationBarTitle({ title: this.targetName });
    } else {
      uni.setNavigationBarTitle({ title: '客服助理' });
    }

    this.getMessages();
    this.timer = setInterval(this.getMessages, 3000);
  },
  onUnload() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    getMessages() {
      const token = uni.getStorageSync('token');
      if(!token) return;
      
      // 🌟 完美修复：确保请求的是 api/chat/cs/list/，与你的 urls.py 严格一致！
      let url = this.chatType === 'user' 
                ? `http://127.0.0.1:8000/api/chat/messages/?target_id=${this.targetId}`
                : `http://127.0.0.1:8000/api/chat/cs/list/`;

      uni.request({
        url: url,
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            // 接收后端传来的私信权限状态
            if (this.chatType === 'user') {
              this.isMutual = res.data.is_mutual;
              this.mySentCount = res.data.my_sent_count;
            }

            if(this.messages.length !== res.data.data.length){
                this.messages = res.data.data;
                this.$nextTick(() => { 
                  if (this.messages.length > 0) {
                    this.scrollId = 'msg-' + (this.messages.length - 1); 
                  }
                });
            }
          }
        }
      });
    },
    sendMessage() {
      if (!this.canSend) return uni.showToast({ title: '非互关好友限发1条', icon: 'none' });
      if (!this.inputText.trim()) return;
      
      const token = uni.getStorageSync('token');
      // 智能分发发送接口
      let url = this.chatType === 'user' 
                ? 'http://127.0.0.1:8000/api/chat/send/' 
                : 'http://127.0.0.1:8000/api/chat/cs/send/';
                
      let requestData = this.chatType === 'user'
                ? { target_id: this.targetId, content: this.inputText }
                : { content: this.inputText };

      uni.request({
        url: url,
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: requestData,
        success: (res) => {
          if (res.data.code === 200) {
            this.inputText = '';
            this.getMessages(); // 发送成功立刻刷新，触发 canSend 锁定
          } else if (res.data.code === 403) {
            uni.showToast({ title: res.data.msg, icon: 'none' });
          }
        }
      });
    }
  }
}
</script>

<style>
.chat-container { height: 100vh; display: flex; flex-direction: column; background: #f5f5f5; }

/* 🌟 用户限制提示条 */
.limit-tip { background: #ffe5e5; color: #ff2442; font-size: 12px; text-align: center; padding: 8px 0; flex-shrink: 0;}

.msg-list { flex: 1; padding: 15px; box-sizing: border-box; }
.msg-row { display: flex; margin-bottom: 20px; align-items: flex-start; }
.msg-row.other { justify-content: flex-start; }
.msg-row.me { justify-content: flex-end; }

/* 🌟 智能头像样式 */
.avatar-box { display: flex; align-items: center; justify-content: center; margin-right: 10px;}
.chat-avatar { width: 40px; height: 40px; border-radius: 50%; }
.cs-avatar { background: linear-gradient(135deg, #FF9A9E, #FECFEF); color: #fff; font-size: 20px; text-align: center; line-height: 40px;}

.msg-row.me .chat-avatar { margin-left: 10px; }

/* 气泡样式 */
.msg-bubble { max-width: 65%; padding: 10px 15px; border-radius: 8px; font-size: 15px; line-height: 1.4; word-wrap: break-word; }
.msg-row.other .msg-bubble { background: #fff; color: #333; border-top-left-radius: 0; box-shadow: 0 2px 5px rgba(0,0,0,0.02);}
.msg-row.me .msg-bubble { background: #ff2442; color: #fff; border-top-right-radius: 0; box-shadow: 0 2px 5px rgba(255,36,66,0.15);}

.input-area { height: 55px; background: #fff; display: flex; align-items: center; padding: 0 15px; padding-bottom: env(safe-area-inset-bottom); border-top: 1px solid #eee; flex-shrink: 0;}
.chat-input { flex: 1; height: 36px; background: #f5f5f5; border-radius: 18px; padding: 0 15px; font-size: 14px; margin-right: 10px; }

/* 🌟 锁定样式 */
.chat-input[disabled] { background: #e0e0e0; color: #999; }
.send-btn { width: 60px; height: 32px; line-height: 32px; background: #ff2442; color: #fff; font-size: 13px; border-radius: 16px; padding: 0; transition: all 0.3s;}
.disabled-btn { background: #ccc; color: #fff; pointer-events: none;}
</style>