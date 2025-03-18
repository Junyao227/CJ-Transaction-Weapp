<template>
	<view class="container">
		<!-- 表单包裹层 -->
		<view class="form-wrapper">
			<!-- 兼职表单部分 -->
			<u--form :model="formJobData" ref="formJob" :rules="rules" labelPosition="top">
				<u-form-item label="兼职标题" prop="formJobData.title" labelWidth="140">
					<u--input v-model="formJobData.title" placeholder="请输入兼职标题"></u--input>
				</u-form-item>

				<u-form-item label="兼职描述" prop="formJobData.description" labelWidth="140">
					<u--textarea v-model="formJobData.description" placeholder="请输入兼职描述" :maxlength="500" :show-count="true"></u--textarea>
				</u-form-item>
				<u-form-item label="公司" prop="formJobData.company" labelWidth="140">
					<u--input v-model="formJobData.company" placeholder="请输入公司名称"></u--input>
				</u-form-item>

				<u-form-item label="薪资" prop="salary" labelWidth="140">
					<u--input type="number" v-model="formJobData.salary" placeholder="请输入薪资" min="0" step="0.01"></u--input>
				</u-form-item>

				<u-form-item label="工作类型" prop="job_type" labelWidth="140">
					<u-radio-group v-model="formJobData.job_type" placement="row">
						<u-radio v-for="(item, index) in jobTypes" :key="index" :label="item.name" :name="index" labelSize="30"></u-radio>
					</u-radio-group>
				</u-form-item>

				<u-form-item label="工作地点" prop="location" labelWidth="140">
					<u--input v-model="formJobData.location" placeholder="请输入工作地点"></u--input>
				</u-form-item>
			</u--form>
		</view>
		<!-- 提交按钮 -->
		<u-button type="primary" formType="submit" @click="submitJobForm">发布</u-button>
	</view>
</template>

<script>
export default {
	data() {
		return {
			// 兼职表单数据
			formJobData: {
				title: '',
				description: '',
				company: '',
				salary: 0,
				job_type: 0, // 默认日结
				location: '',
				publisher_id: '', // 发布者ID，可以根据当前登录用户填充
				created_time: new Date()
			},
			// 兼职表单验证规则
			rules: {
				title: {
					required: true,
					message: '兼职标题不能为空',
					trigger: 'blur'
				},
				description: {
					required: true,
					message: '兼职描述不能为空',
					trigger: 'blur'
				},
				company: {
					required: true,
					message: '公司名称不能为空',
					trigger: 'blur'
				},
				salary: {
					required: true,
					message: '薪资不能为空',
					trigger: 'blur'
				},
				location: {
					required: true,
					message: '工作地点不能为空',
					trigger: 'blur'
				}
			},
			// 工作类型的数据
			jobTypes: [{ name: '日结' }, { name: '周结' }, { name: '月结' }]
		};
	},
	methods: {
		// 提交兼职表单
		submitJobForm() {
			// 获取 wxUserInfo
			const wxUserInfo = uni.getStorageSync('USER_INFO');
			console.log('wxUserInfo-----', wxUserInfo);

			// 添加 publisher_id 到表单数据
			const formJobData = {
				...this.formJobData,
				publisher_id: wxUserInfo.user_id // 假设 _id 是 wxUserInfo 中的用户标识
			};

			this.$refs.formJob
				.validate()
				.then((res) => {
					// 表单验证成功，处理提交数据
					console.log('兼职表单数据:', formJobData);
					// 调用云函数保存数据
					uniCloud.callFunction({
						name: 'savePartTimeJobInfo',
						data: formJobData,
						success: (res) => {
							console.log('保存成功', res);
							uni.showToast({
								title: '兼职发布成功',
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
};
</script>

<style>
/* 整体布局样式 */
.container {
	background-color: #f7f8fa;
	padding: 20px 2%; /* 保持左右内边距，使内容紧凑 */
	min-height: 100vh; /* 确保页面填充整个屏幕 */
}

/* 表单包裹层 */
.form-wrapper {
	background-color: #fff;
	border-radius: 12px; /* 增加圆角，现代感 */
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); /* 添加轻微阴影，突出内容 */
	padding: 15px; /* 增加内边距，舒适布局 */
}
</style>
