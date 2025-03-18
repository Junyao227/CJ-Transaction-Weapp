<template>
	<view class="container">
		<!-- u-tab 标签切换 -->
		<u-tabs :current="activeTab" :list="tabList" @change="tabChanged" />

		<!-- 商品列表 -->
		<view v-if="activeTab === 0" class="item-list">
			<view v-for="(item, index) in onHireItems" :key="index" class="item-card">
				<u--image :src="item.imageUrl" class="item-image" />
				<view class="item-info">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-price">价格: ¥{{ item.price }}</view>
				</view>
			</view>
			<u-empty :show="!onHireItems || onHireItems.length === 0" mode="data"></u-empty>
		</view>

		<view v-if="activeTab === 1" class="item-list">
			<view v-for="(item, index) in draftItems" :key="index" class="item-card">
				<view class="item-info">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-status">状态: 草稿</view>
				</view>
			</view>
			<u-empty :show="!draftItems || draftItems.length === 0" mode="data"></u-empty>
		</view>

		<view v-if="activeTab === 2" class="item-list">
			<view v-for="(item, index) in offHireItems" :key="index" class="item-card">
				<view class="item-info">
					<view class="item-title">{{ item.title }}</view>
					<view class="item-status">状态: 已下架</view>
				</view>
			</view>
			<u-empty :show="!offHireItems || offHireItems.length === 0" mode="data"></u-empty>
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
			tabList: [{ name: '正在招聘' }, { name: '草稿' }, { name: '停止招聘' }],

			// 示例数据
			onHireItems: [],
			draftItems: [],
			offHireItems: []
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
			// 调用 getItemList 云函数获取所有二手商品

			console.log('index this.userInfo=======', this.userInfo.user_id, typeof this.userInfo.user_id);
			const onSaleRes = await uniCloud.callFunction({
				name: 'getItemList',
				data: {
					userId: this.userInfo.user_id,
					status: 0, // 查询在卖商品
					location: 'mine'
				}
			});
			console.log('mine res.result=======', onSaleRes);
			if (onSaleRes.result.success) {
				// 获取商品列表数据
				const onSaleItemsData = onSaleRes.result.data;

				// 获取每个商品的临时图片链接
				const fileUrls = await this.getImageUrls(onSaleItemsData);
				console.log('fileUrls=======', fileUrls);
				// 将临时链接添加到商品数据中
				onSaleItemsData.forEach((item, index) => {
					// 添加 imageUrl 属性，指向临时链接
					item.imageUrl = fileUrls[index];
				});

				// 更新 onSaleItems 数据
				this.onSaleItems = onSaleItemsData;
				console.log('this.onSaleItems=======', this.onSaleItems);
			} else {
				uni.showToast({
					icon: 'none',
					title: onSaleRes.result.message || '获取二手在卖商品数据失败'
				});
			}
		},
		async getImageUrls(items) {
			// 获取所有图片的 fileID 列表（假设每个 item 都有一个 images 属性）
			const fileList = items.map((item) => ({
				fileID: item.images, // 云存储的 fileID
				maxAge: 60 * 60 * 24 // 可选，设置文件的最大有效期（1天）
			}));

			// 调用 uniCloud.getTempFileURL 获取图片的临时 URL
			const result = await uniCloud.getTempFileURL({
				fileList
			});

			if (result.fileList && result.fileList.length > 0) {
				// 返回所有文件的临时 URL
				return result.fileList.map((file) => file.tempFileURL);
			} else {
				uni.showToast({
					icon: 'none',
					title: '获取图片链接失败'
				});
				return [];
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
