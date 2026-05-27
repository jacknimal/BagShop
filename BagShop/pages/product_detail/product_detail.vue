<template>
  <view class="page-wrapper" v-if="product">
    <view class="detail-container">
      <image class="main-img" :src="product.image_url" mode="aspectFill"></image>

      <view class="info-box">
        <view class="price-row">
          <text class="price-symbol">￥</text>
          <text class="price-num">{{ product.price }}</text>
        </view>
        
        <text class="title">
          <text class="diy-tag" v-if="product.is_diy">可定制</text>
          {{ product.name }}
        </text>
        
        <text class="desc">{{ product.description || '这件商品还没有添加描述哦~' }}</text>
      </view>

      <view class="guarantee-box" @click="showToast('服务保障说明')">
        <view class="g-list">
          <view class="g-item"><text class="g-icon">✓</text><text class="g-text">7天无理由退换</text></view>
          <view class="g-item"><text class="g-icon">✓</text><text class="g-text">退货包运费</text></view>
          <view class="g-item"><text class="g-icon">✓</text><text class="g-text">官方正品</text></view>
        </view>
        <text class="arrow">></text>
      </view>

      <view class="spec-box">
        <view class="spec-row" @click="showToast('物流信息')">
          <text class="spec-label">发货</text>
          <text class="spec-value">现货 | 快递: 免运费</text>
          <text class="arrow">></text>
        </view>
        <view class="spec-row" @click="showToast('商品参数说明')">
          <text class="spec-label">参数</text>
          <text class="spec-value">品牌、材质、尺寸、闭合方式等</text>
          <text class="arrow">></text>
        </view>
      </view>
      <view class="detail-section">
        <view class="section-title">
          <text class="line"></text>
          <text class="text">商品详情</text>
          <text class="line"></text>
        </view>
        
        <view class="detail-images" v-if="product.detail_images && product.detail_images.length > 0">
          <image 
            v-for="(img, index) in product.detail_images" 
            :key="index" 
            :src="img" 
            mode="widthFix" 
            class="detail-img"
          ></image>
        </view>
        
        <view class="empty-detail" v-else>
          <text>暂无更多详情图</text>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="icon-btn" @click="goToChat">
        <text class="icon">🎧</text>
        <text class="text">客服</text>
      </view>

      <view class="icon-btn" @click="goCart">
        <text class="icon">🛒</text>
        <text class="text">购物车</text>
      </view>
      
      <view class="btn-group">
        <button class="btn diy-btn" v-if="product.is_diy" @click="goDiy">去定制</button>
        <button class="btn buy-btn" @click="addToCart">加入购物车</button>
        <button class="btn buy-now-btn" @click="buyNow">立即购买</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      productId: '',
      product: null
    }
  },
  onLoad(options) {
    if (options.id) {
      this.productId = options.id;
      this.getProductDetail();
    }
  },
  methods: {
    getProductDetail() {
      uni.request({
        url: `http://127.0.0.1:8000/api/products/?id=${this.productId}`, 
        method: 'GET',
        success: (res) => {
          if (res.data.code === 200 || res.statusCode === 200) {
            let list = res.data.data || res.data;
            this.product = list.find(item => item.id == this.productId) || list[0];
          }
        }
      });
    },
    goCart() {
      uni.switchTab({ url: '/pages/cart/cart' });
    },
    goDiy() {
      uni.navigateTo({ url: `/pages/diy_detail/diy_detail?id=${this.productId}` });
    },
    showToast(msg) {
      uni.showToast({ title: msg, icon: 'none' });
    },
    addToCart() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 1000);
        return;
      }
      uni.request({
        url: 'http://127.0.0.1:8000/api/cart/add/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { product_id: this.productId, quantity: 1 },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: '已加入购物车', icon: 'success' });
          } else {
            uni.showToast({ title: res.data.msg, icon: 'none' });
          }
        }
      });
    },
    buyNow() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 1000);
        return;
      }
      
      uni.showLoading({ title: '准备结算...' });
      
      // 1. 第一步：先将当前商品加入购物车
      uni.request({
        url: 'http://127.0.0.1:8000/api/cart/add/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { product_id: this.productId, quantity: 1 },
        success: (res) => {
          if (res.data.code === 200) {
            
            // 2. 第二步：立刻拉取购物车列表，获取刚才加入的那个购物车项的真实 ID
            uni.request({
              url: 'http://127.0.0.1:8000/api/cart/list/',
              method: 'GET',
              header: { 'Authorization': 'Token ' + token },
              success: (listRes) => {
                uni.hideLoading();
                if (listRes.statusCode === 200 && Array.isArray(listRes.data)) {
                  
                  // 从购物车中筛选出当前商品（取最后一条，即最新加入的）
                  let cartItems = listRes.data.filter(item => item.product.id == this.productId);
                  if (cartItems.length > 0) {
                    let targetCartId = cartItems[cartItems.length - 1].id;
                    
                    // 3. 核心精髓：强制把要结算的购物车商品数组，变成【只有这一个ID】
                    uni.setStorageSync('selectedCartIds', [targetCartId]);
                    
                    // 4. 跳转到原封不动的确认订单页
                    uni.navigateTo({ url: '/pages/confirm_order/confirm_order' });
                  } else {
                     uni.showToast({ title: '拉取结算信息失败', icon: 'none' });
                  }
                }
              }
            });
            
          } else {
            uni.hideLoading();
            uni.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
          }
        }
      });
    },
    // 🌟 修改点 2：增加去聊天室的方法
    goToChat() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => uni.navigateTo({ url: '/pages/login/login' }), 1000);
        return;
      }
      uni.navigateTo({ url: '/pages/message/chat' });
    }
  }
}
</script>

