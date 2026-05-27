<template>
  <view class="profile-container">
    <view class="avatar-section" @click="changeAvatar">
      <image class="big-avatar" :src="form.avatar || '/static/logo.png'" mode="aspectFill"></image>
      <view class="edit-badge">
        <uni-icons type="camera-filled" size="18" color="#fff"></uni-icons>
      </view>
      <text class="tip">点击更换头像</text>
    </view>

    <view class="form-card">
      <view class="form-item">
        <text class="label">登录账号</text>
        <input class="input disabled" v-model="form.username" disabled />
      </view>
      
      <view class="form-item">
        <text class="label">我的昵称</text>
        <input class="input" v-model="form.nickname" placeholder="设置一个好听的名字" />
      </view>

      <view class="form-item">
        <text class="label">电子邮箱</text>
        <input class="input" v-model="form.email" placeholder="绑定邮箱找回密码" />
      </view>

      <view class="form-item">
        <text class="label">手机号码</text>
        <input class="input" type="number" v-model="form.phone" placeholder="请输入手机号" />
      </view>

      <view class="form-item no-border">
        <text class="label">我的性别</text>
        <picker @change="onGenderChange" :value="genderIndex" :range="genderRange">
          <view class="picker-val">
            {{ genderRange[genderIndex] }}
            <uni-icons type="right" size="14" color="#ccc"></uni-icons>
          </view>
        </picker>
      </view>
    </view>

    <view class="btn-box">
      <button class="save-btn" @click="handleSave">保存资料</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      genderRange: ['保密', '男', '女'],
      genderMap: ['unknown', 'male', 'female'],
      genderIndex: 0,
      form: {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        gender: 'unknown',
        avatar: ''
      }
    }
  },
  onLoad() {
    this.loadProfile();
  },
  methods: {
    async loadProfile() {
      uni.request({
        url: 'http://127.0.0.1:8000/api/user/profile/',
        header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
        success: (res) => {
          if (res.data.code === 200) {
            this.form = res.data.data;
            this.genderIndex = this.genderMap.indexOf(this.form.gender);
          }
        }
      });
    },
    onGenderChange(e) {
      this.genderIndex = e.detail.value;
      this.form.gender = this.genderMap[this.genderIndex];
    },
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'], // 使用压缩图，上传更快
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          
          // 🌟 核心修复：立即上传到服务器
          uni.showLoading({ title: '上传中...' });
          
          uni.uploadFile({
            url: 'http://127.0.0.1:8000/api/upload/', // 你的后端上传接口
            filePath: tempFilePath,
            name: 'file', // 必须和后端 request.FILES.get('file') 对应
            success: (uploadRes) => {
              uni.hideLoading();
              const data = JSON.parse(uploadRes.data);
              if (data.code === 200) {
                // 🌟 将头像路径替换为服务器返回的永久 URL
                this.form.avatar = data.url; 
                uni.showToast({ title: '上传成功', icon: 'success' });
              } else {
                uni.showToast({ title: '上传失败', icon: 'none' });
              }
            },
            fail: () => {
              uni.hideLoading();
              uni.showToast({ title: '网络错误', icon: 'none' });
            }
          });
        }
      });
    },
    handleSave() {
      uni.showLoading({ title: '保存中...' });
      uni.request({
        url: 'http://127.0.0.1:8000/api/user/profile/update/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
        data: this.form, // 这里的 this.form.avatar 现在是永久 URL 了
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            uni.showToast({ title: '资料已同步' });
            // 🌟 更新本地缓存，确保“我的”页面不刷新也能看到新头像
            uni.setStorageSync('nickname', this.form.nickname);
            uni.setStorageSync('avatar', this.form.avatar);
            
            setTimeout(() => { uni.navigateBack(); }, 1000);
          }
        }
      });
    }
  }
}
</script>

<style lang="scss">
.profile-container { min-height: 100vh; background: #f8f9fb; padding: 30rpx; }
.avatar-section { 
  display: flex; flex-direction: column; align-items: center; margin: 40rpx 0 60rpx; position: relative;
  .big-avatar { width: 160rpx; height: 160rpx; border-radius: 80rpx; border: 4rpx solid #fff; box-shadow: 0 4rpx 20rpx rgba(0,0,0,0.1); }
  .edit-badge { position: absolute; bottom: 40rpx; right: 280rpx; background: #3a7afe; width: 44rpx; height: 44rpx; border-radius: 22rpx; display: flex; align-items: center; justify-content: center; border: 4rpx solid #fff;}
  .tip { font-size: 24rpx; color: #999; margin-top: 20rpx; }
}
.form-card { background: #fff; border-radius: 24rpx; padding: 0 30rpx; }
.form-item { 
  display: flex; justify-content: space-between; align-items: center; height: 110rpx; border-bottom: 1rpx solid #f5f5f5;
  .label { font-size: 28rpx; color: #333; width: 160rpx; }
  .input { flex: 1; text-align: right; font-size: 28rpx; color: #333; }
  .disabled { color: #ccc; }
  .picker-val { font-size: 28rpx; color: #333; }
  &.no-border { border-bottom: none; }
}
.btn-box { margin-top: 80rpx; }
.save-btn { background: linear-gradient(135deg, #3a7afe 0%, #a25df9 100%); color: #fff; border-radius: 50rpx; height: 90rpx; line-height: 90rpx; font-size: 30rpx; border: none;}
</style>