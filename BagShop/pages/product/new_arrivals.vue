<template>
  <view class="new-arrivals-container">
    <view class="hero-header">
      <image class="hero-bg" src="/static/new/new.jpg"></image>
      <view class="hero-content">
        <text class="title-en">NEW ARRIVALS</text>
        <text class="title-cn">本季 · 新品首发</text>
        <view class="hero-line"></view>
      </view>
    </view>

    <view class="premium-list" v-if="productList.length > 0">
      <view class="premium-card" v-for="(item, index) in productList" :key="item.id" @click="goToDetail(item.id)">
        
        <view class="image-wrapper">
          <view class="premium-badge">NEW COLLECTION</view>
          
          <swiper 
            class="premium-swiper" 
            circular 
            :autoplay="!item.video_url" 
            :interval="4000" 
            indicator-dots 
            indicator-active-color="#ffffff" 
            indicator-color="rgba(255,255,255,0.4)"
          >
            <swiper-item v-if="item.video_url">
              <video 
                class="premium-video" 
                :src="item.video_url" 
                autoplay 
                loop 
                muted 
                :controls="false"
                :show-play-btn="false"
                :show-center-play-btn="false"
                object-fit="cover"
                @click.stop="goToDetail(item.id)"
              ></video>
            </swiper-item>

            <swiper-item v-for="(img, imgIdx) in item.images" :key="imgIdx">
              <image class="premium-img" :src="img" mode="aspectFill" @click.stop="goToDetail(item.id)"></image>
            </swiper-item>
          </swiper>
          
          <view class="image-gradient"></view>
        </view>
        
        <view class="premium-info">
          <view class="info-header">
            <text class="premium-name">{{ item.name }}</text>
            <view class="price-box">
              <text class="price-symbol">¥</text>
              <text class="price-num">{{ item.price }}</text>
            </view>
          </view>
          
          <text class="premium-desc">{{ item.description || '设计师从自然光影中汲取灵感，甄选优质皮革，辅以精湛工艺，为你呈现本季最瞩目的定制之作。探索更多设计细节，开启你的专属穿搭灵感...' }}</text>
          
          <view class="explore-btn">
            <text>探索详情</text>
            <text class="arrow">→</text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <view class="empty-icon">✨</view>
      <text class="empty-title">全新系列 蓄势待发</text>
      <text class="empty-desc">设计师正在进行最后的打磨，敬请期待...</text>
    </view>
    
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      productList: []
    }
  },
  onLoad() {
    this.fetchNewArrivals();
  },
  methods: {
    fetchNewArrivals() {
      uni.showLoading({ title: '加载灵感中...', mask: true });
      uni.request({
        url: 'http://127.0.0.1:8000/api/products/new/',
        method: 'GET',
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            this.productList = res.data.data;
          }
        },
        fail: () => {
          uni.hideLoading();
          uni.showToast({ title: '网络请求失败', icon: 'none' });
        }
      });
    },
    goToDetail(id) {
      uni.navigateTo({ url: `/pages/product_detail/product_detail?id=${id}` });
    }
  }
}
</script>

<style>
.new-arrivals-container { background-color: #f4f5f7; min-height: 100vh; padding-bottom: 40px; }

/* 头图区 */
.hero-header { position: relative; width: 100%; height: 280px; display: flex; justify-content: center; align-items: center; overflow: hidden;}
.hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; filter: brightness(0.6); transform: scale(1.05); transition: transform 10s ease-out;}
.hero-content { position: relative; z-index: 10; display: flex; flex-direction: column; align-items: center; }
.title-en { color: rgba(255,255,255,0.8); font-size: 13px; letter-spacing: 8px; margin-bottom: 12px; font-weight: 300; }
.title-cn { color: #ffffff; font-size: 34px; font-weight: bold; letter-spacing: 6px; font-family: 'Times New Roman', serif; text-shadow: 0 4px 15px rgba(0,0,0,0.4); }
.hero-line { width: 30px; height: 2px; background-color: #ff2442; margin-top: 20px; }

/* 杂志级单列排版 */
.premium-list { padding: 25px 20px; }
.premium-card { background: #ffffff; border-radius: 16px; overflow: hidden; margin-bottom: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1); }
.premium-card:active { transform: scale(0.98); }

/* 图片/视频容器与轮播图样式 */
.image-wrapper { position: relative; width: 100%; height: 320px; background-color: #f9f9f9; overflow: hidden;}
.premium-swiper { width: 100%; height: 100%; }
.premium-img { width: 100%; height: 100%; object-fit: cover; }

/* 🌟 新增：视频样式，撑满容器并裁切边缘 */
.premium-video { width: 100%; height: 100%; object-fit: cover; display: block; }

.image-gradient { position: absolute; bottom: 0; left: 0; width: 100%; height: 80px; background: linear-gradient(to top, rgba(0,0,0,0.05), transparent); pointer-events: none; z-index: 5;}

/* 高级感黑金角标 */
.premium-badge { position: absolute; top: 15px; left: 15px; background: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px); color: #fff; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 2px; letter-spacing: 2px; border: 1px solid rgba(255,255,255,0.2); z-index: 10;}

/* 文本信息区 */
.premium-info { padding: 25px 20px; background: #fff;}
.info-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }

.premium-name { flex: 1; font-size: 20px; font-weight: 900; color: #111; line-height: 1.4; padding-right: 15px; font-family: serif;}
.price-box { display: flex; align-items: baseline; color: #ff2442; flex-shrink: 0;}
.price-symbol { font-size: 14px; font-weight: bold; margin-right: 2px; }
.price-num { font-size: 22px; font-weight: bold; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;}

.premium-desc { display: block; font-size: 13px; color: #666; line-height: 1.8; margin-bottom: 20px; text-align: justify; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden;}

/* 探索详情按钮 */
.explore-btn { display: inline-flex; align-items: center; padding: 8px 0; border-bottom: 1px solid #111; }
.explore-btn text { font-size: 13px; color: #111; font-weight: bold; letter-spacing: 1px;}
.explore-btn .arrow { margin-left: 8px; font-size: 16px; font-weight: normal; transition: transform 0.3s;}
.premium-card:active .explore-btn .arrow { transform: translateX(4px); }

/* 空状态 */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding-top: 80px; }
.empty-icon { font-size: 40px; margin-bottom: 15px; opacity: 0.8; }
.empty-title { font-size: 18px; font-weight: bold; color: #333; margin-bottom: 8px; letter-spacing: 1px;}
.empty-desc { color: #999; font-size: 13px; letter-spacing: 1px; }

.safe-area-bottom { height: env(safe-area-inset-bottom); }
</style>