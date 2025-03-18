<template>
	<view class="container">
		<!-- 如果页面正在加载，显示loading -->
		<u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>
		<view v-if="!loading">
			<!-- 商品信息 -->
			<view class="product-info">
				<u--image :src="itemInfo.imageUrl" width="60px" height="60px" class="product-image" />
				<view class="product-details">
					<text class="product-price">￥{{ itemInfo.price }}</text>
				</view>
				<view class="buy-button-wrapper">
					<u-button type="primary" @click="buyNow">立即购买</u-button>
				</view>
			</view>

			<!-- 消息列表 -->
			<scroll-view class="messages" scroll-y :scroll-top="scrollTop">
				<view v-for="(msg, index) in messageList" :key="index" class="message-item">
					<!-- 卖家消息布局 -->
					<view v-if="msg.senderId !== userInfo.userId" class="message-left-wrapper">
						<view class="avatar-container">
							<u--image :src="sellerInfo.sellerAvatar" width="40px" height="40px" shape="circle" />
						</view>
						<view class="message-left">
							<text>{{ msg.content }}</text>
						</view>
					</view>
					<!-- 买家消息布局 -->
					<view v-else class="message-right-wrapper">
						<view class="message-right">
							<text>{{ msg.content }}</text>
						</view>
						<view class="avatar-container">
							<u--image :src="userInfo.userAvatar" width="40px" height="40px" shape="circle" />
						</view>
					</view>
				</view>
			</scroll-view>

			<!-- 输入框 -->
			<view class="input-wrapper">
				<u--input v-model="message" type="text" placeholder="输入消息..." class="input-field" />
				<view class="send-button-wrapper">
					<u-button type="primary" @click="sendMessage">发送</u-button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
