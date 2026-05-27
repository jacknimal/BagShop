<template>
  <view class="home-container">
    <view class="search-header">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input 
          class="search-input" 
          type="text" 
          v-model="searchKeyword" 
          placeholder="搜索你喜欢的箱包或图案..." 
          confirm-type="search"
          @confirm="handleSearch"
        />
        <view class="search-btn" @click="handleSearch">搜索</view>
      </view>
    </view>

    <view class="grid-menu">
      <view class="grid-item" v-for="(item, index) in gridList" :key="index" @click="handleGridClick(item.name)">
        <view class="icon-circle" :style="{ background: item.color }">
          <text class="grid-icon">{{ item.icon }}</text>
        </view>
        <text class="grid-text">{{ item.name }}</text>
      </view>
    </view>

    <view class="notice-bar">
      <view class="notice-tag">商城头条</view>
      <swiper class="notice-swiper" vertical autoplay circular interval="3000">
        <swiper-item v-for="(msg, i) in noticeList" :key="i" class="notice-swiper-item" @click="handleNoticeClick(msg)">
          <text class="notice-text">{{ msg.title }}</text>
        </swiper-item>
      </swiper>
    </view>

    <scroll-view class="category-scroll" scroll-x="true">
      <view class="category-list">
        <view 
          class="category-item" 
          :class="{ active: currentCategoryId === null }" 
          @click="switchCategory(null)"
        >全部推荐</view>
        
        <view 
          class="category-item" 
          :class="{ active: currentCategoryId === item.id }" 
          v-for="item in categoryList" 
          :key="item.id"
          @click="switchCategory(item.id)"
        >{{ item.name }}</view>
      </view>
    </scroll-view>

    <view class="goods-list" v-if="bagList.length > 0">
      <view class="goods-item" v-for="(item, index) in bagList" :key="index" @click="goToDetail(item.id)">
        
        <view class="img-box">
          <image class="goods-img" :src="item.image_url || '/static/logo.png'" mode="aspectFill"></image>
        </view>
        
        <view class="goods-info">
          <text class="goods-name">
            <text class="diy-tag" v-if="item.is_diy !== false">可定制</text>
            {{ item.name }}
          </text>
          
          <view class="goods-bottom">
            <view class="price-box">
              <text class="price-symbol">￥</text>
              <text class="price-num">{{ item.price }}</text>
            </view>
            <text class="sales-text">已售 100+</text>
          </view>
        </view>

      </view>
    </view>
    
    <view class="empty-tip" v-else>
      <text>没有找到相关箱包哦~</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      bagList: [],
      categoryList: [], 
      currentCategoryId: null, 
      searchKeyword: '',
      
      gridList: [
        { name: '箱包文化', icon: '🏛️', color: 'linear-gradient(135deg, #FF9A9E, #FECFEF)' },
        { name: 'DIY社区', icon: '💬', color: 'linear-gradient(135deg, #84FAB0, #8FD3F4)' },
        { name: '领券中心', icon: '🎟️', color: 'linear-gradient(135deg, #FFD194, #70E1F5)' },
        { name: '定制指南', icon: '✨', color: 'linear-gradient(135deg, #A18CD1, #FBC2EB)' },
        { name: '新品首发', icon: '🔥', color: 'linear-gradient(135deg, #ff0844, #ffb199)' }
      ],
      // 🌟 修改点 2：清空原有的静态假数据，准备接收后端返回的对象数组
      noticeList: [] 
    }
  },
  onLoad() {
    this.getCategories(); 
    this.getProducts();   
  },
  // 🌟 修改点 3：利用 onShow 生命周期，每次用户切回首页时，都能静默获取最新的头条公告
  onShow() {
    this.getNotices();
  },
  methods: {
    // 🌟 修改点 4：新增向后端拉取实时商城头条的接口请求方法
    getNotices() {
      uni.request({
        url: 'http://127.0.0.1:8000/api/headlines/',
        method: 'GET',
        success: (res) => {
          if (res.data.code === 200) {
            this.noticeList = res.data.data;
          }
        }
      });
    },

    // 🌟 修改点 5：新增点击头条公告弹出详细内容的交互逻辑
    // 🌟 替换：点击头条公告不再弹窗，而是存入缓存并跳去图文落地页
    handleNoticeClick(msg) {
      // 把当前这条头条的数据存起来，给 headline_detail 页面用
      uni.setStorageSync('currentHeadline', msg);
      uni.navigateTo({
        url: '/pages/index/headline_detail'
      });
    },

    getCategories() {
      uni.request({
        url: 'http://127.0.0.1:8000/api/categories/',
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            this.categoryList = res.data;
          }
        }
      });
    },

    getProducts() {
      uni.request({
        url: 'http://127.0.0.1:8000/api/products/', 
        method: 'GET',
        data: {
          category_id: this.currentCategoryId || '',
          keyword: this.searchKeyword || ''
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.bagList = res.data; 
          }
        }
      });
    },

    switchCategory(id) {
      this.currentCategoryId = id; 
      this.searchKeyword = '';     
      this.getProducts();          
    },

    handleSearch() {
      this.currentCategoryId = null; 
      this.getProducts();            
    },

    goToDetail(productId) {
      uni.navigateTo({
        url: `/pages/product_detail/product_detail?id=${productId}`
      });
    },
    
    handleGridClick(name) {
      if (name === 'DIY社区') {
        uni.navigateTo({ url: '/pages/community/community' });
      } else if (name === '领券中心') {
        uni.navigateTo({ url: '/pages/coupon/coupon_center' });
      } else if (name === '箱包文化') {
        // 🌟 新增：跳转到箱包文化主页
        uni.navigateTo({ url: '/pages/culture/culture_index' });
      } else if (name === '定制指南') {
    // 🌟 加上这个跳转
		uni.navigateTo({ url: '/pages/guide/diy_guide' });
	  } else if (name === '新品首发') {
        // 🌟 核心修复：加上新品首发的跳转路径
        uni.navigateTo({ url: '/pages/product/new_arrivals' });
      } else {
        uni.showToast({ title: `${name} 板块开发中...`, icon: 'none' });
      }
    }
  }
}
</script>

