<template>
  <view class="after-sales-container">
    
    <view class="step-box" v-if="currentStep === 1">
      <view class="section-title">请选择售后服务类型</view>
      <view class="type-list">
        <view class="type-item" :class="{active: form.type === '退货/退款'}" @click="form.type = '退货/退款'">
          <view class="type-info">
            <text class="type-name">退货/退款</text>
            <text class="type-desc">已收到货，需要退还收到的商品</text>
          </view>
          <text class="radio-circle"></text>
        </view>
        <view class="type-item" :class="{active: form.type === '换货'}" @click="form.type = '换货'">
          <view class="type-info">
            <text class="type-name">换货</text>
            <text class="type-desc">已收到货，需要更换已收到的商品</text>
          </view>
          <text class="radio-circle"></text>
        </view>
        <view class="type-item" :class="{active: form.type === '维修'}" @click="form.type = '维修'">
          <view class="type-info">
            <text class="type-name">维修</text>
            <text class="type-desc">商品存在质量问题，需要维修</text>
          </view>
          <text class="radio-circle"></text>
        </view>
        <view class="type-item" :class="{active: form.type === '补寄'}" @click="form.type = '补寄'">
          <view class="type-info">
            <text class="type-name">补寄</text>
            <text class="type-desc">商品漏发或配件缺失，需要补寄</text>
          </view>
          <text class="radio-circle"></text>
        </view>
      </view>
      <view class="footer-btn-box">
        <button class="next-btn" @click="goNext">下一步</button>
      </view>
    </view>

    <view class="step-box" v-if="currentStep === 2 && form.type === '退货/退款'">
      <view class="section-title">请选择退款原因</view>
      <view class="reason-tags">
        <text class="tag" 
              :class="{active: form.reason === reason}" 
              v-for="(reason, index) in refundReasons" 
              :key="index" 
              @click="form.reason = reason">
          {{ reason }}
        </text>
      </view>
      <view class="footer-btn-box">
        <button class="next-btn" @click="goNext">下一步</button>
      </view>
    </view>

    <view class="step-box" v-if="currentStep === 3 && form.type === '退货/退款'">
      <view class="section-title">补充详细说明与凭证</view>
      <view class="form-card">
        <textarea class="desc-textarea" v-model="form.desc" placeholder="请详细描述您遇到的问题..."></textarea>
        <view class="upload-area">
          <view class="img-preview" v-for="(img, idx) in form.images" :key="idx">
            <image :src="img" mode="aspectFill" class="uploaded-img"></image>
            <text class="del-btn" @click="delImg(idx)">x</text>
          </view>
          <view class="upload-btn" @click="chooseImage" v-if="form.images.length < 3">
            <text class="plus">+</text>
            <text class="up-text">上传凭证</text>
          </view>
        </view>
      </view>
      <view class="footer-btn-box">
        <button class="submit-btn" @click="submitAfterSales">提交申请</button>
      </view>
    </view>

    <view class="step-box" v-if="currentStep === 2 && form.type === '换货'">
      <view class="form-card" style="margin-top: 15px;">
        <view class="cell-row" @click="showExchangeReason = true">
          <text class="cell-label">换货原因</text>
          <view class="cell-value">
            <text :class="{'placeholder-text': !form.reason}">{{ form.reason || '请选择换货原因' }}</text>
            <text class="arrow">></text>
          </view>
        </view>
        <view class="cell-row border-none">
          <text class="cell-label">换新商品</text>
          <input class="cell-input" type="text" v-model="form.new_product" placeholder="请描述需要换新的商品名称/型号" />
        </view>
      </view>

      <view class="section-title" style="margin-top: 20px;">补充描述和凭证</view>
      <view class="form-card">
        <textarea class="desc-textarea" v-model="form.desc" placeholder="请详细描述换货需求..."></textarea>
        <view class="upload-area">
          <view class="img-preview" v-for="(img, idx) in form.images" :key="idx">
            <image :src="img" mode="aspectFill" class="uploaded-img"></image>
            <text class="del-btn" @click="delImg(idx)">x</text>
          </view>
          <view class="upload-btn" @click="chooseImage" v-if="form.images.length < 3">
            <text class="plus">+</text>
            <text class="up-text">上传凭证</text>
          </view>
        </view>
      </view>
      <view class="footer-btn-box">
        <button class="submit-btn" @click="submitAfterSales">提交申请</button>
      </view>
    </view>

    <view class="step-box" v-if="currentStep === 2 && (form.type === '维修' || form.type === '补寄')">
       <view class="section-title">补充详细说明与凭证</view>
       <view class="form-card">
        <textarea class="desc-textarea" v-model="form.desc" :placeholder="`请详细描述您的${form.type}需求...`"></textarea>
        <view class="upload-area">
          <view class="upload-btn" @click="chooseImage" v-if="form.images.length === 0">
            <text class="plus">+</text>
            <text class="up-text">上传凭证</text>
          </view>
          <view class="img-preview" v-for="(img, idx) in form.images" :key="idx">
            <image :src="img" mode="aspectFill" class="uploaded-img"></image>
            <text class="del-btn" @click="delImg(idx)">x</text>
          </view>
        </view>
      </view>
      <view class="footer-btn-box">
        <button class="submit-btn" @click="submitAfterSales">提交申请</button>
      </view>
    </view>


    <view class="modal-mask" v-if="showExchangeReason" @click="showExchangeReason = false">
      <view class="bottom-modal" @click.stop>
        <view class="modal-header">
          <text class="modal-title">选择换货原因</text>
          <text class="close-icon" @click="showExchangeReason = false">x</text>
        </view>
        <scroll-view scroll-y class="modal-body">
          <view class="reason-cell" 
                v-for="(reason, index) in exchangeReasons" :key="index"
                @click="form.reason = reason">
            <text class="reason-text" :class="{activeText: form.reason === reason}">{{ reason }}</text>
            <text class="check-icon" v-if="form.reason === reason">✔</text>
          </view>
        </scroll-view>
        <view class="modal-footer">
          <button class="finish-btn" @click="showExchangeReason = false">完成</button>
        </view>
      </view>
    </view>

  </view>
