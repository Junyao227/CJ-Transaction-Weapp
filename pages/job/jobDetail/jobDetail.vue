<template>
	<view class="container">
		<!-- 用户信息 -->
		<view class="user-info-card">
			<image :src="publisherAndJobInfo.avatar" class="user-avatar" />
			<view class="user-details">
				<text class="user-nickname">{{ publisherAndJobInfo.nickname }}</text>
				<view class="follow-btn-wrapper">
					<u-button class="follow-btn" v-if="!isFollowed" type="default"  @click="followUser">关注</u-button>
					<u-button class="follow-btn" v-else type="success"  @click="unfollowUser">已关注</u-button>
				</view>
			</view>
		</view>

		<!-- 兼职信息 -->
		<view class="job-info-card">
			<text class="job-title">{{ publisherAndJobInfo.title }}</text>
			<text class="job-location">📍 {{ publisherAndJobInfo.location }}</text>
			<view class="job-pay">
				<text class="pay-label">💰 工资：</text>
				<text class="pay-value">￥{{ publisherAndJobInfo.salary }}</text>
			</view>
			<!-- 结算周期 -->
			<view class="settlement-type-wrapper">
				<u-tag :type="getSettlementTypeTag(publisherAndJobInfo.job_type)" :text="getSettlementTypeLabel(publisherAndJobInfo.job_type)" size="mini" class="settlement-type"></u-tag>
			</view>
		</view>

		<!-- 兼职描述 -->
		<view class="job-description-card">
			<text class="description-label">描述：</text>
			<text class="description-content">{{ publisherAndJobInfo.description }}</text>
		</view>

		<!-- 收藏按钮和"申请此兼职"按钮 -->
		<view class="chat-btn-wrapper">
			<view class="collect-btn-wrapper">
				<u-button class="collect-btn" v-if="!isCollected" type="default"  @click="collectJob">收藏</u-button>
				<u-button class="collect-btn" v-else type="success"  @click="uncollectJob">已收藏</u-button>
			</view>
			<view class="chat-btn-wrapper-inner">
				<u-button class="chat-btn" type="primary" @click="startChat">申请此兼职</u-button>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			publisherAndJobInfo: {}, // 兼职信息
			isFollowed: false, // 关注状态
			isCollected: false // 收藏状态
		};
	},
	onLoad(options) {
		this.getDetailInfo(options);
	},
	methods: {
		getSettlementTypeTag(jobType) {
			switch (jobType) {
				case 1:
					return 'success';
				case 2:
					return 'primary';
				case 0:
				default:
					return 'info';
			}
		},
		getSettlementTypeLabel(jobType) {
			switch (jobType) {
				case 1:
					return '周结';
				case 2:
					return '月结';
				case 0:
				default:
					return '日结';
			}
		},
		startChat() {
			const userInfo = uni.getStorageSync('USER_INFO');
			uni.navigateTo({
				url: `/pages/job/chat/chat?publisherAndJobInfo=${JSON.stringify(this.publisherAndJobInfo)}`
			});
		},
		getDetailInfo(options) {
			if (options.job) {
				const job = JSON.parse(options.job);
				uniCloud.callFunction({
					name: 'getUserInfoByUserId',
					data: { userId: job.publisher_id },
					success: (res) => {
						if (res.result.success) {
							const userInfo = res.result.data;
							const { nickname, avatar } = userInfo;
							this.publisherAndJobInfo = { ...job, nickname, avatar };
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
						uni.showToast({
							icon: 'none',
							title: '调用云函数失败'
						});
						console.error('云函数调用失败:', err);
					}
				});
			}
		},
		checkFollowStatus() {
			if (!this.publisherAndJobInfo.publisher_id) return;
			uniCloud.callFunction({
				name: 'checkFollowStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.publisherAndJobInfo.publisher_id
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
			if (!this.publisherAndJobInfo._id) return;
			uniCloud.callFunction({
				name: 'checkCollectStatus',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.publisherAndJobInfo._id,
					type: 1 // 1 表示兼职
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
		followUser() {
			uniCloud.callFunction({
				name: 'followUser',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.publisherAndJobInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = true;
						uni.showToast({ title: '关注成功', icon: 'success' });
					}
				},
				fail: (err) => {
					uni.showToast({ title: '关注失败', icon: 'none' });
				}
			});
		},
		unfollowUser() {
			uniCloud.callFunction({
				name: 'unfollowUser',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					followedUserId: this.publisherAndJobInfo.publisher_id
				},
				success: (res) => {
					if (res.result.success) {
						this.isFollowed = false;
						uni.showToast({ title: '取消关注成功', icon: 'success' });
					}
				},
				fail: (err) => {
					uni.showToast({ title: '取消关注失败', icon: 'none' });
				}
			});
		},
		collectJob() {
			uniCloud.callFunction({
				name: 'collectItem',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.publisherAndJobInfo._id,
					type: 1 // 1 表示兼职
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = true;
						uni.showToast({ title: '收藏成功', icon: 'success' });
					}
				},
				fail: (err) => {
					uni.showToast({ title: '收藏失败', icon: 'none' });
				}
			});
		},
		uncollectJob() {
			uniCloud.callFunction({
				name: 'uncollectItem',
				data: {
					userId: uni.getStorageSync('USER_INFO').user_id,
					itemId: this.publisherAndJobInfo._id,
					type: 1 // 1 表示兼职
				},
				success: (res) => {
					if (res.result.success) {
						this.isCollected = false;
						uni.showToast({ title: '取消收藏成功', icon: 'success' });
					}
				},
				fail: (err) => {
					uni.showToast({ title: '取消收藏失败', icon: 'none' });
				}
			});
		}
	}
};
</script>

