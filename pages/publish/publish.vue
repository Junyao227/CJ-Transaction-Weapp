<template>
	<view class="container">
		<!-- 发布选项列表 -->
		<view class="content">
			<view class="publish-list">
				<!-- 发布二手商品 -->
				<view class="publish-item" @click="goToPublishGoods()">
					<view class="item-left">
						<view class="icon-wrapper">
							<u-icon name="file-text" size="24" color="#5677FC" />
						</view>
						<text class="item-title">发布二手商品</text>
					</view>
					<u-icon name="arrow-right-double" size="16" color="#CCCCCC" />
				</view>
				<!-- 发布兼职信息 -->
				<view class="publish-item" @click="goToPublishPartTime()">
					<view class="item-left">
						<view class="icon-wrapper">
							<u-icon name="file-text" size="24" color="#5677FC" />
						</view>
						<text class="item-title">发布兼职信息</text>
					</view>
					<u-icon name="arrow-right-double" size="16" color="#CCCCCC" />
				</view>
				<!-- 发布跑腿信息 -->
				<view class="publish-item" @click="goToPublishErrand()">
					<view class="item-left">
						<view class="icon-wrapper">
							<u-icon name="file-text" size="24" color="#5677FC" />
						</view>
						<text class="item-title">发布跑腿信息</text>
					</view>
					<u-icon name="arrow-right-double" size="16" color="#CCCCCC" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			default_activeBarColor: this.$appTheme.appThemeColor,
			default_activeColor: this.$appTheme.appThemeTextBlackColor,
			default_inactiveColor: this.$appTheme.appThemeTextBlackColor
		};
	},
	onLoad() {},
	methods: {
		// 跳转到发布二手商品页面
		goToPublishGoods() {
			uni.navigateTo({
				url: '/pages_publish/second-hand-item/second-hand-item'
			});
		},

		// 跳转到发布兼职信息页面
		goToPublishPartTime() {
			uni.navigateTo({
				url: '/pages_publish/part-time-job/part-time-job'
			});
		},

		// 跳转到发布跑腿信息页面
		goToPublishErrand() {
			uni.navigateTo({
				url: '/pages_publish/errand-task/errand-task'
			});
		}
	}
};
</script>

<style>
page {
	height: 100%;
}
.container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #f8f8f8;
}

.notification {
	margin-left: 32rpx;
}
.content {
	flex: 1;
	padding: 24rpx;
	overflow-y: auto;
}
.publish-list {
	background-color: #ffffff;
	border-radius: 12rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
}
.publish-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx;
	border-bottom: 1px solid #eeeeee;
}
.publish-item:last-child {
	border-bottom: none;
}
.item-left {
	display: flex;
	align-items: center;
}
.icon-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 48px;
	height: 48px;
	margin-right: 24rpx;
	border-radius: 24rpx;
	background-color: #f5f7ff;
}
.item-title {
	font-size: 14px;
	color: #333333;
}
</style>