</template>

<script>
export default {
  data() {
    return {
      orderId: '',
      currentStep: 1,
      showExchangeReason: false,
      
      form: {
        type: '', // 退货/退款, 换货, 维修, 补寄
        reason: '',
        new_product: '',
        desc: '',
        images: []
      },

      refundReasons: [
        '买贵了', '不想要了', '协商一致退款', '颜色/款式/大小不符', 
        '材质与描述不符', '做工粗糙', '质量问题', '缺少配件', 
        '商品破损/污渍', '卖家发错货'
      ],
      exchangeReasons: [
        '拍错/不喜欢/不合适', '收到商品破损', '卖家发错货', 
        '与商家协商一致', '做工粗糙有瑕疵', '质量问题'
      ]
    }
  },
  onLoad(options) {
    if (options.order_id) {
      this.orderId = options.order_id;
    }
  },
  methods: {
    goNext() {
      if (this.currentStep === 1) {
        if (!this.form.type) return uni.showToast({ title: '请选择售后类型', icon: 'none' });
        this.currentStep = 2;
      } 
      else if (this.currentStep === 2 && this.form.type === '退货/退款') {
        if (!this.form.reason) return uni.showToast({ title: '请选择退款原因', icon: 'none' });
        this.currentStep = 3;
      }
    },
    
    chooseImage() {
      uni.chooseImage({
        count: 3 - this.form.images.length,
        success: (res) => {
          this.form.images = this.form.images.concat(res.tempFilePaths);
        }
      });
    },
    delImg(index) {
      this.form.images.splice(index, 1);
    },

    submitAfterSales() {
      // 最终提交前的校验
      if (this.form.type === '换货') {
        if (!this.form.reason) return uni.showToast({ title: '请选择换货原因', icon: 'none' });
        if (!this.form.new_product) return uni.showToast({ title: '请输入换新商品信息', icon: 'none' });
      }
      
      uni.showLoading({ title: '提交中...' });
      
      // 调用我们上一轮写好的后端售后接口
      const token = uni.getStorageSync('token');
      uni.request({
        url: 'http://127.0.0.1:8000/api/order/after_sales/',
        method: 'POST',
        header: { 'Authorization': 'Token ' + token },
        data: { 
          order_id: this.orderId,
          after_sales_data: this.form // 把完整的表单信息传给后端（供后台查看）
        },
        success: (response) => {
          uni.hideLoading();
          if (response.data.code === 200) {
            uni.showModal({
              title: '提交成功',
              content: '您的售后申请已提交。由于当前系统暂未接入全自动退款，请前往“我的-联系官方客服”加急处理。',
              showCancel: false,
              confirmText: '我知道了',
              success: () => {
                uni.navigateBack(); // 提交成功后退回订单列表
              }
            });
          } else {
            uni.showToast({ title: response.data.msg, icon: 'none' });
          }
        }
      });
    }
  }
}
</script>

