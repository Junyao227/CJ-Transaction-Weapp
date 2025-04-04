<template>
	<view class="my-page">
		<!-- 用户信息区 -->
		<view class="user-section">
			<view class="user-info">
				<view class="avatar-wrapper">
					<image class="avatar" :src="userInfo.avatar" mode="aspectFill" />
				</view>
				<view class="user-detail">
					<text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
					<text class="user-id">ID: {{ userInfo.user_id }}</text>
				</view>
			</view>
		</view>

		<!-- 用户数据 -->
		<view class="user-count"><LabelCount :ops="mineCountOps"></LabelCount></view>

		<!---滑动tab-->
		<view class="tab">
			<u-tabs
				name="text"
				:list="tabsData"
				:current="current"
				@change="change"
				:activeStyle="default_activeColor"
				:inactiveStyle="default_inactiveColor"
				lineHeight="10"
				lineWidth="30"
			></u-tabs>
		</view>
		

		<!-- 跳蚤 -->
		<view class="order-nav" v-if="current === 0">
			<DialNav :mode="4" shadow :list="fleaNavOps" nameSize="24rpx" imgSize="72rpx"></DialNav>
		</view>
		<!-- 兼职 -->
		<view class="order-nav" v-if="current === 1">
			<DialNav :mode="4" shadow :list="sidelineNavOps" nameSize="24rpx" imgSize="72rpx"></DialNav>
		</view>
		<!-- 跑腿 -->
		<view class="order-nav" v-if="current === 2">
			<DialNav :mode="4" shadow :list="legworkNavOps" nameSize="24rpx" imgSize="72rpx"></DialNav>
		</view>

		<!-- 外层包裹条形布局部分 -->
		<view class="cell-container">
			<u-cell-group class="cell-group">
				<u-cell title="邀请有奖" icon="order" icon-size="45" @click="goToOrders" arrow></u-cell>
				<u-cell title="手机号验证" icon="setting" @click="goToSettings" arrow></u-cell>
				<u-cell title="关于我们" icon="setting" @click="goToAboutUs" arrow></u-cell>
				<u-cell title="退出登录" icon="logout" @click="showLogoutModal" arrow></u-cell>
				<!-- u-modal 弹出框 -->
				<u-modal :show="showModal" showCancelButton="true" showConfirmButton="true" :cancelText="'取消'" :confirmText="'确认退出'" @confirm="logout" @cancel="cancelLogout">
					<view>您确定要退出登录吗？</view>
				</u-modal>
			</u-cell-group>
		</view>
	</view>
</template>