const GoEasy = uni.$GoEasy;
import { mapState, mapActions, mapGetters } from 'vuex';
export default {
	data() {
		return {
			userInfo: {
				userId: '',
				userAvatar: ''
			},
			sellerInfo: {
				sellerId: '',
				sellNickName: '',
				sellerAvatar: ''
			},
			sessionId: '', // 会话ID
			messageList: [], // 消息列表
			message: '', // 用户输入的消息
			scrollTop: 0, // 控制滚动位置
			itemInfo: {
				imageUrl: '',
				price: ''
			},
			loading: true,
			sellerAndItemInfo: {},
			to: {}, // GoEasy 发送目标
			goeasy: null
		};
	},
	onLoad(options) {
		const sellerAndItemInfo = JSON.parse(options.sellerAndItemInfo);
		this.sellerAndItemInfo = sellerAndItemInfo;
		console.log("this.sellerAndItemInf",this.sellerAndItemInfo);
		this.itemInfo.price = sellerAndItemInfo.price;
		this.getItemTempImagesUrl(sellerAndItemInfo);

		const userInfo = uni.getStorageSync('USER_INFO');
		this.userInfo.userId = userInfo.user_id;
		this.userInfo.userAvatar = userInfo.avatar;

		this.sellerInfo.sellerAvatar = sellerAndItemInfo.avatar;
		this.sellerInfo.sellNickName = sellerAndItemInfo.nickname;
		this.sellerInfo.sellerId = sellerAndItemInfo.publisher_id;

		// 优化：将 to 初始化移到 onLoad 中，避免重复定义
		this.to = {
			id: this.sellerAndItemInfo.otherId && this.userInfo.userId === this.sellerInfo.sellerId ? this.sellerAndItemInfo.otherId : this.sellerInfo.sellerId,
			type: GoEasy.IM_SCENE.PRIVATE,
			data: {
				name: this.sellerInfo.sellNickName || this.sellerInfo.sellerId,
				avatar: this.sellerInfo.sellerAvatar,
				sessionId: this.sessionId
			}
		};
		this.goeasy = GoEasy; // 假设已在 main.js 中全局引入
		this.connectGoEasy();
		this.initSession();
		this.setupRealTimeMessages();
	},
	onUnload() {
		// 优化：移除 GoEasy 监听器，移除无用的 watcher 检查
		this.goeasy.im.off(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
	},
	computed: {
		// 映射 Vuex 的状态和 getters
		...mapState('messages', ['messages']),
		...mapGetters('messages')
	},
	methods: {
		// 映射 Vuex 的 actions
		...mapActions('messages', ['updateSendMessage', 'updateReadedMessage']),
		async getItemTempImagesUrl(sellerAndItemInfo) {
			// 获取每个商品的临时图片链接
			// 调用 uniCloud.getTempFileURL 获取图片的临时 URL
			const result = await uniCloud.getTempFileURL({
				fileList: [sellerAndItemInfo.images]
			});

			if (result.fileList && result.fileList.length > 0) {
				this.itemInfo.imageUrl = result.fileList[0]?.tempFileURL;
			} else {
				uni.showToast({
					icon: 'none',
					title: '获取图片链接失败'
				});
			}
		},
		connectGoEasy() {
			this.goeasy.connect({
				id: this.userInfo.userId, // 使用当前用户 ID
				data: {
					avatar: this.userInfo.userAvatar || '/static/logo.png',
					nickname: this.userInfo.userId
				},
				onSuccess: () => {
					console.log('GoEasy connect successfully.');
				},
				onFailed: (error) => {
					console.log('Failed to connect GoEasy, code:' + error.code + ', error:' + error.content);
				},
				onProgress: (attempts) => {
					console.log('GoEasy is connecting', attempts);
				}
			});
		},
		async getSellerAvatar(sellerId) {
			const sellerRes = await uniCloud.callFunction({
				name: 'getUserInfoByUserId',
				data: { userId: sellerId }
			});

			if (sellerRes.result.success) {
				this.sellerInfo.sellerAvatar = sellerRes.result.data.avatar;
			} else {
				uni.showToast({
					icon: 'none',
					title: sellerRes.result.message || '查询用户头像失败'
				});
			}
		},
		async initSession() {
			let res;
			try {
				if (this.sellerAndItemInfo.otherId && this.userInfo.userId === this.sellerInfo.sellerId) {
					res = await uniCloud.callFunction({
						name: 'getChatSessionBySellerIdAndUserId',
						data: { userId: this.sellerAndItemInfo.otherId, sellerId: this.userInfo.userId, related_id:this.sellerAndItemInfo._id,type: 1 }
					});
				} else {
					res = await uniCloud.callFunction({
						name: 'getChatSessionBySellerIdAndUserId',
						data: { userId: this.userInfo.userId, sellerId: this.sellerInfo.sellerId, related_id:this.sellerAndItemInfo._id, type: 1 }
					});
				}

				if (res.result.success) {
					this.sessionId = res.result.sessionId;
					this.updateReadedMessage({ sessionId: this.sessionId });
					await uniCloud.callFunction({
						name: 'markMessagesAsRead',
						data: { sessionId: this.sessionId, userId: this.userInfo.userId }
					});
					this.fetchMessages();
				} else {
					const createRes = await uniCloud.callFunction({
						name: 'saveChatSession',
						data: { userId: this.userInfo.userId, sellerId: this.sellerInfo.sellerId, type: 1, relatedItemId: this.sellerAndItemInfo._id }
					});
					if (createRes.result.success) {
						this.sessionId = createRes.result.sessionId;
						this.fetchMessages();
					}
				}
			} catch (e) {
				uni.showToast({
					title: `错误: ${e.message}`,
					icon: 'none',
					duration: 2000
				});
			}
		},
		async fetchMessages() {
			try {
				const res = await uniCloud.callFunction({
					name: 'getChatMessageBySessionId',
					data: { sessionId: this.sessionId }
				});
				if (res.result.success) {
					this.messageList = res.result.messages.map((msg) => ({
						senderId: msg.sender_id,
						content: msg.content,
						timestamp: msg.created_at
					}));
					this.scrollToBottom(); // 优化：调用统一的方法
				}
			} catch (e) {
				uni.showToast({
					title: `错误: ${e.message}`,
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.loading = false;
			}
		},
		// [GoEasy 修改] 使用 GoEasy 发送消息并保存到云数据库
		sendMessage() {
			if (!this.message.trim()) return;
			GoEasy.im.createTextMessage({
				text: this.message,
				to: this.to,
				onSuccess: (message) => {
					message.payload.customData = {
						sessionId: this.sessionId,
						type: 1
					};

					// 本地立即显示
					this.messageList.push({
						senderId: this.userInfo.userId,
						content: this.message,
						timestamp: Date.now()
					});

					this.updateSendMessage({ message: this.message,sessionId: this.sessionId,type: 1,otherUserId: this.to.id});

					this.scrollToBottom();

					// 发送消息并保存到云数据库
					GoEasy.im.sendMessage({
						message: message,
						onSuccess: async () => {
							try {
								await uniCloud.callFunction({
									name: 'saveMessage',
									data: {
										sessionId: this.sessionId,
										userId: this.userInfo.userId,
										sellerId: this.to.id, // 优化：使用 to.id 统一接收者
										type: 1,
										messageContent: message.payload.text
									}
								});
							} catch (e) {
								uni.showToast({
									title: `保存消息失败: ${e.message}`,
									icon: 'none'
								});
							}
						},
						onFailed: (error) => {
							uni.showToast({
								title: `发送失败: ${error.message}`,
								icon: 'none'
							});
						}
					});

					this.message = ''; // 清空输入框
				},
				onFailed: (error) => {
					uni.showToast({
						title: `创建消息失败: ${error.message}`,
						icon: 'none'
					});
				}
			});
		},
		buyNow() {
			uni.navigateTo({
				url: `/pages/item/purchase/purchase?sellerAndItemInfo=${JSON.stringify(this.sellerAndItemInfo)}`
			});
		},
		// 优化：提取 scrollToBottom 为独立方法
		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = 999999; // 直接设置一个足够大的值
			});
		},
		setupRealTimeMessages() {
			this.goeasy.im.on(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
		},
		// 优化：新增 onMessageReceived 方法处理接收消息
		onMessageReceived(message) {
			const senderId = message.senderId;
			const receiverId = message.receiverId;
			const friendId = this.userInfo.userId === senderId ? receiverId : senderId;
			console.log('接收到私信消息:', message);
			if (friendId === this.to.id) {
				// 优化：使用 to.id 判断
				this.messageList.push({
					senderId: message.senderId,
					content: message.payload.text,
					timestamp: message.timestamp
				});
				this.updateReadedMessage({ sessionId: this.sessionId });
				this.scrollToBottom();
			}
		}
	}
};
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100%;
}

