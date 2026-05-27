<template>
  <view class="hub-container">
    <view class="tab-box">
      <view 
        class="tab-btn" 
        :class="{ active: currentTab === 0 }" 
        @click="switchTab(0)">
        <text class="tab-icon">💖</text>
        <text>我的关注</text>
      </view>
      <view 
        class="tab-btn" 
        :class="{ active: currentTab === 1 }" 
        @click="switchTab(1)">
        <text class="tab-icon">✨</text>
        <text>新增粉丝</text>
      </view>
    </view>

    <scroll-view scroll-y class="list-scroll">
      <view class="user-list" v-if="displayList.length > 0">
        <view class="user-card" v-for="user in displayList" :key="user.user_id">
          <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
          
          <view class="user-info">
            <text class="username">{{ user.username }}</text>
            <text class="time">{{ currentTab === 0 ? '关注于 ' + user.time : '在 ' + user.time + ' 关注了你' }}</text>
          </view>
          
          <block v-if="currentTab === 0">
            <button class="action-btn unfollow" @click="confirmUnfollow(user)">
              {{ user.is_mutual ? '互相关注' : '已关注' }}
            </button>
          </block>
          
          <block v-else>
            <button 
              class="action-btn" 
              :class="user.is_mutual ? 'unfollow' : 'follow-back'" 
              @click="handleFanAction(user)">
              {{ user.is_mutual ? '互相关注' : '回关' }}
            </button>
          </block>
        </view>
      </view>
      
      <view class="empty-state" v-else>
        <view class="empty-icon">{{ currentTab === 0 ? '📭' : '🍃' }}</view>
        <text>{{ currentTab === 0 ? '你还没有关注任何人哦~' : '暂时没有新增粉丝记录~' }}</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTab: 0, // 0: 我的关注, 1: 新增粉丝
      followingList: [],
      fansList: []
    }
  },
  computed: {
    displayList() {
      return this.currentTab === 0 ? this.followingList : this.fansList;
    }
  },
  onLoad() {
    // 🌟 核心修复：直接通过代码强行修改顶部导航栏标题
    uni.setNavigationBarTitle({
      title: '粉丝好友'
    });
  },
  onShow() {
    this.refreshData();
  },
  methods: {
    refreshData() {
      this.getFollowing();
      this.getFans();
    },
    switchTab(index) {
      this.currentTab = index;
    },
    getFollowing() {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/user/following/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) this.followingList = res.data.data;
        }
      });
    },
    getFans() {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/user/fans/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) this.fansList = res.data.data;
        }
      });
    },

    confirmUnfollow(user) {
      uni.showModal({
        title: '取消关注',
        content: `确定要取消关注 ${user.username} 吗？`,
        confirmColor: '#ff2442',
        success: (res) => {
          if (res.confirm) {
            this.executeToggleFollow(user);
          }
        }
      });
    },

    handleFanAction(user) {
      if (user.is_mutual) {
        this.confirmUnfollow(user);
      } else {
        this.executeToggleFollow(user);
      }
    },

    executeToggleFollow(user) {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/user/follow/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { target_id: user.user_id },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: res.data.msg, icon: 'none' });
            this.refreshData(); 
          }
        }
      });
    }
  }
}
</script>

<style>
/* 🌟 全局背景改为高级浅灰蓝 */
.hub-container { background-color: #f5f7fa; min-height: 100vh; display: flex; flex-direction: column; }

/* 🌟 全新胶囊按钮 Tab 样式 */
.tab-box { display: flex; justify-content: center; padding: 20px 15px; gap: 15px; }
.tab-btn { flex: 1; display: flex; justify-content: center; align-items: center; background: #ffffff; border-radius: 25px; padding: 12px 0; font-size: 15px; color: #666; font-weight: 500; box-shadow: 0 2px 10px rgba(0,0,0,0.03); transition: all 0.3s ease; }
.tab-icon { margin-right: 6px; font-size: 16px; }

/* 激活状态：漂亮的渐变色 + 阴影放大 */
.tab-btn.active { background: linear-gradient(135deg, #ff758c, #ff7eb3); color: #ffffff; box-shadow: 0 4px 15px rgba(255, 117, 140, 0.3); transform: translateY(-2px); }

/* 列表滚动区 */
.list-scroll { flex: 1; padding: 0 15px; }

/* 🌟 卡片式列表设计 */
.user-card { background: #ffffff; border-radius: 16px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.02); transition: transform 0.2s; }
.user-card:active { transform: scale(0.98); }

.avatar { width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; background: #f0f0f0; border: 1px solid #f9f9f9; }

.user-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.username { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 6px; }
.time { font-size: 12px; color: #999; }

/* 按钮逻辑样式优化 */
.action-btn { margin: 0; padding: 0 18px; height: 32px; line-height: 32px; border-radius: 16px; font-size: 13px; font-weight: bold; transition: all 0.2s; }
.action-btn::after { border: none; }

/* 回关：醒目的红色 */
.follow-back { background: #ff2442; color: #fff; box-shadow: 0 2px 8px rgba(255, 36, 66, 0.2); }
.follow-back:active { background: #e01f38; }

/* 已关注/互相关注：低调的灰色 */
.unfollow { background: #f5f5f5; color: #999; border: 1px solid #eee; }

/* 美化空状态 */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px; }
.empty-icon { font-size: 50px; margin-bottom: 15px; opacity: 0.8; }
.empty-state text { color: #999; font-size: 14px; letter-spacing: 1px; }
</style>