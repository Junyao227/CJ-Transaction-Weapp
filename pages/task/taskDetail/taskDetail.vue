<template>
	<view class="container">
		<!-- 用户信息 -->
		<view class="user-info">
			<image :src="publisherAndTaskInfo.avatar" class="user-avatar" />
			<view class="user-details">
				<text class="user-nickname">{{ publisherAndTaskInfo.nickname }}</text>
				<view class="follow-btn-wrapper">
					<u-button class="follow-btn" v-if="!isFollowed" type="default"  @click="followUser">关注</u-button>
					<u-button class="follow-btn" v-else type="success"  @click="unfollowUser">已关注</u-button>
				</view>
			</view>
		</view>

		<!-- 跑腿任务信息 -->
		<view class="task-info">
			<text class="task-title">{{ publisherAndTaskInfo.title }}</text>
			<view class="task-pickup">
				<text class="pickup-label">取货地：</text>
				<text class="pickup-value">{{ publisherAndTaskInfo.pickup_location }}</text>
			</view>
			<view class="task-location">
				<text class="location-label">目的地：</text>
				<text class="location-value">{{ publisherAndTaskInfo.delivery_location }}</text>
			</view>
			<view class="task-reward">
				<text class="reward-label">报酬：</text>
				<text class="reward-value">￥{{ publisherAndTaskInfo.reward }}</text>
			</view>
		</view>

		<!-- 跑腿任务描述 -->
		<view class="task-description">
			<text class="description-label">任务描述：</text>
			<text class="description-content">{{ publisherAndTaskInfo.description }}</text>
		</view>

		<!-- 底部按钮 -->
		<view class="chat-btn-wrapper">
			<view class="collect-btn-wrapper">
				<u-button class="collect-btn" v-if="!isCollected" type="default" @click="collectItem">收藏</u-button>
				<u-button class="collect-btn" v-else type="success" @click="uncollectItem">已收藏</u-button>
			</view>
			<view class="chat-btn-wrapper-inner">
				<u-button class="chat-btn" type="primary" @click="startChat">我要接单</u-button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			publisherAndTaskInfo: {}, // 跑腿任务信息对象
			isFollowed: false, // 是否已关注
			isCollected: false // 是否已收藏
		};
	},
	onLoad(options) {
		// 获取传递的跑腿任务对象
		this.getDetailInfo(options);
	},
	methods: {
		startChat() {
			const userInfo = uni.getStorageSync('USER_INFO');
			uni.navigateTo({
				url: `/pages/task/chat/chat?publisherAndTaskInfo=${JSON.stringify(this.publisherAndTaskInfo)}`
			});
		},
		getDetailInfo(options) {
			if (options.task) {
				const task = JSON.parse(options.task); // 解析传递的跑腿任务对象

				// 调用云函数获取用户信息
				uniCloud.callFunction({
					name: 'getUserInfoByUserId',
					data: { userId: task.publisher_id },
					success: (res) => {
						if (res.result.success) {
							const userInfo = res.result.data;
							const { nickname, avatar } = userInfo;
							this.publisherAndTaskInfo = { ...task, nickname, avatar };
							this.checkFollowStatus();
							this.checkCollectStatus();
						} else {
							uni.showToast({
								icon: 'none',
								title: res.result.message || '查询失败'
							});
						}
					},
					fail: (err) => {
						uni.showToast({ icon: 'none', title: '调用云函数失败' });
						console.error('云函数调用失败:', err);
					}
				});
			}
		},
		// 检查关注状态
		checkFollowStatus() {
			if (!this.publisherAndTaskInfo.publisher_id) return;
			uniCloud.callFunction({
				name: 'checkFollowStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.publisherAndTaskInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = res.result.isFollowed;
					}
				},
				fail: (err) => console.error('检查关注状态失败:', err)
			});
		},
		// 检查收藏状态
		checkCollectStatus() {
			if (!this.publisherAndTaskInfo._id) return;
			uniCloud.callFunction({
				name: 'checkCollectStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.publisherAndTaskInfo._id,
					type: 2 // 2 表示跑腿任务
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = res.result.isCollected;
					}
				},
				fail: (err) => console.error('检查收藏状态失败:', err)
			});
		},
		// 关注用户
		followUser() {
			uniCloud.callFunction({
				name: 'followUser',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.publisherAndTaskInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = true;
						uni.showToast({ title: '关注成功', icon: 'success' });
					}
				},
				fail: (err) => console.error('关注失败:', err)
			});
		},
		// 取消关注用户
		unfollowUser() {
			uniCloud.callFunction({
				name: 'unfollowUser',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.publisherAndTaskInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = false;
						uni.showToast({ title: '取消关注成功', icon: 'success' });
					}
				},
				fail: (err) => console.error('取消关注失败:', err)
			});
		},
		// 收藏任务
		collectItem() {
			uniCloud.callFunction({
				name: 'collectItem',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.publisherAndTaskInfo._id,
					type: 2 // 2 表示跑腿任务
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = true;
						uni.showToast({ title: '收藏成功', icon: 'success' });
					}
				},
				fail: (err) => console.error('收藏失败:', err)
			});
		},
		// 取消收藏任务
		uncollectItem() {
			uniCloud.callFunction({
				name: 'uncollectItem',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.publisherAndTaskInfo._id,
					type: 2 // 2 表示跑腿任务
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = false;
						uni.showToast({ title: '取消收藏成功', icon: 'success' });
					}
				},
				fail: (err) => console.error('取消收藏失败:', err)
			});
		}
	}
};
</script>

