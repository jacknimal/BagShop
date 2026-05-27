<template>
  <view class="diy-container">
    <view class="studio-header">
      <view class="header-content">
        <text class="en-title">CREATION STUDIO</text>
        <text class="cn-title">箱包定制工坊</text>
        <view class="action-group">
          <view class="draft-count" @click="goToDrafts">
            <text class="icon">🎨</text>
            <text>草稿箱</text>
          </view>
          <view class="draft-count finished-btn" @click="goToFinished">
            <text class="icon">✨</text>
            <text>我的成品库</text>
          </view>
        </view>
      </view>
    </view>

    <scroll-view class="type-scroll" scroll-x show-scrollbar="false">
      <view class="type-list">
        <view 
          class="type-item" 
          :class="{ active: currentCategoryId === null }" 
          @click="switchCategory(null)"
        >全部底包</view>
        
        <view 
          class="type-item" 
          v-for="cat in diyCategories" 
          :key="cat.id"
          :class="{ active: currentCategoryId === cat.id }"
          @click="switchCategory(cat.id)"
        >
          {{ cat.name }}
        </view>
      </view>
    </scroll-view>

    <view class="base-grid">
      <view 
        class="base-card" 
        v-for="item in filteredProducts" 
        :key="item.id" 
        @click="goToDetail(item.id, item.name, item.price, item.image_url)"
      >
        <view class="card-image-box">
          <image class="base-image" :src="item.image_url || '/static/logo.png'" mode="aspectFit"></image>
          <view class="card-tag">NEW BASE</view>
        </view>
        
        <view class="card-info">
          <view class="name-row">
            <text class="name">{{ item.name }}</text>
            <text class="custom-icon">✂️</text>
          </view>
          <text class="desc">{{ item.description || '自由定义面料与细节，拒绝撞包' }}</text>
          
          <view class="price-row">
            <view class="price">
              <text class="unit">￥</text>
              <text class="val">{{ item.price }}</text>
              <text class="suffix">起</text>
            </view>
            <view class="start-btn">开始创作</view>
          </view>
        </view>
      </view>
      
      <view v-if="filteredProducts.length === 0" class="empty-tip">
        <text>该分类下暂无可选底包~</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      baseProducts: [],    
      diyCategories: [],   
      currentCategoryId: null
    }
  },
  computed: {
      filteredProducts() {
        if (this.currentCategoryId === null) return this.baseProducts;
        
        return this.baseProducts.filter(p => {
          const productCatId = p.category !== undefined ? p.category : p.category_id;
          return productCatId == this.currentCategoryId; 
        });
      }
    },
  onLoad() {
    this.getDiyProducts();
    this.getCategories();
  },
  methods: {
    getCategories() {
      uni.request({
        url: 'http://127.0.0.1:8000/api/categories/',
        success: (res) => {
          const allCats = Array.isArray(res.data) ? res.data : (res.data.data || []);
          this.diyCategories = allCats.filter(c => !c.name.includes('挂件') && !c.name.includes('配件'));
        }
      });
    },
    getDiyProducts() {
      uni.request({
        url: 'http://127.0.0.1:8000/api/products/diy/', 
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            this.baseProducts = res.data;
          }
        }
      });
    },
    switchCategory(id) {
      this.currentCategoryId = id;
    },
    goToDetail(id, name, price, image_url) {
          const safeImageUrl = encodeURIComponent(image_url || ''); 
          uni.navigateTo({
            url: `/pages/diy_detail/diy_detail?id=${id}&name=${name}&price=${price}&image_url=${safeImageUrl}`
          });
    },
    goToDrafts() {
      uni.navigateTo({ url: '/pages/drafts/drafts' });
    },
    // 🌟 新增：跳转到我的成品库
    goToFinished() {
      uni.navigateTo({ url: '/pages/finished_products/finished_products' });
    }
  }
}
</script>

<style lang="scss">
.diy-container { min-height: 100vh; background-color: #fcfcfe; padding-bottom: 50rpx; }

.studio-header { 
  height: 380rpx; 
  background: linear-gradient(to bottom, #fff9e6, #fcfcfe); 
  padding: 80rpx 40rpx 0;
  .en-title { font-size: 64rpx; font-weight: 900; color: rgba(255,142,126,0.1); letter-spacing: 4rpx; display: block; margin-bottom: -30rpx;}
  .cn-title { font-size: 52rpx; font-weight: bold; color: #333; display: block; }
  
  /* 🌟 修改点：操作按钮组排版 */
  .action-group {
    display: flex; gap: 20rpx; margin-top: 30rpx;
  }
  .draft-count { 
    background: rgba(255,255,255,0.7); display: inline-flex; align-items: center;
    padding: 10rpx 24rpx; border-radius: 40rpx; font-size: 24rpx; color: #666;
    border: 1.5rpx solid #eee;
    .icon { margin-right: 10rpx; }
  }
  .finished-btn {
    background: #fff0ed; color: #ff8e7e; border-color: #ffd8d2; font-weight: bold;
  }
}

.type-scroll { 
  margin-top: -40rpx; 
  .type-list { display: flex; padding: 0 40rpx; }
  .type-item { 
    flex-shrink: 0; padding: 16rpx 40rpx; color: #666; font-size: 28rpx; margin-right: 20rpx;
    background: #fff; border-radius: 40rpx; transition: 0.3s;
    border: 1.5rpx solid #eee;
    &.active { 
      background: #ff8e7e; color: #fff; font-weight: bold; 
      box-shadow: 0 4rpx 12rpx rgba(255,142,126,0.3); border-color: #ff8e7e; 
    }
  }
}

.base-grid { padding: 40rpx; display: flex; flex-direction: column; gap: 30rpx; }
.base-card { 
  background: #fff; border-radius: 32rpx; overflow: hidden; display: flex; flex-direction: column;
  box-shadow: 0 4rpx 15rpx rgba(0,0,0,0.03);
  border: 1.5rpx solid #eee;
  .card-image-box { 
    height: 420rpx; background: #fff; position: relative; display: flex; align-items: center; justify-content: center;
    .base-image { width: 85%; height: 85%; }
    .card-tag { position: absolute; top: 20rpx; left: 20rpx; background: #ff8e7e; color: #fff; font-size: 20rpx; padding: 6rpx 16rpx; border-radius: 8rpx; font-weight: bold;}
  }
  .card-info { 
    padding: 30rpx;
    .name-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
    .name { font-size: 32rpx; color: #333; font-weight: bold; }
    .desc { font-size: 24rpx; color: #999; margin-bottom: 30rpx; display: block; }
    .price-row { 
      display: flex; justify-content: space-between; align-items: center; 
      .price { color: #ff8e7e; .unit { font-size: 24rpx; } .val { font-size: 40rpx; font-weight: bold; } .suffix { font-size: 22rpx; color: #999; margin-left: 6rpx; } }
      .start-btn { 
        background: #ff8e7e; color: #fff; font-size: 26rpx; font-weight: bold; 
        padding: 14rpx 40rpx; border-radius: 40rpx; box-shadow: 0 6rpx 15rpx rgba(255,142,126,0.2);
      }
    }
  }
}

.empty-tip { text-align: center; padding: 100rpx 0; color: #ccc; font-size: 26rpx; }
</style>