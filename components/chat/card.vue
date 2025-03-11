<template>
	<view class="chat-card">
		<!-- 默认展示部分 -->
		<view class="card-header" @click="toggleExpand">
			<view class="job-title">{{ job.title }}</view>
			<text class="salary">{{ job.salary }}</text>
		</view>
		<view class="card-meta">
			<text class="meta">{{ job.companyName }}</text>
			<text class="meta">{{ job.location }}</text>
			<text class="meta">{{ job.experience }}</text>
		</view>
		<view class="card-description" v-if="!isExpanded">
			<text>
				{{ job.description.slice(0, 40) }}...
				<text class="view-more">展开</text>
			</text>
		</view>

		<!-- 展开后展示部分 -->
		<view class="card-expanded" v-if="isExpanded">
			<text class="description">{{ job.description }}</text>
			<view class="tags">
				<u-tag v-for="(tag, index) in job.tags" :key="index" :text="tag" size="mini" type="primary" />
			</view>
			<u-button type="primary" @click="goToDetail">查看详情</u-button>
		</view>
	</view>
</template>

<script>
export default {
	props: {
		job: {
			type: Object,
			required: true
		}
	},
	data() {
		return {
			isExpanded: false,
			job: {
				title: '前端工程师（全栈）',
				salary: '8-11K',
				companyName: '深圳科蒸智能技术',
				location: '深圳',
				experience: '1-3年',
				description: '欢迎加入创业公司，公司基本均为00后...职责要求：熟悉Vue、React、TypeScript...',
				tags: ['全职', 'JavaScript', '前端']
			}
		};
	},
	methods: {
		toggleExpand() {
			this.isExpanded = !this.isExpanded;
		},
		goToDetail() {
			uni.navigateTo({
				url: `/pages/job/jobDetail/jobDetail?job=${JSON.stringify(this.job)}`
			});
		}
	}
};
</script>

<style scoped>
.chat-card {
	background-color: #fff;
	padding: 15px;
	border-radius: 10px;
	margin-bottom: 15px;
	box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.job-title {
	font-size: 16px;
	font-weight: bold;
	color: #333;
}

.salary {
	font-size: 16px;
	color: #ff4d4f;
}

.card-meta {
	margin-top: 5px;
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
	font-size: 12px;
	color: #999;
}

.meta {
	background: #f0f0f0;
	padding: 2px 5px;
	border-radius: 4px;
}

.card-description {
	margin-top: 10px;
	font-size: 14px;
	color: #666;
}

.view-more {
	color: #007bff;
	font-size: 14px;
	cursor: pointer;
}

.card-expanded {
	margin-top: 10px;
}

.description {
	font-size: 14px;
	color: #333;
}

.tags {
	margin: 10px 0;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

u-tag {
	margin-right: 5px;
}

u-button {
	margin-top: 10px;
	width: 100%;
}
</style>
