<template>
  <view class="ai-container">
    
    <scroll-view scroll-y class="chat-scroll" :scroll-into-view="scrollId" scroll-with-animation>
      
      <view class="msg-row ai" id="msg-init">
        <view class="avatar ai-avatar">✨</view>
        <view class="msg-bubble ai-bubble">
          <text class="ai-name">专属设计顾问·小包</text>
          <text>你好！我是你的AI定制助手。
          你可以告诉我你的日常穿搭风格、偏好的颜色，或者送礼的对象。我会为你生成独一无二的DIY设计方案哦！🎨</text>
        </view>
      </view>

      <view class="msg-row" v-for="(m, index) in messages" :key="index" :class="m.isUser ? 'user' : 'ai'" :id="'msg-'+index">
        <view class="avatar ai-avatar" v-if="!m.isUser">✨</view>
        
        <view class="msg-bubble" :class="m.isUser ? 'user-bubble' : 'ai-bubble'">
          {{ m.text }}
        </view>
        
        <image class="avatar user-avatar" src="/static/logo.png" mode="aspectFill" v-if="m.isUser"></image>
      </view>

      <view class="bottom-spacer"></view>
    </scroll-view>

    <view class="interaction-area">
      <scroll-view scroll-x class="suggestion-scroll" :show-scrollbar="false">
        <view class="suggestion-tags">
          <view class="tag" @click="fastSend('我平时穿休闲风，推荐个颜色？')">👕 休闲风配色</view>
          <view class="tag" @click="fastSend('送给闺蜜的生日礼物，怎么设计？')">🎁 送闺蜜方案</view>
          <view class="tag" @click="fastSend('帆布材质适合搭配什么图案？')">🎨 帆布图案推荐</view>
          <view class="tag" @click="fastSend('想要极简高级感的设计')">✨ 极简高级风</view>
        </view>
      </scroll-view>

      <view class="input-bottom">
        <input 
          class="chat-input" 
          v-model="inputText" 
          placeholder="告诉小包你的设计想法..." 
          confirm-type="send" 
          @confirm="sendMessage"
        />
        <button class="send-btn" :class="{ 'active': inputText.length > 0 }" @click="sendMessage">发送</button>
      </view>
    </view>
    
  </view>
</template>

<script>
export default {
  data() {
    return {
      inputText: '',
      messages: [],
      scrollId: ''
    }
  },
  methods: {
    // 点击提示词快速发送
    fastSend(text) {
      this.inputText = text;
      this.sendMessage();
    },
    
    // 🌟 真实调用 AI 接口的逻辑
    sendMessage() {
      if (!this.inputText.trim()) return;
      
      const userText = this.inputText;
      
      // 1. 将用户的消息推入本地数组展示
      this.messages.push({
        isUser: true,
        text: userText
      });
      
      this.inputText = '';
      this.scrollToBottom();

      // 2. 构造传给后端的历史记录（智谱API要求 role 是 user 或 assistant）
      const chatHistory = this.messages.map(m => ({
        role: m.isUser ? 'user' : 'assistant',
        content: m.text
      }));

      // 3. 开始请求
      uni.showLoading({ title: '小包思考中...' });
      const token = uni.getStorageSync('token');
      
      uni.request({
        url: 'http://127.0.0.1:8000/api/ai/ask/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { history: chatHistory }, // 把拼接好的上下文发给后端
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            // 接收 AI 的真实回复
            this.messages.push({
              isUser: false,
              text: res.data.data.reply
            });
            this.scrollToBottom();
          } else {
            uni.showToast({ title: res.data.msg, icon: 'none' });
          }
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({ title: '网络请求失败', icon: 'none' });
        }
      });
    },
    
    // 自动滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollId = 'msg-' + (this.messages.length - 1);
      });
    }
  }
}
</script>

<style>
.ai-container { height: 100vh; display: flex; flex-direction: column; background: #f8f9fa; }

/* 聊天滚动区 */
.chat-scroll { flex: 1; padding: 20px 15px 0; box-sizing: border-box; }
.bottom-spacer { height: 20px; }

/* 消息行基础样式 */
.msg-row { display: flex; margin-bottom: 25px; align-items: flex-start; }
.msg-row.ai { justify-content: flex-start; }
.msg-row.user { justify-content: flex-end; }

/* 头像设计 */
.avatar { width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0; }
.ai-avatar { background: linear-gradient(135deg, #1f1c2c, #928dab); color: #fff; display: flex; justify-content: center; align-items: center; font-size: 20px; margin-right: 12px; box-shadow: 0 4px 10px rgba(31,28,44,0.2);}
.user-avatar { margin-left: 12px; border: 1px solid #eee; }

/* 气泡设计 */
.msg-bubble { max-width: 70%; padding: 12px 16px; border-radius: 12px; font-size: 15px; line-height: 1.5; word-wrap: break-word; }

/* AI 的气泡（带点毛玻璃和高级渐变感） */
.ai-bubble { background: #ffffff; color: #333333; border-top-left-radius: 2px; box-shadow: 0 4px 15px rgba(0,0,0,0.04); border: 1px solid #f0f0f0;}
.ai-name { display: block; font-size: 12px; color: #888; margin-bottom: 6px; font-weight: bold;}

/* 用户的气泡 */
.user-bubble { background: #111111; color: #ffffff; border-top-right-radius: 2px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }

/* 底部交互区容器 */
.interaction-area { background: #ffffff; border-top: 1px solid #eee; padding-bottom: env(safe-area-inset-bottom); box-shadow: 0 -4px 20px rgba(0,0,0,0.03);}

/* 灵感提示词 (横向滚动) */
.suggestion-scroll { width: 100%; white-space: nowrap; padding: 12px 0; background: #fafafa;}
.suggestion-tags { display: flex; padding: 0 15px; }
.tag { display: inline-block; background: #ffffff; border: 1px solid #e0e0e0; color: #555; font-size: 13px; padding: 6px 14px; border-radius: 16px; margin-right: 10px; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02);}
.tag:active { background: #f0f0f0; transform: scale(0.95);}

/* 输入框区域 */
.input-bottom { display: flex; align-items: center; padding: 10px 15px 15px; }
.chat-input { flex: 1; height: 40px; background: #f5f5f5; border-radius: 20px; padding: 0 18px; font-size: 14px; margin-right: 12px; transition: all 0.3s;}
.chat-input:focus { background: #eeeeee; }

/* 发送按钮 */
.send-btn { width: 65px; height: 36px; line-height: 36px; background: #e0e0e0; color: #999; font-size: 13px; font-weight: bold; border-radius: 18px; padding: 0; transition: all 0.3s; margin: 0;}
.send-btn::after { border: none; }
.send-btn.active { background: #111111; color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.2);}
</style>