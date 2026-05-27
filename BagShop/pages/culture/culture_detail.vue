<template>
  <view class="article-page">
    <image class="cover-img" :src="article.cover" mode="aspectFill"></image>
    
    <view class="article-body">
      <view class="title-area">
        <text class="title">{{ article.title }}</text>
        <text class="date">发布于 2024 · 官方专栏</text>
      </view>
      
      <view class="content-area">
        <block v-for="(node, index) in article.content" :key="index">
          <text class="paragraph" v-if="node.type === 'text'">{{ node.value }}</text>
          <image class="illustration" v-if="node.type === 'image'" :src="node.value" mode="widthFix"></image>
        </block>
      </view>
    </view>
    
    <button class="shop-btn" @click="goShop">去挑选中意箱包</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      type: '',
      article: {}
    }
  },
  onLoad(options) {
    this.type = options.type || 'brand';
    this.loadArticleData();
  },
  methods: {
    // 根据传入的类型，加载不同的纯静态数据
    loadArticleData() {
      const dataBank = {
        'brand': {
          title: '品牌故事：始于热爱，忠于匠心',
          cover: '/static/culture/fig1.jpg',
          content: [
            { type: 'text', value: '在这个追求个性与多元的时代，我们致力于打造一个无界限的箱包世界——从亲民实用的日常百搭，到奢华精致的高级典藏，风格跨越千姿百态，满足您的每一种审美表达。' },
            { type: 'image', value: '/static/culture/LV.jpg' },
            { type: 'text', value: '我们坚信，无论定价几何，对品质的追求绝不妥协。我们始终甄选顶尖的皮具材质与匠心五金，只为呈现最纯粹的箱包质感。同时，我们开创性地打造了 DIY 定制服务与专属的社区交流平台。在这里，您不仅能亲手赋予包包独一无二的专属印记，还能与志同道合的朋友们碰撞灵感，分享属于你们的箱包文化。' }
          ]
        },
        'history': {
          title: '百年演变简史：从实用工具到时尚标志',
          cover: '/static/culture/fig2.jpg',
          content: [
            { type: 'text', value: '箱包的历史，几乎是一部人类出行史。早在中世纪，人们只是用粗糙的皮革束口袋来装钱币。到了19世纪随着火车的普及，硬挺的旅行箱（Trunk）应运而生。' },
            { type: 'text', value: '20世纪初，随着女性走出家庭步入职场，手提包（Handbag）正式成为了不可或缺的时尚配饰，并在之后的百年里演变出了托特包、剑桥包、法棍包等无数经典形态。' }
          ]
        },
        'material': {
          title: '材质百科：教你读懂皮料的“语言”',
          cover: '/static/culture/fig3.jpg',
          content: [
            { type: 'text', value: '好包的灵魂在于材质。市面上常见的“真皮”通常指的是牛皮和羊皮。' },
            { type: 'text', value: '【头层牛皮】保留了完好的天然纹理，毛孔清晰，透气性极佳，用久了会产生迷人的包浆（Patina）。【十字纹牛皮】则经过了压花处理，防刮耐磨，版型硬挺，非常适合通勤包。' }
          ]
        },
        'care': {
          title: '保养秘籍：让你的爱包历久弥新',
          cover: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600',
          content: [
            { type: 'text', value: '皮具就像人的皮肤一样，需要定期的清洁与滋润。' },
            { type: 'text', value: '1. 日常防潮：不背的时候，请在包内塞入雪梨纸撑起包型，并放入防尘袋置于通风处。\n2. 遇水急救：如果不慎淋雨，切忌用吹风机热风吹干！应立刻用干棉布吸干水分，放在阴凉处自然风干。\n3. 定期上油：每隔2-3个月，可以使用专用的皮革保养油进行擦拭。' }
          ]
        }
      };
      
      this.article = dataBank[this.type] || dataBank['brand'];
      // 动态修改导航栏标题
      uni.setNavigationBarTitle({ title: this.article.title.split('：')[0] });
    },
    goShop() {
      uni.switchTab({ url: '/pages/index/index' });
    }
  }
}
</script>

<style>
.article-page { background: #fff; min-height: 100vh; padding-bottom: 40px;}
.cover-img { width: 100%; height: 240px; }

.article-body { padding: -20px 20px 20px; position: relative; z-index: 2;}
.title-area { background: #fff; padding: 25px 20px; margin: -40px 0 20px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.06);}
.title { font-size: 20px; font-weight: bold; color: #333; line-height: 1.5; display: block; margin-bottom: 8px; font-family: serif;}
.date { font-size: 12px; color: #999; }

.content-area { padding: 0 10px; }
.paragraph { font-size: 15px; color: #444; line-height: 1.8; margin-bottom: 20px; display: block; text-align: justify; letter-spacing: 0.5px;}
.illustration { width: 100%; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);}

.shop-btn { background: #111; color: #fff; width: 80%; border-radius: 25px; margin-top: 40px; height: 46px; line-height: 46px; font-size: 15px;}
</style>