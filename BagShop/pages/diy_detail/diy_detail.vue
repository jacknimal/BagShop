<template>
	<view class="studio-container">
		<view class="preview-area">
			<view class="main-canvas">
				<image class="layer base" :src="baseInfo.image_url || '/static/logo.png'" mode="aspectFit"></image>
				<image 
					v-if="selections.theme && selections.theme.value" 
					class="layer overlay" 
					:src="selections.theme.value" 
					mode="aspectFit"
				></image>
				<view v-if="monogramText" class="monogram-preview">
					<text>{{ monogramText }}</text>
				</view>
			</view>
			
			<view class="price-pill">
				<text class="label">预计总额</text>
				<text class="symbol">￥</text>
				<text class="num">{{ currentTotalPrice }}</text>
			</view>
		</view>

		<view class="control-panel">
			<scroll-view class="tab-scroll" scroll-x show-scrollbar="false">
				<view class="tab-list">
					<view 
						class="tab-item" 
						v-for="type in optionTypes" 
						:key="type.key"
						:class="{ active: currentTab === type.key }"
						@click="currentTab = type.key"
					>
						{{ type.name }}
					</view>
				</view>
			</scroll-view>

			<scroll-view class="option-scroll" scroll-y show-scrollbar="false">
				<view class="option-grid">
					<view 
						class="option-item" 
						v-if="currentTab === 'theme' || currentTab === 'lining'"
						@click="uploadCustomImage"
					>
						<view class="upload-box">
							<text class="upload-icon">+</text>
						</view>
						<text class="opt-name">上传自定义</text>
					</view>

					<view 
						class="option-item" 
						v-for="opt in filteredOptions" 
						:key="opt.id"
						:class="{ selected: selections[currentTab] && selections[currentTab].id === opt.id }"
						@click="selectOption(opt)"
					>
						<view v-if="currentTab === 'color'" class="color-dot" :style="{ background: opt.value }"></view>
						<view v-else-if="currentTab === 'size'" class="size-box">{{ opt.name }}</view>
						<image v-else class="opt-img" :src="opt.value || '/static/logo.png'" mode="aspectFill"></image>
						
						<text class="opt-name">{{ opt.name }}</text>
						<text class="opt-price" v-if="opt.add_price > 0">+￥{{ opt.add_price }}</text>
					</view>
				</view>

				<view v-if="currentTab === 'monogram'" class="monogram-input-box">
					<text class="input-title">定制内容：</text>
					<input 
						class="monogram-input" 
						v-model="monogramText" 
						placeholder="请输入需要雕刻的英文或数字 (限10字)" 
						maxlength="10"
					/>
					<text class="input-desc">💡 请先在上方选择心仪的字体样式哦~</text>
				</view>
				
				<view class="scroll-bottom-safe"></view>
			</scroll-view>
		</view>

		<view class="footer-actions">
			<view class="ai-box" @click="askAI">
				<text class="ai-icon">🤖</text>
				<text class="ai-text">AI 建议</text>
			</view>
			<view class="btn-group">
				<button class="btn btn-draft" @click="saveDraft">存草稿箱</button>
				<button class="btn btn-buy" @click="addToFinished">加入成品库</button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			productId: null,
			baseInfo: { name: '', price: 0, image_url: '' },
			options: [], 
			currentTab: 'material',
			monogramText: '', 
			
			optionTypes: [
				{ name: '面料材质', key: 'material' },
				{ name: '外观颜色', key: 'color' },
				{ name: '主题图案', key: 'theme' },
				{ name: '内衬花色', key: 'lining' },
				{ name: '五金配件', key: 'hardware' },
				{ name: '个性刻字', key: 'monogram' },
				{ name: '配饰挂件', key: 'accessory' },
				{ name: '型号尺寸', key: 'size' }
			],
			selections: {
				material: null, color: null, theme: null, lining: null,
				hardware: null, monogram: null, accessory: null, size: null
			}
		}
	},
	computed: {
		filteredOptions() {
			if (!Array.isArray(this.options)) return [];
			return this.options.filter(o => o.option_type === this.currentTab);
		},
		currentTotalPrice() {
			let extra = 0;
			Object.values(this.selections).forEach(s => {
				if (s && s.add_price) extra += parseFloat(s.add_price);
			});
			const base = parseFloat(this.baseInfo.price || 0);
			return (base + extra).toFixed(2);
		}
	},
	onLoad(options) {
		this.productId = options.id;
		this.baseInfo.name = options.name;
		this.baseInfo.price = options.price;
		this.baseInfo.image_url = decodeURIComponent(options.image_url || '');
		this.getOptions();
	},
	methods: {
		getOptions() {
			uni.request({
				url: 'http://127.0.0.1:8000/api/diy/options/',
				data: { product_id: this.productId },
				success: (res) => {
					let fetchedOptions = Array.isArray(res.data) ? res.data : (res.data.data || []);
					
					// 🌟 修改点 1：为尺寸选项分别设置默认加价 50，100，150
					const hasSize = fetchedOptions.some(o => o.option_type === 'size');
					if (!hasSize) {
						fetchedOptions.push(
							{ id: 'size_s', name: '小', value: '', add_price: 50, option_type: 'size' },
							{ id: 'size_m', name: '中', value: '', add_price: 100, option_type: 'size' },
							{ id: 'size_l', name: '大', value: '', add_price: 150, option_type: 'size' }
						);
					}
					this.options = fetchedOptions;
				}
			});
		},
		uploadCustomImage() {
			uni.chooseImage({
				count: 1,
				success: (chooseRes) => {
					uni.showLoading({ title: '上传中...' });
					const tempFilePath = chooseRes.tempFilePaths[0];
					uni.uploadFile({
						url: 'http://127.0.0.1:8000/api/upload/', 
						filePath: tempFilePath,
						name: 'file',
						success: (uploadRes) => {
							uni.hideLoading();
							try {
								const data = JSON.parse(uploadRes.data);
								if (data.code === 200) {
									
									// 🌟 修改点 2：根据上传的是主题还是内衬，设定不同的自定义溢价
									let customAddPrice = 0;
									if (this.currentTab === 'theme') {
										customAddPrice = 40;
									} else if (this.currentTab === 'lining') {
										customAddPrice = 60;
									}
									
									const customOpt = {
										id: 'custom_' + Date.now(),
										name: '我的上传',
										value: data.url, 
										add_price: customAddPrice, // 应用价格
										option_type: this.currentTab
									};
									this.options.unshift(customOpt); 
									this.selectOption(customOpt); 
									uni.showToast({ title: '上传成功', icon: 'success' });
								} else {
									uni.showToast({ title: data.msg || '上传失败', icon: 'none' });
								}
							} catch(e) {
								uni.showToast({ title: '服务器响应错误', icon: 'none' });
							}
						},
						fail: () => {
							uni.hideLoading();
							uni.showToast({ title: '网络请求失败', icon: 'none' });
						}
					});
				}
			});
		},
		selectOption(opt) {
			this.$set(this.selections, this.currentTab, opt);
		},
		saveDraft() {
			uni.request({
				url: 'http://127.0.0.1:8000/api/diy/save_draft/',
				method: 'POST',
				header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
				data: {
					product_id: this.productId,
					diy_details: { 
						selections: this.selections, 
						monogram_text: this.monogramText, 
						price: this.currentTotalPrice 
					}
				},
				success: () => { uni.showToast({ title: '已存入草稿箱', icon: 'success' }); }
			});
		},
		addToFinished() {
			if (!this.productId) {
				uni.showToast({ title: '参数错误', icon: 'none' });
				return;
			}
			uni.request({
				url: 'http://127.0.0.1:8000/api/diy/add_finished/',
				method: 'POST',
				header: { 'Authorization': 'Token ' + uni.getStorageSync('token') },
				data: {
					product_id: this.productId,
					diy_details: { 
						selections: this.selections, 
						monogram_text: this.monogramText, 
						price: this.currentTotalPrice 
					}
				},
				success: (res) => { 
					if (res.data.code === 200) {
						uni.showToast({ title: '已提交商家审核', icon: 'success' }); 
						setTimeout(() => {
							uni.navigateTo({ url: '/pages/finished_products/finished_products' });
						}, 1500);
					} else {
						uni.showToast({ title: res.data.msg || '提交失败', icon: 'none' }); 
					}
				}
			});
		},
		askAI() {
			uni.navigateTo({ url: '/pages/guide/ai_chat' });
		}
	}
}
</script>