<style scoped>
.container {
	padding: 20px;
	background-color: #f7f8fa;
}

/* 用户信息 */
.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
	padding: 15px;
	background-color: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.user-avatar {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	margin-right: 15px;
}

.user-details {
	flex: 1;
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.user-nickname {
	font-size: 18px;
	font-weight: bold;
	color: #333;
}

.follow-btn {
	width: 70px;
	height: 32px;
	border-radius: 16px;
	font-size: 14px;
	text-align: center;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	transition: all 0.3s ease;
}

/* 跑腿任务信息 */
.task-info {
	margin-bottom: 20px;
	padding: 15px;
	background-color: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.task-title {
	font-size: 20px;
	font-weight: bold;
	color: #333;
	margin-bottom: 15px;
}

.task-location,
.task-pickup,
.task-reward {
	display: flex;
	align-items: center;
	margin-top: 10px;
}

.location-label,
.pickup-label,
.reward-label {
	font-size: 16px;
	color: #666;
	width: 80px; /* 固定标签宽度，使内容对齐 */
}

.location-value,
.pickup-value,
.reward-value {
	font-size: 16px;
	color: #333;
	font-weight: bold;
	flex: 1; /* 使内容部分占据剩余空间 */
}

.reward-value {
	color: #ff4d4f; /* 报酬金额使用红色 */
}

/* 跑腿任务描述 */
.task-description {
	margin-bottom: 20px;
	padding: 15px;
	background-color: #fff;
	border-radius: 12px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.description-label {
	font-size: 16px;
	color: #666;
	margin-bottom: 10px;
}

.description-content {
	font-size: 16px;
	color: #333;
	line-height: 1.6;
}

/* 收藏和聊天按钮区块 */
.chat-btn-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 10px;

  /* 固定在底部 */
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%; /* 宽度占满屏幕 */
  z-index: 100; /* 保证按钮在其他内容之上 */
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

.chat-btn,
.collect-btn {
	width: 48%;
	height: 50px;
	border-radius: 25px;
	font-size: 16px;
}

.chat-btn {
	background-color: #007bff;
	color: #fff;
}

.chat-btn:hover {
	background-color: #0056b3;
}

.collect-btn {
	background-color: #f0f0f0;
	color: #333;
}

.collect-btn:hover {
	background-color: #ddd;
}
</style>
