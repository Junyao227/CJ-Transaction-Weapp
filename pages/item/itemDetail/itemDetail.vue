<template>
	<view class="container">
		<!-- 如果页面正在加载，显示loading -->
		<u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>

		<!-- 页面内容 -->
		<view v-if="!loading">
			<!-- 用户信息 -->
			<view class="user-info-card">
				<image :src="sellerAndItemInfo.avatar" class="user-avatar" />
				<view class="user-info-details">
					<text class="user-nickname">{{ sellerAndItemInfo.nickname }}</text>
					<view class="follow-btn-wrapper">
						<u-button v-if="!isFollowed" type="default"  @click="followUser">关注</u-button>
						<u-button v-else type="success"  @click="unfollowUser">已关注</u-button>
					</view>
				</view>
			</view>

			<!-- 商品价格 -->
			<view class="item-price-card">
				<text class="price-label">价格：</text>
				<text class="price-value">￥{{ sellerAndItemInfo.price }}</text>
			</view>

			<!-- 商品描述 -->
			<view class="item-description-card">
				<text class="description-label">描述：</text>
				<text class="description-content">{{ sellerAndItemInfo.description }}</text>
			</view>

			<!-- 商品图片展示 -->
			<view class="item-images-card">
				<image :src="sellerAndItemInfo.imageUrl" class="item-image" mode="aspectFill" />
			</view>

			<!-- 收藏按钮和"我想要"按钮放在同一行 -->
			<view class="chat-btn-wrapper">
				<view class="collect-btn-wrapper">
					<u-button v-if="!isCollected" type="default"  @click="collectItem">收藏</u-button>
					<u-button v-else type="success" @click="uncollectItem">已收藏</u-button>
				</view>
				<view class="chat-btn-wrapper-inner">
					<u-button type="primary" @click="startChat">我想要</u-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			sellerAndItemInfo: {}, // 商品对象
			isFollowed: false, // 关注状态
			isCollected: false, // 收藏状态
			loading: true // 页面加载状态
		};
	},
	onLoad(options) {
		this.getDetailInfo(options);
	},
	methods: {
		startChat() {
			const userInfo = uni.getStorageSync('USER_INFO');
			uni.navigateTo({
				url: `/pages/item/chat/chat?sellerAndItemInfo=${JSON.stringify(this.sellerAndItemInfo)}`
			});
		},
		getDetailInfo(options) {
			if (options.item) {
				const item = JSON.parse(options.item); // 解析传递的商品对象
				// 调用云函数获取用户信息
				uniCloud.callFunction({
					name: 'getUserInfoByUserId',
					data: {
						userId: item.publisher_id // 传递 WxOpenId 参数
					},
					success: (res) => {
						if (res.result.success) {
							const sellerInfo = res.result.data;
							const { nickname, avatar } = sellerInfo;
							const sellerAndItemInfo = { ...item, nickname, avatar };
							this.sellerAndItemInfo = sellerAndItemInfo;

							this.checkFollowStatus(); // 检查是否已关注
							this.checkCollectStatus(); // 检查是否已收藏
						} else {
							uni.showToast({
								icon: 'none',
								title: res.result.message || '查询失败'
							});
						}
						this.loading = false; // 加载完成，设置 loading 为 false
					},
					fail: (err) => {
						uni.showToast({
							icon: 'none',
							title: '调用云函数失败'
						});
						console.error('云函数调用失败:', err);
						this.loading = false; // 加载完成，设置 loading 为 false
					}
				});
			}
		},
		checkFollowStatus() {
			if (!this.sellerAndItemInfo.publisher_id) return;
			// 检查是否已关注
			uniCloud.callFunction({
				name: 'checkFollowStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.sellerAndItemInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = res.result.isFollowed;
					}
				},
				fail: (err) => {
					console.error('检查关注状态失败:', err);
				}
			});
		},
		checkCollectStatus() {
			if (!this.sellerAndItemInfo._id) return;
			// 检查是否已收藏
			uniCloud.callFunction({
				name: 'checkCollectStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.sellerAndItemInfo._id,
					type: 0 // 0 表示二手商品
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = res.result.isCollected;
					}
				},
				fail: (err) => {
					console.error('检查收藏状态失败:', err);
				}
			});
		},
		// 收藏商品
		collectItem() {
			uniCloud.callFunction({
				name: 'collectItem',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.sellerAndItemInfo._id,
					type: 0 // 0 表示二手商品
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = true;
						uni.showToast({ title: '收藏成功', icon: 'success' });
					}
				},
				fail: (err) => {
					console.error('收藏失败:', err);
					uni.showToast({ title: '收藏失败', icon: 'none' });
				}
			});
		},
		// 取消收藏商品
		uncollectItem() {
			uniCloud.callFunction({
				name: 'uncollectItem',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.sellerAndItemInfo._id,
					type: 0 // 0 表示二手商品
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = false;
						uni.showToast({ title: '取消收藏成功', icon: 'success' });
					}
				},
				fail: (err) => {
					console.error('取消收藏失败:', err);
					uni.showToast({ title: '取消收藏失败', icon: 'none' });
				}
			});
		},
		// 关注用户
		followUser() {
			uniCloud.callFunction({
				name: 'followUser',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.sellerAndItemInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = true;
						uni.showToast({ title: '关注成功', icon: 'success' });
					}
				},
				fail: (err) => {
					console.error('关注失败:', err);
					uni.showToast({ title: '关注失败', icon: 'none' });
				}
			});
		},
		// 取消关注用户
		unfollowUser() {
			uniCloud.callFunction({
				name: 'unfollowUser',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.sellerAndItemInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = false;
						uni.showToast({ title: '取消关注成功', icon: 'success' });
					}
				},
				fail: (err) => {
					console.error('取消关注失败:', err);
					uni.showToast({ title: '取消关注失败', icon: 'none' });
				}
			});
		}
	}
};
</script>

