<template>
	<view>
		<view class="swiper">
			<u-swiper :list="swiperList" @change="change" @click="click" height="300rpx"></u-swiper>
		</view>

		<view class="search">
			<u-search
				:showAction="true"
				actionText="搜索"
				:animation="true"
				placeholder="请输入二手商品/兼职/跑腿的关键词"
				v-model="keyword"
				margin="8rpx"
				@search="search"
			></u-search>
		</view>
		<view class="slot">
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
			<view v-if="current === 0">
				<!-- 跳蚤商品展示页 -->
				<view class="item-list">
					<view v-for="(item, index) in itemList" :key="index" class="item-card" @click="goToItemDetail(item)">
						<u--image :showLoading="true" :src="item.imageUrl" width="100%" height="120px" class="item-image"></u--image>
						<view class="item-info">
							<text class="item-title">{{ item.title }}</text>
							<view class="item-price-location">
								<text class="item-price">￥{{ item.price }}</text>
								<text class="item-location">{{ item.location }}</text>
							</view>
						</view>
					</view>
				</view>
				<u-empty :show="!itemList || itemList.length === 0" mode="data"></u-empty>
			</view>
			<view v-if="current === 1">
				<!-- 兼职列表 -->
				<view class="job-list">
					<view v-for="(job, index) in jobList" :key="index" class="job-card" @click="goToJobDetail(job)">
						<view class="card-content">
							<view class="card-details">
								<text class="job-title">{{ job.title }}</text>
								<text class="company-name">{{ job.company }}</text>
								<view class="job-info">
									<text class="job-salary">薪资：{{ job.salary }}</text>
									<text class="job-location">地点：{{ job.location }}</text>
								</view>
								<!-- 结算方式标签 -->
								<view class="settlement-type-wrapper">
									<u-tag :type="getSettlementTypeTag(job.job_type)" :text="getSettlementTypeLabel(job.job_type)" size="mini" class="settlement-type"></u-tag>
								</view>
							</view>
						</view>
					</view>
				</view>
				<u-empty :show="!jobList || jobList.length === 0" mode="data"></u-empty>
			</view>
			<view v-if="current === 2">
				<!-- 跑腿任务列表 -->
				<view class="delivery-list">
					<view v-for="(task, index) in taskList" :key="index" class="task-card" @click="goToTaskDetail(task)">
						<view class="card-content">
							<view class="task-info">
								<text class="task-title">{{ task.title }}</text>
								<view class="task-details">
									<text class="task-location">起点：{{ task.pickup_location }}</text>
									<text class="task-destination">终点：{{ task.delivery_location }}</text>
									<text class="task-price">报酬：￥{{ task.reward }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<u-empty :show="!taskList || taskList.length === 0" mode="data"></u-empty>
			</view>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			swiperList: ['/static/nav/banner.png'],
			userInfo: {},
			current: 0,
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
			itemList: [],
			jobList: [],
			taskList: [],
			keyword: ''
		};
	},
	onLoad() {
		this.getItemList();
	},
	onPullDownRefresh() {
		// 触发下拉刷新时的操作
		this.fetchData();
	},
	methods: {
		// 切换tab时更新current的值
		change(tab) {
			this.current = tab.index;
			// 根据 tab 切换更新数据
			if (this.current === 0) {
				this.getItemList(); // 获取跳蚤商品
			} else if (this.current === 1) {
				this.getJobList(); // 获取兼职信息
			} else if (this.current === 2) {
				this.getTaskList(); // 获取跑腿任务
			}
		},

		// 跳转到商品详情页面
		goToItemDetail(item) {
			uni.navigateTo({
				url: `/pages/item/itemDetail/itemDetail?item=${JSON.stringify(item)}` // 将商品对象转换为字符串传递
			});
		},
		// 跳转到兼职详情页面
		goToJobDetail(job) {
			uni.navigateTo({
				url: `/pages/job/jobDetail/jobDetail?job=${JSON.stringify(job)}`
			});
		},

		// 跳转到跑腿任务详情页面
		goToTaskDetail(task) {
			uni.navigateTo({
				url: `/pages/task/taskDetail/taskDetail?task=${JSON.stringify(task)}`
			});
		},

		async getItemList() {
			const userInfo = await uni.getStorageSync('USER_INFO');
			this.userInfo = userInfo;
			// 调用 getItemList 云函数获取所有二手商品

			const res = await uniCloud.callFunction({
				name: 'getItemList',
				data: {
					userId: this.userInfo.user_id,
					status: 0, // 查询在卖商品
					location: 'index'
				}
			});

			if (res.result.success) {
				// 获取商品列表数据
				const items = res.result.data;

				// 获取每个商品的临时图片链接
				const fileUrls = await this.getImageUrls(items);

				// 将临时链接添加到商品数据中
				items.forEach((item, index) => {
					// 添加 imageUrl 属性，指向临时链接
					item.imageUrl = fileUrls[index];
				});

				// 更新 itemList 数据
				this.itemList = items;
			} else {
				uni.showToast({
					icon: 'none',
					title: res.result.message || '获取二手商品数据失败'
				});
			}
		},
		async getJobList() {
			// 调用 getJobList 云函数获取所有兼职职位
			const res = await uniCloud.callFunction({
				name: 'getJobList' // 假设云函数名称为 getJobList
			});

			if (res.result.success) {
				// 获取职位列表数据
				const jobs = res.result.data;

				// 更新 jobList 数据
				this.jobList = jobs;
			} else {
				uni.showToast({
					icon: 'none',
					title: res.result.message || '获取兼职数据失败'
				});
			}
		},

		async getTaskList() {
			// 调用 getTaskList 云函数获取所有跑腿任务
			const res = await uniCloud.callFunction({
				name: 'getTaskList' // 假设云函数名称为 getTaskList
			});

			if (res.result.success) {
				// 获取任务列表数据
				const tasks = res.result.data;

				// 更新 taskList 数据
				this.taskList = tasks;
			} else {
				uni.showToast({
					icon: 'none',
					title: res.result.message || '获取跑腿数据失败'
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
		},
		// 结算方式标签样式
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
		async search(e) {
			const res = await uniCloud.callFunction({
				name: 'searchByKeyWord',
				data: {
					type: this.current, // 查询种类
					keyword: this.keyword
				}
			});

			if (res.result.success) {
				// 根据 current 值判断查询类型
				if (this.current === 0) {
					// 查询二手商品
					// 获取商品列表数据
					const items = res.result.data;

					// 获取每个商品的临时图片链接
					const fileUrls = await this.getImageUrls(items);

					// 将临时链接添加到商品数据中
					items.forEach((item, index) => {
						// 添加 imageUrl 属性，指向临时链接
						item.imageUrl = fileUrls[index];
					});

					// 更新 itemList 数据
					this.itemList = items;
				} else if (this.current === 1) {
					// 查询兼职
					res = res.result.data;
				} else if (this.current === 2) {
					// 查询跑腿任务
					res = res.result.data;
				}
			} else {
				throw new Error(res.result.message || '查询二手商品失败');
			}
		}
	}
};
</script>

<style scoped>
/* 整体布局样式 */
.container {
	background-color: #f7f8fa;
	padding: 20px 2%; /* 保持左右内边距，使内容紧凑 */
}

/* 跳蚤商品页面样式 */
.item-list {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between; /* 确保两列均匀分布 */
	padding: 10px 0;
	gap: 6px; /* 保持卡片间距，紧凑排布 */
}

.item-card {
	width: 49%; /* 保持紧凑的宽度，确保一行显示两个卡片，保留细小间隙 */
	margin-bottom: 10px; /* 保持底部间距 */
	border-radius: 8px; /* 保持圆角，类似闲鱼风格 */
	padding: 8px; /* 保持内边距 */
	background-color: #fff;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 较轻的阴影，闲鱼风格 */
	transition: transform 0.2s; /* 添加轻微 hover 动画 */
}

.item-card:hover {
	transform: scale(1.02); /* 轻微放大效果，增强交互感 */
}

.item-image {
	width: 100%;
	height: 130px; /* 扩大图片高度，突出商品 */
	border-radius: 6px; /* 图片圆角与卡片一致 */
	object-fit: cover; /* 保持图片覆盖，适合大多数比例 */
}

.item-info {
	margin-top: 8px; /* 微调标题和图片的间距，适应较大图片 */
}

.item-title {
	font-size: 14px; /* 增大标题字体，保持清晰但紧凑 */
	font-weight: 500; /* 稍轻的粗体，类似闲鱼 */
	color: #333;
	line-height: 1.3; /* 微调行高，适应较大字体 */
	white-space: nowrap; /* 防止标题换行 */
	overflow: hidden; /* 超出部分隐藏 */
	text-overflow: ellipsis; /* 超出部分显示省略号 */
}

.item-price-location {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 6px; /* 微调间距，适应较大字体 */
}

.item-price {
	font-size: 16px; /* 增大价格字体，保持醒目 */
	color: #ff6b6b; /* 微调为更柔和的红色，协调配色 */
	font-weight: bold;
}

.item-location {
	font-size: 12px; /* 增大位置字体，保持清晰 */
	color: #999;
}

/* 兼职页面样式 */
.job-list {
	padding: 10px;
}

.job-card {
	background-color: #fff;
	margin-bottom: 15px;
	border-radius: 12px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.card-content {
	padding: 15px;
}

.card-details {
	flex: 1;
}

.job-title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
}

.company-name {
	font-size: 14px;
	color: #999;
	margin-top: 5px;
}

.job-info {
	margin-top: 10px;
	display: flex;
	justify-content: space-between;
}

.job-salary {
	font-size: 16px;
	color: #f44336;
}

.job-location {
	font-size: 14px;
	color: #666;
}

.settlement-type-wrapper {
	margin-top: 10px;
	display: flex;
	justify-content: flex-start;
}

.settlement-type {
	display: inline-block;
	padding: 4px 8px;
	border-radius: 4px;
	font-size: 12px;
	background-color: #007bff;
	color: #fff;
}

/* 跑腿页面样式 */
.delivery-list {
	padding: 10px;
}

.task-card {
	background-color: #fff;
	margin-bottom: 15px;
	border-radius: 12px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	overflow: hidden;
}

.card-content {
	padding: 15px;
}

.task-info {
	margin-bottom: 10px;
}

.task-title {
	font-size: 18px;
	font-weight: bold;
	color: #333;
	margin-bottom: 10px;
}

.task-details {
	display: flex;
	flex-direction: column;
	gap: 8px; /* 增加间距 */
}

.task-location,
.task-destination,
.task-price {
	font-size: 14px;
	color: #666;
}

.task-price {
	font-size: 16px;
	color: #f44336;
	font-weight: bold;
}
</style>
