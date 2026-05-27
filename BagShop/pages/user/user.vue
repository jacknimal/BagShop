<template>
  <view class="user-container">
    <view class="user-header">
      <view class="user-info" @click="handleLogin">
        <image class="avatar" :src="userInfo.avatar || '/static/logo.png'" mode="aspectFill"></image>
        <view class="info-text">
          <text class="nickname">{{ isLogin ? userInfo.username : '点击登录/注册' }}</text>
          <text class="user-id" v-if="isLogin">完善信息 ></text>
          <text class="user-id" v-else>登录后享受专属定制服务</text>
        </view>
      </view>
    </view>

    <view class="order-section card-box">
      <view class="card-header" @click="goToOrder('all')">
        <text class="card-title">我的订单</text>
        <text class="card-more">查看全部 ></text>
      </view>
      <view class="order-grid">
        <view class="grid-item" @click="goToOrder('pending')">
          <text class="icon">💳</text>
          <text class="text">待付款</text>
        </view>
        <view class="grid-item" @click="goToOrder('paid')">
          <text class="icon">📦</text>
          <text class="text">待发货</text>
        </view>
        <view class="grid-item" @click="goToOrder('shipped')">
          <text class="icon">🚚</text>
          <text class="text">待收货</text>
        </view>
        <view class="grid-item" @click="goToOrder('completed')">
          <text class="icon">✨</text>
          <text class="text">已完成</text>
        </view>
      </view>
    </view>

    <view class="service-section card-box">
      <text class="card-title" style="padding: 15px; display: block; border-bottom: 1px solid #f9f9f9;">我的服务</text>
      <view class="service-list">
        <view class="service-row" @click="goToDrafts">
          <view class="row-left">
            <text class="icon">📝</text>
            <text class="text">我的 DIY 草稿箱</text>
          </view>
          <text class="arrow">></text>
        </view>
        <view class="service-row" @click="goToMyNotes">
          <view class="row-left">
            <text class="icon">📔</text>
            <text class="text">我的笔记</text>
          </view>
          <text class="arrow">></text>
        </view>
        <view class="service-row" @click="goToAddress">
          <view class="row-left">
            <text class="icon">📍</text>
            <text class="text">收货地址</text>
          </view>
          <text class="arrow">></text>
        </view>

        <view class="service-row" @click="goToAfterSalesList">
          <view class="row-left">
            <text class="icon">🛡️</text>
            <text class="text">售后服务</text>
          </view>
          <text class="arrow">></text>
        </view>

        <view class="service-row" @click="goToCSChat">
          <view class="row-left">
            <text class="icon">🎧</text>
            <text class="text">联系官方客服</text>
          </view>
          <text class="arrow">></text>
        </view>

        <view class="service-row" @click="goToSettings">
          <view class="row-left">
            <text class="icon">⚙️</text>
            <text class="text">设置</text>
          </view>
          <text class="arrow">></text>
        </view>
      </view>
    </view>

    <view class="logout-box" v-if="isLogin">
      <button class="logout-btn" @click="logout">退出登录</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLogin: false,
      userInfo: {
        username: '',
        avatar: ''
      }
    }
  },
  onShow() {
    this.checkLoginState();
  },
 methods: {
   checkLoginState() {
     const token = uni.getStorageSync('token');
     // 🌟 核心修改：优先从缓存中获取修改后的昵称和头像
     const username = uni.getStorageSync('username');
     const nickname = uni.getStorageSync('nickname');
     const avatar = uni.getStorageSync('avatar');
 
     if (token) {
       this.isLogin = true;
       // 显示昵称，没昵称显示用户名
       this.userInfo.username = nickname || username || '定制玩家';
       this.userInfo.avatar = avatar || '/static/logo.png';
     } else {
       this.isLogin = false;
       this.userInfo.username = '';
     }
   },
   // 🌟 修改跳转逻辑：点击头像或“完善信息”都进入资料编辑页
   handleLogin() {
     if (!this.isLogin) {
       uni.navigateTo({ url: '/pages/login/login' });
     } else {
       // 已登录状态下，点击进入资料修改页
       uni.navigateTo({ url: '/pages/profile/profile' });
     }
   },
    goToOrder(status) {
      if (!this.isLogin) return this.handleLogin();
      uni.navigateTo({ url: `/pages/orders/orders?status=${status}` });
    },
    goToAfterSalesList() {
      if (!this.isLogin) return this.handleLogin();
      uni.navigateTo({ url: '/pages/after_sales_list/after_sales_list' });
    },
    goToDrafts() {
      if (!this.isLogin) return this.handleLogin();
      uni.navigateTo({ url: '/pages/drafts/drafts' });
    },
    goToMyNotes() {
      if (!this.isLogin) return this.handleLogin();
      uni.navigateTo({ url: '/pages/community/my_notes' });
    },
    goToAddress() {
      if (!this.isLogin) return this.handleLogin();
      uni.navigateTo({ url: '/pages/address/list' });
    },
    
    // 🌟 修改点 2：新增客服聊天室跳转逻辑（需要登录）
    goToCSChat() {
      if (!this.isLogin) return this.handleLogin();
      uni.navigateTo({ url: '/pages/message/chat?type=cs' });
    },
    
    goToSettings() {
      uni.navigateTo({ url: '/pages/settings/settings' });
    },
    logout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token');
            uni.removeStorageSync('username');
            this.checkLoginState();
            uni.showToast({ title: '已安全退出', icon: 'success' });
          }
        }
      });
    }
  }
}
</script>