<style>
.home-container { 
  background-color: #f8f9fb; 
  min-height: 100vh; 
  padding-bottom: 20px;
}

/* 1. 搜索框 */
.search-header { 
  background-color: #ffffff; 
  padding: 10px 15px; 
  position: sticky; 
  top: 0; 
  z-index: 99;
}

.search-box { 
  /* 🌟 修改：背景设为白色，增加橙色边框 */
  background-color: #ffffff; 
  border: 1.5px solid #ff5000; 
  /* 🌟 保持原有大小：高度 36px */
  height: 36px; 
  border-radius: 18px; 
  display: flex; 
  align-items: center; 
  padding-left: 15px; 
  /* 🌟 核心：隐藏溢出，确保右侧按钮贴合圆角且不超出宽度 */
  overflow: hidden; 
  box-sizing: border-box; 
}

.search-icon { 
  margin-right: 8px; 
  font-size: 14px;
  color: #999;
}

.search-input { 
  flex: 1; 
  height: 100%; 
  font-size: 12px; /* 输入文字稍微调小一点，腾出空间 */
  background: transparent; 
}

/* 🌟 新增：橙底白字搜索按钮样式 */
.search-btn {
  width: 54px; /* 固定宽度，不影响搜索框总长 */
  height: 100%;
  background-color: #ff5000; 
  color: #ffffff; 
  display: flex;
  align-items: center;
  justify-content: center;
  /* 🌟 按照要求：字体小一些 */
  font-size: 12px; 
  font-weight: bold;
}

.search-btn:active {
  opacity: 0.8; /* 点击时的反馈效果 */
}

