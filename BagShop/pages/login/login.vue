<template>
  <view class="page-wrapper">
    <view class="header-bg" :class="{ 'register-bg': !isLogin }">
      <view class="glass-mask"></view>
      <text class="bg-title-text">{{ isLogin ? 'BAG' : 'JOIN' }}</text>
    </view>
    
    <view class="content-card">
      <view class="welcome-section">
        <text class="main-title">{{ isLogin ? '欢迎回来' : '创建新账号' }}</text>
        <text class="sub-title">{{ isLogin ? '高级箱包定制，懂你所需' : '即刻加入，探索无限创意' }}</text>
      </view>

      <view v-if="!isLogin" class="avatar-upload-section" @click="chooseAvatar">
        <view class="avatar-wrapper">
          <image class="current-avatar" :src="avatarUrl" mode="aspectFill"></image>
          <view class="upload-icon-mask">
            <uni-icons type="camera-filled" size="24" color="#fff"></uni-icons>
          </view>
        </view>
        <text class="upload-tip">点击设置头像</text>
      </view>

      <view class="form-area">
        <view class="input-group">
          <uni-icons type="person" size="20" color="#999" class="prefix-icon"></uni-icons>
          <input class="input-item" type="text" v-model="username" placeholder="请输入注册账号" placeholder-style="color:#ccc"/>
        </view>
        <view class="input-group">
          <uni-icons type="locked" size="20" color="#999" class="prefix-icon"></uni-icons>
          <input class="input-item" type="password" v-model="password" placeholder="请输入密码 (6-16位)" placeholder-style="color:#ccc"/>
        </view>
        
        <view v-if="!isLogin" class="register-extend-fields animation-slide-bottom">
          <view class="input-group">
            <uni-icons type="star" size="20" color="#999" class="prefix-icon"></uni-icons>
            <input class="input-item" type="text" v-model="nickname" placeholder="想一个好听的昵称"/>
          </view>
          <view class="input-group">
            <uni-icons type="phone" size="20" color="#999" class="prefix-icon"></uni-icons>
            <input class="input-item" type="number" v-model="phone" placeholder="请输入手机号"/>
          </view>
          <view class="input-group">
            <uni-icons type="email" size="20" color="#999" class="prefix-icon"></uni-icons>
            <input class="input-item" type="text" v-model="email" placeholder="请输入电子邮箱"/>
          </view>
          
          <view class="gender-selector">
            <text class="label">选择性别</text>
            <view class="gender-options">
              <view 
                class="gender-item" 
                :class="{ active: gender === 'male' }" 
                @click="gender = 'male'"
              >
                <uni-icons type="staff" size="18" :color="gender === 'male' ? '#fff' : '#666'"></uni-icons>
                <text>男</text>
              </view>
              <view 
                class="gender-item" 
                :class="{ active: gender === 'female' }" 
                @click="gender = 'female'"
              >
                <uni-icons type="woman" size="18" :color="gender === 'female' ? '#fff' : '#666'"></uni-icons>
                <text>女</text>
              </view>
              <view 
                class="gender-item" 
                :class="{ active: gender === 'unknown' }" 
                @click="gender = 'unknown'"
              >
                <text>保密</text>
              </view>
            </view>
          </view>
        </view>
        
        <button class="submit-btn" @click="handleSubmit" hover-class="btn-hover">
          {{ isLogin ? '立即登录' : '确 定 注 册' }}
          <uni-icons type="arrow-right" size="20" color="#fff" class="suffix-icon"></uni-icons>
        </button>
      </view>
      
      <view class="footer-links">
        <text v-if="isLogin" class="link-text">忘记密码?</text>
        <text class="switch-text" @click="toggleState">
          {{ isLogin ? '新用户注册' : '已有账号登录' }}
        </text>
      </view>
    </view>
    
    <view style="height: 60rpx;"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLogin: true,
      username: '',
      password: '',
      nickname: '',
      email: '',
      phone: '',
      gender: 'unknown',
      // 请确保你的项目 static 目录下有此占位图，或者换成 logo.png
      avatarUrl: '/static/logo.png' 
    }
  },
  methods: {
    toggleState() {
      this.isLogin = !this.isLogin;
      this.password = '';
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.avatarUrl = res.tempFilePaths[0];
        }
      });
    },
    handleSubmit() {
      if (!this.username || !this.password) {
        uni.showToast({ title: '账号密码不能为空', icon: 'none' });
        return;
      }
      
      if (!this.isLogin && (!this.nickname || !this.email || !this.phone)) {
        uni.showToast({ title: '请完善您的资料', icon: 'none' });
        return;
      }

      const url = this.isLogin ? 'http://127.0.0.1:8000/api/login/' : 'http://127.0.0.1:8000/api/register/';
      
      uni.request({
        url: url,
        method: 'POST',
        data: {
          username: this.username,
          password: this.password,
          nickname: this.nickname,
          email: this.email,
          phone: this.phone,
          gender: this.gender,
          avatar: this.avatarUrl 
        },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: res.data.msg, icon: 'success' });
            if (this.isLogin) {
              uni.setStorageSync('token', res.data.token);
              uni.setStorageSync('username', res.data.username);
              uni.setStorageSync('nickname', res.data.nickname);
              uni.setStorageSync('avatar', res.data.avatar);
              setTimeout(() => { uni.switchTab({ url: '/pages/index/index' }); }, 1500);
            } else {
              setTimeout(() => { this.toggleState(); }, 1500);
            }
          } else {
            uni.showToast({ title: res.data.msg, icon: 'none' });
          }
        }
      });
    }
  }
}
</script>

