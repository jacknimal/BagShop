<template>
  <view class="culture-container">
    
    <swiper class="hero-swiper" autoplay circular interval="4000" duration="1000">
      <swiper-item v-for="(item, index) in swiperList" :key="index" @click="goToDetail(item.type)">
        <image class="hero-img" :src="item.img" mode="aspectFill"></image>
        <view class="hero-mask">
          <text class="hero-title">{{ item.title }}</text>
          <text class="hero-subtitle">{{ item.subtitle }}</text>
          <view class="hero-btn">品牌故事</view>
        </view>
      </swiper-item>
    </swiper>

    <view class="marquee-box">
      <view class="marquee-content">
        <view class="marquee-group">
          <text class="marquee-text">ART OF BAGS · 与你"箱"伴，"包"你满意</text>
          <text class="marquee-text">ART OF BAGS · 与你"箱"伴，"包"你满意</text>
          <text class="marquee-text">ART OF BAGS · 与你"箱"伴，"包"你满意</text>
        </view>
        <view class="marquee-group">
          <text class="marquee-text">ART OF BAGS · 与你"箱"伴，"包"你满意</text>
          <text class="marquee-text">ART OF BAGS · 与你"箱"伴，"包"你满意</text>
          <text class="marquee-text">ART OF BAGS · 与你"箱"伴，"包"你满意</text>
        </view>
      </view>
    </view>

    <view class="brand-card" @click="goToDetail('brand')">
      <view class="brand-header">
        <text class="section-title">ABOUT US</text>
        <text class="section-subtitle">关于本站</text>
      </view>
      <text class="brand-desc">我们致力于寻找优质的皮料与精湛的工艺，为您提供不仅仅是收纳工具，更是表达个性的时尚单品。从经典复刻到现代DIY，每一款箱包都承载着独特的故事...</text>
      <view class="read-more">阅读品牌故事 <text class="arrow">→</text></view>
    </view>

    <view class="culture-grid">
      <view class="grid-header">
        <text class="section-title">EXPLORE</text>
        <text class="section-subtitle">探索视界</text>
      </view>

      <view class="grid-layout">
        <view class="grid-left" @click="goToDetail('history')">
          <image class="grid-img" src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=600&auto=format&fit=crop" mode="aspectFill"></image>
          <view class="grid-content dark-mask">
            <text class="g-title">百年演变简史</text>
            <text class="g-sub">从行李箱到晚宴包</text>
          </view>
        </view>

        <view class="grid-right">
          <view class="grid-item-small" @click="goToDetail('material')">
            <image class="grid-img" src="/static/culture/caizhi.jpg"></image>
            <view class="grid-content light-mask">
              <text class="g-title dark-text">材质百科</text>
              <text class="g-sub dark-text">如何辨别头层牛皮</text>
            </view>
          </view>
          
          <view class="grid-item-small" @click="goToDetail('care')">
            <image class="grid-img" src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=400&auto=format&fit=crop" mode="aspectFill"></image>
            <view class="grid-content dark-mask">
              <text class="g-title">日常洗护</text>
              <text class="g-sub">让爱包历久弥新</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="footer-tip">- 匠心之作 · 经典永恒 -</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      swiperList: [
        {
          img: '/static/culture/ARTOFBAG.jpg',
          title: 'ART OF BAGS',
          subtitle: '与你"箱"伴，"包"你满意',
          type: 'brand'
        },
        {
          img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800',
          title: 'ART OF BAGS',
          subtitle: '与你"箱"伴，"包"你满意',
          type: 'brand'
        },
        {
          img: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?q=80&w=800',
          title: 'ART OF BAGS',
          subtitle: '与你"箱"伴，"包"你满意',
          type: 'brand'
        }
      ]
    }
  },
  methods: {
    goToDetail(type) {
      uni.navigateTo({
        url: `/pages/culture/culture_detail?type=${type}`
      });
    }
  }
}
</script>

