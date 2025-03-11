<template>
	<view class="my-page">
		<!-- 用户信息部分 -->
		<view class="user-info">
			<u-avatar size="80" :src="userInfo.avatar" />
			<view class="user-details">
				<text class="user-name">{{ userInfo.nickname }}</text>
				<text class="user-id">ID: {{ userInfo.user_id }}</text>
			</view>
		</view>

		<!-- 用户数据 -->
		<view class="user-count"><LabelCount :ops="mineCountOps"></LabelCount></view>

		<!---滑动tab-->

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
	padding: 20px;
}

/* 用户信息部分 */
.user-info {
	display: flex;
	align-items: center;
	margin-bottom: 30px;
	background-color: #fff;
	padding: 20px;
	border-radius: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.user-info u-avatar {
	margin-right: 20px;
}

.user-details {
	flex: 1;
}

.user-name {
	font-size: 18px;
	font-weight: bold;
}

.user-id {
	font-size: 14px;
	color: #888;
}

/* 栅格布局 */
.grid-container {
	margin-bottom: 20px; /* 给栅格布局增加底部间隔 */
}

.grid-section .u-grid-item {
	background-color: #f5f5f5; /* 背景色 */
	border-radius: 10px;
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 阴影效果 */
	padding: 20px;
	text-align: center;
}

.grid-text {
	display: block;
	margin-top: 8px;
}

/* 我的条形布局部分 */
.cell-container {
	margin-top: 20px; /* 增加顶部间隔 */
}

u-cell {
	margin-bottom: 10px;
	background-color: #fff; /* 设置条形布局背景颜色 */
	border-radius: 10px; /* 圆角效果 */
	box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* 阴影效果 */
	padding: 15px;
}
</style>
