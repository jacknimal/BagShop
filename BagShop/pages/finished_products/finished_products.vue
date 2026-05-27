<template>
  <view class="finished-container">
    <view class="finished-list" v-if="finishedList.length > 0">
      <view class="finished-item" v-for="item in finishedList" :key="item.id">
        <view class="item-header">
          <text class="time">提交于: {{ item.created_at }}</text>
          <text class="status-tag" :class="item.status">{{ item.status_display }}</text>
        </view>
        
        <view class="item-content">
          <image class="goods-img" :src="item.product.image_url || '/static/logo.png'" mode="aspectFit"></image>
          <view class="goods-info">
            <text class="goods-name">{{ item.product.name }}</text>
            <view class="diy-summary">
              <text v-if="item.diy_data.selections.material">面料: {{ item.diy_data.selections.material.name }}</text>
              <text v-if="item.diy_data.monogram_text">刻字: {{ item.diy_data.monogram_text }}</text>
            </view>
            <text class="price">定制价: ￥{{ item.diy_data.price }}</text>
          </view>
        </view>

        <view class="feedback-box" v-if="item.admin_feedback">
          <text class="feedback-label">商家留言:</text>
          <text class="feedback-text">{{ item.admin_feedback }}</text>
        </view>

        <view class="item-footer">
          <button class="action-btn delete" size="mini" @click="handleDelete(item.id)">移除</button>
          
          <button class="action-btn share" size="mini" @click="shareToCommunity(item)">一键分享</button>
          
          <button 
            v-if="item.status === 'approved'" 
            class="action-btn cart" 
            size="mini" 
            @click="addToCart(item.id)"
          >立即订购 (加购)</button>
          
          <button 
            v-if="item.status === 'rejected'" 
            class="action-btn modify" 
            size="mini" 
            @click="reModify(item)"
          >修改设计</button>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <image class="empty-img" src="/static/logo.png" mode="aspectFit"></image>
      <text>成品库还是空的，快去设计你的专属作品吧~</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      finishedList: []
    }
  },
  onShow() {
    this.fetchFinishedList();
  },
  methods: {
    fetchFinishedList() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      uni.request({
        url: 'http://127.0.0.1:8000/api/diy/finished/list/',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) this.finishedList = res.data.data;
        }
      });
    },
    addToCart(id) {
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/diy/finished/to_cart/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { finished_id: id },
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({ title: '已加入购物车', icon: 'success' });
            setTimeout(() => uni.switchTab({ url: '/pages/cart/cart' }), 1000);
          }
        }
      });
    },
    handleDelete(id) {
      uni.showModal({
        title: '提示',
        content: '确定移除该成品记录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.request({
              url: 'http://127.0.0.1:8000/api/diy/finished/delete/',
              method: 'POST',
              header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
              data: { finished_id: id },
              success: () => {
                uni.showToast({ title: '已移除' });
                this.fetchFinishedList();
              }
            });
          }
        }
      });
    },
    reModify(item) {
      const safeUrl = encodeURIComponent(item.product.image_url || '');
      uni.navigateTo({
        url: `/pages/diy_detail/diy_detail?id=${item.product.id}&name=${item.product.name}&price=${item.product.price}&image_url=${safeUrl}`
      });
    },
    // 一键分享到 DIY 社区的核心逻辑
    shareToCommunity(item) {
      uni.showModal({
        title: '分享到社区',
        content: '将把该款定制的参数和图片作为笔记发布到社区，是否继续？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '发布中...' });
            
            let contentStr = `我刚刚设计了一款超棒的【${item.product.name}】！\n\n`;
            const sels = item.diy_data.selections;
            
            // 🌟 封面大图永远固定为底包主图，保持社区美观
            const shareImageUrl = item.product.image_url; 
            
            if (sels.material && sels.material.name) contentStr += `✨ 材质: ${sels.material.name}\n`;
            if (sels.color && sels.color.name) contentStr += `🎨 颜色: ${sels.color.name}\n`;
            
            // 🌟 如果是用户上传的图片，将真实图片地址放在冒号后面
            if (sels.theme && sels.theme.name) {
              if (sels.theme.name === '我的上传') {
                contentStr += `🖼️ 图案: ${sels.theme.value}\n`;
              } else {
                contentStr += `🖼️ 图案: ${sels.theme.name}\n`;
              }
            }
            
            if (sels.lining && sels.lining.name) {
              if (sels.lining.name === '我的上传') {
                contentStr += `👜 内衬: ${sels.lining.value}\n`;
              } else {
                contentStr += `👜 内衬: ${sels.lining.name}\n`;
              }
            }
            
            if (sels.hardware && sels.hardware.name) contentStr += `🔗 五金: ${sels.hardware.name}\n`;
            if (sels.size && sels.size.name) contentStr += `📏 尺寸: ${sels.size.name}\n`;
            if (item.diy_data.monogram_text) contentStr += `🖋️ 专属刻字: ${item.diy_data.monogram_text}\n`;
            
            contentStr += `\n大家觉得我的眼光怎么样？快来抄作业啦！`;

            // 调用社区发布接口
            uni.request({
              url: 'http://127.0.0.1:8000/api/community/post/create/',
              method: 'POST',
              header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
              data: {
                title: `分享我的专属定制：${item.product.name}`,
                content: contentStr,
                image_url: shareImageUrl // 🌟 发送固定的大封面底包图
              },
              success: (res) => {
                uni.hideLoading();
                if (res.data.code === 200) {
                  uni.showToast({ title: '已成功发布到社区！', icon: 'success' });
                } else {
                  uni.showToast({ title: res.data.msg || '发布失败', icon: 'none' });
                }
              },
              fail: () => {
                uni.hideLoading();
                uni.showToast({ title: '网络请求失败', icon: 'none' });
              }
            });
          }
        }
      });
    }
  }
}
</script>

