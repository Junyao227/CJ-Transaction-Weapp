<template>
	<view class="container">
		<!-- 表单包裹层 -->
		<view class="form-wrapper">
			<u-form :model="itemFormData" ref="itemFormRules" :rules="rules" labelPosition="top">
				<!-- 商品标题 -->
				<view class="form-item-wrapper">
					<u-form-item label="商品标题" prop="itemFormData.title" borderBottom>
						<view class="input-wrapper">
							<u-input v-model="itemFormData.title" placeholder="请输入商品标题"></u-input>
						</view>
					</u-form-item>
				</view>

				<!-- 商品描述 -->
				<view class="form-item-wrapper">
					<u-form-item label="商品描述" prop="itemFormData.description">
						<view class="input-wrapper">
							<u-textarea v-model="itemFormData.description" placeholder="请输入商品描述" :maxlength="500" :show-count="true"></u-textarea>
						</view>
					</u-form-item>
				</view>

				<!-- 商品价格 -->
				<view class="form-item-wrapper">
					<u-form-item label="商品价格" prop="price">
						<view class="input-wrapper">
							<u-input type="number" v-model="itemFormData.price" placeholder="请输入商品价格" min="0" step="0.01"></u-input>
						</view>
					</u-form-item>
				</view>

				<!-- 库存数量 -->
				<view class="form-item-wrapper">
					<u-form-item label="库存数量" prop="quantity">
						<view class="input-wrapper">
							<u-input type="number" v-model="itemFormData.quantity" placeholder="请输入库存数量" min="0" step="1"></u-input>
						</view>
					</u-form-item>
				</view>

				<!-- 商品图片 -->
				<view class="form-item-wrapper">
					<u-form-item label="商品图片" prop="images">
						<view class="upload-wrapper">
							<u-upload :fileList="fileList" :max="1" @afterRead="afterRead" @delete="deletePic" :showUploadList="true" />
						</view>
					</u-form-item>
				</view>

				<!-- 商品地址 -->
				<view class="form-item-wrapper">
					<u-form-item label="商品地址" prop="location">
						<view class="input-wrapper">
							<u-input v-model="itemFormData.location" placeholder="请输入商品地址"></u-input>
						</view>
					</u-form-item>
				</view>
			</u-form>
		</view>

		<!-- 提交按钮 -->
		<view class="submit-button-wrapper">
			<u-button type="primary" @click="submitItemForm">发布</u-button>
		</view>
	</view>
