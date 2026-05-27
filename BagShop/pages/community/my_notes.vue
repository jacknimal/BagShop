<template>
  <view class="my-notes-container">
    <view class="waterfall-box" v-if="postList.length > 0">
      <view class="post-card" v-for="item in postList" :key="item.id" @click="goToPostDetail(item.id)">
        <image class="post-img" :src="item.image_url" mode="widthFix"></image>

        <view class="post-info">
          <text class="post-title">{{ item.title }}</text>
          
          <view class="post-action-bar">
            <view class="like-box">
              <text class="like-count">♥ {{ item.likes_count }}</text>
            </view>
            
            <view class="premium-red-trash-btn" @click.stop="confirmDelete(item.id)">
              <text class="trash-icon-red">🗑️</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else>
      <text>你还没有发布过笔记，快去社区分享吧~</text>
    </view>
  </view>
</template>

<script>
// 逻辑部分无需改变
export default {
  data() {
    return { postList: [] }
  },
  onShow() {
    this.fetchMyNotes();
  },
  methods: {
    fetchMyNotes() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      uni.request({
        url: 'http://127.0.0.1:8000/api/community/my_posts/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) this.postList = res.data.data;
        }
      });
    },
    goToPostDetail(id) {
      uni.navigateTo({ url: `/pages/community/post_detail?id=${id}` });
    },
    confirmDelete(id) {
      uni.showModal({
        title: '删除笔记',
        content: '确定要删除这篇笔记吗？删除后将无法找回哦。',
        confirmColor: '#ff2442',
        confirmText: '确认删除',
        cancelText: '我再想想',
        success: (res) => {
          if (res.confirm) {
            this.executeDelete(id);
          }
        }
      });
    },
    executeDelete(id) {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/community/post/delete/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { post_id: id },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: '已删除', icon: 'success' });
            this.postList = this.postList.filter(item => item.id !== id);
          } else {
            uni.showToast({ title: res.data.msg || '删除失败', icon: 'none' });
          }
        }
      });
    }
  }
}
</script>

<style>
.my-notes-container { background-color: #f5f7fa; min-height: 100vh; padding: 15px; padding-bottom: calc(15px + env(safe-area-inset-bottom));}
.waterfall-box { column-count: 2; column-gap: 12px; }

.post-card { break-inside: avoid; background: #fff; border-radius: 12px; margin-bottom: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: transform 0.2s, box-shadow 0.2s; }
.post-card:active { transform: translateY(1px); box-shadow: 0 2px 6px rgba(0,0,0,0.02); }

.post-img { width: 100%; display: block; background: #eee; min-height: 100px;}

.post-info { padding: 12px; }
.post-title { font-size: 13px; font-weight: bold; color: #333; line-height: 1.5; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-bottom: 12px;}

/* 🌟 最高标准 UI：重新设计的底部操作栏 (Flex 布局) */
.post-action-bar { display: flex; justify-content: space-between; align-items: center; height: 32px; }

.like-box { flex: 1; overflow: hidden; }
.like-count { font-size: 11px; color: #999; font-weight: bold;}

/* 🌟 全新设计的全红色下置悬浮删除按钮 */
.premium-red-trash-btn { width: 30px; height: 30px; background-color: #ff2442; border-radius: 50%; display: flex; justify-content: center; align-items: center; z-index: 10; box-shadow: 0 2px 8px rgba(255, 36, 66, 0.3); transition: all 0.2s; margin-left: 10px; flex-shrink: 0;}

/* 点击时的缩放和颜色加深反馈 */
.premium-red-trash-btn:active { transform: scale(0.9); background-color: #e01f38; box-shadow: 0 1px 4px rgba(255, 36, 66, 0.2);}

.trash-icon-red { font-size: 15px; color: #ffffff; line-height: 1; margin-top: -1px;}

.empty-state { text-align: center; padding-top: 120px; color: #999; font-size: 14px; letter-spacing: 1px;}
</style>