<style>
.after-sales-container { background-color: #f5f7fa; min-height: 100vh; padding: 15px; padding-bottom: 80px;}
.section-title { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 15px; margin-top: 10px;}

/* 步骤1：类型选择 */
.type-list { background-color: #fff; border-radius: 12px; padding: 0 15px; }
.type-item { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; border-bottom: 1px solid #f9f9f9; }
.type-item:last-child { border-bottom: none; }
.type-info { display: flex; flex-direction: column; }
.type-name { font-size: 16px; font-weight: bold; color: #333; margin-bottom: 5px; }
.type-desc { font-size: 12px; color: #999; }
.radio-circle { width: 20px; height: 20px; border-radius: 50%; border: 1px solid #ccc; box-sizing: border-box;}
.type-item.active .radio-circle { border: 6px solid #ff5000; }

/* 步骤2：退款原因标签 */
.reason-tags { display: flex; flex-wrap: wrap; }
.tag { background-color: #fff; color: #333; padding: 8px 15px; border-radius: 20px; font-size: 13px; margin: 0 10px 10px 0; border: 1px solid #eee; }
.tag.active { background-color: #fff4f0; color: #ff5000; border-color: #ff5000; font-weight: bold; }

/* 卡片式表单 */
.form-card { background-color: #fff; border-radius: 12px; padding: 15px; }
.cell-row { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
.cell-row.border-none { border-bottom: none; }
.cell-label { font-size: 15px; color: #333; width: 80px; font-weight: bold;}
.cell-value { flex: 1; display: flex; justify-content: flex-end; align-items: center; }
.cell-input { flex: 1; font-size: 14px; color: #333; text-align: right; }
.placeholder-text { color: #999; font-size: 14px; }
.arrow { color: #ccc; margin-left: 10px; font-size: 16px; }

/* 文本域与上传 */
.desc-textarea { width: 100%; height: 100px; font-size: 14px; line-height: 1.5; margin-bottom: 15px; }
.upload-area { display: flex; flex-wrap: wrap; }
.upload-btn { width: 80px; height: 80px; border: 1px dashed #ccc; border-radius: 8px; display: flex; flex-direction: column; justify-content: center; align-items: center; background-color: #fafafa; margin-right: 10px;}
.plus { font-size: 28px; color: #999; margin-bottom: -5px;}
.up-text { font-size: 11px; color: #999; }
.img-preview { width: 80px; height: 80px; margin-right: 10px; margin-bottom: 10px; position: relative; }
.uploaded-img { width: 100%; height: 100%; border-radius: 8px; }
.del-btn { position: absolute; top: -5px; right: -5px; background: rgba(0,0,0,0.6); color: #fff; width: 18px; height: 18px; text-align: center; line-height: 16px; border-radius: 50%; font-size: 12px; }

/* 底部按钮与固定定位 */
.footer-btn-box { position: fixed; bottom: 0; left: 0; width: 100%; padding: 15px 20px; background-color: #fff; box-sizing: border-box; box-shadow: 0 -2px 10px rgba(0,0,0,0.05); z-index: 100; }
.next-btn { background: #111; color: #fff; border-radius: 22px; font-size: 16px; height: 44px; line-height: 44px; width: 100%;}
.submit-btn { background: linear-gradient(90deg, #ff7700, #ff4900); color: #fff; border-radius: 22px; font-size: 16px; height: 44px; line-height: 44px; width: 100%;}

/* 底部弹窗 */
.modal-mask { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 999; display: flex; align-items: flex-end; }
.bottom-modal { width: 100%; background-color: #fff; border-radius: 16px 16px 0 0; padding-bottom: 30px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f9f9f9; }
.modal-title { font-size: 16px; font-weight: bold; }
.close-icon { font-size: 20px; color: #999; padding: 0 10px;}
.modal-body { max-height: 400px; padding: 0 20px; }
.reason-cell { display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #f9f9f9; }
.reason-text { font-size: 14px; color: #333; }
.activeText { color: #ff5000; font-weight: bold; }
.check-icon { color: #ff5000; font-size: 16px; font-weight: bold; }
.modal-footer { padding: 15px 20px 0; }
.finish-btn { background: #ff5000; color: #fff; border-radius: 22px; height: 44px; line-height: 44px; font-size: 16px; }
</style>