<template>
	<view class="container">
		<!-- 收货地址 -->
		<view class="address-section" v-if="userInfo.shipping">
			<view class="address-label">收货地址</view>
			<view class="address-details">{{ userInfo.shipping }}</view>
		</view>
		<view class="address-section" v-else>
			<view class="address-label">收货地址</view>
			<view class="address-details" @click="navigateToAddressSetting">请先去填写收货地址</view>
		</view>

		<!-- 商品信息 -->
		<view class="item-section">
			<view class="item-label">商品信息</view>
			<view class="item-details">
				<view class="item-name">{{ sellerAndItemInfo.itemName }}</view>
				<view class="item-price">￥{{ sellerAndItemInfo.itemPrice }}</view>
			</view>
		</view>

		<!-- 底部固定栏 -->
		<view class="bottom-bar">
			<view class="total-section">
				<view class="total-label">合计：</view>
				<view class="total-amount">￥{{ sellerAndItemInfo.itemPrice }}</view>
			</view>
			<button class="confirm-button" @click="confirmPurchase">确认购买</button>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			userInfo: {
				userId: '',
				userAvatar: '',
				shipping: ''
			},
			sellerAndItemInfo: {
				itemName: '闲置一套红米k60充电器',
				itemPrice: 30.0
			},
			itemOrder: {
				item_id: '',
				publisher_id: '',
				receive_id: '',
				count: 0,
				total_amount: 0,
				status: 0
			}
		};
	},
	onLoad(options) {
		const userInfo = uni.getStorageSync('USER_INFO');
		this.userInfo.userId = userInfo.userId;
		this.userInfo.userAvatar = userInfo.userAvatar;
		this.userInfo.shipping = userInfo.shipping;
	},
	methods: {
		navigateToAddressSetting() {
			uni.navigateTo({
				url: '/pages/settings/address'
			});
		},
		confirmPurchase() {
			// 确认购买逻辑
			uni.showToast({
				title: '购买成功',
				icon: 'success'
			});
		}
	}
};
</script>

<style>
.container {
	padding: 20px;
	padding-bottom: 80px; /* 为底部固定栏留出空间 */
}

.address-section, .item-section {
	margin-bottom: 20px;
}

.address-label, .item-label {
	font-size: 16px;
	font-weight: bold;
	margin-bottom: 10px;
}

.address-details, .item-details {
	font-size: 14px;
}

.item-name {
	margin-bottom: 5px;
}

.item-price {
	color: #e64340;
	font-weight: bold;
}

.bottom-bar {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	background-color: white;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 20px;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.total-section {
	display: flex;
	align-items: center;
}

.total-label {
	font-size: 16px;
	font-weight: bold;
}

.total-amount {
	font-size: 16px;
	color: #e64340;
	font-weight: bold;
	margin-left: 5px;
}

.confirm-button {
	background-color: #e64340;
	color: white;
	font-size: 16px;
	padding: 10px 20px;
	border-radius: 5px;
	border: none;
}
</style>