<style>
.culture-container { background-color: #fafafa; min-height: 100vh; padding-bottom: 40px; overflow-x: hidden;}

/* 1. 动态轮播图样式 */
.hero-swiper { width: 100%; height: 320px; }
.hero-img { width: 100%; height: 100%; }
.hero-mask { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; justify-content: center; align-items: center;}
.hero-title { color: #fff; font-size: 36px; font-weight: 900; letter-spacing: 4px; font-family: serif; margin-bottom: 10px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);}
.hero-subtitle { color: #eee; font-size: 14px; letter-spacing: 2px; margin-bottom: 20px;}
.hero-btn { border: 1px solid #fff; color: #fff; font-size: 12px; padding: 6px 20px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; backdrop-filter: blur(4px);}

/* 🌟 2. 核心修改：无缝滚动标语 (完美单行不换行方案) */
.marquee-box { 
  background: #111; 
  padding: 12px 0; 
  overflow: hidden; 
  width: 100%; 
  white-space: nowrap; /* 核心1：强制整个外层绝对不允许换行 */
}

.marquee-content { 
  display: inline-block; 
  white-space: nowrap; /* 核心2：动画容器也强制单行 */
  animation: marquee 15s linear infinite; 
}

.marquee-group { 
  display: inline-block; /* 核心3：两组文字像行内元素一样左右平齐拼接 */
}

.marquee-text { 
  display: inline-block; 
  color: #fff; 
  font-size: 13px; 
  letter-spacing: 2px; 
  padding-right: 40px; 
  opacity: 0.9;
}

/* 关键点：滑动到 -50% 时瞬间跳回 0，由于两组内容一模一样，肉眼看不出破绽 */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } 
}

/* 关键点：滑动到 -50% 时瞬间跳回 0，由于两组内容一模一样，肉眼看不出破绽 */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); } 
}

/* 标题公共样式 */
.section-title { font-size: 20px; font-weight: 900; color: #333; font-family: serif; display: block;}
.section-subtitle { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; display: block;}

/* 3. 品牌卡片 */
.brand-card { background: #fff; margin: 30px 20px; border-radius: 12px; padding: 25px 20px; position: relative; box-shadow: 0 10px 30px rgba(0,0,0,0.05); transition: transform 0.2s;}
.brand-card:active { transform: scale(0.98); }
.brand-header { margin-bottom: 15px; border-left: 3px solid #ff5000; padding-left: 10px;}
.brand-desc { font-size: 14px; color: #555; line-height: 1.8; display: block; margin-bottom: 20px;}
.read-more { font-size: 13px; font-weight: bold; color: #ff5000; display: flex; align-items: center;}
.read-more .arrow { margin-left: 5px; font-size: 16px; transition: transform 0.3s;}
.brand-card:active .arrow { transform: translateX(5px); }

/* 4. 网格布局 */
.culture-grid { padding: 0 20px;}
.grid-header { margin-bottom: 20px; text-align: center;}
.grid-layout { display: flex; height: 320px; gap: 12px;}

.grid-left { flex: 1.2; border-radius: 12px; overflow: hidden; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.2s;}
.grid-right { flex: 1; display: flex; flex-direction: column; gap: 12px; }
.grid-item-small { flex: 1; border-radius: 12px; overflow: hidden; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: transform 0.2s;}

.grid-left:active, .grid-item-small:active { transform: scale(0.97); }

.grid-img { width: 100%; height: 100%; position: absolute; top: 0; left: 0;}
.grid-content { position: absolute; bottom: 0; left: 0; width: 100%; padding: 15px; box-sizing: border-box; display: flex; flex-direction: column;}
.dark-mask { background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: #fff;}
.light-mask { background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0)); color: #333;}

.g-title { font-size: 16px; font-weight: bold; margin-bottom: 4px; text-shadow: 0 1px 4px rgba(0,0,0,0.2);}
.g-sub { font-size: 11px; opacity: 0.9;}
.dark-text { color: #333; text-shadow: none;}

.footer-tip { text-align: center; color: #ccc; font-size: 12px; margin-top: 40px; letter-spacing: 2px;}
</style>