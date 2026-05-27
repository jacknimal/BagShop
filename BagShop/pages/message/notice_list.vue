<template>
  <view class="notice-container">
    <view class="notice-list" v-if="listData.length > 0">
      <view class="notice-item" v-for="item in listData" :key="item.id">
        <image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
        <view class="notice-content">
          <view class="top-line">
            <text class="user-name">{{ item.sender }}</text>
            <text class="time">{{ item.time }}</text>
          </view>
          
          <text class="action-text" v-if="type === 'like'">❤️ 赞了你的笔记</text>
          
          <text class="action-text" v-if="type === 'comment'">💬 评论了你: {{ item.content }}</text>
          
          <view class="post-ref">
            <text class="post-title">@你的笔记: {{ item.post_title }}</text>
          </view>
        </view>
      </view>
    </view>
    <view class="empty-state" v-else>暂无相关通知~</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      type: 'like',
      listData: []
    }
  },
  onLoad(options) {
    this.type = options.type || 'like';
    uni.setNavigationBarTitle({ title: this.type === 'like' ? '收到的赞' : '收到的评论' });
    this.fetchList();
  },
  methods: {
    fetchList() {
      const token = uni.getStorageSync('token');
      if (!token) return;
      
      // 核心修复：点进来时实时请求数据库，获取永久保留的历史记录！
      uni.request({
        url: `http://127.0.0.1:8000/api/community/notice/list/?type=${this.type}`,
        method: 'GET',
        header: { 'Authorization': 'Token ' + token },
        success: (res) => {
          if (res.data.code === 200) {
            this.listData = res.data.data;
          }
        }
      });
    }
  }
}
</script>

<style>
.notice-container { background-color: #f5f7fa; min-height: 100vh; padding: 10px; }
.notice-item { display: flex; background: #fff; padding: 15px; border-radius: 12px; margin-bottom: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.02);}
.avatar { width: 44px; height: 44px; border-radius: 50%; margin-right: 12px; background: #eee; flex-shrink: 0;}
.notice-content { flex: 1; }
.top-line { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;}
.user-name { font-size: 15px; font-weight: bold; color: #333; }
.time { font-size: 11px; color: #999; }
.action-text { font-size: 14px; color: #333; margin-bottom: 8px; display: block;}
.post-ref { background: #f5f5f5; padding: 8px 10px; border-radius: 6px; border-left: 3px solid #ccc;}
.post-title { font-size: 12px; color: #666; }
.empty-state { text-align: center; color: #999; padding-top: 100px; font-size: 14px; }
</style>