<style scoped>
/* 容器样式 */
.container {
	background-color: #f7f8fa;
	padding-bottom: 90px; /* 为底部按钮区块预留足够空间 */
}

/* 用户信息区块 */
.user-info-card {
	display: flex;
	align-items: center;
	background: #fff;
	padding: 15px;
	margin-bottom: 15px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	border-radius: 12px;
}

.user-avatar {
	width: 60px;
	height: 60px;
	border-radius: 50%;
	border: 2px solid #f0f0f0;
	margin-right: 15px;
}

.user-info-details {
	display: flex;
	flex: 1;
	align-items: center;
	justify-content: space-between;
}

.user-nickname {
	font-size: 20px;
	font-weight: bold;
	color: #333;
}

.follow-btn-wrapper {
	display: flex;
	align-items: center;
}

.follow-btn-wrapper u-button {
	width: 70px;
	height: 32px;
	line-height: 32px;
	border-radius: 16px;
	font-size: 14px;
	text-align: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

.follow-btn-wrapper u-button:hover {
	transform: scale(1.05);
}

/* 商品价格区块 */
.item-price-card {
	display: flex;
	align-items: center;
	background: #fff;
	padding: 15px;
	margin-bottom: 15px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	border-radius: 10px;
}

.price-label {
	font-size: 16px;
	font-weight: bold;
	color: #666;
	margin-right: 10px;
}

.price-value {
	font-size: 24px;
	font-weight: bold;
	color: #ff4d4f;
}

/* 商品描述区块 */
.item-description-card {
	background: #fff;
	padding: 20px;
	margin-bottom: 15px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	border-radius: 10px;
}

.description-label {
	font-size: 16px;
	color: #666;
	margin-bottom: 10px;
	display: block;
}

.description-content {
	font-size: 16px;
	color: #333;
	line-height: 1.6;
}

/* 商品图片展示区块 */
.item-images-card {
	background: #fff;
	padding: 15px;
	margin-bottom: 15px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	border-radius: 10px;
	text-align: center;
}

.item-image {
	width: 100%;
	max-height: 300px;
	object-fit: contain;
	border-radius: 10px;
}

/* 收藏和聊天按钮区块（固定底部） */
.chat-btn-wrapper {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 15px;
	background: #fff;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	border-radius: 10px;
	position: fixed; /* 固定底部 */
	bottom: 0;
	left: 0;
	width: 100%; /* 满宽 */
	z-index: 100; /* 确保按钮在其他内容之上 */
}

/* 收藏按钮的外部包装样式 */
.collect-btn-wrapper {
	display: flex;
	justify-content: space-between;
	gap: 10px; /* 收藏按钮之间的间距 */
	width: 45%;
	margin-right: 15px; /* 设置右边间距 */
}

/* 聊天按钮的外部包装样式 */
.chat-btn-wrapper-inner {
	flex-grow: 1;
	display: flex;
	justify-content: flex-end;
	margin-left: 15px; /* 设置左边间距 */

}

</style>
