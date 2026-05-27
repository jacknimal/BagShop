<template>
  <view class="container">
    
    <view class="address-card" @click="chooseAddress">
      <view class="address-left">
        <text class="location-icon">📍</text>
        
        <view class="address-info" v-if="selectedAddress">
          <view class="user-line">
            <text class="name">{{ selectedAddress.receiver_name }}</text>
            <text class="phone">{{ selectedAddress.receiver_phone }}</text>
            <text class="tag" v-if="selectedAddress.is_default">默认</text>
          </view>
          <text class="detail">{{ selectedAddress.address_detail }}</text>
        </view>
        
        <view class="address-empty" v-else>
          <text class="empty-text">请选择收货地址</text>
        </view>
      </view>
      <text class="arrow">></text>
      <view class="address-border"></view>
    </view>

    <view class="goods-box">
      <view class="section-title">商品清单</view>
      <view class="goods-item" v-for="item in cartList" :key="item.id">
        <view class="goods-info">
          <text class="goods-name">{{ item.product.name }}</text>
          <view class="diy-tags" v-if="item.parsedDiy">
            <text class="tag" v-if="item.parsedDiy.theme">{{ item.parsedDiy.theme }}</text>
            <text class="tag" v-if="item.parsedDiy.color">{{ item.parsedDiy.color }}</text>
            <text class="tag" v-if="item.parsedDiy.size">{{ item.parsedDiy.size }}</text>
          </view>
        </view>
        <text class="goods-price">￥{{ item.parsedDiy && item.parsedDiy.price ? item.parsedDiy.price : item.product.price }} x {{ item.quantity }}</text>
      </view>
    </view>

    <view class="coupon-cell" @click="openCouponModal">
      <text class="c-label">优惠券</text>
      <view class="c-value">
        <text class="c-highlight" v-if="selectedCoupon">- ￥{{ selectedCoupon.discount_amount }}</text>
        <text class="c-highlight" v-else-if="availableCoupons.length > 0">{{ availableCoupons.length }} 张可用</text>
        <text class="c-disabled" v-else>暂无可用</text>
        <text class="arrow">></text>
      </view>
    </view>

    <view class="footer">
      <view class="total-price">待支付: ￥{{ finalPrice }}</view>
      <button class="pay-btn" @click="handlePayment">确认支付</button>
    </view>

    <view class="modal-mask" v-if="showCouponModal" @click="showCouponModal = false">
      <view class="bottom-modal" @click.stop>
        <view class="modal-header">优惠券</view>
        <scroll-view scroll-y class="coupon-scroll">
          
          <view class="cp-item" v-for="item in availableCoupons" :key="item.user_coupon_id" @click="selectCoupon(item)">
            <view class="cp-left">￥<text class="cp-num">{{ item.discount_amount }}</text></view>
            <view class="cp-mid">
              <text class="cp-name">{{ item.name }}</text>
              <text class="cp-rule">满 {{ item.min_spend }} 元可用</text>
            </view>
            <view class="cp-right">
              <text class="check-icon" v-if="selectedCoupon && selectedCoupon.user_coupon_id === item.user_coupon_id">✅</text>
              <view class="circle-icon" v-else></view>
            </view>
          </view>

          <view class="cp-item no-use" @click="selectCoupon(null)">
            <text class="cp-name">不使用优惠券</text>
            <view class="cp-right">
              <text class="check-icon" v-if="!selectedCoupon">✅</text>
              <view class="circle-icon" v-else></view>
            </view>
          </view>
          
        </scroll-view>
        <button class="close-btn" @click="showCouponModal = false">完成</button>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      selectedAddress: null,
      cartList: [],
      
      // 优惠券相关数据
      myCoupons: [],
      selectedCoupon: null,
      showCouponModal: false
    }
  },
  onLoad() {
    this.getCartData();
    uni.$on('selectAddress', (address) => {
      this.selectedAddress = address;
    });
    this.getDefaultAddress();
  },
  onUnload() {
    uni.$off('selectAddress');
  },
  computed: {
    // 1. 商品纯总价 (不含优惠)
    goodsTotalPrice() {
      let total = 0;
      this.cartList.forEach(item => {
        let itemPrice = item.parsedDiy && item.parsedDiy.price ? parseFloat(item.parsedDiy.price) : parseFloat(item.product.price);
        total += itemPrice * item.quantity;
      });
      return parseFloat(total.toFixed(2));
    },
    // 2. 筛选出当前总价满足使用条件的优惠券
    availableCoupons() {
      return this.myCoupons.filter(c => this.goodsTotalPrice >= parseFloat(c.min_spend));
    },
    // 3. 最终实际支付价格
    finalPrice() {
      let total = this.goodsTotalPrice;
      if (this.selectedCoupon) {
        total -= parseFloat(this.selectedCoupon.discount_amount);
      }
      return total > 0 ? total.toFixed(2) : '0.01'; // 确保至少支付1分钱
    }
  },
  methods: {
    getCartData() {
      const token = uni.getStorageSync('token');
      const selectedIds = uni.getStorageSync('selectedCartIds') || [];
      
      uni.request({
        url: 'http://127.0.0.1:8000/api/cart/list/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data)) {
            let parsedList = res.data.map(item => {
              let parsedData = null;
              if (item.diy_details) {
                try { parsedData = JSON.parse(item.diy_details); } catch (e) {}
              }
              return { ...item, parsedDiy: parsedData };
            });
            this.cartList = parsedList.filter(item => selectedIds.includes(item.id));
            
            // 拿到商品总价后，再去拉取优惠券
            this.getMyCoupons();
          }
        }
      });
    },

    getMyCoupons() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      uni.request({
        url: 'http://127.0.0.1:8000/api/coupons/my/?status=unused',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            this.myCoupons = res.data.data;
            // 智能优选：自动选中面额最大的一张可用优惠券
            if (this.availableCoupons.length > 0) {
              // 按抵扣金额降序排列，取第一张
              let sorted = [...this.availableCoupons].sort((a, b) => b.discount_amount - a.discount_amount);
              this.selectedCoupon = sorted[0];
            }
          }
        }
      });
    },

    openCouponModal() {
      if (this.availableCoupons.length > 0 || this.selectedCoupon) {
        this.showCouponModal = true;
      } else {
        uni.showToast({ title: '暂无可用优惠券', icon: 'none' });
      }
    },

    selectCoupon(item) {
      this.selectedCoupon = item;
    },

    getDefaultAddress() {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/address/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200 && res.data.data.length > 0) {
            if (!this.selectedAddress) {
              this.selectedAddress = res.data.data[0];
            }
          }
        }
      });
    },

    chooseAddress() {
      uni.navigateTo({ url: '/pages/address/list?from=checkout' });
    },
    
    handlePayment() {
      if (!this.selectedAddress) return uni.showToast({ title: '请先选择收货地址', icon: 'none' });
      if (this.cartList.length === 0) return uni.showToast({ title: '没有可结算的商品', icon: 'none' });

      uni.showActionSheet({
        itemList: ['微信支付', '支付宝支付'],
        success: (res) => {
          let payMethod = res.tapIndex === 0 ? '微信' : '支付宝';
          uni.showLoading({ title: `正在唤起${payMethod}...`, mask: true });
          
          setTimeout(() => {
            uni.hideLoading();
            this.executeCreateOrder('paid'); 
          }, 1500);
        },
        fail: () => {
          uni.showToast({ title: '已取消支付', icon: 'none' });
          this.executeCreateOrder('pending');
        }
      });
    },

    executeCreateOrder(orderStatus) {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/order/create/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { 
          receiver_name: this.selectedAddress.receiver_name,
          receiver_phone: this.selectedAddress.receiver_phone,
          address: this.selectedAddress.address_detail,
          status: orderStatus,
          cart_item_ids: uni.getStorageSync('selectedCartIds'),
          // 🌟 核心：提交选中的优惠券ID，以便后端记录和核销
          user_coupon_id: this.selectedCoupon ? this.selectedCoupon.user_coupon_id : null
        }, 
        success: (res) => {
          if (res.data.code === 200) {
            if (orderStatus === 'paid') uni.showToast({ title: '支付成功！', icon: 'success' });
            
            // 清理缓存并跳转
            uni.removeStorageSync('selectedCartIds');
            setTimeout(() => {
              let jumpStatus = orderStatus === 'paid' ? 'paid' : 'pending';
              uni.redirectTo({ url: `/pages/orders/orders?status=${jumpStatus}` });
            }, 1000);
          } else {
            uni.showToast({ title: res.data.msg, icon: 'none' });
          }
        }
      });
    }
  }
}
</script>

