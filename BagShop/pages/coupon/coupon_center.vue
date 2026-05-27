<template>
  <view class="coupon-bg">
    <view class="header-banner">
      <text class="banner-title">专属优惠券</text>
      <text class="banner-sub">先领券，再购物，更划算</text>
    </view>
    
    <view class="coupon-list">
      <view class="coupon-card" v-for="item in coupons" :key="item.id">
        <view class="c-left">
          <text class="c-symbol">￥</text><text class="c-price">{{ item.discount_amount }}</text>
        </view>
        
        <view class="c-mid">
          <text class="c-name">{{ item.name }}</text>
          <text class="c-rule">满 {{ item.min_spend }} 元可用</text>
        </view>
        
        <view class="c-right">
          <view class="c-btn claimed" v-if="item.has_claimed">已领取</view>
          <view class="c-btn" v-else @click="claim(item.id)">立即领取</view>
        </view>
      </view>
      
      <view class="empty-tip" v-if="coupons.length === 0">暂时没有可领取的优惠券哦~</view>
    </view>
  </view>
</template>

<script>
export default {
  data() { return { coupons: [] } },
  onShow() { this.getCenterCoupons(); },
  methods: {
    getCenterCoupons() {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/coupons/center/',
        header: token ? { 'Authorization': 'Token ' + token } : {},
        success: (res) => { if(res.data.code === 200) this.coupons = res.data.data; }
      });
    },
    claim(id) {
      const token = uni.getStorageSync('token');
      if(!token) return uni.showToast({title:'请先登录', icon:'none'});
      
      uni.showLoading({title:'领取中...'});
      uni.request({
        url: 'http://127.0.0.1:8000/api/coupons/claim/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { coupon_id: id },
        success: (res) => {
          uni.hideLoading();
          uni.showToast({title: res.data.msg, icon: res.data.code===200 ? 'success' : 'none'});
          if(res.data.code === 200) {
             // 领取成功后，重新拉取数据，此时 item.has_claimed 就会变成 true，按钮自然变灰
             this.getCenterCoupons();
          }
        }
      });
    }
  }
}
</script>

<style>
.coupon-bg { background-color: #f5f5f5; min-height: 100vh; }
.header-banner { background: linear-gradient(135deg, #ff9000, #ff5000); padding: 40px 20px; text-align: center; color: #fff;}
.banner-title { font-size: 24px; font-weight: bold; display: block; margin-bottom: 5px;}
.banner-sub { font-size: 14px; opacity: 0.8;}

.coupon-list { padding: 15px; margin-top: -20px;}
.coupon-card { display: flex; background: #fff; border-radius: 8px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);}

.c-left { background: linear-gradient(135deg, #ff758c, #ff7eb3); color: #fff; width: 90px; display: flex; justify-content: center; align-items: baseline; padding: 20px 0;}
.c-symbol { font-size: 14px; }
.c-price { font-size: 30px; font-weight: bold;}

.c-mid { flex: 1; padding: 15px 10px; display: flex; flex-direction: column; justify-content: center;}
.c-name { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 5px;}
.c-rule { font-size: 12px; color: #999;}

.c-right { width: 80px; display: flex; justify-content: center; align-items: center; border-left: 1px dashed #eee;}

/* 正常领取按钮 */
.c-btn { background: linear-gradient(90deg, #ff7700, #ff4900); color: #fff; font-size: 12px; padding: 6px 12px; border-radius: 15px; box-shadow: 0 2px 5px rgba(255,80,0,0.2);}

/* 🌟 修改点：已领取按钮的灰色失效状态变得极其明显 */
.c-btn.claimed { 
  background: #d9d9d9; /* 变成纯灰色背景 */
  color: #fff; 
  box-shadow: none; /* 移除橘色阴影 */
  pointer-events: none; /* 禁止用户任何点击交互 */
}

.empty-tip { text-align: center; padding: 50px 0; color: #999; font-size: 14px;}
</style>