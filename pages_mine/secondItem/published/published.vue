<template>
	<view class="container">
		<!-- u-tab 标签切换 -->
		<u-tabs :current="activeTab" :list="tabList" @change="tabChanged" />

		<!-- 商品列表 -->
		<view v-if="activeTab === 0" class="item-list">
			<view v-for="(item, index) in onSaleItems" :key="index" class="item-card">
				<u--image :src="item.imageUrl" class="item-image" />
				<view class="item-info">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-price">价格: ¥{{ item.price }}</view>
				</view>
			</view>
		</view>

		<view v-if="activeTab === 1" class="item-list">
			<view v-for="(item, index) in draftItems" :key="index" class="item-card">
				<u--image :src="item.imageUrl" class="item-image" />
				<view class="item-info">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-price">价格: ¥{{ item.price }}</view>
				</view>
			</view>
		</view>

		<view v-if="activeTab === 2" class="item-list">
			<view v-for="(item, index) in offShelfItems" :key="index" class="item-card">
				<u--image :src="item.imageUrl" class="item-image" />
				<view class="item-info">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-price">价格: ¥{{ item.price }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 当前激活的 tab
			activeTab: 0,

			// tab 列表
			tabList: [{ name: '在卖' }, { name: '草稿' }, { name: '已下架' }],

			// 示例数据
			onSaleItems: [],
			draftItems: [],
			offShelfItems: []
		};
	},
	onLoad(options) {
		this.getItemList();
	},
	methods: {
		tabChanged(activeTab) {
			console.log('当前选中的标签:', activeTab);
			this.activeTab = activeTab.index;
		},
		async getItemList() {
			const userInfo = await uni.getStorageSync('USER_INFO');
			this.userInfo = userInfo;

			console.log('index this.userInfo=======', this.userInfo.user_id, typeof this.userInfo.user_id);

			// 一次获取所有与该用户相关的商品数据
			const allItemsRes = await uniCloud.callFunction({
				name: 'getItemList',
				data: {
					userId: this.userInfo.user_id,
					location: 'mine' // 获取"我的发布"二手商品
				}
			});

			console.log('mine res.result=======', allItemsRes);

			if (allItemsRes.result.success) {
				// 获取商品列表数据
				let allItems = allItemsRes.result.data;

				// 统一添加临时图片链接
				await this.addImageUrls(allItems);

				// 根据 status 分类商品数据
				this.onSaleItems = allItems.filter((item) => item.status === 0); // 在卖
				this.draftItems = allItems.filter((item) => item.status === 1); // 草稿
				this.offShelfItems = allItems.filter((item) => item.status === 2); // 已下架

				console.log('this.onSaleItems=======', this.onSaleItems);
				console.log('this.draftItems=======', this.draftItems);
				console.log('this.offShelfItems=======', this.offShelfItems);
			} else {
				uni.showToast({
					icon: 'none',
					title: allItemsRes.result.message || '获取二手商品数据失败'
				});
			}
		},

		// 添加临时图片链接
		async addImageUrls(items) {
			if (items.length === 0) return;

			const fileList = items.map((item) => ({
				fileID: item.images,
				maxAge: 60 * 60 * 24
			}));

			const result = await uniCloud.getTempFileURL({
				fileList
			});

			if (result.fileList && result.fileList.length > 0) {
				const fileUrls = result.fileList.map((file) => file.tempFileURL);
				items.forEach((item, index) => {
					item.imageUrl = fileUrls[index];
				});
			} else {
				uni.showToast({
					icon: 'none',
					title: '获取图片链接失败'
				});
			}
		}
	}
};
</script>

<style scoped>
.container {
	padding: 20px;
}
.title {
	font-size: 24px;
	font-weight: bold;
	margin-bottom: 20px;
}
.item-list {
	margin-bottom: 30px;
}
.item-card {
	display: flex;
	align-items: center;
	margin-bottom: 10px;
}
.item-image {
	width: 80px;
	height: 80px;
	margin-right: 10px;
}
.item-info {
	flex: 1;
}
.item-title {
	font-size: 18px;
	font-weight: bold;
}
.item-price,
.item-status {
	margin-top: 5px;
	color: #666;
}
.view-detail {
	margin-top: 10px;
	color: #1e90ff;
}
</style>