<style lang="scss">
.finished-container { min-height: 100vh; background: #fcfcfe; padding: 30rpx; }
.finished-item { 
  background: #fff; border-radius: 24rpx; padding: 30rpx; margin-bottom: 30rpx;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.02); border: 1.5rpx solid #eee;
}
.item-header { 
  display: flex; justify-content: space-between; border-bottom: 1.5rpx dashed #eee;
  padding-bottom: 20rpx; margin-bottom: 25rpx;
  .time { font-size: 22rpx; color: #aaa; }
  .status-tag { 
    font-size: 22rpx; padding: 4rpx 16rpx; border-radius: 8rpx; font-weight: bold;
    &.pending { background: #fff7e6; color: #ffa940; }
    &.approved { background: #f6ffed; color: #52c41a; }
    &.rejected { background: #fff1f0; color: #ff4d4f; }
  }
}
.item-content { 
  display: flex; align-items: center;
  .goods-img { width: 140rpx; height: 140rpx; border-radius: 16rpx; background: #fff9e6; margin-right: 25rpx;}
  .goods-info {
    flex: 1;
    .goods-name { font-size: 28rpx; font-weight: bold; color: #333; display: block; margin-bottom: 10rpx;}
    .diy-summary { font-size: 22rpx; color: #999; margin-bottom: 10rpx;}
    .price { font-size: 26rpx; color: #ff8e7e; font-weight: 900; }
  }
}
.feedback-box { 
  margin-top: 20rpx; background: #f9f9f9; padding: 15rpx; border-radius: 12rpx;
  .feedback-label { font-size: 20rpx; color: #999; margin-right: 10rpx;}
  .feedback-text { font-size: 22rpx; color: #666; }
}
.item-footer { 
  display: flex; justify-content: flex-end; gap: 15rpx; margin-top: 30rpx; flex-wrap: wrap;
  .action-btn { 
    margin: 0; border-radius: 40rpx; border: none; font-size: 24rpx; font-weight: bold; padding: 0 25rpx;
    &.delete { background: #f5f5f5; color: #999; }
    
    &.share { background: #fff4e6; color: #ff8c00; border: 1px solid #ffeed4; }
    
    &.cart { background: #ff8e7e; color: #fff; box-shadow: 0 4rpx 15rpx rgba(255,142,126,0.2);}
    &.modify { background: #eef6ff; color: #4a90e2; }
  }
}
.empty-state { text-align: center; padding-top: 200rpx; color: #ccc; font-size: 26rpx; .empty-img { width: 200rpx; height: 200rpx; margin-bottom: 30rpx; opacity: 0.5; } }
</style>