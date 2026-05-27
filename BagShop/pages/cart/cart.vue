<template>
  <view class="cart-container">
    <view class="cart-list" v-if="cartList.length > 0">
      <view class="cart-item" v-for="(item, index) in cartList" :key="item.id">
        <view class="checkbox-box" @click="toggleSelect(index)">
          <text class="check-icon" :class="{checked: item.selected}">{{ item.selected ? '✓' : '' }}</text>
        </view>
        
        <image class="goods-img" :src="item.product.image_url || '/static/logo.png'" mode="aspectFill"></image>
        
        <view class="goods-info">
          <text class="goods-name">{{ item.product.name }}</text>
          
          <view class="diy-tags" v-if="item.parsedDiy">
            <text class="tag" v-if="item.parsedDiy.theme">{{ item.parsedDiy.theme }}</text>
            <text class="tag" v-if="item.parsedDiy.color">{{ item.parsedDiy.color }}</text>
          </view>
          
          <view class="price-qty">
            <text class="price">￥{{ item.parsedDiy && item.parsedDiy.price ? item.parsedDiy.price : item.product.price }}</text>
            
            <view class="stepper">
              <text class="step-btn" @click.stop="changeQuantity(index, -1)">-</text>
              <text class="step-input">{{ item.quantity }}</text>
              <text class="step-btn" @click.stop="changeQuantity(index, 1)">+</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <text>购物车空空如也，快去挑点喜欢的吧~</text>
    </view>

    <view class="bottom-bar" v-if="cartList.length > 0">
      <view class="select-all" @click="toggleSelectAll">
        <text class="check-icon" :class="{checked: isAllSelected}">{{ isAllSelected ? '✓' : '' }}</text>
        <text class="all-text">全选</text>
      </view>
      <view class="total-box">
        <text class="total-label">合计:</text>
        <text class="total-price">￥{{ totalPrice }}</text>
        <button class="checkout-btn" :class="{disabled: selectedCount === 0}" @click="goToCheckout">去结算({{ selectedCount }})</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      cartList: []
    }
  },
  onShow() {
    this.getCartData();
  },
  computed: {
    isAllSelected() {
      return this.cartList.length > 0 && this.cartList.every(item => item.selected);
    },
    selectedCount() {
      return this.cartList.filter(item => item.selected).length;
    },
    totalPrice() {
      let total = 0;
      this.cartList.forEach(item => {
        if (item.selected) {
          let itemPrice = item.parsedDiy && item.parsedDiy.price ? parseFloat(item.parsedDiy.price) : parseFloat(item.product.price);
          total += itemPrice * item.quantity;
        }
      });
      return total.toFixed(2);
    }
  },
  methods: {
    getCartData() {
      const token = uni.getStorageSync('token');
      if(!token) return;
      uni.request({
        url: 'http://127.0.0.1:8000/api/cart/list/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data)) {
            this.cartList = res.data.map(item => {
              let parsedData = null;
              if (item.diy_details) {
                try { parsedData = JSON.parse(item.diy_details); } catch (e) {}
              }
              return { ...item, parsedDiy: parsedData, selected: true }; 
            });
          }
        }
      });
    },

    // 🌟 修改点：支持减少到 0 时提示删除
    changeQuantity(index, delta) {
      let item = this.cartList[index];
      let newQty = parseInt(item.quantity) + delta;
      
      // 当数量即将减到 0 时，触发移除确认
      if (newQty < 1) {
        uni.showModal({
          title: '移出购物车',
          content: '确定要将该商品移出购物车吗？',
          success: (res) => {
            if (res.confirm) {
              this.updateBackendQuantity(index, item.id, 0); // 传 0 给后端触发删除
            }
          }
        });
        return;
      }
      
      // 正常加减数量
      item.quantity = newQty;
      this.updateBackendQuantity(index, item.id, newQty);
    },

    // 封装向后端更新数量的方法
    updateBackendQuantity(index, cartId, newQty) {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/cart/update/', 
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { cart_id: cartId, quantity: newQty },
        success: (res) => {
          if (res.data.code === 200) {
            // 如果传入的是 0，说明删除了，直接从数组里切掉
            if (newQty === 0) {
              this.cartList.splice(index, 1);
              uni.showToast({ title: '已移除', icon: 'success' });
            }
          } else {
            // 如果报错，恢复旧数据
            this.getCartData();
            uni.showToast({ title: res.data.msg || '操作失败', icon: 'none' });
          }
        }
      });
    },

    toggleSelect(index) {
      this.cartList[index].selected = !this.cartList[index].selected;
    },
    toggleSelectAll() {
      const newState = !this.isAllSelected;
      this.cartList.forEach(item => item.selected = newState);
    },
    goToCheckout() {
      if (this.selectedCount === 0) return uni.showToast({ title: '请至少选择一件商品', icon: 'none' });
      const selectedIds = this.cartList.filter(item => item.selected).map(item => item.id);
      uni.setStorageSync('selectedCartIds', selectedIds);
      uni.navigateTo({ url: '/pages/confirm_order/confirm_order' });
    }
  }
}
</script>

