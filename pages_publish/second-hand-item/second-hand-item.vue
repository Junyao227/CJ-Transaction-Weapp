<template>
	<view class="container">
		<!-- 表单包裹层 -->
		<view class="form-wrapper">
			<u--form :model="itemFormData" ref="itemFormRules" :rules="rules" labelPosition="top">
				<!-- 商品标题 -->
				<u-form-item label="商品标题" prop="title" borderBottom labelWidth="140">
					<u--input v-model="itemFormData.title" placeholder="请输入商品标题"></u--input>
				</u-form-item>

				<!-- 商品描述 -->
				<u-form-item label="商品描述" prop="description" labelWidth="140">
					<u--textarea v-model="itemFormData.description" placeholder="请输入商品描述" :maxlength="500" :show-count="true"></u--textarea>
				</u-form-item>

				<!-- 商品价格 -->
				<u-form-item label="商品价格(元)" prop="price" labelWidth="200">
					<u--input type="number" v-model="itemFormData.price" placeholder="请输入商品价格" min="0" step="0.01"></u--input>
				</u-form-item>

				<!-- 库存数量 -->
				<u-form-item label="库存数量" prop="quantity" labelWidth="140">
					<u--input type="number" v-model="itemFormData.quantity" placeholder="请输入库存数量" min="0" step="1"></u--input>
				</u-form-item>

				<!-- 商品图片 -->
				<u-form-item label="商品图片" prop="images" labelWidth="140">
					<u-upload :fileList="fileList" :max="1" @afterRead="afterRead" @delete="deletePic" :showUploadList="true" />
				</u-form-item>

				<u-cell icon="map-fill" title="取货地址" :value="area || '请选择取货地址'" @click="showPicker = true" />

				<u-picker :show="showPicker" ref="uPicker" :columns="columns" @confirm="confirmLocation" @change="changeHandler" />

				<!-- 商品标题 -->
				<u-form-item label="详细地址" borderBottom labelWidth="140">
					<u--textarea v-model="detailLocation" placeholder="请输入详细地址" :maxlength="500" :show-count="true"></u--textarea>
				</u-form-item>
			</u--form>
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
			// 是否展示地址选择器
			showPicker: false,

			// 选择器数据
			columns: [
				['宿舍', '教学楼'],
				['1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '11栋', '12栋', '13栋'] // 默认中国的城市
			],
			// 省份对应的城市数据
			columnData: {
				宿舍: ['1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '11栋', '12栋', '13栋'],
				教学楼: ['1栋', '2栋', '3栋', '4栋', '5栋', '6栋', '7栋', '8栋', '9栋', '10栋', '11栋', '12栋', '13栋']
			},

			// 管理上传图片的列表
			fileList: [],
			// 二手商品表单数据
			itemFormData: {
				title: '',
				description: '',
				price: 0,
				quantity: 0,
				images: '',
				location: '', // 存储最终拼接的省市数据
				publisher_id: '', // 发布者ID
				created_time: new Date()
			},
			area: '',
			detailLocation: '',
			// 表单验证规则
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
					message: '取货地区不能为空',
					trigger: 'blur'
				}
			}
		};
	},
	watch: {
		detailLocation() {
			this.updateLocation();
			
		}
	},
	methods: {
		changeHandler(e) {
			const { columnIndex, index, picker = this.$refs.uPicker } = e;
			if (columnIndex === 0) {
				const country = this.columns[0][index]; // 获取选中的国家
				const cities = this.columnData[country] || []; // 获取对应的城市列表

				if (picker && cities.length) {
					picker.setColumnValues(1, cities); // 更新城市列
				} else {
					console.error('未找到对应城市列表:', country);
				}
			}
		},
		confirmLocation(e) {
			if (!e.value || !Array.isArray(e.value)) {
				uni.showToast({ title: '请选择正确的取货地址', icon: 'none' });
				return;
			}
			this.area = e.value.join(' - '); // 仅存储选择器的值
			this.updateLocation(); // 更新最终地址
			this.showPicker = false; // 关闭选择器
		},
		updateLocation() {
			this.itemFormData.location = this.area && this.detailLocation ? `${this.area} - ${this.detailLocation}` : this.area || this.detailLocation || '';
		},

		// 删除图片
		deletePic(event) {
			this.fileList.splice(event.index, 1);
			this.itemFormData.images = '';
		},

		// 读取文件并上传
		async afterRead(event) {
			const file = event.file;
			this.fileList.push({
				...file,
				status: 'uploading',
				message: '上传中'
			});

			const fileName = file.url.split('/').pop();
			try {
				const result = await this.uploadFileToCloud(file.url, fileName);
				this.fileList[0] = { ...this.fileList[0], status: 'success', message: '', url: result };
				this.itemFormData.images = result;
			} catch (error) {
				this.fileList[0] = { ...this.fileList[0], status: 'fail', message: '上传失败' };
			}
		},

		// 上传文件到云存储
		uploadFileToCloud(filePath, fileName) {
			return new Promise((resolve, reject) => {
				uniCloud.uploadFile({
					cloudPath: `uploads/${Date.now()}_${fileName}`,
					filePath,
					success: (res) => resolve(res.fileID),
					fail: (err) => reject(err)
				});
			});
		},

		// 提交表单
		submitItemForm() {
			const wxUserInfo = uni.getStorageSync('USER_INFO');

			const itemsData = {
				...this.itemFormData,
				publisher_id: wxUserInfo.user_id
			};

			this.$refs.itemFormRules
				.validate()
				.then(() => {
					uniCloud.callFunction({
						name: 'saveSecondItemsInfo',
						data: itemsData,
						success: (res) => {
							uni.showToast({ title: '商品发布成功', icon: 'success' });
							this.resetForm();
						},
						fail: (err) => {
							uni.showToast({ title: '发布失败', icon: 'none' });
						}
					});
				})
				.catch(() => {
					uni.$u.toast('校验失败');
				});
		},

		// 重置表单
		resetForm() {
			this.itemFormData = {
				title: '',
				description: '',
				price: 0,
				quantity: 0,
				images: '',
				location: '',
				publisher_id: '',
				created_time: new Date()
			};
			this.area='';
			this.detailLocation='';
			this.fileList = [];
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
</style>
