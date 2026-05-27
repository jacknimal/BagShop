<template>
  <view class="settings-container">
    <view class="setting-group">
      <view class="setting-item" @click="showToast('关于我们 - 时尚定制箱包 v1.0')">
        <text class="label">关于我们</text>
        <text class="arrow">></text>
      </view>
      <view class="setting-item" @click="clearCache">
        <text class="label">清除本地缓存</text>
        <text class="value">{{ cacheSize }}</text>
      </view>
      <view class="setting-item" @click="showToast('隐私政策与服务协议')">
        <text class="label">用户协议与隐私</text>
        <text class="arrow">></text>
      </view>
    </view>
    
    <button class="logout-btn" v-if="isLogin" @click="logout">退出当前账号</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      cacheSize: '2.4MB', // 模拟缓存数据
      isLogin: false
    }
  },
  onShow() {
    this.isLogin = !!uni.getStorageSync('token');
  },
  methods: {
    showToast(msg) { uni.showToast({ title: msg, icon: 'none' }); },
    clearCache() {
      uni.showLoading({ title: '清理中...' });
      setTimeout(() => {
        uni.hideLoading();
        this.cacheSize = '0KB';
        uni.showToast({ title: '清理成功', icon: 'success' });
      }, 1000);
    },
    logout() {
      uni.showModal({
        title: '退出登录',
        content: '确定要退出当前账号吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('token');
            uni.removeStorageSync('username');
            uni.showToast({ title: '已退出', icon: 'success' });
            setTimeout(() => uni.switchTab({ url: '/pages/index/index' }), 1000);
          }
        }
      });
    }
  }
}
</script>

<style>
.settings-container { background: #f5f7fa; min-height: 100vh; padding: 15px;}
.setting-group { background: #fff; border-radius: 12px; padding: 0 15px; margin-bottom: 25px;}
.setting-item { display: flex; justify-content: space-between; align-items: center; padding: 18px 0; border-bottom: 1px solid #f9f9f9;}
.setting-item:last-child { border-bottom: none;}
.label { font-size: 15px; color: #333;}
.value { font-size: 14px; color: #999;}
.arrow { color: #ccc; font-size: 16px;}
.logout-btn { background: #fff; color: #ff0000; border-radius: 22px; font-size: 16px; height: 46px; line-height: 46px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);}
.logout-btn::after { border: none;}
</style>