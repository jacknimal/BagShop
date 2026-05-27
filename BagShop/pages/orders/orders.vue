<template>
  <view class="orders-container">
    <view class="tabs">
      <view class="tab" :class="{active: currentStatus === 'all'}" @click="switchTab('all')">全部</view>
      <view class="tab" :class="{active: currentStatus === 'pending'}" @click="switchTab('pending')">待付款</view>
      <view class="tab" :class="{active: currentStatus === 'paid'}" @click="switchTab('paid')">待发货</view>
      <view class="tab" :class="{active: currentStatus === 'shipped'}" @click="switchTab('shipped')">待收货</view>
      <view class="tab" :class="{active: currentStatus === 'completed'}" @click="switchTab('completed')">已完成</view>
    </view>

    <scroll-view scroll-y class="order-list" v-if="filteredOrders.length > 0">
      <view class="order-card" v-for="order in filteredOrders" :key="order.id">
        <view class="order-header">
          <text class="order-no">订单号: {{ order.order_number }}</text>
          <text class="order-status" :class="order.status">{{ getStatusText(order.status) }}</text>
        </view>
        
        <view class="order-items">
          <view class="item" v-for="item in order.items" :key="item.id">
            <image class="goods-img" :src="item.product.image_url || '/static/logo.png'" mode="aspectFill"></image>
            <view class="goods-info">
              <text class="goods-name">{{ item.product.name }}</text>
              <view class="diy-tags" v-if="item.diy_data">
                 <text class="tag" v-if="item.diy_data.theme">{{ item.diy_data.theme }}</text>
                 <text class="tag" v-if="item.diy_data.color">{{ item.diy_data.color }}</text>
                 <text class="tag" v-if="item.diy_data.size">{{ item.diy_data.size }}</text>
              </view>
            </view>
            <view class="goods-price-qty">
              <text class="price">￥{{ item.price }}</text>
              <text class="qty">x {{ item.quantity }}</text>
            </view>
          </view>
        </view>

        <view class="address-preview" v-if="order.status === 'paid'">
          <text class="info-text">收货人：{{ order.receiver_name }} {{ order.receiver_phone }}</text>
          <text class="info-text">地址：{{ order.address }}</text>
        </view>

        <view class="order-footer">
          <text class="total">合计: <text class="total-price">￥{{ order.total_price }}</text></text>
          
          <view class="action-btns">
            <button class="btn cancel-btn" size="mini" v-if="order.status === 'pending'" @click="cancelOrder(order.id)">取消订单</button>
            <button class="btn pay-btn" size="mini" v-if="order.status === 'pending'" @click="payOrder(order.id)">立即付款</button>
            
            <button class="btn cancel-btn" size="mini" v-if="order.status === 'paid'" @click="openAddressModal(order)">修改信息</button>
            
            <button class="btn cancel-btn" size="mini" v-if="order.status === 'shipped' || order.status === 'completed'" @click="applyAfterSales(order.id)">申请售后</button>
            <button class="btn confirm-btn" size="mini" v-if="order.status === 'shipped'" @click="confirmReceipt(order.id)">确认收货</button>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="empty-state" v-else>
      <text>暂无相关订单~</text>
    </view>

    <view class="modal-mask" v-if="showModal">
      <view class="modal-content">
        <view class="modal-title">修改收货信息</view>
        <view class="modal-body">
          <view class="form-item">
            <text class="form-label">收货人</text>
            <input class="modal-input" type="text" v-model="editForm.receiver_name" placeholder="请输入姓名" />
          </view>
          <view class="form-item">
            <text class="form-label">手机号</text>
            <input class="modal-input" type="number" v-model="editForm.receiver_phone" placeholder="请输入手机号" />
          </view>
          <view class="form-item align-top">
            <text class="form-label">详细地址</text>
            <textarea class="modal-textarea" v-model="editForm.address" placeholder="请输入详细地址(省市区街)"></textarea>
          </view>
        </view>
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="showModal = false">取消</button>
          <button class="modal-btn confirm" @click="submitAddressUpdate">确认修改</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      currentStatus: 'all',
      orders: [],
      // 弹窗控制与表单数据
      showModal: false,
      editForm: {
        order_id: '',
        receiver_name: '',
        receiver_phone: '',
        address: ''
      }
    }
  },
  onLoad(options) {
    if (options.status) this.currentStatus = options.status;
  },
  onShow() {
    this.getOrderList();
  },
  computed: {
    filteredOrders() {
      if (this.currentStatus === 'all') return this.orders;
      return this.orders.filter(order => order.status === this.currentStatus);
    }
  },
  methods: {
    switchTab(status) { this.currentStatus = status; },
    
    getOrderList() {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/order/list/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.statusCode === 200 && Array.isArray(res.data)) {
            this.orders = res.data;
          }
        }
      });
    },

    openAddressModal(order) {
      this.editForm = {
        order_id: order.id,
        receiver_name: order.receiver_name,
        receiver_phone: order.receiver_phone,
        address: order.address
      };
      this.showModal = true;
    },

    submitAddressUpdate() {
      if (!this.editForm.receiver_name || !this.editForm.receiver_phone || !this.editForm.address) {
        return uni.showToast({ title: '信息不能为空', icon: 'none' });
      }
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/order/update_address/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: this.editForm,
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: '修改成功', icon: 'success' });
            this.showModal = false;
            this.getOrderList(); 
          } else {
            uni.showToast({ title: res.data.msg, icon: 'none' });
          }
        }
      });
    },

    // 在 pages/orders/orders.vue 中修改此方法
        applyAfterSales(orderId) {
          // 核心修改：直接带着订单号，跳转到我们全新开发的售后中心页面！
          uni.navigateTo({
            url: `/pages/after_sales/after_sales?order_id=${orderId}`
          });
        },

    cancelOrder(orderId) {
      uni.showModal({
        title: '取消订单',
        content: '确定要取消这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            const token = uni.getStorageSync('token');
            uni.request({
              url: 'http://127.0.0.1:8000/api/order/cancel/',
              method: 'POST',
              header: { 'Authorization': 'Token ' + token },
              data: { order_id: orderId },
              success: (response) => {
                if (response.data.code === 200) {
                  uni.showToast({ title: '已取消', icon: 'success' });
                  this.getOrderList();
                }
              }
            });
          }
        }
      });
    },

    payOrder(orderId) {
      uni.showActionSheet({
        itemList: ['微信支付', '支付宝支付'],
        success: (res) => {
          let payMethod = res.tapIndex === 0 ? '微信' : '支付宝';
          uni.showLoading({ title: `正在唤起${payMethod}...`, mask: true });
          setTimeout(() => {
            uni.hideLoading();
            const token = uni.getStorageSync('token');
            uni.request({
              url: 'http://127.0.0.1:8000/api/order/pay/',
              method: 'POST',
              header: { 'Authorization': 'Token ' + token },
              data: { order_id: orderId },
              success: (response) => {
                if (response.data.code === 200) {
                  uni.showToast({ title: '支付成功！', icon: 'success' });
                  this.getOrderList(); 
                  this.currentStatus = 'paid'; 
                }
              }
            });
          }, 1500);
        }
      });
    },

    confirmReceipt(orderId) {
      uni.showModal({
        title: '确认收货',
        content: '请确认您已收到商品，货款将打给卖家。',
        success: (res) => {
          if (res.confirm) {
            const token = uni.getStorageSync('token');
            uni.request({
              url: 'http://127.0.0.1:8000/api/order/confirm/',
              method: 'POST',
              header: { 'Authorization': 'Token ' + token },
              data: { order_id: orderId },
              success: (response) => {
                if (response.data.code === 200) {
                  uni.showToast({ title: '交易完成', icon: 'success' });
                  this.getOrderList();
                  this.currentStatus = 'completed';
                }
              }
            });
          }
        }
      });
    },

    getStatusText(status) {
      const statusMap = { 'pending': '待付款', 'paid': '待发货', 'shipped': '待收货', 'completed': '已完成' };
      return statusMap[status] || '未知状态';
    }
  }
}
</script>