/* 2. 金刚区 (五个图标并排) */
.grid-menu { display: flex; justify-content: space-around; background-color: #fff; padding: 20px 10px 15px; margin-bottom: 10px;}
.grid-item { display: flex; flex-direction: column; align-items: center; }
.icon-circle { width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center; margin-bottom: 6px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);}
.grid-icon { font-size: 22px; }
.grid-text { font-size: 12px; color: #333; font-weight: 500;}

/* 3. 商城头条滚动条 */
.notice-bar { 
  display: flex; 
  align-items: center; 
  /* 🌟 修改点：换成浅橘色或浅黄色背景，增加细微边框 */
  background-color: #fff7e8; 
  border: 1px solid #ffebcc;
  padding: 10px 15px; 
  margin: 0 10px 15px; 
  border-radius: 8px; 
  box-shadow: 0 4px 12px rgba(255, 144, 0, 0.08); /* 调整投影颜色更统一 */
}
.notice-tag { background: linear-gradient(90deg, #ff5000, #ff9000); color: #fff; font-size: 11px; font-weight: bold; padding: 3px 6px; border-radius: 4px; margin-right: 10px; font-style: italic;}
.notice-swiper { flex: 1; height: 20px; }
.notice-swiper-item { display: flex; align-items: center; }
.notice-text { 
  font-size: 12px; 
  /* 🌟 修改点：颜色加深，比如深咖色或纯黑 */
  color: #8a5d19; 
  font-weight: 500; /* 稍微加粗一点 */
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap; 
}

/* 4. 分类横向滚动 */
.category-scroll { width: 100%; white-space: nowrap; padding: 5px 0 15px; }
.category-list { display: inline-block; padding: 0 10px; }
.category-item { display: inline-block; padding: 6px 18px; margin: 0 6px; background-color: #fff; border-radius: 20px; font-size: 13px; color: #666; border: 1px solid #eee; transition: all 0.2s;}
.category-item.active { background-color: #007aff; color: white; font-weight: bold; border-color: #007aff;}

/* ================= 5. 大厂级商品列表优化 ================= */
.goods-list { 
  display: flex; 
  flex-wrap: wrap; 
  padding: 0 10px; 
  justify-content: space-between; 
}

.goods-item { 
  width: 48.5%; 
  background-color: #ffffff; 
  margin-bottom: 12px; 
  border-radius: 8px; 
  overflow: hidden; 
  box-shadow: 0 2px 6px rgba(0,0,0,0.04); 
  padding-bottom: 10px; 
}

/* 完美 1:1 正方形占位 */
.img-box {
  width: 100%;
  padding-top: 100%; 
  position: relative;
  background-color: #f9f9f9;
}
.goods-img { 
  position: absolute;
  top: 0;
  left: 0;
  width: 100%; 
  height: 100%; 
}

.goods-info { 
  padding: 8px 10px 0; 
}

.goods-name { 
  font-size: 13px; 
  color: #333; 
  line-height: 1.4; 
  height: 36px; 
  display: -webkit-box; 
  -webkit-box-orient: vertical; 
  -webkit-line-clamp: 2; 
  overflow: hidden; 
  margin-bottom: 6px; 
}

/* 营销小标签 */
.diy-tag {
  font-size: 10px;
  color: #fff;
  background: linear-gradient(90deg, #ff5000, #ff9000);
  padding: 1px 4px;
  border-radius: 4px;
  margin-right: 4px;
  vertical-align: 1px;
}

.goods-bottom { 
  display: flex; 
  justify-content: space-between; 
  align-items: baseline; 
  margin-top: 4px;
}

/* 价格排版：小符号，大数字 */
.price-box {
  color: #ff5000;
}
.price-symbol {
  font-size: 11px;
  font-weight: bold;
}
.price-num {
  font-size: 17px;
  font-weight: bold;
}

/* 弱化的灰色提示文字 */
.sales-text {
  font-size: 11px;
  color: #999;
}

.empty-tip { text-align: center; padding: 50px 0; color: #999; font-size: 14px; }
</style>