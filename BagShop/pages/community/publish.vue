<template>
  <view class="publish-container">
    <view class="upload-section">
      <view class="img-box" v-for="(img, index) in images" :key="index">
        <image class="preview-img" :src="img" mode="aspectFill"></image>
        <text class="del-btn" @click="delImg(index)">×</text>
      </view>
      <view class="add-btn" @click="chooseImage" v-if="images.length < 1">
        <text class="plus">＋</text>
        <text class="tips">上传作品图</text>
      </view>
    </view>

    <view class="content-section">
      <input class="title-input" type="text" v-model="form.title" placeholder="填写标题会有更多赞哦~" placeholder-class="ph-style" />
      <view class="divider"></view>
      <textarea class="desc-textarea" v-model="form.content" placeholder="添加正文，分享你的DIY灵感、材质选择或搭配心得..." placeholder-class="ph-style" maxlength="500"></textarea>
    </view>

    <view class="bottom-bar">
      <button class="publish-btn" @click="submitPost">发布笔记</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      images: [],
      form: {
        title: '',
        content: ''
      }
    }
  },
  methods: {
    chooseImage() {
      uni.chooseImage({
        count: 1, // 这里限制发1张主图，做瀑布流展示
        success: (res) => {
          this.images = res.tempFilePaths;
        }
      });
    },
    delImg(index) {
      this.images.splice(index, 1);
    },
    submitPost() {
      if (!this.form.title) return uni.showToast({ title: '总得写个标题吧~', icon: 'none' });
      if (this.images.length === 0) return uni.showToast({ title: '请至少上传一张作品图', icon: 'none' });

      const token = uni.getStorageSync('token');
      uni.showLoading({ title: '图片上传中...' });

      // 1. 先把临时图片真实上传给后端
      uni.uploadFile({
        url: 'http://127.0.0.1:8000/api/upload/', 
        filePath: this.images[0],
        name: 'file', // 后端接收的字段名
        success: (uploadRes) => {
          // 注意：uploadFile 返回的是字符串，需要 parse
          const resData = JSON.parse(uploadRes.data);
          if (resData.code === 200) {
            const realImageUrl = resData.url; // 拿到后端返回的永久真实网络地址！
            
            // 2. 带着真实的图片地址，发表动态
            uni.showLoading({ title: '发布笔记中...' });
            uni.request({
              url: 'http://127.0.0.1:8000/api/community/post/create/',
              method: 'POST',
              header: { 'Authorization': 'Token ' + token },
              data: {
                title: this.form.title,
                content: this.form.content,
                image_url: realImageUrl // 传真实 URL
              },
              success: (res) => {
                uni.hideLoading();
                if (res.data.code === 200) {
                  uni.showToast({ title: '发布成功！', icon: 'success' });
                  setTimeout(() => { uni.navigateBack(); }, 1000);
                }
              }
            });
          } else {
            uni.hideLoading();
            uni.showToast({ title: '图片上传失败', icon: 'none' });
          }
        }
      });
    }
  }
}
</script>

<style>
.publish-container { background-color: #fff; min-height: 100vh; padding: 20px; padding-bottom: 80px;}

.upload-section { display: flex; flex-wrap: wrap; margin-bottom: 20px;}
.img-box { position: relative; width: 100px; height: 100px; margin-right: 15px; margin-bottom: 15px; border-radius: 8px; overflow: hidden;}
.preview-img { width: 100%; height: 100%;}
.del-btn { position: absolute; top: 0; right: 0; background: rgba(0,0,0,0.5); color: #fff; width: 20px; height: 20px; text-align: center; line-height: 18px; font-size: 16px; border-radius: 0 0 0 8px;}
.add-btn { width: 100px; height: 100px; background-color: #f5f5f5; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; border: 1px dashed #ddd;}
.plus { font-size: 30px; color: #999; margin-bottom: -5px;}
.tips { font-size: 12px; color: #999;}

.content-section { margin-top: 10px; }
.title-input { font-size: 18px; font-weight: bold; color: #333; height: 50px;}
.divider { height: 1px; background-color: #f0f0f0; margin: 10px 0 20px;}
.desc-textarea { width: 100%; height: 200px; font-size: 15px; color: #333; line-height: 1.6;}
.ph-style { color: #ccc;}

.bottom-bar { position: fixed; bottom: 0; left: 0; width: 100%; padding: 10px 20px 25px; background-color: #fff; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); box-sizing: border-box;}
.publish-btn { background: #ff5000; color: #fff; border-radius: 24px; font-size: 16px; font-weight: bold; height: 44px; line-height: 44px; width: 100%;}
</style>