<style>
/* 包装层：解决底部留白 */
.page-wrapper { background-color: #f5f7fa; min-height: 100vh; padding-bottom: 100px; }

.detail-container { background-color: #f5f7fa; }

/* 主图 */
.main-img { width: 100%; height: 375px; background-color: #fff; display: block; }

/* 基础信息区 */
.info-box { background-color: #fff; padding: 15px; margin-bottom: 10px; }
.price-row { color: #ff5000; margin-bottom: 8px; align-items: baseline; display: flex;}
.price-symbol { font-size: 14px; font-weight: bold; }
.price-num { font-size: 24px; font-weight: bold; margin-left: 2px; }
.title { font-size: 16px; font-weight: bold; color: #333; line-height: 1.4; display: block; margin-bottom: 8px;}
.diy-tag { font-size: 10px; color: #fff; background: linear-gradient(90deg, #ff5000, #ff9000); padding: 2px 6px; border-radius: 4px; margin-right: 6px; vertical-align: 2px;}
.desc { font-size: 13px; color: #666; line-height: 1.6; display: block; }

/* 服务保障与参数模块 */
.guarantee-box { display: flex; justify-content: space-between; align-items: center; background-color: #fff; padding: 12px 15px; margin-bottom: 10px; }
.g-list { display: flex; flex: 1; align-items: center; }
.g-item { display: flex; align-items: center; margin-right: 15px; }
.g-icon { color: #ff5000; font-size: 12px; margin-right: 4px; font-weight: bold;}
.g-text { font-size: 12px; color: #666; }

.spec-box { background-color: #fff; padding: 0 15px; margin-bottom: 10px; }
.spec-row { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
.spec-row:last-child { border-bottom: none; }
.spec-label { width: 45px; font-size: 13px; color: #999; }
.spec-value { flex: 1; font-size: 13px; color: #333; }
.arrow { color: #ccc; font-size: 16px; font-weight: 300;}

/* 详情区 */
.detail-section { background-color: #fff; padding: 0 0 15px; }
.section-title { display: flex; justify-content: center; align-items: center; padding: 15px 0; }
.section-title .line { width: 30px; height: 1px; background-color: #ddd; margin: 0 10px; }
.section-title .text { font-size: 14px; color: #999; }

.detail-images { width: 100%; display: flex; flex-direction: column; }
.detail-img { width: 100%; display: block; margin: 0; padding: 0; }
.empty-detail { text-align: center; color: #ccc; font-size: 13px; padding: 20px 0;}

/* 底部操作栏：固定定位修复 */
.bottom-bar { 
  position: fixed; 
  bottom: 0; 
  left: 0; 
  width: 100%; 
  height: 60px; 
  background-color: #fff; 
  display: flex; 
  align-items: center; 
  justify-content: space-between; 
  padding: 0 15px; 
  box-sizing: border-box; 
  box-shadow: 0 -2px 10px rgba(0,0,0,0.05); 
  z-index: 999;
}

/* 图标按钮样式 */
.icon-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 50px; background: transparent;}
.icon-btn .icon { font-size: 22px; margin-bottom: 2px;}
.icon-btn .text { font-size: 10px; color: #666;}
.clear-btn-style { padding: 0; margin: 0; line-height: normal; border: none; overflow: visible; }
.clear-btn-style::after { border: none; }

.btn-group { display: flex; flex: 1; justify-content: flex-end; }
.btn { height: 40px; line-height: 40px; border-radius: 20px; font-size: 14px; font-weight: bold; margin: 0 0 0 8px; padding: 0 12px; color: #fff; }
.diy-btn { background: linear-gradient(90deg, #ff9000, #ff5000); }
.buy-btn { background: linear-gradient(90deg, #333333, #000000); }
.buy-now-btn { background: #ff5000; }
</style>