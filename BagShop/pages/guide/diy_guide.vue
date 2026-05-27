<template>
  <view class="guide-container">
    <view class="hero-section">
      <image class="hero-bg" src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800&auto=format&fit=crop" mode="aspectFill"></image>
      <view class="hero-overlay">
        <text class="hero-title">专属定制指南</text>
        <text class="hero-subtitle">4步解锁你的灵感，设计独一无二的梦中情包</text>
      </view>
    </view>

    <view class="section-container">
      <view class="section-header">
        <text class="section-title">HOW TO DESIGN</text>
        <text class="section-desc">定制流程</text>
      </view>

      <view class="step-list">
        <view class="step-item" v-for="(step, index) in stepList" :key="index">
          <view class="step-left">
            <view class="step-number">0{{ index + 1 }}</view>
            <view class="step-line" v-if="index !== stepList.length - 1"></view>
          </view>
          <view class="step-right">
            <image class="step-img" :src="step.image" mode="aspectFill"></image>
            <view class="step-text-box">
              <text class="step-title">{{ step.title }}</text>
              <text class="step-desc">{{ step.desc }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section-container tips-bg">
      <view class="section-header">
        <text class="section-title">DESIGN TIPS</text>
        <text class="section-desc">美学建议</text>
      </view>
      
      <view class="tips-grid">
        <view class="tip-card" v-for="(tip, index) in tipsList" :key="index">
          <text class="tip-icon">{{ tip.icon }}</text>
          <text class="tip-title">{{ tip.title }}</text>
          <text class="tip-desc">{{ tip.desc }}</text>
        </view>
      </view>
    </view>

    <view class="bottom-action">
      <button class="start-btn ai-btn" @click="goToAIChat">
        <text class="sparkle">✨</text>
        咨询小包，为您提供AI定制建议
      </button>
    </view>
    
    <view class="safe-area-bottom"></view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      stepList: [
        {
          title: '挑选基础包型',
          desc: '从经典的托特包、水桶包到复古剑桥包，选择最契合你日常穿搭的基础版型。',
          image: '/static/guide/种类.jpg'
        },
        {
          title: '甄选优质材质与色彩',
          desc: '无论是细腻的头层牛皮，还是环保轻便的纯棉帆布，数十种色彩随心搭配。',
          image: '/static/guide/color.jpg'
        },
        {
          title: '挥洒创意，自由排版',
          desc: '在包身添加专属图案、趣味贴纸或高定五金配件，拖拽缩放，所见即所得。',
          image: '/static/guide/排版.jpg'
        },
        {
          title: '专属印记镌刻',
          desc: '最后，烫印上你的名字缩写或专属纪念日，让它成为世上绝无仅有的存在。',
          image: '/static/guide/印记.jpg'
        }
      ],
      tipsList: [
        { icon: '🎨', title: '色彩法则', desc: '同色系搭配显高级，撞色搭配更具个性吸睛。' },
        { icon: '✨', title: '材质碰撞', desc: '帆布包身拼接牛皮手柄，复古且兼具耐用性。' },
        { icon: '📐', title: '留白艺术', desc: '图案不宜过满，适当的留白能提升整体质感。' },
        { icon: '💎', title: '点睛之笔', desc: '一个亮色的金属挂件，就能点亮沉闷的穿搭。' }
      ]
    }
  },
  methods: {
    // 🌟 跳转到 AI 聊天室
    goToAIChat() {
      uni.navigateTo({
        url: '/pages/guide/ai_chat' 
      });
    }
  }
}
</script>

<style>
.guide-container { background-color: #ffffff; min-height: 100vh; padding-bottom: 90px; }

/* 1. 顶部 Hero 区 */
.hero-section { position: relative; width: 100%; height: 300px; }
.hero-bg { width: 100%; height: 100%; }
.hero-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7)); display: flex; flex-direction: column; justify-content: flex-end; padding: 30px 20px; box-sizing: border-box;}
.hero-title { color: #ffffff; font-size: 28px; font-weight: bold; font-family: serif; letter-spacing: 2px; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);}
.hero-subtitle { color: #eeeeee; font-size: 13px; letter-spacing: 1px; line-height: 1.5; opacity: 0.9;}

/* 通用区块标题 */
.section-container { padding: 40px 20px 20px; }
.section-header { margin-bottom: 30px; text-align: center; }
.section-title { display: block; font-size: 22px; font-weight: 900; color: #111; font-family: serif; letter-spacing: 1px;}
.section-desc { display: inline-block; font-size: 12px; color: #ff5000; background: #fff0e5; padding: 2px 10px; border-radius: 12px; margin-top: 6px; letter-spacing: 2px;}

/* 2. 步骤轴设计 */
.step-list { display: flex; flex-direction: column; }
.step-item { display: flex; margin-bottom: 25px; }

.step-left { display: flex; flex-direction: column; align-items: center; margin-right: 15px; width: 30px; }
.step-number { font-size: 20px; font-weight: bold; color: #ff5000; font-family: serif; font-style: italic;}
.step-line { flex: 1; width: 1px; background-color: #ffe0d0; margin-top: 5px; }

.step-right { flex: 1; background: #fafafa; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column;}
.step-img { width: 100%; height: 160px; background: #eee; }
.step-text-box { padding: 15px; }
.step-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 6px; display: block;}
.step-desc { font-size: 13px; color: #666; line-height: 1.6; text-align: justify; display: block;}

/* 3. 美学建议网格 */
.tips-bg { background-color: #f9f9f9; padding-bottom: 40px; margin-top: 20px;}
.tips-grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
.tip-card { width: 48%; background: #ffffff; border-radius: 12px; padding: 20px 15px; box-sizing: border-box; margin-bottom: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); display: flex; flex-direction: column; align-items: center; text-align: center; transition: transform 0.2s;}
.tip-card:active { transform: scale(0.96); }
.tip-icon { font-size: 28px; margin-bottom: 10px; }
.tip-title { font-size: 15px; font-weight: bold; color: #333; margin-bottom: 6px; }
.tip-desc { font-size: 12px; color: #777; line-height: 1.5; }

/* 🌟 4. 底部 AI 悬浮按钮美化 */
.bottom-action { position: fixed; bottom: 0; left: 0; width: 100%; padding: 10px 20px 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); box-shadow: 0 -4px 20px rgba(0,0,0,0.05); box-sizing: border-box; z-index: 100;}
.start-btn { background: #111111; color: #ffffff; height: 50px; line-height: 50px; border-radius: 25px; font-size: 16px; font-weight: bold; display: flex; justify-content: center; align-items: center; transition: all 0.3s; box-shadow: 0 4px 15px rgba(0,0,0,0.2);}
.start-btn:active { transform: scale(0.98); background: #333333;}
.ai-btn { background: linear-gradient(135deg, #1f1c2c, #928dab); } /* 给 AI 按钮加上高级的渐变紫黑色 */
.sparkle { margin-right: 8px; font-size: 18px; }

.safe-area-bottom { height: env(safe-area-inset-bottom); }
</style>