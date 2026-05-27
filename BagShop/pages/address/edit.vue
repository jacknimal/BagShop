<template>
  <view class="edit-container">
    <view class="form-group">
      <view class="form-item">
        <text class="label">收货人</text>
        <input class="input" type="text" v-model="form.receiver_name" placeholder="请输入真实姓名" />
      </view>
      <view class="form-item">
        <text class="label">手机号码</text>
        <input class="input" type="number" v-model="form.receiver_phone" placeholder="请输入11位手机号" />
      </view>
      <view class="form-item align-top">
        <text class="label">详细地址</text>
        <textarea class="textarea" v-model="form.address_detail" placeholder="请输入省市区及详细街道、门牌号"></textarea>
      </view>
    </view>
    
    <view class="form-group">
      <view class="form-item switch-item">
        <text class="label">设为默认收货地址</text>
        <switch :checked="form.is_default" color="#ff5000" @change="e => form.is_default = e.detail.value" />
      </view>
    </view>

    <view class="btn-box">
      <button class="save-btn" @click="saveAddress">保存地址</button>
      <button class="del-btn" v-if="form.id" @click="deleteAddress">删除此地址</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: { id: null, receiver_name: '', receiver_phone: '', address_detail: '', is_default: false }
    }
  },
  onLoad(options) {
    if (options.data) {
      this.form = JSON.parse(decodeURIComponent(options.data));
      uni.setNavigationBarTitle({ title: '编辑地址' });
    }
  },
  methods: {
    saveAddress() {
      if (!this.form.receiver_name || !this.form.receiver_phone || !this.form.address_detail) {
        return uni.showToast({ title: '请填写完整信息', icon: 'none' });
      }
      const token = uni.getStorageSync('token');
      const method = this.form.id ? 'PUT' : 'POST';
      
      uni.request({
        url: 'http://127.0.0.1:8000/api/address/',
        method: method,
        header: { 'Authorization': 'Token ' + token },
        data: this.form,
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: '保存成功', icon: 'success' });
            setTimeout(() => uni.navigateBack(), 1000);
          }
        }
      });
    },
    deleteAddress() {
      uni.showModal({
        title: '删除确认',
        content: '确定要删除这个地址吗？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: 'http://127.0.0.1:8000/api/address/',
              method: 'DELETE',
              header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
              data: { id: this.form.id },
              success: () => {
                uni.showToast({ title: '已删除', icon: 'success' });
                setTimeout(() => uni.navigateBack(), 1000);
              }
            });
          }
        }
      });
    }
  }
}
</script>

<style>
.edit-container { background: #f5f7fa; min-height: 100vh; padding: 15px;}
.form-group { background: #fff; border-radius: 12px; padding: 0 15px; margin-bottom: 15px;}
.form-item { display: flex; align-items: center; padding: 15px 0; border-bottom: 1px solid #f9f9f9;}
.form-item:last-child { border-bottom: none;}
.form-item.align-top { align-items: flex-start;}
.label { width: 80px; font-size: 15px; color: #333;}
.input { flex: 1; font-size: 15px; color: #333;}
.textarea { flex: 1; height: 80px; font-size: 15px; color: #333; line-height: 1.4;}
.switch-item { justify-content: space-between;}
.btn-box { margin-top: 30px;}
.save-btn { background: #ff5000; color: #fff; border-radius: 22px; font-size: 16px; height: 44px; line-height: 44px; margin-bottom: 15px;}
.del-btn { background: #fff; color: #ff0000; border-radius: 22px; font-size: 16px; height: 44px; line-height: 44px;}
.del-btn::after { border: 1px solid #ff0000;}
</style>