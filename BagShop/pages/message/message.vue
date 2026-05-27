<template>
  <view class="msg-container">
    <view class="msg-header">
      <view class="header-item" @click="goToNotice('like')">
        <view class="icon-box">
          <view class="icon-circle like-bg">♥</view>
          <text class="badge" v-if="unreadLikes > 0">{{ unreadLikes }}</text>
        </view>
        <text class="text">赞和收藏</text>
      </view>
      
      <view class="header-item" @click="goToFollowHub">
        <view class="icon-box">
          <view class="icon-circle fan-bg">👤</view>
          <text class="badge" v-if="unreadFans > 0">{{ unreadFans }}</text>
        </view>
        <text class="text">粉丝好友</text>
      </view>
      
      <view class="header-item" @click="goToNotice('comment')">
        <view class="icon-box">
          <view class="icon-circle comment-bg">💬</view>
          <text class="badge" v-if="unreadComments > 0">{{ unreadComments }}</text>
        </view>
        <text class="text">评论和@</text>
      </view>
    </view>

    <view class="chat-list">
      <view class="list-title">消息互动</view>
      
      <view class="chat-item" @click="goToCSChat">
        <view class="avatar-box">
          <view class="avatar cs-avatar">🎧</view>
          <text class="badge" v-if="unreadChat > 0">{{ unreadChat }}</text>
        </view>
        <view class="chat-info">
          <view class="chat-top">
            <text class="chat-name">箱包销售客服助理</text>
            <text class="chat-time">官方</text>
          </view>
          <text class="chat-preview" v-if="unreadChat > 0" style="color: #ff5000;">您有 {{ unreadChat }} 条未读消息，请及时查看</text>
          <text class="chat-preview" v-else>点击此处咨询商品、定制或售后问题~</text>
        </view>
      </view>

      <view class="chat-item" v-for="chat in chatList" :key="chat.user_id" @click="goToUserChat(chat)">
        <view class="avatar-box">
          <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
          <text class="badge" v-if="chat.unread_count > 0">{{ chat.unread_count }}</text>
        </view>
        <view class="chat-info">
          <view class="chat-top">
            <text class="chat-name">{{ chat.username }}</text>
            <text class="chat-time">{{ chat.last_time }}</text>
          </view>
          <view class="chat-preview-box">
            <text class="chat-preview" :style="chat.unread_count > 0 ? 'color: #ff5000; font-weight: bold;' : ''">
              {{ chat.unread_count > 0 ? '[未读] ' + chat.last_msg : chat.last_msg }}
            </text>
            <text class="friend-tag" v-if="chat.is_mutual">互相关注</text>
          </view>
        </view>
      </view>

      <view class="empty-state" v-if="chatList.length === 0">快去社区关注达人，开始聊天吧~</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      unreadLikes: 0,
      unreadComments: 0,
      unreadChat: 0,
      unreadFans: 0, 
      chatList: [] 
    }
  },
  onShow() {
    this.getNoticeCounts();
    this.getChatList();
  },
  methods: {
    getNoticeCounts() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      uni.request({
        url: 'http://127.0.0.1:8000/api/community/notice/counts/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            this.unreadLikes = res.data.unread_likes;
            this.unreadComments = res.data.unread_comments;
            this.unreadChat = res.data.unread_chat || 0; 
            this.unreadFans = res.data.unread_fans || 0; 
          }
        }
      });
    },
    getChatList() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      uni.request({
        url: 'http://127.0.0.1:8000/api/chat/list/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            this.chatList = res.data.data;
          }
        }
      });
    },
    
    goToNotice(type) {
      uni.navigateTo({ url: `/pages/message/notice_list?type=${type}` });
    },
    
    goToFollowHub() {
      uni.navigateTo({ url: '/pages/message/follow_hub' });
    },
    
    goToCSChat() {
      uni.navigateTo({ url: '/pages/message/chat?type=cs' });
    },
    
    goToUserChat(chat) {
      uni.navigateTo({ 
        url: `/pages/message/chat?target_id=${chat.user_id}&name=${chat.username}&type=user` 
      });
    },
    showToast(msg) { uni.showToast({ title: msg, icon: 'none' }); }
  }
}
</script>

<style>
.msg-container { background-color: #f5f7fa; min-height: 100vh; }
.msg-header { display: flex; justify-content: space-around; background: #fff; padding: 25px 0; margin-bottom: 10px; }
.header-item { display: flex; flex-direction: column; align-items: center; }
.icon-box { position: relative; margin-bottom: 8px; }
.icon-circle { width: 50px; height: 50px; border-radius: 16px; display: flex; justify-content: center; align-items: center; font-size: 24px; color: #fff; }
.like-bg { background: linear-gradient(135deg, #ff758c, #ff7eb3); }
.fan-bg { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.comment-bg { background: linear-gradient(135deg, #43e97b, #38f9d7); }
.badge { position: absolute; top: -6px; right: -6px; background: #ff3b30; color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 10px; border: 2px solid #fff; font-weight: bold;}
.text { font-size: 13px; color: #333; font-weight: bold;}

.chat-list { background: #fff; min-height: 500px;}
.list-title { font-size: 15px; font-weight: bold; color: #333; padding: 15px 15px; }
.empty-state { text-align: center; color: #999; padding-top: 30px; padding-bottom: 30px; font-size: 13px;}

.chat-item { display: flex; align-items: center; padding: 12px 15px; border-bottom: 1px solid #f9f9f9; width: 100%; box-sizing: border-box;}
.chat-item:active { background-color: #f5f5f5; }

.avatar-box { position: relative; margin-right: 15px; }
.avatar { width: 50px; height: 50px; border-radius: 50%; background: #eee; display: flex; justify-content: center; align-items: center; font-size: 24px;}
.cs-avatar { background: linear-gradient(135deg, #FF9A9E, #FECFEF); color: #fff; }

.chat-info { flex: 1; display: flex; flex-direction: column; justify-content: center; overflow: hidden;}
.chat-top { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;}
.chat-name { font-size: 16px; font-weight: bold; color: #333;}
.chat-time { font-size: 11px; color: #999; }
.chat-preview-box { display: flex; justify-content: space-between; align-items: center;}
.chat-preview { font-size: 13px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;}
.friend-tag { font-size: 10px; color: #ff2442; background: #fff1f0; padding: 2px 6px; border-radius: 4px; margin-left: 10px; white-space: nowrap;}
</style>