<style scoped>
/* 容器整体样式 */
.container {
  background-color: #f7f8fa;
  padding: 20px;
  padding-bottom: 100px; /* 底部按钮预留空间 */
}

/* 用户信息区块 */
.user-info-card {
  display: flex;
  align-items: center;
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.user-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-right: 20px;
}

.user-details {
  flex: 1;
  display: flex;
  justify-content: space-between; /* 按钮和昵称分开对齐 */
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
  line-height: 32px;
  border-radius: 16px;
  font-size: 14px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 按钮阴影 */
  transition: all 0.3s ease; /* 动画过渡效果 */
}

.follow-btn:hover {
  transform: scale(1.05); /* 鼠标悬浮轻微放大 */
}

/* 兼职信息区块 */
.job-info-card {
  background: #fff;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.job-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.job-location {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
}

.job-pay {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.pay-label {
  font-size: 16px;
  color: #666;
}

.pay-value {
  font-size: 20px;
  color: #ff4d4f;
  font-weight: bold;
}

/* 结算周期标签 */
.settlement-type-wrapper {
  display: flex;
  justify-content: flex-start; /* 标签左对齐 */
  margin-top: 10px; /* 与上方内容保持间距 */
}

.settlement-type {
  display: inline-block;
  padding: 4px 8px; /* 调整标签内边距 */
  border-radius: 4px; /* 圆角 */
  font-size: 12px; /* 字体大小 */
  background-color: #007bff; /* 背景颜色 */
  color: #fff; /* 文字颜色 */
}

/* 兼职描述区块 */
.job-description-card {
  background: #fff;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.description-label {
  font-size: 16px;
  color: #666;
  margin-bottom: 15px;
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

/* 收藏按钮 */
.collect-btn {
  width: 48%;
  height: 50px;
  border-radius: 25px;
  font-size: 14px;
  background-color: #f0f0f0;
  color: #333;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.collect-btn:hover {
  background-color: #ddd; /* 鼠标悬浮时更深颜色 */
}

/* 聊天按钮 */
.chat-btn {
  width: 48%;
  height: 50px;
  border-radius: 25px;
  font-size: 18px;
  background-color: #007bff; /* 蓝色按钮 */
  color: #fff;
  transition: background-color 0.3s ease;
}

.chat-btn:hover {
  background-color: #0056b3; /* 深蓝色 */
}

</style>
