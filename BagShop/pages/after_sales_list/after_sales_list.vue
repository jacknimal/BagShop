<template>
  <view class="container">
    <view class="list" v-if="records.length > 0">
      <view class="record-card" v-for="item in records" :key="item.id">
        <view class="card-header">
          <text class="order-no">关联订单：{{ item.order_number }}</text>
          <text class="status-tag" :class="item.status">{{ getStatusText(item.status) }}</text>
        </view>
        
        <view class="card-body">
          <view class="info-row">
            <text class="label">服务类型：</text>
            <text class="value highlight">{{ item.service_type }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请原因：</text>
            <text class="value">{{ item.reason }}</text>
          </view>
          <view class="info-row">
            <text class="label">涉及商品：</text>
            <text class="value text-ellipsis">{{ item.product_names }}</text>
          </view>
          <view class="info-row">
            <text class="label">申请时间：</text>
            <text class="value">{{ formatTime(item.created_at) }}</text>
          </view>
        </view>
        
        <view class="card-footer" v-if="item.status === 'pending'">
          <text class="tip">商家正在加急审核中，请耐心等待~</text>
        </view>
        <view class="card-footer" v-if="item.status === 'approved'">
          <text class="tip success">审核已通过！客服将很快与您联系。</text>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <text>暂无售后记录，买得放心~</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      records: []
    }
  },
  onShow() {
    this.getRecords();
  },
  methods: {
    getRecords() {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/order/after_sales_list/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            this.records = res.data.data;
          }
        }
      });
    },
    getStatusText(status) {
      const map = {
        'pending': '审核中',
        'approved': '处理中',
        'completed': '已完成',
        'rejected': '已拒绝'
      };
      return map[status] || '未知状态';
    },
    formatTime(dateStr) {
      const date = new Date(dateStr);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  }
}
</script>

<style>
.container { background-color: #f5f7fa; min-height: 100vh; padding: 15px; }
.record-card { background-color: #fff; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.card-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f9f9f9; padding-bottom: 12px; margin-bottom: 12px; }
.order-no { font-size: 13px; color: #666; }
.status-tag { font-size: 12px; font-weight: bold; padding: 3px 8px; border-radius: 4px; }
.status-tag.pending { background-color: #fff4f0; color: #ff5000; }
.status-tag.approved { background-color: #e6f7ff; color: #007aff; }
.status-tag.completed { background-color: #f6ffed; color: #52c41a; }
.status-tag.rejected { background-color: #f5f5f5; color: #999; }

.info-row { display: flex; margin-bottom: 8px; font-size: 13px; }
.label { color: #999; width: 70px; }
.value { color: #333; flex: 1; }
.highlight { font-weight: bold; color: #ff5000; }
.text-ellipsis { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }

.card-footer { margin-top: 10px; padding-top: 10px; border-top: 1px dashed #eee; }
.tip { font-size: 12px; color: #ff5000; }
.tip.success { color: #007aff; }
.empty-state { text-align: center; padding-top: 100px; color: #999; font-size: 14px; }
</style>