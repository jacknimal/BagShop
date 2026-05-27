<template>
  <view class="coupon-bg">
    <view class="tabs">
      <view class="tab" :class="{active: currentStatus === 'unused'}" @click="switchTab('unused')">未使用</view>
      <view class="tab" :class="{active: currentStatus === 'used'}" @click="switchTab('used')">已使用</view>
      <view class="tab" :class="{active: currentStatus === 'expired'}" @click="switchTab('expired')">已过期</view>
    </view>

    <scroll-view scroll-y class="coupon-list" v-if="coupons.length > 0">
      <view class="coupon-card" :class="currentStatus" v-for="item in coupons" :key="item.user_coupon_id">
        <view class="c-left">
          <text class="c-symbol">￥</text><text class="c-price">{{ item.discount_amount }}</text>
        </view>
        <view class="c-mid">
          <text class="c-name">{{ item.name }}</text>
          <text class="c-rule">满 {{ item.min_spend }} 元可用</text>
          <text class="c-time">有效期至: {{ item.expires_at }}</text>
        </view>
        <view class="c-right">
          <view class="status-stamp" v-if="currentStatus === 'used'">已使用</view>
          <view class="status-stamp" v-else-if="currentStatus === 'expired'">已过期</view>
          <view class="use-btn" v-else @click="goShopping">去使用</view>
        </view>
      </view>
    </scroll-view>

    <view class="empty-tip" v-else>
      <text>暂无相关优惠券哦~</text>
      <button class="get-more-btn" @click="goCouponCenter">去领券中心看看</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentStatus: 'unused',
      coupons: []
    }
  },
  onShow() {
    this.getMyCoupons();
  },
  methods: {
    switchTab(status) {
      this.currentStatus = status;
      this.getMyCoupons();
    },
    getMyCoupons() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      
      uni.showLoading({ title: '加载中...' });
      uni.request({
        url: `http://127.0.0.1:8000/api/coupons/my/?status=${this.currentStatus}`,
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          uni.hideLoading();
          if (res.data.code === 200) {
            this.coupons = res.data.data;
          }
        }
      });
    },
    goShopping() {
      uni.switchTab({ url: '/pages/index/index' });
    },
    goCouponCenter() {
      uni.navigateTo({ url: '/pages/coupon/coupon_center' });
    }
  }
}
</script>

<style>
.coupon-bg { background-color: #f5f5f5; min-height: 100vh; display: flex; flex-direction: column; }

/* 选项卡样式 */
.tabs { display: flex; justify-content: space-around; background-color: #fff; padding: 10px 0; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.02);}
.tab { font-size: 14px; color: #666; padding: 5px 10px; position: relative;}
.tab.active { color: #ff5000; font-weight: bold;}
.tab.active::after { content: ''; position: absolute; bottom: -5px; left: 20%; width: 60%; height: 3px; background-color: #ff5000; border-radius: 2px;}

/* 优惠券列表 */
.coupon-list { flex: 1; padding: 15px; box-sizing: border-box; }
.coupon-card { display: flex; background: #fff; border-radius: 8px; margin-bottom: 15px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); position: relative;}
.c-left { background: linear-gradient(135deg, #ff758c, #ff7eb3); color: #fff; width: 90px; display: flex; justify-content: center; align-items: baseline; padding: 25px 0;}
.c-symbol { font-size: 14px; }
.c-price { font-size: 30px; font-weight: bold;}
.c-mid { flex: 1; padding: 15px 10px; display: flex; flex-direction: column; justify-content: center;}
.c-name { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 5px;}
.c-rule { font-size: 12px; color: #ff5000; background: #fff4f0; padding: 2px 6px; border-radius: 4px; align-self: flex-start; margin-bottom: 8px;}
.c-time { font-size: 11px; color: #999;}
.c-right { width: 80px; display: flex; justify-content: center; align-items: center; border-left: 1px dashed #eee;}

/* 去使用按钮 */
.use-btn { background: #ff5000; color: #fff; font-size: 12px; padding: 6px 14px; border-radius: 15px; box-shadow: 0 2px 5px rgba(255,80,0,0.2);}

/* 失效状态置灰 */
.coupon-card.used .c-left, .coupon-card.expired .c-left { background: #d9d9d9; }
.coupon-card.used .c-name, .coupon-card.expired .c-name { color: #999; }
.coupon-card.used .c-rule, .coupon-card.expired .c-rule { background: #f5f5f5; color: #999; }
.status-stamp { border: 1px solid #ccc; color: #ccc; font-size: 12px; padding: 4px 8px; transform: rotate(-15deg); border-radius: 4px;}

/* 空白提示 */
.empty-tip { text-align: center; padding-top: 80px; color: #999; font-size: 14px; }
.get-more-btn { margin-top: 20px; width: 160px; height: 36px; line-height: 36px; font-size: 13px; border-radius: 18px; border: 1px solid #ff5000; color: #ff5000; background: transparent;}
</style>