<style>
/* 整体背景 */
.user-container { background-color: #f5f7fa; min-height: 100vh; padding-bottom: 30px; }

/* 头部信息区 */
.user-header { background: linear-gradient(135deg, #2c3e50, #000000); padding: 60px 20px 40px; border-radius: 0 0 20px 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.user-info { display: flex; align-items: center; }
.avatar { width: 66px; height: 66px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.2); margin-right: 15px; background-color: #fff;}
.info-text { display: flex; flex-direction: column; justify-content: center; }
.nickname { color: #fff; font-size: 20px; font-weight: bold; margin-bottom: 5px; }
.user-id { color: rgba(255,255,255,0.7); font-size: 12px; background-color: rgba(255,255,255,0.1); padding: 3px 10px; border-radius: 12px; display: inline-block; }

/* 通用圆角白底卡片样式 */
.card-box { background-color: #fff; border-radius: 12px; margin: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.03); overflow: hidden; }

/* 订单区 */
.order-section { margin-top: -20px; position: relative; z-index: 10; }
.card-header { display: flex; justify-content: space-between; align-items: center; padding: 15px; border-bottom: 1px solid #f9f9f9; }
.card-title { font-size: 15px; font-weight: bold; color: #333; }
.card-more { font-size: 12px; color: #999; }
.order-grid { display: flex; justify-content: space-around; padding: 15px 0; }
.grid-item { display: flex; flex-direction: column; align-items: center; }
.grid-item .icon { font-size: 24px; margin-bottom: 6px; }
.grid-item .text { font-size: 12px; color: #666; }

/* 服务区 */
.service-list { padding: 0 15px; }
.service-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f9f9f9; background: transparent; text-align: left; line-height: normal; }
.service-row::after { border: none; } 
.service-row:last-child { border-bottom: none; }
.row-left { display: flex; align-items: center; }
.row-left .icon { font-size: 20px; margin-right: 10px; }
.row-left .text { font-size: 14px; color: #333; }
.arrow { color: #ccc; font-size: 14px; }

/* 退出登录按钮 */
.logout-box { padding: 0 15px; margin-top: 30px; }
.logout-btn { background-color: #fff; color: #ff5000; border-radius: 22px; font-size: 15px; font-weight: bold; height: 44px; line-height: 44px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.logout-btn::after { border: none; }
</style>