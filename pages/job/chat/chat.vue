<template>
	<view class="container">
		<!-- 头部信息 -->
		<view class="header">
			<u--image :src="sellerInfo.sellerAvatar" width="50px" height="50px" shape="circle" />
			<view class="user-info">
				<text class="user-name">{{ sellerInfo.sellerNickname }}</text>
				<text class="user-title">{{ sellerInfo.company }} · {{ sellerInfo.position }}</text>
			</view>
		</view>

		<!-- 快捷操作按钮 -->
		<view class="quick-actions">
			<view class="action-item-wrapper">
				<u-button size="mini" plain @click="sendJobInfo">换电话</u-button>
			</view>
			<view class="action-item-wrapper">
				<u-button size="mini" plain @click="sendWeChatInfo">换微信</u-button>
			</view>
			<view class="action-item-wrapper">
				<u-button size="mini" plain @click="sendResume">发简历</u-button>
			</view>
			<view class="action-item-wrapper">
				<u-button size="mini" plain>不感兴趣</u-button>
			</view>
		</view>

		<!-- 提示文本 -->
		<view class="chat-tips">以下是30天内的聊天记录</view>

		<!-- 消息列表 -->
		<!-- [修改] 调整消息布局，与二手商品页面一致 -->
		<scroll-view class="messages" scroll-y :scroll-top="scrollTop">
			<view v-for="(msg, index) in messages" :key="index" class="message-item">
				<!-- 卖家消息布局 -->
				<view v-if="msg.senderId !== userInfo.userId" class="message-left-wrapper">
					<view class="avatar-wrapper">
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
					<view class="avatar-wrapper">
						<u--image :src="userInfo.userAvatar" width="40px" height="40px" shape="circle" />
					</view>
				</view>
			</view>
		</scroll-view>

		<!-- 底部输入框 -->
		<view class="input-wrapper">
			<view class="common-reply" @click="sendJobInfo">常</view>
			<u--input v-model="message" type="text" placeholder="输入消息..." class="input-field" />
			<view class="send-button-wrapper">
				<u-button type="primary" size="normal" @click="sendMessage">发送</u-button>
			</view>
			<view class="icon" @click="openEmojiPicker">😊</view>
			<view class="icon" @click="openFilePicker">➕</view>
		</view>
	</view>
</template>

<script>
const GoEasy = uni.$GoEasy;

