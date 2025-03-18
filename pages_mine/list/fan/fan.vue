<template>
	<view class="my-page">
		<scroll-view class="scroll-view" :scroll-y="true" @scrolltolower="loadMoreFans" lower-threshold="50">
			<u-list>
				<u-list-item v-for="(fan, index) in fanList" :key="index" @click="goToFanDetail(fan.user_id)">
					<view class="fan-details">
						<!-- 外部容器包裹头像，控制头像与其他信息的距离 -->
						<view class="fan-avatar"><u-avatar :src="fan.avatar" size="40" shape="square" /></view>

						<view class="fan-info">
							<text class="fan-name">{{ fan.nickname }}</text>
							<text class="fan-id">ID: {{ fan.user_id }}</text>
						</view>
					</view>
				</u-list-item>
			</u-list>
			<!-- 显示加载中动画 -->
			<u-loading-icon :show="loading" text="加载中..." />
			<u-empty :show="!fanList || fanList.length === 0" mode="data"></u-empty>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			fanList: [], // 存储粉丝列表
			loading: false // 加载状态
		};
	},
	onLoad() {
		this.loadFans();
	},
	methods: {
		// 加载粉丝列表数据
		async loadFans() {
			if (this.loading) return; // 防止重复加载

			this.loading = true; // 设置为加载中
			try {
				const userId = uni.getStorageSync('USER_INFO').user_id; // 当前用户ID
				const res = await uniCloud.callFunction({
					name: 'getFansList', // 云函数名称
					data: { userId: userId }
				});

				if (res.result.success) {
					// 将新数据追加到已有的粉丝列表中
					this.fanList = [...this.fanList, ...res.result.data];
				} else {
					uni.showToast({ icon: 'none', title: '获取粉丝列表失败' });
				}
			} catch (err) {
				uni.showToast({ icon: 'none', title: '加载失败' });
			} finally {
				this.loading = false; // 加载完毕
			}
		},
		// 点击粉丝跳转到粉丝详情
		goToFanDetail(userId) {
			uni.navigateTo({
				url: `/pages_mine/list/fanDetail/fanDetail?userId=${userId}`
			});
		},
		// 滚动到底部时加载更多粉丝
		loadMoreFans() {
			this.loadFans(); // 加载更多粉丝
		}
	}
};
</script>

<style scoped>
.my-page {
	padding: 20px;
}

.fan-details {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
}

.fan-avatar {
	margin-right: 13px;
}

.fan-info {
	display: flex;
	align-items: center; /* 让昵称和ID在同一行 */
}

.fan-name {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	margin-right: 18px; /* 调整昵称和ID之间的间距 */
}

.fan-id {
	font-size: 12px;
	color: #888;
}

u-button {
	margin-top: 20px;
}

/* ScrollView样式调整 */
.scroll-view {
	max-height: 100%;
	overflow-y: auto;
}
</style>
