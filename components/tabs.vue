<template>
	<view class="slot" :style="{ padding, backgroundColor }">
		<u-tabs
			name="text"
			:list="listData"
			:current="current"
			@change="change"
			:activeStyle="activeColor || default_activeColor"
			:inactiveStyle="inactiveColor || default_inactiveColor"
			lineHeight="10"
			lineWidth="30"
		>
		</u-tabs>
		<view v-if="current === 0">
			<text>这是第一个标签页的内容</text>
		</view>
		<view v-if="current === 1">
			<text>这是第二个标签页的内容</text>
		</view>
		<view v-if="current === 2">
			<text>这是第三个标签页的内容</text>
		</view><view v-if="current === 3">
			<text>这是第四个标签页的内容</text>
		</view>
	</view>
</template>

<script>
export default {
	name: 'tabs',
	data() {
		return {
			current: 0,
			default_activeBarColor: this.$appTheme.appThemeColor,
			default_activeColor: this.$appTheme.appThemeTextBlackColor,
			default_inactiveColor: this.$appTheme.appThemeTextBlackColor
		};
	},
	props: {
		// 配置项
		listData: {
			type: Array,
			default: () => {
				return [];
			}
		},
		// 激活颜色
		activeBarColor: {
			type: String,
			default: null
		},
		activeColor: {
			type: String,
			default: null
		},
		inactiveColor: {
			type: String,
			default: null
		},
		// 内边距
		padding: {
			type: String,
			default: '0 0rpx 20rpx'
		},
		// 背景色
		backgroundColor: {
			type: String,
			default: '#fafafa'
		},
		// 文字大小
		fontSize: {
			type: [String, Number],
			default: 30
		},
		// 宽度
		itemWidth: {
			type: [String, Number],
			default: 'auto'
		}
	},
	methods: {
		// 切换tab时更新current的值
		change(tab) {
			console.log("index======",tab.index)
			this.current = tab.index; // 直接用一个变量控制标签页切换
		}
	}
};
</script>

<style lang="scss" scoped>
.slot {
}
</style>