<script>
import DialNav from '@/components/nav/dial-nav.vue';
import LabelCount from '@/components/nav/label-count';
export default {
	components: {
		DialNav,
		LabelCount
	},
	data() {
		return {
			// 模拟的用户信息
			userInfo: {},
			// 订单导航配置
			fleaNavOps: [
				{ name: '我发布的', img: require('../../static/nav/mine-order-2.png'), url: '/pages_mine/secondItem/published/published' },
				{ name: '我卖出的', img: require('../../static/nav/mine-order-2.png'), url: '/pages-mall/pages/order/list' },
				{ name: '我买到的', img: require('../../static/nav/mine-order-3.png'), url: '/pages-mall/pages/order/list' }
			],
			sidelineNavOps: [
				{ name: '我发布的', img: require('../../static/nav/mine-order-2.png'), url: '/pages_mine/partTimeJob/published/published' },
				{ name: '沟通过', img: require('../../static/nav/mine-order-2.png'), url: '/pages-mall/pages/order/list' },
				{ name: '待面试', img: require('../../static/nav/mine-order-3.png'), url: '/pages-mall/pages/order/list' }
			],
			legworkNavOps: [
				{ name: '我发布的', img: require('../../static/nav/mine-order-2.png'), url: '/pages-mall/pages/order/list' },
				{ name: '沟通过', img: require('../../static/nav/mine-order-2.png'), url: '/pages-mall/pages/order/list' },
				{ name: '我接单的', img: require('../../static/nav/mine-order-3.png'), url: '/pages-mall/pages/order/list' }
			],
			current: 0,
			showModal: false, // 控制弹出框显示
			tabsData: [
				{
					name: '跳蚤'
				},
				{
					name: '兼职'
				},
				{
					name: '跑腿'
				}
			],
			default_activeBarColor: this.$appTheme.appThemeColor,
			default_activeColor: this.$appTheme.appThemeTextBlackColor,
			default_inactiveColor: this.$appTheme.appThemeTextBlackColor,
			// 用户数据
			mineCountOps: [
				{ label: '积分', count: 0, url: '/pages_mine/points/points', type: 'points' },
				{ label: '粉丝', count: 0, url: '/pages_mine/list/fan/fan', type: 'fans' },
				{ label: '关注', count: 0, url: '/pages_mine/list/follow/follow', type: 'follow' },
				{ label: '收藏', count: 0, url: '/pages_mine/list/collect/collect', type: 'collections' }
			]
		};
	},
	onLoad() {
		this.getWxUserInfo();
		this.loadUserCounts();
	},
	onShow() {
		this.loadUserCounts();
	},
	methods: {
		// 切换tab时更新current的值
		change(tab) {
			console.log('index======', tab.index);
			this.current = tab.index; // 直接用一个变量控制标签页切换
		},
		goToOrders() {
			uni.navigateTo({
				url: '/pages/orders/orders' // 跳转到订单页面
			});
		},
		goToFavorites() {
			uni.navigateTo({
				url: '/pages/favorites/favorites' // 跳转到收藏页面
			});
		},
		goToSettings() {
			uni.navigateTo({
				url: '/pages/settings/settings' // 跳转到设置页面
			});
		},
		goToAboutUs() {
			uni.navigateTo({
				url: '/pages_mine/aboutUs/aboutUs' // 跳转到设置页面
			});
		},
		// 点击退出登录按钮时，显示退出确认框
		showLogoutModal() {
			this.showModal = true;
		},
		// 用户点击取消退出时的操作
		cancelLogout() {
			this.showModal = false; // 关闭弹出框
		},

		logout() {
			// 处理退出登录逻辑
			uni.showToast({
				title: '退出成功',
				icon: 'success'
			});
			// 清除本地缓存或进行其他退出操作
			uni.clearStorageSync();
			uni.reLaunch({
				url: '/pages/login/login' // 跳转到登录页面
			});
		},
		getWxUserInfo() {
			const UserInfo = uni.getStorageSync('USER_INFO'); // 或者直接传入一个 WxOpenId

			if (!UserInfo) {
				uni.showToast({
					icon: 'none',
					title: '未获取到用户的用户信息'
				});
				return;
			} else {
				this.userInfo = UserInfo;
			}
		},
		click(name) {
			this.$refs.uToast.success(`点击了第${name}个`);
		},
		async loadUserCounts() {
			try {
				const userId = uni.getStorageSync('USER_INFO').user_id; // 当前用户ID
				const res = await uniCloud.callFunction({
					name: 'getUserCounts', // 云函数名称
					data: { userId: userId }
				});
				console.log('loadUserCounts  res=======', res);
				if (res.result.success) {
					// 返回的统计数据
					const counts = res.result.data;
					// 更新 mineCountOps
					this.mineCountOps = this.mineCountOps.map((item) => {
						switch (item.type) {
							case 'points': // 映射到前端组件展示
								item.count = counts.score; // 显示积分字段 "score"
								break;
							case 'fans':
								item.count = counts.fans;
								break;
							case 'follow':
								item.count = counts.follow;
								break;
							case 'collections':
								item.count = counts.collections;
								break;
						}
						return item;
					});
				} else {
					uni.showToast({ icon: 'none', title: res.result.message || '获取数据失败' });
				}
			} catch (err) {
				console.error('获取用户统计数据失败:', err);
				uni.showToast({ icon: 'none', title: '获取数据失败' });
			}
		}
	}
};
</script>

<style scoped>
.my-page {
	padding: 0;
	background-color: #f7f7f7;
	padding-bottom: 30rpx;
}

/* 用户信息部分 - 无重叠 */
.user-section {
	background: linear-gradient(180deg, #2979ff 0%, #5094ff 100%);
	padding: 40rpx 30rpx 30rpx; /* 减少底部内边距 */
}

/* 用户数据部分 - 取消负边距 */
.user-count {
	background-color: #fff;
	margin: 10rpx 25rpx 20rpx; /* 改为正常外边距 */
}
.tab {
	background-color: #fff;
	margin: 0 25rpx 5rpx; /* 改为正常外边距 */
}

/* 订单导航部分 */
.order-nav {
	background-color: #fff;
	margin: 0 25rpx 20rpx;
}

/* 条形布局部分 */
.cell-container {
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
	margin: 0 25rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 用户信息细节调整 */
.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 30rpx; /* 增加与数据卡片的间距 */
}

.avatar-wrapper {
	width: 120rpx;
	height: 120rpx;
	margin-right: 30rpx;
}

.avatar {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	border: 4rpx solid #ffffff;
	background-color: #fff;
}

.nickname {
	font-size: 36rpx;
	color: #ffffff;
	font-weight: bold;
	display: block;
	margin-bottom: 10rpx;
}

.user-id {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.85);
}

/* 单元格样式 */
.cell-group {
	margin: 0;
}

.cell-group /deep/ .u-cell {
	padding: 28rpx 32rpx;
	border-bottom: 1rpx solid #f5f5f5;
}

.cell-group /deep/ .u-cell:last-child {
	border-bottom: none;
}

.cell-group /deep/ .u-cell__title-text {
	font-size: 28rpx;
	color: #333;
}

.cell-group /deep/ .u-icon {
	margin-right: 20rpx;
}

/* 底部安全区域 */
.safe-area-inset-bottom {
	padding-bottom: env(safe-area-inset-bottom);
}
</style>
