<template>
  <view class="article-container">
    <view class="article-header">
      <text class="article-title">{{ detail.title }}</text>
      <text class="article-time">官方发布</text>
    </view>

    <view class="article-content" v-if="detail.content">
      <text class="content-text">{{ detail.content }}</text>
    </view>

    <view class="images-box" v-if="detail.image_urls && detail.image_urls.length > 0">
      <image 
        v-for="(img, index) in detail.image_urls" 
        :key="index"
        class="article-cover" 
        :src="img" 
        mode="widthFix">
      </image>
    </view>

    <view class="bottom-action" v-if="detail.target_url">
      <button class="action-btn" @click="jumpToTarget">👉 点击这里查看详情</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      detail: {}
    }
  },
  onLoad() {
    const data = uni.getStorageSync('currentHeadline');
    if (data) {
      this.detail = data;
    }
  },
  methods: {
    jumpToTarget() {
      if (this.detail.target_url) {
        uni.navigateTo({
          url: this.detail.target_url,
          fail: () => {
            uni.switchTab({ url: this.detail.target_url });
          }
        });
      }
    }
  }
}
</script>

<style>
.article-container {
  background-color: #fff;
  min-height: 100vh;
  padding-bottom: 90px; 
}

.article-header {
  padding: 20px 15px 15px;
}
.article-title {
  font-size: 22px;
  font-weight: bold;
  color: #333;
  line-height: 1.4;
  display: block;
  margin-bottom: 10px;
}
.article-time {
  font-size: 13px;
  color: #999;
}

.article-content {
  padding: 0 15px 15px;
}
.content-text {
  font-size: 15px;
  color: #444;
  line-height: 1.8;
  letter-spacing: 0.5px;
  /* 允许保留后台输入的换行符 */
  white-space: pre-wrap; 
}

/* 多图容器 */
.images-box {
  display: flex;
  flex-direction: column;
  width: 100%;
}
.article-cover {
  width: 100%;
  display: block;
  margin: 0; /* 消除多图之间的默认间隙，实现无缝拼接 */
}

/* 高颜值底部悬浮按钮 */
.bottom-action {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10px 15px 25px; 
  background: #fff;
  box-shadow: 0 -4px 15px rgba(0,0,0,0.05);
  box-sizing: border-box;
}
.action-btn {
  background: linear-gradient(90deg, #ff7700, #ff4900);
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  height: 48px;
  line-height: 48px;
  border-radius: 24px;
  box-shadow: 0 4px 10px rgba(255, 80, 0, 0.3);
  animation: pulse 2s infinite; 
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
</style>