<style>
/* 基础样式保持不变 */
.orders-container { background-color: #f5f7fa; min-height: 100vh; display: flex; flex-direction: column;}
.tabs { display: flex; justify-content: space-around; background-color: #fff; padding: 10px 0; position: sticky; top: 0; z-index: 10; box-shadow: 0 2px 5px rgba(0,0,0,0.02);}
.tab { font-size: 14px; color: #666; padding: 5px 10px; position: relative;}
.tab.active { color: #ff5000; font-weight: bold;}
.tab.active::after { content: ''; position: absolute; bottom: -5px; left: 20%; width: 60%; height: 3px; background-color: #ff5000; border-radius: 2px;}

.order-list { flex: 1; padding: 15px; }
.order-card { background-color: #fff; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);}
.order-header { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 13px;}
.order-no { color: #666;}
.order-status { font-weight: bold;}
.order-status.pending { color: #ff5000;}
.order-status.paid { color: #007aff;}
.order-status.shipped { color: #07c160;}
.order-status.completed { color: #999;}

.item { display: flex; margin-bottom: 15px; }
.goods-img { width: 70px; height: 70px; border-radius: 8px; margin-right: 12px; background-color: #f9f9f9;}
.goods-info { flex: 1;}
.goods-name { font-size: 14px; color: #333; margin-bottom: 5px; display: block;}
.diy-tags { display: flex; flex-wrap: wrap;}
.tag { font-size: 10px; color: #999; background-color: #f5f5f5; padding: 2px 6px; border-radius: 4px; margin-right: 5px; margin-bottom: 5px;}
.goods-price-qty { text-align: right;}
.price { font-size: 14px; color: #333; font-weight: bold; display: block;}
.qty { font-size: 12px; color: #999;}

.address-preview { background-color: #f9f9f9; padding: 10px; border-radius: 6px; margin-bottom: 15px; }
.info-text { font-size: 12px; color: #666; display: block; margin-bottom: 4px; line-height: 1.4;}

.order-footer { border-top: 1px solid #f9f9f9; padding-top: 15px; display: flex; justify-content: space-between; align-items: center;}
.total { font-size: 13px; color: #666;}
.total-price { font-size: 16px; color: #333; font-weight: bold; margin-left: 5px;}
.action-btns { display: flex; justify-content: flex-end;}
.btn { margin: 0 0 0 10px; border-radius: 15px; font-size: 13px; padding: 0 15px; height: 30px; line-height: 30px;}
.cancel-btn { background-color: #fff; color: #666; border: 1px solid #ccc;}
.pay-btn { background-color: #ff5000; color: #fff;}
.confirm-btn { background-color: #07c160; color: #fff;}
.empty-state { text-align: center; padding-top: 100px; color: #999; font-size: 14px;}

/* --- 全新优化：商用级表单弹窗 --- */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 999; display: flex; justify-content: center; align-items: center; }
.modal-content { width: 85%; background-color: #fff; border-radius: 12px; padding: 20px 20px 25px; box-sizing: border-box; }
.modal-title { font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 20px; color: #333; }

/* 左标题 + 右输入 的表单布局 */
.form-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #eee; }
.form-item.align-top { align-items: flex-start; border-bottom: none; padding-bottom: 0;}
.form-label { width: 65px; font-size: 14px; color: #333; font-weight: bold; }
.modal-input { flex: 1; font-size: 14px; color: #333; }
.modal-textarea { flex: 1; height: 70px; background-color: #f9f9f9; border-radius: 6px; padding: 8px; font-size: 14px; color: #333; box-sizing: border-box; }

.modal-footer { display: flex; justify-content: space-between; margin-top: 25px;}
.modal-btn { width: 45%; height: 40px; line-height: 40px; border-radius: 20px; font-size: 15px; font-weight: bold; margin: 0; }
.modal-btn.cancel { background-color: #f5f5f5; color: #666; }
.modal-btn.confirm { background-color: #ff5000; color: #fff; }
</style>