</template>
<script>
export default {
	data() {
		return {
			// 管理上传图片的列表
			fileList: [],
			// 二手商品表单数据
			itemFormData: {
				title: '',
				description: '',
				price: 0,
				quantity: 0,
				images: '',
				location: '',
				publisher_id: '', // 可以根据当前登录用户的ID来填充
				created_time: new Date()
			},
			// 二手商品表单验证规则
			rules: {
				title: {
					required: true,
					message: '商品标题不能为空',
					trigger: 'blur'
				},
				description: {
					required: true,
					message: '商品描述不能为空',
					trigger: 'blur'
				},
				price: {
					required: true,
					message: '商品价格不能为空',
					trigger: 'blur'
				},
				quantity: {
					required: true,
					message: '库存数量不能为空',
					trigger: 'blur'
				},
				location: {
					required: true,
					message: '商品地址不能为空',
					trigger: 'blur'
				}
			}
		};
	},
	methods: {
		// 删除图片
		deletePic(event) {
			this.fileList.splice(event.index, 1); // 从文件列表中删除图片
			this.itemFormData.images = ''; // 删除后清空表单中的图片
		},

		// 读取文件并上传
		async afterRead(event) {
			const file = event.file; // 获取上传的文件
			this.fileList.push({
				...file,
				status: 'uploading',
				message: '上传中'
			});

			// 从 file.url 中提取文件名
			const fileName = file.url.split('/').pop();
			console.log('file================', file, fileName);

			// 上传文件到云存储
			try {
				const result = await this.uploadFileToCloud(file.url, fileName);

				// 更新文件列表，设置状态为成功
				this.fileList[0] = {
					...this.fileList[0],
					status: 'success',
					message: '',
					url: result // 云存储返回的 fileID
				};

				// 将上传成功的文件ID赋值给 itemFormData.images
				this.itemFormData.images = result;
			} catch (error) {
				console.error('上传失败:', error);
				this.fileList[0] = {
					...this.fileList[0],
					status: 'fail',
					message: '上传失败'
				};
			}
		},

		// 上传文件到云存储
		uploadFileToCloud(filePath, fileName) {
			return new Promise((resolve, reject) => {
				uniCloud.uploadFile({
					cloudPath: `uploads/${Date.now()}_${fileName}`, // 设置云存储路径
					filePath, // 上传的文件路径
					success: (res) => {
						resolve(res.fileID); // 上传成功，返回文件ID
					},
					fail: (err) => {
						reject(err); // 上传失败，返回错误信息
					}
				});
			});
		},

		// 提交表单
		submitItemForm() {
			// 获取 wxUserInfo
			const wxUserInfo = uni.getStorageSync('USER_INFO');
			console.log('wxUserInfo-----', wxUserInfo);

			// 添加 publisher_id 到表单数据
			const itemsData = {
				...this.itemFormData,
				publisher_id: wxUserInfo.user_id // 假设 _id 是 wxUserInfo 中的用户标识
			};

			this.$refs.itemFormRules
				.validate()
				.then(() => {
					uni.$u.toast('校验通过');
					// 表单验证成功，处理提交数据
					console.log('二手商品表单数据:', itemsData);
					// 调用云函数保存数据
					uniCloud.callFunction({
						name: 'saveSecondItemsInfo',
						data: itemsData,
						success: (res) => {
							console.log('保存成功', res);
							uni.showToast({
								title: '商品发布成功',
								icon: 'success'
							});
							// 清空表单数据
							this.itemFormData = {
								title: '',
								description: '',
								price: 0,
								quantity: 0,
								images: '',
								location: '',
								publisher_id: '', // 发布者ID
								created_time: new Date()
							};
							this.fileList = []; // 清空上传的图片列表
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
				.catch(() => {
					uni.$u.toast('校验失败');
				});
		}
	}
};
</script>
<style scoped>
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

/* 表单项包裹层 */
.form-item-wrapper {
	margin-bottom: 15px; /* 增加表单项间距，清晰但紧凑 */
}

/* 输入框/上传包裹层 */
.input-wrapper,
.upload-wrapper {
	flex: 1; /* 确保填满剩余空间 */
}

.input-wrapper .u-input,
.input-wrapper .u-textarea {
	font-size: 14px; /* 调整输入框字体大小，保持清晰 */
	border-radius: 6px; /* 增加输入框圆角，现代感 */
	background-color: #f9f9f9; /* 浅灰背景，区分输入区 */
}

.input-wrapper .u-textarea {
	min-height: 100px; /* 确保描述区域足够高 */
	border-radius: 6px; /* 保持圆角 */
}

.upload-wrapper .u-upload {
	width: 100%; /* 填满表单项宽度 */
}

.upload-wrapper .u-upload__content {
	border-radius: 6px; /* 上传区域圆角 */
	background-color: #f9f9f9; /* 一致的背景色 */
	padding: 10px; /* 增加内边距 */
}

/* 表单项样式 */
.form-item-wrapper .u-form-item {
	margin-bottom: 0; /* 移除 u-form-item 默认底部间距 */
	padding: 0; /* 移除 u-form-item 默认内边距 */
}

.form-item-wrapper .u-form-item__label {
	font-size: 14px; /* 调整标签字体大小，清晰但紧凑 */
	color: #333;
	font-weight: 500; /* 稍重字体，突出标签 */
	width: 100px; /* 固定标签宽度，确保对齐 */
	text-align: left; /* 左对齐标签 */
}

/* 提交按钮包裹层 */
.submit-button-wrapper {
	margin-top: 20px; /* 增加按钮与表单的间距 */
	display: flex;
	justify-content: center; /* 按钮居中 */
}

.submit-button-wrapper .u-button {
	width: 80%; /* 按钮宽度适中 */
	max-width: 300px; /* 限制最大宽度 */
	font-size: 16px; /* 增大按钮字体，突出 */
	border-radius: 8px; /* 增加按钮圆角 */
	background-color: #007bff; /* 蓝色按钮，与主题一致 */
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 轻微阴影，现代感 */
}


</style>