<style lang="scss">
.page-wrapper {
  min-height: 100vh;
  background-color: #f5f7fa;
  position: relative;
  /* 🌟 核心修复：移除 overflow:hidden，允许页面内容自然溢出并滚动 */
  overflow-y: auto; 
}

.header-bg {
  height: 40vh;
  background: linear-gradient(135deg, #3a7afe 0%, #a25df9 100%);
  position: relative;
  transition: all 0.5s ease;
  &.register-bg {
    background: linear-gradient(135deg, #ff6b6b 0%, #ffc048 100%);
  }
  
  .glass-mask {
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.1);
  }
  
  .bg-title-text {
    position: absolute; bottom: -50rpx; left: -50rpx;
    font-size: 200rpx; font-weight: bold; color: rgba(255,255,255,0.1);
  }
}

.content-card {
  /* 🌟 核心修复：从 absolute 改为 relative */
  position: relative; 
  /* 🌟 核心修复：利用负 margin 向上移动，实现盖在背景图上的效果 */
  margin-top: -15vh; 
  margin-left: 40rpx; 
  margin-right: 40rpx;
  
  background: #ffffff;
  border-radius: 40rpx;
  padding: 60rpx;
  box-shadow: 0 15rpx 50rpx rgba(0,0,0,0.1);
  z-index: 10;
  /* 确保卡片底部与页面边缘有间距 */
  margin-bottom: 40rpx; 
}

.welcome-section {
  margin-bottom: 60rpx;
  text-align: center;
  .main-title { font-size: 48rpx; font-weight: bold; color: #333; display: block; margin-bottom: 10rpx;}
  .sub-title { font-size: 26rpx; color: #999; }
}

.avatar-upload-section {
  display: flex; flex-direction: column; align-items: center; margin-bottom: 50rpx;
  .avatar-wrapper {
    width: 150rpx; height: 150rpx; border-radius: 75rpx; 
    border: 6rpx solid #f0f3f8; position: relative;
    .current-avatar { width: 100%; height: 100%; border-radius: 75rpx; }
    .upload-icon-mask {
      position: absolute; bottom: 0; right: 0; 
      background: rgba(58, 122, 254, 0.9); width: 50rpx; height: 50rpx;
      border-radius: 25rpx; display: flex; align-items: center; justify-content: center;
    }
  }
  .upload-tip { font-size: 22rpx; color: #3a7afe; margin-top: 15rpx; }
}

.input-group {
  display: flex; align-items: center;
  background: #f0f3f8;
  height: 100rpx; border-radius: 50rpx;
  margin-bottom: 30rpx; padding: 0 40rpx;
  transition: all 0.3s;
  
  &:focus-within {
    background: #fff;
    border: 1px solid rgba(58, 122, 254, 0.3);
    box-shadow: 0 4rpx 15rpx rgba(58, 122, 254, 0.1);
  }

  .prefix-icon { margin-right: 20rpx; }
  .input-item { flex: 1; font-size: 28rpx; color: #333; }
}

.gender-selector {
  margin: 40rpx 0 50rpx;
  .label { font-size: 26rpx; color: #666; margin-left: 20rpx; margin-bottom: 15rpx; display: block; }
  .gender-options { display: flex; gap: 20rpx; }
  .gender-item {
    flex: 1; height: 80rpx; border-radius: 40rpx;
    background: #f0f3f8; display: flex; align-items: center; justify-content: center;
    gap: 10rpx; color: #666; font-size: 26rpx; transition: all 0.3s;
    
    &.active {
      background: linear-gradient(135deg, #3a7afe 0%, #a25df9 100%);
      color: #fff; box-shadow: 0 4rpx 15rpx rgba(58, 122, 254, 0.3);
    }
  }
}

.submit-btn {
  height: 110rpx; border-radius: 55rpx;
  background: linear-gradient(135deg, #3a7afe 0%, #a25df9 100%);
  color: #fff; font-size: 32rpx; font-weight: bold;
  display: flex; align-items: center; justify-content: center; gap: 15rpx;
  box-shadow: 0 10rpx 30rpx rgba(58, 122, 254, 0.3);
  margin-top: 50rpx; border: none;
}
.btn-hover { opacity: 0.9; transform: scale(0.98); }

.footer-links {
  margin-top: 40rpx; display: flex; justify-content: space-between; padding: 0 20rpx;
  font-size: 24rpx;
  .link-text { color: #999; }
  .switch-text { color: #3a7afe; font-weight: bold; }
}

.animation-slide-bottom {
  animation: slideBottom 0.5s ease-out;
}
@keyframes slideBottom {
  from { opacity: 0; transform: translateY(20rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>