<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<uni-icons type="left" size="24" class="back-icon" />
			<view class="header-right">
				<uni-icons type="more-filled" size="24" class="more-icon" />
				<uni-icons type="camera-filled" size="24" class="camera-icon" />
			</view>
		</view>

		<!-- 标签页 -->
		<view class="tabs">
			<view v-for="(tab, index) in tabList" :key="index" :class="['tab-item', { active: activeTab === index }]" @click="tabChanged(index)">
				<text class="tab-text">{{ tab.name }}</text>
			</view>
		</view>

		<!-- 商品列表 -->
		<scroll-view scroll-y class="goods-list">
			<view v-if="activeTab === 0">
				<view v-for="(item, index) in onSaleItems" :key="index" class="goods-item">
					<image :src="item.imageUrl" class="goods-image" mode="aspectFill" />
					<view class="goods-info">
						<text class="goods-title">{{ item.title }}</text>
						<text class="goods-price">价格: ¥{{ item.price }}</text>
					</view>
				</view>
				<u-empty :show="!onSaleItems || onSaleItems.length === 0" mode="data"></u-empty>
			</view>
			<view v-if="activeTab === 1">
				<view v-for="(item, index) in draftItems" :key="index" class="goods-item">
					<image :src="item.imageUrl" class="goods-image" mode="aspectFill" />
					<view class="goods-info">
						<text class="goods-title">{{ item.title }}</text>
						<text class="goods-price">价格: ¥{{ item.price }}</text>
					</view>
				</view>
				<u-empty :show="!draftItems || draftItems.length === 0" mode="data"></u-empty>
			</view>
			<view v-if="activeTab === 2">
				<view v-for="(item, index) in offShelfItems" :key="index" class="goods-item">
					<image :src="item.imageUrl" class="goods-image" mode="aspectFill" />
					<view class="goods-info">
						<text class="goods-title">{{ item.title }}</text>
						<text class="goods-price">价格: ¥{{ item.price }}</text>
					</view>
				</view>
				<u-empty :show="!offShelfItems || offShelfItems.length === 0" mode="data"></u-empty>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			activeTab: 0,
			tabList: [{ name: '在卖' }, { name: '草稿' }, { name: '已下架' }],
			onSaleItems: [],
			draftItems: [],
			offShelfItems: []
		};
	},
	onLoad(options) {
		this.getItemList();
	},
	methods: {
		tabChanged(index) {
			this.activeTab = index;
		},
		async getItemList() {
			const userInfo = await uni.getStorageSync('USER_INFO');
			this.userInfo = userInfo;
			const allItemsRes = await uniCloud.callFunction({
				name: 'getItemList',
				data: { userId: this.userInfo.user_id, location: 'mine' }
			});
			if (allItemsRes.result.success) {
				let allItems = allItemsRes.result.data;
				await this.addImageUrls(allItems);
				this.onSaleItems = allItems.filter((item) => item.status === 0);
				this.draftItems = allItems.filter((item) => item.status === 1);
				this.offShelfItems = allItems.filter((item) => item.status === 2);
			} else {
				uni.showToast({ icon: 'none', title: allItemsRes.result.message || '获取二手商品数据失败' });
			}
		},
		async addImageUrls(items) {
			if (items.length === 0) return;
			const fileList = items.map((item) => ({ fileID: item.images, maxAge: 60 * 60 * 24 }));
			const result = await uniCloud.getTempFileURL({ fileList });
			if (result.fileList && result.fileList.length > 0) {
				const fileUrls = result.fileList.map((file) => file.tempFileURL);
				items.forEach((item, index) => {
					item.imageUrl = fileUrls[index];
				});
			} else {
				uni.showToast({ icon: 'none', title: '获取图片链接失败' });
			}
		}
	}
};
</script>

<style>
.container {
	display: flex;
	flex-direction: column;
	height: 100%;
	background-color: #f5f5f5;
}
.header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 30rpx;
	background-color: #ffffff;
}
.tabs {
  display: flex;
  background-color: #ffffff;
  padding: 0 30rpx;
  border-bottom: 1px solid #eeeeee;
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
  position: relative;
}

.tab-text {
  font-size: 14px;
  color: #666666;
}

.tab-item.active .tab-text {
  color: #1989fa;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40rpx;
  height: 4rpx;
  background-color: #1989fa;
  border-radius: 2rpx;
}
.goods-list {
	flex: 1;
	overflow: auto;
	padding: 20rpx;
}
.goods-item {
	display: flex;
	padding: 20rpx;
	background-color: #ffffff;
	border-radius: 12rpx;
	margin-bottom: 20rpx;
}
.goods-image {
	width: 160rpx;
	height: 160rpx;
	border-radius: 8rpx;
	flex-shrink: 0;
}
.goods-info {
	flex: 1;
	margin-left: 20rpx;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
}

.goods-title {
  font-size: 14px;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-price {
  font-size: 14px;
  color: #ff4d4f;
}
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 100rpx 0;
}
</style>