<style>
.container { padding: 15px; background-color: #f5f5f5; min-height: 100vh; padding-bottom: 80px; }

/* 智能地址卡片样式 */
.address-card { background-color: #fff; border-radius: 8px; padding: 20px 15px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; position: relative; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.03);}
.address-left { display: flex; align-items: center; flex: 1; }
.location-icon { font-size: 24px; margin-right: 15px; }
.address-info { flex: 1; display: flex; flex-direction: column; }
.user-line { margin-bottom: 8px; display: flex; align-items: center; }
.name { font-size: 16px; font-weight: bold; color: #333; margin-right: 10px; }
.phone { font-size: 15px; color: #666; font-weight: bold; margin-right: 10px; }
.tag { font-size: 10px; background-color: #fff4f0; color: #ff5000; padding: 2px 6px; border-radius: 4px; border: 1px solid #ff5000; }
.detail { font-size: 13px; color: #666; line-height: 1.4; }
.address-empty { flex: 1; }
.empty-text { font-size: 16px; color: #333; font-weight: bold;}
.arrow { color: #ccc; font-size: 18px; margin-left: 10px; }
.address-border { position: absolute; bottom: 0; left: 0; right: 0; height: 4px; background: repeating-linear-gradient(-45deg, #ff5000 0, #ff5000 20%, transparent 0, transparent 25%, #007aff 0, #007aff 45%, transparent 0, transparent 50%); background-size: 80px; }

/* 商品信息 */
.section-title { font-size: 16px; font-weight: bold; margin-bottom: 15px; color: #333; }
.goods-box { background-color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.goods-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f9f9f9; padding: 10px 0; font-size: 14px; }
.goods-info { display: flex; flex-direction: column; flex: 1;}
.goods-name { margin-bottom: 5px; color: #333;}
.diy-tags { display: flex; flex-wrap: wrap; }
.goods-price { color: #333; font-weight: bold;}

/* 🌟 优惠券选择栏 */
.coupon-cell { background-color: #fff; padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 8px rgba(0,0,0,0.03); margin-bottom: 15px;}
.c-label { font-size: 15px; color: #333; font-weight: bold;}
.c-value { display: flex; align-items: center; }
.c-highlight { color: #ff5000; font-size: 14px; font-weight: bold;}
.c-disabled { color: #999; font-size: 14px;}

.footer { position: fixed; bottom: 0; left: 0; width: 100%; height: 60px; background-color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 20px; box-sizing: border-box; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); }
.total-price { color: #ff0000; font-size: 18px; font-weight: bold; }
.pay-btn { background-color: #ff5000; color: #fff; border-radius: 20px; padding: 0 30px; height: 40px; line-height: 40px; font-size: 16px; margin: 0; }

/* 🌟 从底部弹出的优惠券弹窗 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 999; }
.bottom-modal { position: absolute; bottom: 0; left: 0; width: 100%; background: #f5f5f5; border-radius: 16px 16px 0 0; padding-bottom: env(safe-area-inset-bottom); display: flex; flex-direction: column; max-height: 70vh;}
.modal-header { padding: 15px; text-align: center; font-size: 16px; font-weight: bold; background: #fff; border-radius: 16px 16px 0 0;}
.coupon-scroll { flex: 1; padding: 15px; box-sizing: border-box; max-height: 50vh; overflow-y: auto;}

.cp-item { display: flex; background: #fff; border-radius: 8px; margin-bottom: 10px; align-items: center; padding: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);}
.cp-left { color: #ff5000; width: 70px; font-weight: bold; }
.cp-num { font-size: 24px; }
.cp-mid { flex: 1; display: flex; flex-direction: column; }
.cp-name { font-size: 15px; color: #333; font-weight: bold; margin-bottom: 5px; }
.cp-rule { font-size: 11px; color: #999; }
.cp-right { width: 30px; text-align: right; }
.check-icon { font-size: 18px; }
.circle-icon { width: 18px; height: 18px; border-radius: 50%; border: 1px solid #ccc; display: inline-block; }

.cp-item.no-use { justify-content: space-between; }
.close-btn { background: #ff5000; color: #fff; margin: 10px 15px 15px; border-radius: 25px; height: 44px; line-height: 44px; font-size: 16px; font-weight: bold;}
</style>