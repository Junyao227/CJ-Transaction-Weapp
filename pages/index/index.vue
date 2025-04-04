<template>
	<view>
		<view class="swiper">
			<u-swiper :list="swiperList" @change="change" @click="click" height="300rpx"></u-swiper>
		</view>

		<view class="search">
			<u-search :showAction="true" actionText="搜索" :animation="true" placeholder="请输入二手商品/兼职/跑腿的关键词" v-model="keyword" margin="8rpx" @search="search"></u-search>
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
				    <scroll-view class="goods-container" scroll-y @scrolltolower="loadMore">
				      <view class="goods-list">
				        <view class="goods-item" v-for="(item, index) in itemList" :key="index" @click="goToItemDetail(item)">
				          <image class="goods-image" :src="item.imageUrl" mode="aspectFill" />
				          <view class="goods-info">
				            <text class="goods-title">{{item.title}}</text>
				            <view class="goods-bottom">
				              <text class="goods-price">¥{{item.price}}</text>
				              <text class="goods-location">{{item.location}}</text>
				            </view>
				          </view>
				        </view>
				      </view>
				    <!--  <u-loadmore v-if="itemList.length > 0" :status="loadStatus" /> -->
				    </scroll-view>
				<u-empty :show="!itemList || itemList.length === 0" mode="data"></u-empty>
			</view>
			<view v-if="current === 1">
				<!-- 兼职列表 -->
				<scroll-view class="content-section" scroll-y @scrolltolower="loadMore">
					<view class="job-list">
						<view v-for="(job, index) in jobList" :key="index" class="job-card" @click="goToJobDetail(job)">
							<view class="job-header">
								<text class="job-title">{{job.title}}</text>
								<text class="job-salary">{{job.salary}}元</text>
							</view>
							<view class="company-info">
								<text class="company-name">{{job.company}}</text>
								<view class="job-tags">
								  <view 
								    class="settlement-tag"
								    :class="'type-' + job.job_type"
								  >
								    {{ getSettlementTypeLabel(job.job_type) }}
								  </view>
								</view>
							</view>
							<view class="job-footer">
								<view class="location-info">
									<u-icon name="map" size="28" color="#666" />
									<text class="location-text">{{job.location}}</text>
								</view>
								<u-icon name="arrow-right" size="28" color="#999" />
							</view>
						</view>
					</view>
					<u-empty v-if="jobList.length === 0" text="暂无数据" />
				</scroll-view>
			</view>
			<view v-if="current === 2">
				<!-- 跑腿任务列表（使用AI的UI结构） -->
				<scroll-view scroll-y class="content-wrapper">
					<view class="delivery-list">
						<view 
							v-for="(task, index) in taskList" 
							:key="index" 
							class="task-card"
							@click="goToTaskDetail(task)"
						>
							<view class="task-header">
								<view class="task-title">{{ task.title }}</view>
								<view :class="['task-status', 'status-' + task.status]">
								      {{ getTaskStatusText(task.status) }}
								    </view>
							</view>
							<view class="task-content">
								<view class="location-item">
									<u-icon name="map" size="28" color="#666666"/>
									<text class="location-text">{{ task.pickup_location }}</text>
								</view>
								<view class="location-item">
									<u-icon name="arrow-right" size="28" color="#666666"/>
									<text class="location-text">{{ task.delivery_location }}</text>
								</view>
							</view>
							<view class="task-footer">
								<view class="task-info">
									<view class="task-time">
										<u-icon name="calendar" size="28" color="#999999"/>
										<text class="time-text">{{ formatTime(task.created_time) }}</text>
									</view>
									<view class="task-distance">
										<u-icon name="map" size="28" color="#999999"/>
										<text class="distance-text">{{ task.distance }}km</text>
									</view>
								</view>
								<view class="task-price">
									<text class="price-symbol">¥</text>
									<text class="price-value">{{ task.reward }}</text>
								</view>
							</view>
						</view>
					</view>
					<u-empty v-if="!taskList.length" text="暂无跑腿任务" />
				</scroll-view>
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
			keyword: '',
			loadStatus: 'loadmore'
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
					userId: userInfo.user_id,
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
		// 获取任务状态文本
		getTaskStatusText(status) {
			const statusMap = {
				'0': '待接单',
				'1': '进行中',
				'2': '已完成'
			};
			return statusMap[status] || '未知状态';
		},
		// 格式化时间
		formatTime(timestamp) {
			if (!timestamp) return '';
			const date = new Date(timestamp);
			return `${date.getMonth()+1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
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
					this.jobList = res.result.data;
				} else if (this.current === 2) {
					// 查询跑腿任务
					this.taskList = res.result.data;
				}
			} else {
				uni.showToast({
					icon: 'none',
					title: res.result.message || '查询失败'
				});
			}
		},
		loadMore() {
			console.log('加载更多数据');
			// 这里可以添加加载更多数据的逻辑
		}
	}
};
</script>

<style scoped>
/* 顶部搜索栏 */
.search {
	margin: 7px;
}

/* 导航栏图标 */
.nav-icons {
	display: flex;
	justify-content: space-around;
	padding: 10px 0;
	background-color: #fff;
}

.nav-icon {
	display: flex;
	flex-direction: column;
	align-items: center;
	font-size: 12px;
	color: #666;
}

.nav-icon img {
	width: 45px;
	height: 45px;
	border-radius: 50%;
	margin-bottom: 5px;
}


/* 二手商品列表样式 - Flex 布局 */
.goods-container {
  padding: 24rpx;
  box-sizing: border-box;
  width: 100%;
}

.goods-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  width: 100%;
}

.goods-item {
  width: calc(50% - 12rpx); /* 关键：精确计算宽度 */
  margin-bottom: 24rpx;
  background: #fff;
  border-radius: 12rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

/* 图片和商品信息样式保持不变 */
.goods-image {
  width: 100%;
  height: 340rpx;
  background: #f7f7f7;
}

.goods-info {
  padding: 16rpx;
}

.goods-title {
  font-size: 28rpx;
  color: #333333;
  line-height: 40rpx;
  height: 80rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.goods-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12rpx;
}

.goods-price {
  font-size: 32rpx;
  font-weight: bold;
  color: #ff6b6b;
}

.goods-location {
  font-size: 24rpx;
  color: #999999;
}

/* 兼职列表样式 */
.content-section {
	flex: 1;
	overflow: auto;
}

.job-list {
	padding: 20rpx 32rpx;
}

.job-card {
	background-color: #FFFFFF;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.job-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.job-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.job-salary {
	font-size: 32rpx;
	font-weight: 600;
	color: #FF6B6B;
}

.company-info {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.company-name {
	font-size: 28rpx;
	color: #666666;
}

.job-tags {
	display: flex;
	gap: 10rpx;
}

.settlement-tag {
  display: inline-block;
  padding: 4rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: white;
}

/* 日结样式 */
.settlement-tag.type-0 {
  background-color: #FF9500; /* 橙色 */
}

/* 周结样式 */
.settlement-tag.type-1 {
  background-color: #34C759; /* 绿色 */
}

/* 月结样式 */
.settlement-tag.type-2 {
  background-color: #007AFF; /* 蓝色 */
}

.job-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.location-info {
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.location-text {
	font-size: 26rpx;
	color: #666666;
}

.job-card:active {
	opacity: 0.8;
	transform: scale(0.98);
	transition: all 0.2s;
}

/* 跑腿任务列表样式（使用AI的样式） */
.content-wrapper {
	flex: 1;
	overflow: auto;
}

.delivery-list {
	padding: 20rpx;
}

.task-card {
	margin-bottom: 20rpx;
	padding: 30rpx;
	background-color: #ffffff;
	border-radius: 16rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.task-card:active {
	transform: scale(0.98);
	transition: transform 0.2s;
}

.task-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.task-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333333;
}

.task-status {
	padding: 4rpx 16rpx;
	border-radius: 20rpx;
	font-size: 24rpx;
}

.task-status.status-0 {
	background-color: #fff5e6;
	color: #ff9900;
}

.task-status.status-1 {
	background-color: #e6f7ff;
	color: #1890ff;
}

.task-status.status-2 {
	background-color: #f6ffed;
	color: #52c41a;
}

.task-content {
	margin-bottom: 20rpx;
}

.location-item {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
}

.location-item:last-child {
	margin-bottom: 0;
}

.location-text {
	margin-left: 12rpx;
	font-size: 28rpx;
	color: #666666;
}

.task-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20rpx;
	padding-top: 20rpx;
	border-top: 2rpx solid #f5f5f5;
}

.task-info {
	display: flex;
	align-items: center;
}

.task-time, .task-distance {
	display: flex;
	align-items: center;
	margin-right: 24rpx;
}

.time-text, .distance-text {
	margin-left: 8rpx;
	font-size: 24rpx;
	color: #999999;
}

.task-price {
	display: flex;
	align-items: baseline;
}

.price-symbol {
	font-size: 24rpx;
	color: #ff4d4f;
}

.price-value {
	font-size: 36rpx;
	font-weight: 600;
	color: #ff4d4f;
	margin-left: 4rpx;
}
</style>