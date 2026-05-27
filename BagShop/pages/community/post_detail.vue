<template>
  <view class="detail-container" v-if="post">
    
    <view class="header-bar">
      <view class="header-left" @click="goBack">
        <text class="back-icon">‹</text>
      </view>
      
      <view class="author-info">
        <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
        <text class="author-name">{{ post.user.username }}</text>
      </view>

      <view class="header-right">
        <button 
          class="follow-btn" 
          :class="{ 'followed': post.is_followed }" 
          @click="toggleFollow">
          {{ post.is_followed ? '已关注' : '关注' }}
        </button>
      </view>
    </view>

    <scroll-view scroll-y class="scroll-content">
      <image class="main-image" :src="post.image_url" mode="widthFix"></image>

     <view class="content-box">
        <text class="title">{{ post.title }}</text>
        <text class="content-text">{{ post.content }}</text>
        <text class="publish-time" v-if="post.created_at">发布于 {{ post.created_at }}</text>
      </view>
      
      <view class="comment-section">
        <view class="comment-title">共 {{ post.comments.length }} 条评论</view>
        <view class="comment-list" v-if="post.comments.length > 0">
          <view class="comment-item" v-for="c in post.comments" :key="c.id">
            <image class="avatar-small" src="/static/logo.png" mode="aspectFill"></image>
            <view class="comment-right">
              <text class="comment-author">{{ c.username }}</text>
              <text class="comment-content">{{ c.content }}</text>
              <text class="comment-time">{{ c.created_at }}</text>
            </view>
          </view>
        </view>
        <view class="empty-comment" v-else>快来发表第一条评论吧~</view>
      </view>
    </scroll-view>

    <view class="bottom-bar">
      <view class="input-container">
        <input class="comment-input" type="text" v-model="commentText" placeholder="说点什么..." confirm-type="send" @confirm="submitComment" />
        <text class="send-text-btn" @click="submitComment">发送</text>
      </view>
      
      <view class="action-icons">
        <view class="icon-box" @click="toggleLike">
          <text class="icon" :class="{liked: post.is_liked}">{{ post.is_liked ? '♥' : '♡' }}</text>
          <text class="count">{{ post.likes_count }}</text>
        </view>
      </view>
    </view>
    
  </view>
</template>

<script>
export default {
  data() {
    return {
      postId: '',
      post: null,
      commentText: ''
    }
  },
  onLoad(options) {
    if (options.id) {
      this.postId = options.id;
      this.getPostDetail();
    }
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    getPostDetail() {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/community/post/detail/',
        method: 'GET',
        data: { id: this.postId },
        header: token ? { 'Authorization': 'Token ' + token } : {},
        success: (res) => {
          if (res.data.code === 200) this.post = res.data.data;
        }
      });
    },
    
    toggleFollow() {
      const token = uni.getStorageSync('token');
      if (!token) return uni.showToast({ title: '请先登录', icon: 'none' });
      
      uni.request({
        url: 'http://127.0.0.1:8000/api/user/follow/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { target_id: this.post.user.id },
        success: (res) => {
          if (res.data.code === 200) {
            this.post.is_followed = res.data.is_followed;
            uni.showToast({ title: res.data.msg, icon: 'none' });
          } else {
            uni.showToast({ title: res.data.msg, icon: 'none' });
          }
        }
      });
    },

    toggleLike() {
      const token = uni.getStorageSync('token');
      if (!token) return uni.showToast({ title: '请先登录', icon: 'none' });
      uni.request({
        url: 'http://127.0.0.1:8000/api/community/post/like/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { post_id: this.postId },
        success: (res) => {
          if (res.data.code === 200) {
            this.post.is_liked = res.data.is_liked;
            this.post.likes_count = res.data.likes_count;
          }
        }
      });
    },
    submitComment() {
      if (!this.commentText.trim()) return uni.showToast({ title: '评论不能为空', icon: 'none' });
      const token = uni.getStorageSync('token');
      if (!token) return uni.showToast({ title: '请先登录', icon: 'none' });
      
      uni.request({
        url: 'http://127.0.0.1:8000/api/community/post/comment/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { post_id: this.postId, content: this.commentText },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: '评论成功', icon: 'success' });
            this.commentText = '';
            this.getPostDetail(); 
          }
        }
      });
    }
  }
}
</script>

<style>
.detail-container { height: 100vh; display: flex; flex-direction: column; background: #fff;}

.header-bar { height: 44px; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; background: rgba(255,255,255,0.98); position: sticky; top: 0; z-index: 100; border-bottom: 1px solid #f5f5f5;}
.header-left { width: 30px; }
.back-icon { font-size: 32px; color: #333; font-weight: 300; line-height: 44px;}

.author-info { flex: 1; display: flex; align-items: center; padding-left: 10px;}
.avatar { width: 30px; height: 30px; border-radius: 50%; border: 1px solid #eee; margin-right: 8px;}
.author-name { font-size: 14px; font-weight: bold; color: #333;}

.header-right { width: 70px; display: flex; justify-content: flex-end;}
.follow-btn { margin: 0; padding: 0 14px; height: 26px; line-height: 26px; border-radius: 13px; font-size: 12px; font-weight: bold; color: #fff; background: #ff2442; border: 1px solid #ff2442;}
.follow-btn::after { border: none; }
.follow-btn.followed { background: #fff; color: #999; border: 1px solid #ddd; font-weight: normal;}

.scroll-content { flex: 1; overflow-y: auto; padding-bottom: 20px;}
.main-image { width: 100%; display: block; background-color: #f9f9f9;}
.content-box { padding: 20px 15px; border-bottom: 8px solid #f5f7fa;}
.title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 15px; display: block;}
.content-text { font-size: 15px; color: #333; line-height: 1.6; display: block; margin-bottom: 15px; white-space: pre-wrap;}
.publish-time { font-size: 12px; color: #999;}

.comment-section { padding: 20px 15px; }
.comment-title { font-size: 14px; color: #666; margin-bottom: 20px;}
.comment-item { display: flex; margin-bottom: 20px;}
.avatar-small { width: 30px; height: 30px; border-radius: 50%; margin-right: 10px; background: #eee;}
.comment-right { flex: 1; display: flex; flex-direction: column;}
.comment-author { font-size: 13px; color: #666; margin-bottom: 5px;}
.comment-content { font-size: 14px; color: #333; margin-bottom: 5px; line-height: 1.4;}
.comment-time { font-size: 11px; color: #999;}
.empty-comment { text-align: center; color: #999; font-size: 13px; padding: 30px 0;}

/* 🌟 修改点：专门为评论发送框定制的样式 */
.bottom-bar { padding-bottom: env(safe-area-inset-bottom); height: 55px; background-color: #fff; display: flex; align-items: center; padding: 0 15px; box-sizing: border-box; box-shadow: 0 -1px 5px rgba(0,0,0,0.05); z-index: 99;}
.input-container { flex: 1; display: flex; align-items: center; background-color: #f5f5f5; border-radius: 18px; padding: 0 10px 0 15px; margin-right: 15px; height: 36px;}
.comment-input { flex: 1; height: 100%; font-size: 14px; background: transparent; }
.send-text-btn { color: #ff2442; font-size: 14px; font-weight: bold; padding: 0 5px; white-space: nowrap;}

.action-icons { display: flex; align-items: center;}
.icon-box { display: flex; align-items: center; margin-left: 10px;}
.icon { font-size: 24px; color: #333; margin-right: 4px; margin-top: -3px;}
.icon.liked { color: #ff2442;}
.count { font-size: 13px; color: #333; font-weight: 500;}
</style>