<style lang="scss">
/* 样式与您确认过的版本一模一样，无任何改动 */
.studio-container { height: 100vh; display: flex; flex-direction: column; background: #fcfcfe; }

.preview-area { 
	flex: 1; position: relative; background: linear-gradient(to bottom, #ffffff, #fff9e6); 
	overflow: hidden; display: flex; align-items: center; justify-content: center;
	.main-canvas { 
		width: 90%; height: 80%; position: relative;
		.layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transition: all 0.4s ease; }
		.overlay { z-index: 2; transform: scale(0.95); } 
	}
	.monogram-preview {
		position: absolute; top: 45%; left: 50%; transform: translate(-50%, -50%);
		z-index: 3; font-size: 28rpx; color: #b8977e; font-weight: bold; letter-spacing: 4rpx;
		text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
	}
	
	.price-pill { 
			position: absolute; 
			top: 50rpx;    
			left: 30rpx;   
			background: rgba(255, 255, 255, 0.9); 
			color: #ff8e7e;
			padding: 8rpx 24rpx; 
			border-radius: 30rpx; 
			font-weight: bold;
			box-shadow: 0 4rpx 12rpx rgba(255, 142, 126, 0.1); 
			border: 1rpx solid rgba(255, 249, 230, 0.5); 
			z-index: 10;
			display: flex; align-items: baseline; 
	
			.label { 
				font-size: 18rpx; 
				color: #999; margin-right: 8rpx; 
			}
			.symbol { 
				font-size: 20rpx; 
			}
			.num { 
				font-size: 32rpx; 
				margin-left: 2rpx; 
			}
		}
}

.control-panel { 
	height: 580rpx; background: #fff; border-radius: 50rpx 50rpx 0 0;
	box-shadow: 0 -15rpx 40rpx rgba(0,0,0,0.02); display: flex; flex-direction: column;
	border-top: 1rpx solid #f0f0f0;
}

.tab-scroll {
	flex-shrink: 0;
	padding: 35rpx 0 25rpx;
	.tab-list { display: flex; padding: 0 30rpx; white-space: nowrap; }
	.tab-item { 
		display: inline-block; padding: 0 35rpx; font-size: 29rpx; color: #bbb; position: relative;
		transition: all 0.3s;
		&.active { 
			color: #333; font-weight: bold; transform: scale(1.1);
			&:after { content: ''; position: absolute; bottom: -20rpx; left: 50%; transform: translateX(-50%); width: 35rpx; height: 6rpx; background: #ff8e7e; border-radius: 10rpx; }
		}
	}
}

.option-scroll { 
	height: calc(580rpx - 110rpx); 
	flex: 1; 
}

.option-grid { 
	display: grid; grid-template-columns: repeat(4, 1fr); gap: 25rpx; padding: 30rpx 40rpx;
	.option-item { 
		display: flex; flex-direction: column; align-items: center;
		.color-dot { width: 85rpx; height: 85rpx; border-radius: 50%; border: 6rpx solid #f9f9f9; box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.05); }
		.opt-img { width: 100rpx; height: 100rpx; border-radius: 20rpx; background: #fdfdfd; border: 2rpx solid #f0f0f0; }
		
		.upload-box { width: 100rpx; height: 100rpx; border-radius: 20rpx; background: #fff9f8; border: 2rpx dashed #ff8e7e; display: flex; align-items: center; justify-content: center; transition: all 0.3s;}
		.upload-icon { font-size: 50rpx; color: #ff8e7e; font-weight: 300; margin-top: -6rpx;}
		
		.size-box { width: 100rpx; height: 100rpx; border-radius: 20rpx; background: #fdfdfd; border: 2rpx solid #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 32rpx; font-weight: bold; color: #666; transition: all 0.3s;}

		.opt-name { font-size: 23rpx; color: #777; margin-top: 15rpx; }
		.opt-price { font-size: 20rpx; color: #ff8e7e; font-weight: bold; margin-top: 4rpx; }
		
		&.selected { 
			.color-dot, .opt-img, .size-box { border-color: #ff8e7e; transform: translateY(-5rpx); box-shadow: 0 10rpx 20rpx rgba(255,142,126,0.2); }
			.size-box { color: #ff8e7e; }
			.opt-name { color: #ff8e7e; font-weight: bold; }
		}
	}
}
.monogram-input-box {
	padding: 0 40rpx 40rpx;
	.input-title { font-size: 26rpx; color: #333; font-weight: bold; margin-bottom: 20rpx; display: block; }
	.monogram-input {
		background: #fdfdfd; border: 2rpx solid #f0f0f0; border-radius: 20rpx;
		height: 88rpx; padding: 0 30rpx; font-size: 28rpx; color: #333;
		transition: all 0.3s;
	}
	.monogram-input:focus {
		border-color: #ff8e7e; background: #fff9f8;
	}
	.input-desc { font-size: 22rpx; color: #aaa; margin-top: 15rpx; display: block; }
}

.scroll-bottom-safe { height: 40rpx; }

.footer-actions { 
	flex-shrink: 0;
	padding: 25rpx 40rpx 60rpx; background: #fff; display: flex; align-items: center;
	border-top: 1rpx solid #f5f5f5;
	z-index: 10;
	.ai-box { 
		display: flex; flex-direction: column; align-items: center; margin-right: 40rpx;
		.ai-icon { font-size: 42rpx; margin-bottom: 5rpx; }
		.ai-text { font-size: 20rpx; color: #999; }
	}
	.btn-group { 
		flex: 1; display: flex; gap: 25rpx;
		.btn { height: 95rpx; line-height: 95rpx; border-radius: 50rpx; font-size: 30rpx; font-weight: bold; flex: 1; border: none; }
		.btn-draft { background: #eef6ff; color: #4a90e2; }
		.btn-buy { background: #ff8e7e; color: #fff; box-shadow: 0 10rpx 25rpx rgba(255, 142, 126, 0.3); }
	}
}
</style>