/* 商品信息 */
.product-info {
	display: flex;
	align-items: center;
	padding: 10px;
	background-color: #fff;
	border-bottom: 1px solid #eee;
}

.product-image {
	width: 60px;
	height: 60px;
	border-radius: 8px;
	margin-right: 10px;
}

.product-details {
	flex-grow: 1;
	display: flex;
	align-items: center;
}

.product-price {
	font-size: 18px;
	font-weight: bold;
	color: #ff4d4f;
}

.buy-button-wrapper {
	margin-left: 10px;
}

/* 消息列表 */
.messages {
	flex-grow: 1;
	overflow-y: auto;
	width: 100%;
	padding: 10px;
	max-height: calc(100vh - 200px); /* 确保足够高度 */
}

.message-item {
	display: flex;
	width: 100%; /* 占满父容器宽度 */
	margin: 10px 0;
}

/* 卖家消息容器（整体靠左） */
.message-left-wrapper {
	display: flex;
	justify-content: flex-start; /* 靠左对齐 */
	align-items: flex-start; /* 顶部对齐 */
	width: 100%;
}

/* 卖家头像容器 */
.message-left-wrapper .avatar-container {
	margin-right: 4px; /* 卖家头像与消息气泡之间的距离 */
}

/* 卖家消息气泡 */
.message-left {
	background-color: #f1f1f1;
	margin-left: 10px; /* 卖家消息气泡与容器左侧的距离 */
	max-width: 70%; /* 控制消息气泡的最大宽度 */
	padding: 10px;
	border-radius: 12px;
}

/* 买家消息容器（整体靠右） */
.message-right-wrapper {
	display: flex;
	justify-content: flex-end; /* 靠右对齐 */
	align-items: flex-start; /* 顶部对齐 */
	width: 100%;
}

/* 买家头像容器 */
.message-right-wrapper .avatar-container {
	margin-left: 4px; /* 买家头像与消息气泡之间的距离 */
}

/* 买家消息气泡 */
.message-right {
	background-color: #007bff;
	color: white;
	margin-right: 10px; /* 买家消息气泡与容器右侧的距离 */
	max-width: 70%; /* 控制消息气泡的最大宽度 */
	padding: 10px;
	border-radius: 12px;
}

/* 头像样式 */
.avatar {
	width: 40px;
	height: 40px;
	border-radius: 50%;
}

/* 输入框 */
.input-wrapper {
	display: flex;
	align-items: center;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: white;
	padding: 10px;
	box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
	z-index: 10;
}

.input-field {
	flex-grow: 1;
	height: 40px;
	margin-right: 10px;
	padding: 10px;
	border-radius: 20px;
	border: 1px solid #ccc;
}

.send-button-wrapper {
	margin-left: 10px;
}
</style>
