<template>
  <view class="addr-container">
    <view class="addr-list" v-if="addressList.length > 0">
      <view class="addr-item" v-for="item in addressList" :key="item.id" @click="handleSelect(item)">
        <view class="info">
          <view class="user-line">
            <text class="name">{{ item.receiver_name }}</text>
            <text class="phone">{{ item.receiver_phone }}</text>
            <text class="tag" v-if="item.is_default">默认</text>
          </view>
          <text class="detail">{{ item.address_detail }}</text>
        </view>
        <view class="action" @click.stop="editAddress(item)">
          <text class="edit-icon">✎ 编辑</text>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else>暂无收货地址</view>
    
    <view class="footer-box">
      <button class="add-btn" @click="addAddress">＋ 新增收货地址</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return { 
      addressList: [],
      isFromCheckout: false // 标记是否来源于结算页
    }
  },
  onLoad(options) {
    // 识别是不是结算页带着 from=checkout 参数跳转过来的
    if (options.from === 'checkout') {
      this.isFromCheckout = true;
      uni.setNavigationBarTitle({ title: '选择收货地址' });
    }
  },
  onShow() { 
    this.getList(); 
  },
  methods: {
    getList() {
      uni.request({
        url: 'http://127.0.0.1:8000/api/address/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
        success: (res) => { if (res.data.code === 200) this.addressList = res.data.data; }
      });
    },

    // 核心：处理地址点击选择逻辑
    handleSelect(item) {
      if (this.isFromCheckout) {
        // 如果是来选地址的，就通过全局事件总线发射数据
        uni.$emit('selectAddress', item);
        // 发送完数据后，自动退回结算页
        uni.navigateBack();
      }
    },

    addAddress() { 
      uni.navigateTo({ url: '/pages/address/edit' }); 
    },
    editAddress(item) {
      uni.navigateTo({ url: `/pages/address/edit?data=${encodeURIComponent(JSON.stringify(item))}` });
    }
  }
}
</script>

<style>
/* CSS样式保持不变 */
.addr-container { background: #f5f7fa; min-height: 100vh; padding: 15px; padding-bottom: 80px;}
.addr-item { display: flex; align-items: center; background: #fff; padding: 15px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.03);}
.info { flex: 1; border-right: 1px solid #eee; padding-right: 15px;}
.user-line { margin-bottom: 8px; display: flex; align-items: center;}
.name { font-size: 16px; font-weight: bold; color: #333; margin-right: 10px;}
.phone { font-size: 14px; color: #666; margin-right: 10px;}
.tag { font-size: 10px; background: #fff4f0; color: #ff5000; padding: 2px 6px; border-radius: 4px; border: 1px solid #ff5000;}
.detail { font-size: 13px; color: #666; line-height: 1.4; display: block;}
.action { width: 60px; text-align: right; padding-left: 10px;}
.edit-icon { font-size: 13px; color: #999;}
.footer-box { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; background: #fff; box-sizing: border-box; box-shadow: 0 -2px 10px rgba(0,0,0,0.05);}
.add-btn { background: linear-gradient(90deg, #ff7700, #ff4900); color: #fff; border-radius: 22px; font-size: 16px; height: 44px; line-height: 44px;}
.empty-state { text-align: center; padding-top: 100px; color: #999; font-size: 14px;}
</style>