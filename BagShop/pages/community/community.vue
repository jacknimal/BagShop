<template>
  <view class="community-container">
    <view class="nav-header">
      <view class="nav-item" :class="{active: currentTab === 'follow'}" @click="switchTab('follow')">关注</view>
      <view class="nav-item" :class="{active: currentTab === 'explore'}" @click="switchTab('explore')">发现</view>
      <view class="nav-item" :class="{active: currentTab === 'latest'}" @click="switchTab('latest')">最新</view>
    </view>

    <scroll-view scroll-y class="waterfall-scroll" v-if="postList.length > 0">
      <view class="waterfall-box">
        <view class="post-card" v-for="(item, index) in postList" :key="index" @click="goToPostDetail(item.id)">
          <image class="post-img" :src="item.image_url || '/static/logo.png'" mode="widthFix"></image>
          <view class="post-info">
            <text class="post-title">{{ item.title || '分享我的最新定制款~' }}</text>
            <view class="post-bottom">
              <view class="user-box">
                <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
                <text class="username">{{ item.user.username || '定制达人' }}</text>
              </view>
              <view class="like-box" @click.stop="toggleLike(item)">
                <text class="like-icon" :class="{liked: item.is_liked}">{{ item.is_liked ? '♥' : '♡' }}</text>
                <text class="like-count">{{ item.likes_count }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="empty-state" v-else>
      <text v-if="currentTab === 'follow'">你还没有关注任何人，或者关注的大神还没发过笔记哦~</text>
      <text v-else>这里还是一片荒芜，点击右下角发布第一篇笔记吧！</text>
    </view>

    <view class="publish-fab" @click="goToPublish">
      <text class="plus-icon">+</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 'explore',
      postList: []
    }
  },
  onShow() {
    this.getPosts();
  },
  methods: {
    switchTab(tab) {
      if (this.currentTab === tab) return; 
      this.currentTab = tab;
      this.getPosts(); // 切换时重新拉取数据
    },

    getPosts() {
      const token = uni.getStorageSync('token');
      
      // 未登录时点击关注页，给提示
      if (this.currentTab === 'follow' && !token) {
        uni.showToast({ title: '请先登录后查看关注', icon: 'none' });
        this.postList = [];
        return;
      }

      uni.request({
        // 🌟 核心修改：把当前的 tab 传给后端
        url: `http://127.0.0.1:8000/api/community/posts/?tab=${this.currentTab}`,
        method: 'GET',
        header: token ? { 'Authorization': 'Token ' + token } : {},
        success: (res) => {
          if (res.data.code === 200 && res.data.data && res.data.data.length > 0) {
            this.postList = res.data.data;
          } else {
            // 如果后端返回空数组，直接清空列表，触发空状态页面
            this.postList = [];
          }
        }
      });
    },

    toggleLike(item) {
      const token = uni.getStorageSync('token');
      if (!token) return uni.showToast({ title: '请先登录', icon: 'none' });

      uni.request({
        url: 'http://127.0.0.1:8000/api/community/post/like/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { post_id: item.id },
        success: (res) => {
          if (res.data.code === 200) {
            item.is_liked = res.data.is_liked;
            item.likes_count = res.data.likes_count;
          }
        }
      });
    },

    goToPostDetail(id) {
      uni.navigateTo({ url: `/pages/community/post_detail?id=${id}` });
    },

    goToPublish() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录哦~', icon: 'none' });
        setTimeout(() => { uni.navigateTo({ url: '/pages/login/login' }); }, 1000);
        return;
      }
      uni.navigateTo({ url: '/pages/community/publish' });
    }
  }
}
</script>

<style>
/* 样式保持原样 */
.community-container { background-color: #f5f7fa; min-height: 100vh; display: flex; flex-direction: column; }

.nav-header { display: flex; justify-content: center; align-items: center; background: #fff; height: 44px; position: sticky; top: 0; z-index: 10; }
.nav-item { font-size: 15px; color: #666; margin: 0 15px; position: relative; padding-bottom: 5px; transition: all 0.3s;}
.nav-item.active { font-size: 17px; font-weight: bold; color: #333; }
.nav-item.active::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 20px; height: 3px; background: #ff5000; border-radius: 2px; }

.waterfall-scroll { flex: 1; padding: 10px; }
.waterfall-box { column-count: 2; column-gap: 10px; }

.post-card { break-inside: avoid; background: #fff; border-radius: 8px; margin-bottom: 10px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.03); }
.post-img { width: 100%; display: block; background: #eee; min-height: 120px;}
.post-info { padding: 10px; }
.post-title { font-size: 13px; font-weight: bold; color: #333; line-height: 1.4; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; margin-bottom: 8px;}
.post-bottom { display: flex; justify-content: space-between; align-items: center; }
.user-box { display: flex; align-items: center; flex: 1; overflow: hidden;}
.avatar { width: 18px; height: 18px; border-radius: 50%; margin-right: 5px; background: #ccc; }
.username { font-size: 11px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 60px;}
.like-box { display: flex; align-items: center; }
.like-icon { font-size: 16px; color: #999; margin-right: 3px; }
.like-icon.liked { color: #ff5000; }
.like-count { font-size: 11px; color: #999; }

.empty-state { flex: 1; display: flex; justify-content: center; align-items: center; padding: 0 20px; text-align: center; color: #999; font-size: 14px; }

.publish-fab { position: fixed; right: 20px; bottom: 80px; width: 50px; height: 50px; border-radius: 50%; background: linear-gradient(135deg, #ff7700, #ff4900); display: flex; justify-content: center; align-items: center; box-shadow: 0 4px 12px rgba(255,80,0,0.4); z-index: 99; }
.plus-icon { color: #fff; font-size: 30px; font-weight: 300; margin-top: -4px;}
</style>