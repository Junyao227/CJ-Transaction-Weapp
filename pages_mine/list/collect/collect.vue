<template>
	<view class="container">
		<!-- 使用 u-tabs 分别展示不同分类 -->
		<u-tabs :current="activeTab" :list="tabList" @change="tabChanged" />

		<!-- 二手商品 -->
		<view v-if="activeTab === 0" class="item-list">
			<view v-for="(item, index) in itemList" :key="index" class="item-card" @click="goToDetail(item)">
				<u--image class="item-avatar" :src="item.imageUrl" />
				<view class="item-info">
					<text class="item-title">{{ item.data.title }}</text>
					<view class="tag-wrapper">
						<u-tag :text="getStatusLabel(item.data.status, 'item')" size="mini" :type="getStatusTag(item.data.status)" />
					</view>
				</view>
			</view>
			<u-empty :show="!itemList || itemList.length === 0" mode="data"></u-empty>
		</view>

		<!-- 兼职 -->
		<view v-if="activeTab === 1" class="job-list">
			<view v-for="(job, index) in jobList" :key="index" class="job-card" @click="goToDetail(job)">
				<view class="job-info">
					<text class="job-title">{{ job.data.title }}</text>
					<view class="tag-wrapper">
						<u-tag :text="getStatusLabel(job.data.status, 'job')" size="mini" :type="getStatusTag(job.data.status)" />
					</view>
				</view>
			</view>
			<u-empty :show="!jobList || jobList.length === 0" mode="data"></u-empty>
		</view>

		<!-- 跑腿任务 -->
		<view v-if="activeTab === 2" class="task-list">
			<view v-for="(task, index) in taskList" :key="index" class="task-card" @click="goToDetail(task)">
				<view class="task-info">
					<text class="task-title">{{ task.data.title }}</text>
					<view class="tag-wrapper">
						<u-tag :text="getStatusLabel(task.data.status, 'task')" size="mini" :type="getStatusTag(task.data.status)" />
					</view>
				</view>
			</view>
			<u-empty :show="!taskList || taskList.length === 0" mode="data"></u-empty>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			activeTab: 0,
			tabList: [{ name: '二手商品' }, { name: '兼职' }, { name: '跑腿任务' }],
			itemList: [], // 二手商品收藏列表
			jobList: [], // 兼职收藏列表
			taskList: [] // 跑腿任务收藏列表
		};
	},
	onLoad() {
		this.getCollectionList();
	},
	methods: {
		tabChanged(activeTab) {
			this.activeTab = activeTab.index;
		},
		// 获取收藏列表
		async getCollectionList() {
			const userInfo = uni.getStorageSync('USER_INFO');
			if (!userInfo || !userInfo.user_id) {
				uni.showToast({ title: '用户未登录', icon: 'none' });
				return;
			}

			try {
				const res = await uniCloud.callFunction({
					name: 'getUserCollectionList',
					data: { userId: userInfo.user_id }
				});

				if (res.result.success) {
					const allItems = res.result.data;

					const itemList = allItems.filter((item) => item.type === 0);
					this.jobList = allItems.filter((item) => item.type === 1);
					this.taskList = allItems.filter((item) => item.type === 2);

					await this.addImageUrls(itemList);
					// 等待图片处理完成后再更新数据
					this.itemList = itemList;
				} else {
					uni.showToast({ title: res.result.message, icon: 'none' });
				}
			} catch (err) {
				console.error('获取收藏列表失败:', err);
				uni.showToast({ title: '获取收藏列表失败', icon: 'none' });
			}
		},

		// 跳转到详情页
		goToDetail(item) {
			let url = '';
			switch (item.type) {
				case 0:
					url = `/pages/item/itemDetail/itemDetail?item=${JSON.stringify(item.data)}`;
					break;
				case 1:
					url = `/pages/job/jobDetail/jobDetail?job=${JSON.stringify(item.data)}`;
					break;
				case 2:
					url = `/pages/task/taskDetail/taskDetail?task=${JSON.stringify(item.data)}`;
					break;
				default:
					return;
			}
			uni.navigateTo({ url });
		},

		// 为二手商品添加图片链接
		async addImageUrls(items) {
			if (items.length === 0) return;

			const fileList = items.map((item) => ({
				fileID: item.data.images,
				maxAge: 60 * 60 * 24
			}));

			const result = await uniCloud.getTempFileURL({ fileList });

			if (result.fileList && result.fileList.length > 0) {
				const fileUrls = result.fileList.map((file) => file.tempFileURL);
				items.forEach((item, index) => {
					item.imageUrl = fileUrls[index];
				});
			}
		},

		// 获取类型标签文本
		getStatusLabel(status, type) {
			if (type === 'item') {
				return status === 0 ? '在卖' : '已下架';
			} else if (type === 'job') {
				return status === 0 ? '正在招聘' : '停止招聘';
			} else if (type === 'task') {
				return status === 0 ? '上架' : '下架';
			}
			return '未知';
		},

		// 获取类型标签样式
		getStatusTag(status) {
			return status === 0 ? 'success' : 'warning';
		}
	}
};
</script>

<style scoped>
.container {
	padding: 10px;
	background-color: #f7f8fa;
}

/* 列表公共样式 */
.item-list,
.job-list,
.task-list {
	padding: 10px;
}

/* 卡片公共样式 */
.item-card,
.job-card,
.task-card {
	position: relative; /* 关键：让子元素可以定位 */
	display: flex;
	align-items: center;
	padding: 15px;
	background-color: #fff;
	border-radius: 10px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	margin-bottom: 10px;
}

.item-avatar {
	width: 60px;
	height: 60px;
	border-radius: 8px;
	margin-right: 15px;
	object-fit: cover;
}

.item-info,
.job-info,
.task-info {
	display: flex;
	flex-direction: column;
	flex: 1;
}

/* 标签容器样式 */
.tag-wrapper {
	position: absolute;
	bottom: 10px;
	right: 10px;
}

.item-title,
.job-title,
.task-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
	margin-bottom: 5px;
}
</style>