export default {
	data() {
		return {
			userInfo: {
				userId: '',
				userAvatar: ''
			},
			sellerInfo: {
				sellerId: '',
				sellerAvatar: '',
				sellerNickname: '招聘经理',
				company: '冰智科技',
				position: '高级技术总监'
			},
			sessionId: '', // 会话ID
			messages: [], // 消息列表
			message: '', // 用户输入的消息
			scrollTop: 0, // 控制滚动位置
			emojiPickerVisible: false, // 表情包选择框的显示状态
			filePickerVisible: false, // 文件选择框的显示状态
			selectedFile: null, // 选择的文件
			publisherAndJobInfo: {},
			// [新增] 从二手商品页面添加的 GoEasy 相关属性
			to: {}, // GoEasy 发送目标
			goeasy: null,
			loading: true // 添加加载状态
		};
	},
	onLoad(options) {
		const publisherAndJobInfo = JSON.parse(options.publisherAndJobInfo);
		this.publisherAndJobInfo = publisherAndJobInfo;
		
		console.log("兼职页面接收到的兼职信息 publisherAndJobInfo",publisherAndJobInfo);
		const userInfo = uni.getStorageSync('USER_INFO');
		this.userInfo.userId = userInfo.user_id;
		this.userInfo.userAvatar = userInfo.avatar;

		this.sellerInfo.sellerAvatar = publisherAndJobInfo.avatar;
		this.sellerInfo.sellerId = publisherAndJobInfo.publisher_id;
		this.sellerInfo.sellerNickname = publisherAndJobInfo.nickname;

		// [新增] 从二手商品页面添加的 GoEasy 初始化
		this.to = {
			id: this.publisherAndJobInfo.otherId && this.userInfo.userId === this.sellerInfo.sellerId ? this.publisherAndJobInfo.otherId : this.sellerInfo.sellerId,
			type: GoEasy.IM_SCENE.PRIVATE,
			data: {
				name: this.sellerInfo.sellerNickname || this.sellerInfo.sellerId,
				avatar: this.sellerInfo.sellerAvatar
			}
		};
		this.goeasy = GoEasy;
		this.connectGoEasy();

		this.initSession();
		// [新增] 设置实时消息监听
		this.setupRealTimeMessages();
	},
	// [新增] 页面卸载时清理 GoEasy 监听器
	onUnload() {
		this.goeasy.im.off(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
	},
	methods: {
		// [新增] 从二手商品页面添加的 GoEasy 连接方法
		connectGoEasy() {
			this.goeasy.connect({
				id: this.userInfo.userId,
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
		// [修改] 增强错误处理，与二手商品页面保持一致
		async initSession() {
			let res;
			try {
				if (this.publisherAndJobInfo.otherId && this.userInfo.userId === this.sellerInfo.sellerId) {
					res = await uniCloud.callFunction({
						name: 'getChatSessionBySellerIdAndUserId',
						data: { userId: this.publisherAndJobInfo.otherId, sellerId: this.userInfo.userId, related_id:this.sellerAndItemInfo._id, type: 2 }
					});
				} else {
					res = await uniCloud.callFunction({
						name: 'getChatSessionBySellerIdAndUserId',
						data: { userId: this.userInfo.userId, sellerId: this.sellerInfo.sellerId,  related_id:this.sellerAndItemInfo._id,type: 2 }
					});
				}

				if (res.result.success) {
					this.sessionId = res.result.sessionId;
					await uniCloud.callFunction({
						name: 'markMessagesAsRead',
						data: { sessionId: this.sessionId, userId: this.userInfo.userId }
					});
					this.fetchMessages();
				} else {
					const createRes = await uniCloud.callFunction({
						name: 'saveChatSession',
						data: { userId: this.userInfo.userId, sellerId: this.sellerInfo.sellerId, type: 2, relatedItemId: this.publisherAndJobInfo._id }
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
		// [修改] 更新消息映射并添加加载状态
		async fetchMessages() {
			try {
				const res = await uniCloud.callFunction({
					name: 'getChatMessageBySessionId',
					data: { sessionId: this.sessionId }
				});
				if (res.result.success) {
					this.messages = res.result.messages.map((msg) => ({
						senderId: msg.sender_id,
						content: msg.content,
						timestamp: msg.created_at
					}));
					this.scrollToBottom(); // [修改] 使用 scrollToBottom 方法替代内联逻辑
				}
			} catch (e) {
				uni.showToast({
					title: `错误: ${e.message}`,
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.loading = false; // [新增] 设置加载状态为 false
			}
		},
		// [修改] 替换为基于 GoEasy 的消息发送逻辑
		sendMessage() {
			if (!this.message.trim()) return;
			GoEasy.im.createTextMessage({
				text: this.message,
				to: this.to,
				onSuccess: (message) => {
					this.messages.push({
						senderId: this.userInfo.userId,
						content: this.message,
						timestamp: Date.now()
					});
					this.scrollToBottom();

					GoEasy.im.sendMessage({
						message: message,
						onSuccess: async () => {
							try {
								await uniCloud.callFunction({
									name: 'saveMessage',
									data: {
										sessionId: this.sessionId,
										userId: this.userInfo.userId,
										sellerId: this.to.id,
										type: 2,
										messageContent: message.payload.text,
										relatedItemId: this.publisherAndJobInfo._id
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

					this.message = '';
				},
				onFailed: (error) => {
					uni.showToast({
						title: `创建消息失败: ${error.message}`,
						icon: 'none'
					});
				}
			});
		},
		// [修改] 与 GoEasy 消息发送集成
		sendJobInfo() {
			const jobInfo = '我对贵公司招聘岗位非常感兴趣，希望能够得到面试机会！';
			this.message = jobInfo;
			this.sendMessage();
		},
		// [修改] 与 GoEasy 消息发送集成
		sendWeChatInfo() {
			const weChatInfo = '这是我的微信号：wechat12345。';
			this.message = weChatInfo;
			this.sendMessage();
		},
		// [修改] 保持不变但触发文件选择器
		sendResume() {
			this.openFilePicker();
		},
		// [新增] 从二手商品页面添加的可复用滚动方法
		scrollToBottom() {
			this.$nextTick(() => {
				this.scrollTop = this.messages.length * 100;
			});
		},
		// [新增] 从二手商品页面添加的实时消息设置
		setupRealTimeMessages() {
			this.goeasy.im.on(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
		},
		// [新增] 处理来自 GoEasy 的接收消息
		onMessageReceived(message) {
			const senderId = message.senderId;
			const receiverId = message.receiverId;
			const friendId = this.userInfo.userId === senderId ? receiverId : senderId;
			if (friendId === this.to.id) {
				this.messages.push({
					senderId: message.senderId,
					content: message.payload.text,
					timestamp: message.timestamp
				});
				this.scrollToBottom();
			}
		},
		// [修改] 保持不变
		openEmojiPicker() {
			this.emojiPickerVisible = true;
		},
		// [修改] 与 GoEasy 消息发送集成
		selectEmoji(emoji) {
			this.message += emoji;
			this.emojiPickerVisible = false;
			this.sendMessage();
		},
		// [修改] 保持不变
		openFilePicker() {
			uni.chooseFile({
				count: 1,
				extension: ['pdf'],
				success: (res) => {
					this.selectedFile = res.tempFiles[0];
					this.sendFile();
				}
			});
		},
		// [修改] 与 GoEasy 消息发送集成
		sendFile() {
			if (this.selectedFile) {
				uniCloud.uploadFile({
					filePath: this.selectedFile.path,
					fileName: 'resume.pdf',
					success: (uploadRes) => {
						const resumeUrl = uploadRes.fileID;
						this.message = `我的简历：${resumeUrl}`;
						this.sendMessage();
					}
				});
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

.header {
	display: flex;
	align-items: center;
	padding: 10px;
	background-color: white;
	border-bottom: 1px solid #eee;
}

.user-info {
	margin-left: 10px;
}

.user-name {
	font-size: 18px;
	font-weight: bold;
}

.user-title {
	font-size: 14px;
	color: gray;
}

.quick-actions {
	display: flex;
	justify-content: space-around;
	padding: 10px;
	background-color: #f9f9f9;
}

.action-item-wrapper {
	display: flex;
	align-items: center;
	justify-content: center;
}

.chat-tips {
	text-align: center;
	color: gray;
	padding: 5px 0;
	font-size: 12px;
}

.messages {
	flex-grow: 1;
	overflow-y: auto;
	padding: 10px;
	max-height: calc(100vh - 200px); /* 确保消息列表的高度合适 */
}

.message-item {
	display: flex;
	margin: 10px 0;
}

.message-time {
	text-align: center;
	font-size: 12px;
	color: #999;
	margin: 10px 0;
}

.message-left-wrapper,
.message-right-wrapper {
	display: flex;
	align-items: center;
	width: 100%;
}

.message-left {
	background-color: #f1f1f1;
	max-width: 70%;
	padding: 10px;
	border-radius: 12px;
	margin-right: auto; /* 靠左显示 */
}

.message-right {
	background-color: #007bff;
	color: white;
	max-width: 70%;
	padding: 10px;
	border-radius: 12px;
	margin-left: auto; /* 靠右显示 */
}

.avatar-wrapper {
	margin: 0 10px;
}

.input-wrapper {
	display: flex;
	align-items: center;
	padding: 10px;
	background-color: white;
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
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

.icon {
	margin-left: 10px;
}
</style>
