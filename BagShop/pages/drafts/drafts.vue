<template>
  <view class="drafts-container">
    <view class="draft-list" v-if="draftList.length > 0">
      <view class="draft-item" v-for="item in draftList" :key="item.id">
        <view class="draft-header">
          <text class="time">保存时间: {{ formatTime(item.updated_at) }}</text>
        </view>
        
        <view class="draft-content">
          <image class="goods-img" :src="item.product.image_url || '/static/logo.png'" mode="aspectFit"></image>
          
          <view class="goods-info">
            <text class="goods-name">{{ item.product.name }}</text>
            <view class="diy-tags">
              <text class="tag" v-if="item.diy_data && item.diy_data.selections && item.diy_data.selections.theme">
                主题: {{ item.diy_data.selections.theme.name }}
              </text>
              <text class="tag" v-if="item.diy_data && item.diy_data.selections && item.diy_data.selections.color">
                颜色: {{ item.diy_data.selections.color.name }}
              </text>
              <text class="tag" v-if="item.diy_data && item.diy_data.selections && item.diy_data.selections.material">
                面料: {{ item.diy_data.selections.material.name }}
              </text>
              <text class="tag" v-if="item.diy_data && item.diy_data.monogram_text">
                刻字: {{ item.diy_data.monogram_text }}
              </text>
            </view>
            <text class="draft-price" v-if="item.diy_data && item.diy_data.price">预计预算: ￥{{ item.diy_data.price }}</text>
          </view>
        </view>

        <view class="draft-footer">
          <button class="delete-btn" size="mini" @click="deleteDraft(item.id)">删除</button>
          <button class="continue-btn" size="mini" @click="continueDiy(item.product.id, item.product.name, item.product.price, item.product.image_url)">继续创作</button>
        </view>
      </view>
    </view>
    
    <view class="empty-state" v-else>
      <text>草稿箱空空如也，快去挥洒创意吧~</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      draftList: []
    }
  },
  onShow() {
    this.getDrafts();
  },
  methods: {
    getDrafts() {
      const token = uni.getStorageSync('token');
      if (!token) return;

      uni.request({
        url: 'http://127.0.0.1:8000/api/diy/drafts/',
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            this.draftList = res.data.data;
          }
        }
      });
    },
    // 🌟 核心修改 3：接收 image_url 并进行安全编码后传递给工作室
    continueDiy(id, name, price, image_url) {
      const safeImageUrl = encodeURIComponent(image_url || '');
      uni.navigateTo({
        url: `/pages/diy_detail/diy_detail?id=${id}&name=${name}&price=${price}&image_url=${safeImageUrl}`
      });
    },
    formatTime(dateString) {
      const date = new Date(dateString);
      return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    },
    deleteDraft(draftId) {
      uni.showModal({
        title: '删除确认',
        content: '确定要删除这份草稿吗？删除后无法恢复。',
        confirmColor: '#ff8e7e', // 改为可爱的珊瑚色
        success: (res) => {
          if (res.confirm) {
            const token = uni.getStorageSync('token');
            uni.request({
              url: 'http://127.0.0.1:8000/api/diy/draft/delete/',
              method: 'POST',
              header: { 'Authorization': 'Token ' + token },
              data: { draft_id: draftId },
              success: (response) => {
                if (response.data.code === 200) {
                  uni.showToast({ title: '已删除', icon: 'success' });
                  this.getDrafts(); 
                } else {
                  uni.showToast({ title: response.data.msg, icon: 'none' });
                }
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
/* 整体背景融入奶油可爱风 */
.drafts-container { padding: 15px; background-color: #fcfcfe; min-height: 100vh; }
.draft-item { background-color: #fff; border-radius: 16px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f5f5f5;}
.draft-header { border-bottom: 1px dashed #f0f0f0; padding-bottom: 10px; margin-bottom: 15px;}
.time { font-size: 12px; color: #aaa; }
.draft-content { display: flex; align-items: center; }
.goods-img { width: 85px; height: 85px; background-color: #fff9e6; border-radius: 12px; margin-right: 15px; border: 1px solid #fff3d4; }
.goods-info { flex: 1; }
.goods-name { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 8px; display: block;}
.diy-tags { display: flex; flex-wrap: wrap; margin-bottom: 8px;}
.tag { font-size: 11px; color: #ff8e7e; background-color: #fff0ed; padding: 4px 8px; border-radius: 6px; margin-right: 6px; margin-bottom: 6px; font-weight: bold;}
.draft-price { color: #ff8e7e; font-weight: bold; font-size: 14px; display: block; margin-top: 4px;}
.draft-footer { border-top: 1px dashed #f0f0f0; padding-top: 12px; margin-top: 12px; display: flex; justify-content: flex-end;}
.continue-btn { background-color: #ff8e7e; color: #fff; border-radius: 20px; margin: 0; font-size: 12px; padding: 0 15px; box-shadow: 0 4px 10px rgba(255,142,126,0.3);}
.empty-state { text-align: center; padding-top: 100px; color: #ccc; font-size: 13px;}
.delete-btn { background-color: #f9f9f9; color: #999; border-radius: 20px; margin: 0 10px 0 0; font-size: 12px; padding: 0 15px;}
.delete-btn::after { border: none; }
</style>