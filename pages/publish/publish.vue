<template>
	<view class="slot">
	
			<u-cell-group>
			      <!-- 发布二手商品 -->
			      <u-cell icon="tag-fill" title="发布二手商品" @click="goToPublishGoods" />
			      
			      <!-- 发布兼职信息 -->
			      <u-cell icon="briefcase-fill" title="发布兼职信息" @click="goToPublishPartTime" />
			      
			      <!-- 发布跑腿信息 -->
			      <u-cell icon="running-fill" title="发布跑腿信息" @click="goToPublishErrand" />
			    </u-cell-group>
	</view>
</template>

<script>
export default {
	data() {
		return {

	
			
		
			default_activeBarColor: this.$appTheme.appThemeColor,
			default_activeColor: this.$appTheme.appThemeTextBlackColor,
			default_inactiveColor: this.$appTheme.appThemeTextBlackColor
		};
	},
	onLoad() {
		
	},
	methods: {
		// 跳转到发布二手商品页面
		    goToPublishGoods() {
		      uni.navigateTo({
		        url: '/pages_publish/second-hand-item/second-hand-item'
		      });
		    },
		    
		    // 跳转到发布兼职信息页面
		    goToPublishPartTime() {
		      uni.navigateTo({
		        url: '/pages_publish/part-time-job/part-time-job'
		      });
		    },
		    
		    // 跳转到发布跑腿信息页面
		    goToPublishErrand() {
		      uni.navigateTo({
		        url: '/pages_publish/errand-task/errand-task'
		      });
		    }
	}
};
</script>

<style></style>
