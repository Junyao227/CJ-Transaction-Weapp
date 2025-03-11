<template>
	<view>
		<!-- 表单部分 -->
		<u-form :model="formTasksData"  ref="formTasks" :rules="formTasksRules" @submit="submitTasksForm">
			<u-form-item label="任务标题" prop="formTasksData.title">
				<u-input v-model="formTasksData.title" placeholder="请输入任务标题"></u-input>
			</u-form-item>
		
			<u-form-item label="任务描述" prop="formTasksData.description">
				<u--textarea v-model="formTasksData.description" placeholder="请输入任务描述" :maxlength="500" :show-count="true"></u--textarea>
			</u-form-item>
		
			<!-- 报酬 -->
			<u-form-item label="报酬" prop="reward">
				<u-input type="number" v-model="formTasksData.reward" placeholder="请输入报酬" min="0" step="0.01"></u-input>
			</u-form-item>
		
			<!-- 取货地点 -->
			<u-form-item label="取货地点" prop="pickup_location">
				<u-input v-model="formTasksData.pickup_location" placeholder="请输入取货地点"></u-input>
			</u-form-item>
		
			<!-- 送达地点 -->
			<u-form-item label="送达地点" prop="delivery_location">
				<u-input v-model="formTasksData.delivery_location" placeholder="请输入送达地点"></u-input>
			</u-form-item>
			<!-- 提交按钮 -->
			<u-button type="primary" formType="submit" @click="submitTasksForm">发布</u-button>
		</u-form>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				// 跑腿表单数据
				formTasksData: {
					title: '',
					description: '',
					reward: 0,
					pickup_location: '',
					delivery_location: '',
					publisher_id: '', // 发布者ID，可以根据当前登录用户填充
					created_time: new Date()
				},
				// 跑腿表单验证规则
				formTasksRules: {
					title: {
						required: true,
						message: '任务标题不能为空',
						trigger: 'blur'
					},
					description: {
						required: true,
						message: '任务描述不能为空',
						trigger: 'blur'
					},
					reward: {
						required: true,
						message: '报酬不能为空',
						trigger: 'blur'
					},
					pickup_location: {
						required: true,
						message: '取货地点不能为空',
						trigger: 'blur'
					},
					delivery_location: {
						required: true,
						message: '送达地点不能为空',
						trigger: 'blur'
					}
				}
			}
		},
		methods: {
			// 提交跑腿表单
			submitTasksForm() {
				// 获取 wxUserInfo
				const wxUserInfo = uni.getStorageSync('USER_INFO');
				console.log('wxUserInfo-----', wxUserInfo);
				
				
				// 添加 publisher_id 到表单数据
				const formTasksData = {
					...this.formTasksData,
					publisher_id: wxUserInfo.user_id // 假设 _id 是 wxUserInfo 中的用户标识
				};
				this.$refs.formTasks
					.validate()
					.then((res) => {
						// 表单验证成功，处理提交数据
						console.log('跑腿表单数据:', formTasksData);
						// 调用云函数保存数据
						uniCloud.callFunction({
							name: 'saveErrandTasksInfo',
							data: formTasksData,
							success: (res) => {
								console.log('保存成功', res);
								uni.showToast({
									title: '跑腿任务发布成功',
									icon: 'success'
								});
							},
							fail: (err) => {
								console.log('保存失败', err);
								uni.showToast({
									title: '发布失败',
									icon: 'none'
								});
							}
						});
					})
					.catch((errors) => {
						uni.$u.toast('校验失败');
					});
					
			}
		}
	}
</script>

<style>

</style>