<style>
.cart-container { background-color: #f5f7fa; min-height: 100vh; padding: 15px; padding-bottom: 80px;}
.cart-item { display: flex; align-items: center; background-color: #fff; padding: 15px 12px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);}

.checkbox-box { padding: 5px; margin-right: 5px; }
.check-icon { display: inline-block; width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc; text-align: center; line-height: 20px; color: #fff; font-size: 14px; font-weight: bold; transition: all 0.2s;}
.check-icon.checked { background-color: #ff5000; border-color: #ff5000; }

.goods-img { width: 72px; height: 72px; border-radius: 6px; margin-right: 12px; background-color: #f9f9f9; flex-shrink: 0;}
.goods-info { flex: 1; display: flex; flex-direction: column; justify-content: space-between; height: 72px;}

.goods-name { font-size: 13px; color: #333; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; line-height: 1.4;}

.diy-tags { display: flex; flex-wrap: wrap; margin-top: 4px;}
.tag { font-size: 10px; color: #999; background-color: #f5f5f5; padding: 2px 6px; border-radius: 4px; margin-right: 5px;}

.price-qty { display: flex; justify-content: space-between; align-items: center; margin-top: auto;}
.price { color: #ff5000; font-weight: bold; font-size: 16px;}

/* 步进器 (Stepper) 样式 */
.stepper { display: flex; align-items: center; }
.step-btn { width: 24px; height: 24px; line-height: 22px; text-align: center; background-color: #f5f5f5; border-radius: 4px; font-size: 16px; color: #666; font-weight: bold; transition: background-color 0.2s;}
.step-btn:active { background-color: #e0e0e0; }
.step-input { width: 36px; text-align: center; font-size: 13px; color: #333; font-weight: bold;}

.empty-state { text-align: center; padding-top: 100px; color: #999; font-size: 14px;}

.bottom-bar { position: fixed; bottom: 50px; left: 0; width: 100%; height: 55px; background-color: #fff; display: flex; justify-content: space-between; align-items: center; padding: 0 15px; box-sizing: border-box; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 99;}
.select-all { display: flex; align-items: center; }
.all-text { font-size: 14px; color: #333; margin-left: 8px;}
.total-box { display: flex; align-items: center;}
.total-label { font-size: 13px; color: #333;}
.total-price { color: #ff5000; font-size: 18px; font-weight: bold; margin: 0 10px;}
.checkout-btn { background: linear-gradient(90deg, #ff7700, #ff4900); color: #fff; border-radius: 20px; padding: 0 20px; height: 36px; line-height: 36px; font-size: 14px; margin: 0; transition: opacity 0.3s;}
.checkout-btn.disabled { opacity: 0.5; }
</style>