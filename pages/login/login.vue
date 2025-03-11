<template>
	<view class="page">
		<!-- 自定义头部 navbar -->
		<u-navbar
			back-icon-name="arrow-left"
			title=" "
			:custom-back="navbarBack"
			:background="{ backgroundColor: 'rgba(0,0,0,0)' }"
			:border-bottom="false"
			:is-back="pageStatus != 'home'"
		></u-navbar>

		<!-- logo -->
		<view class="logo-wrap" v-if="pageStatus == 'home' || pageStatus == 'getWxRole' || pageStatus == 'loginByCode'">
			<image class="logo" src="../../static/app/logo.png"></image>
			<view class="app-name">Shop Weapp</view>
		</view>

		<!-- 默认登录页面显示 -->
		<view style="width: 100%" v-if="pageStatus == 'home'">
			<view class="text-area" @click="loginByWx">微信登录</view>
			<view class="login" @click="loginByCode">手机号登录/注册</view>
		</view>

		<!-- 微信授权登录，获取用户信息 -->
		<view style="width: 100%" v-if="pageStatus == 'getWxRole'">
			<view class="info">为提供优质服务,需要获取你的以下信息 :</view>
			<view class="public">
				<view class="public-dot"></view>
				<view class="public-text">你的公开信息(头像、昵称等)</view>
			</view>
			<view class="text-enter" @click="getWxLoginRole">授权进入</view>
		</view>

		<!-- 微信登录小程序，再授权获取用户信息之后 -->
		<view class="loginWx" v-if="pageStatus == 'loginByWx'">
			<view class="title">欢迎使用 Shop Weapp</view>
			<view class="desc">立即登录享受优质服务</view>
			<view class="avatar"><image mode="aspectFill" :src="wxLoginUserInfo.userInfo.avatarUrl"></image></view>
			<u-button type="success" open-type="getPhoneNumber" @getphonenumber="decryptPhoneNumber">微信用户一键登录</u-button>
		</view>

		<!-- 手机号验证码登录 -->
		<view class="loginSmsCode" v-if="pageStatus == 'loginByCode'">
			<u-form :model="loginCodeForm" ref="loginCodeForm">
				<u-form-item :border-bottom="true">
					<u-input v-model="loginCodeForm.phone" placeholder="请输入手机号" :placeholder-style="{ color: '#ccc', fontSize: '30rpx' }" />
				</u-form-item>
				<u-form-item :border-bottom="true">
					<view style="display: flex; justify-content: space-between; align-items: center">
						<u-input style="width: 60%" v-model="loginCodeForm.smsCode" placeholder="请输入验证码" :placeholder-style="{ color: '#ccc', fontSize: '30rpx' }" />
						<view class="smscode" @click="getCode" v-if="!codeOPS.isGetting">{{ codeOPS.getted ? '重新获取验证码' : '获取验证码' }}</view>
						<view class="smscode" v-else>{{ codeOPS.countDownTime }}s</view>
					</view>
				</u-form-item>
			</u-form>
			<view style="padding-top: 64rpx">
				<u-button :disabled="!loginCodeForm.phone || !loginCodeForm.smsCode" type="primary" shape="circle" @click="login('code')">登录</u-button>
			</view>
		</view>

		<!-- 协议勾选 -->
		<view class="agree" v-if="pageStatus == 'home' || pageStatus == 'getWxRole' || pageStatus == 'loginByCode'">
			<view class="agree_img" @click="changeAgreeFlag" v-show="!agree_flag"><image src="../../static/operate/check.png"></image></view>
			<view class="agree_img" @click="changeAgreeFlag" v-show="agree_flag"><image src="../../static/operate/checked.png"></image></view>
			<view class="agree_text">
				登录代表您已同意
				<span>《用户服务协议》《隐私权政策》</span>
			</view>
		</view>
	</view>
</template>

<script>
import FunUniappTheme from '@/theme.scss';
export default {
	data() {
		return {
			// 页面状态，默认为 home
			// getWxRole：获取微信权限页，loginByWx：微信授权登录页
			// loginByCode：手机号+验证码登录页，loginByPwd：手机号+密码登录
			// forgetPwd：找回密码页面，resetPwd，重置密码页面
			pageStatus: 'home',
			// 协议是否勾选
			agree_flag: false,
			// 微信授权的用户信息
			wxLoginUserInfo: {},
			// openid
			openId: '',
			// 系统内用户信息
			userInfo: {},
			// 手机号验证码登录表单
			loginCodeForm: {
				phone: null,
				smsCode: null
			},
			// 表单验证
			loginCodeFormRules: {
				phone: [
					{
						required: true,
						message: '请输入手机号',
						trigger: ['change', 'blur']
					},
					{
						validator: (rule, value, callback) => {
							return this.$u.test.mobile(value);
						},
						message: '手机号码不正确',
						trigger: ['change', 'blur']
					}
				],
				smsCode: [
					{
						required: true,
						message: '请输入验证码',
						trigger: ['change', 'blur']
					}
				]
			},
			// 获取验证码倒计时
			codeOPS: {
				countDownTime: 60,
				isGetting: false,
				getted: false,
				timer: null
			}
		};
	},
	onLoad() {
		console.log(FunUniappTheme);
	},
	onReady() {
		if (this.pageStatus == 'loginByCode') {
			this.$refs.loginCodeForm.setRules(this.loginCodeFormRules);
		}
	},
	methods: {
		// 勾选/取消用于协议
		changeAgreeFlag() {
			this.agree_flag = !this.agree_flag;
		},

		// 微信登录
		loginByWx() {
			if (!this.agree_flag) {
				uni.showToast({
					icon: 'none',
					title: '请先阅读并勾选协议'
				});
				return;
			}
			this.pageStatus = 'getWxRole';
		},

		// 自定义navbar的返回方法
		navbarBack() {
			if (this.pageStatus == 'getWxRole' || this.pageStatus == 'loginByWx' || this.pageStatus == 'loginByCode') {
				this.pageStatus = 'home';
			} else if (this.pageStatus == 'forgetPwd' || this.pageStatus == 'resetPwd') {
				this.pageStatus = 'loginByPwd';
			} else if (this.pageStatus == 'loginByPwd') {
				this.pageStatus = 'loginByCode';
			}
		},

		// 微信授权
		getWxLoginRole() {
			if (!this.agree_flag) {
				uni.showToast({
					icon: 'none',
					title: '请先阅读并勾选协议'
				});
				return;
			}
			this.getUserInfoByWx(() => {
				this.getWxCode((code) => {
					this.getOpenId(code, (openId) => {
						// 调用云函数查询是否已有该用户
						this.checkIfUserExists(openId, (userExist) => {
							if (userExist) {
								// 如果用户存在，直接跳转到首页
								uni.reLaunch({
									url: '/pages/index/index'
								});
							} else {
								// 如果用户不存在，保存用户信息到数据库
								this.saveUserInfo(openId, this.wxLoginUserInfo, () => {
									// 保存完毕后跳转
									uni.reLaunch({
										url: '/pages/index/index'
									});
								});
							}
						});
					});
				});
			});
		},

		// 基于uni的获取code方法
		getWxCode(callBack) {
			uni.login({
				provider: 'weixin',
				onlyAuthorize: true,
				success: (loginRes) => {
					callBack(loginRes.code);
				},
				fail(e) {
					console.log('getWxCode失败......');
				}
			});
		},

		// 获取openId
		async getOpenId(code, callBack) {
			// 调用云函数获取 openid
			uniCloud.callFunction({
				name: 'getWxOpenId', // 云函数名称
				data: { code }, // 传递 code 给云函数
				success: (res) => {
					uni.setStorageSync('OPEN_ID', res.result.openid);
					uni.setStorageSync('SESSION_KEY', res.result.session_key);
					callBack(res.result.openid);
				},
				fail: (err) => {
					// 获取 err 对象中的错误信息
					const errorMessage = err.message || err.errMsg || '未知错误';

					// 显示模态框
					uni.showModal({
						title: '错误',
						content: `获取 openid 失败: ${errorMessage}`,
						showCancel: false // 不显示取消按钮
					});
				}
			});
		},

		// 获取个人信息
		getUserInfoByWx(callBack) {
			let $this = this;
			uni.getUserProfile({
				desc: '获取你的昵称、头像',
				success: function (data) {
					uni.setStorageSync('APP_WX_USERINFO', data);
					$this.wxLoginUserInfo = data;
					$this.pageStatus = 'loginByWx';
					callBack();
				},
				fail: function (error) {
					console.log('getUserInfoByWx出错', error);
				}
			});
		},
		getWxUserInfoByOpenId(WxOpenId) {
			if (!WxOpenId) {
				uni.showToast({
					icon: 'none',
					title: '未获取到用户的微信 OpenID'
				});
				return;
			}

			// 调用云函数获取用户信息
			uniCloud.callFunction({
				name: 'getWxUserInfoByOpenId', // 云函数名称
				data: {
					WxOpenId: WxOpenId // 传递 WxOpenId 参数
				},
				success: (res) => {
					if (res.result.code === 200) {
						// 查询成功，返回用户信息
						const userInfo = res.result.data;
						console.log('--------查询到的用户信息-----------:', userInfo);
						// 将微信用户信息存入 Vuex
						this.$store.dispatch('userInfo/updateUserInfo', userInfo);
						uni.setStorageSync('USER_INFO', userInfo);
					} else {
						// 查询失败
						uni.showToast({
							icon: 'none',
							title: res.result.message || '查询失败'
						});
					}
				},
				fail: (err) => {
					// 调用云函数失败
					uni.showToast({
						icon: 'none',
						title: err || '调用云函数失败'
					});
					console.error('云函数调用失败:', err);
				}
			});
		},
		// 查询是否已存在用户
		checkIfUserExists(openId, callBack) {
			uniCloud.callFunction({
				name: 'checkUserExists', // 云函数名称
				data: { openId: openId },
				success: (res) => {
					if (res.result.exist) {
						// 如果用户已存在
						this.getWxUserInfoByOpenId(openId);
						callBack(true);
					} else {
						// 用户不存在
						callBack(false);
					}
				},
				fail: (err) => {
					console.error('查询用户是否存在失败', err);
					callBack(false); // 如果查询失败也认为是新用户
				}
			});
		},

		// 保存用户信息
		saveUserInfo(openId, userInfo, callBack) {
			uniCloud.callFunction({
				name: 'saveUserInfo', // 云函数名称
				data: {
					openId: openId,
					userInfo: userInfo
				},
				success: (res) => {
					console.log('用户信息保存成功', res);
					callBack();
				},
				fail: (err) => {
					console.error('保存用户信息失败', err);
				}
			});
		},

		// 获取手机号回调
		decryptPhoneNumber(e) {
			uni.showModal({
				title: '提示',
				content: '由于没有企业认证，无法获取手机号，开发模式先暂时放开登录入口',
				complete: () => {
					uni.setStorageSync('IS_LOGIN', true);
					uni.reLaunch({
						url: '/pages/index/index'
					});
				}
			});
		},

		// 微信小程序手机号登录
		loginByOpenId() {
			const openid = uni.getStorageSync('OPEN_ID');
			this.$u.api.loginByOpenId(openid).then((res) => {
				this.userInfo = res;
			});
		},

		// 手机号+验证码登录
		loginByCode() {
			this.pageStatus = 'loginByCode';
		},

		// 获取验证码
		getCode() {
			if (!this.loginCodeForm.phone) {
				uni.showToast({
					icon: 'none',
					title: '请输入手机号'
				});
				return;
			}
			uni.showLoading({
				title: '正在获取验证码'
			});
			uni.hideLoading();
			this.codeOPS.isGetting = true;
			this.codeOPS.getted = true;
			this.codeOPS.timer = setInterval(() => {
				if (this.codeOPS.countDownTime > 0 && this.codeOPS.countDownTime <= 60) {
					this.codeOPS.countDownTime--;
				} else {
					this.resetCountDown(false);
				}
			}, 1000);
		},

		// 倒计时初始化
		resetCountDown(isInit) {
			clearInterval(this.codeOPS.timer);
			this.codeOPS = {
				countDownTime: 60,
				isGetting: false,
				getted: isInit ? false : true,
				timer: null
			};
			this.$forceUpdate();
		},

		// 手机号登录方法，分为验证码和密码两种
		login(type) {
			uni.setStorageSync('IS_LOGIN', true);
			uni.reLaunch({
				url: '/pages/index/index'
			});
			// if (type == 'code') {
			// 	this.$refs.loginCodeForm.validate(valid => {
			// 		if (valid) {

			// 		}
			// 	});
			// }
		}
	}
};
</script>

<style lang="scss" scoped>
.page {
	padding: 0 40rpx;
	background-color: $app-theme-bg-color;
}

.logo-wrap {
	display: flex;
	justify-content: center;
	padding-top: 100rpx;
	padding-bottom: 240rpx;
	flex-wrap: wrap;
	.logo {
		height: 220rpx;
		width: 220rpx;
	}
	.app-name {
		width: 100%;
		padding-top: 40rpx;
		text-align: center;
		font-size: 44rpx;
		font-weight: 500;
		color: $app-theme-text-black-color;
	}
}

.text-area {
	width: 100%;
	height: 96rpx;
	background: $app-theme-color;
	font-weight: 400;
	border-radius: 56rpx;
	color: $app-theme-text-white-color;
	line-height: 16px;
	font-size: 32rpx;
	text-align: center;
	line-height: 96rpx;
	/* background: url(../../static/img/logo_newhope.png); */
}

.info {
	font-size: 28rpx;
	font-weight: 400;
	color: $app-theme-text-black-color;
	line-height: 28rpx;
	margin-top: 180rpx;
}

.public {
	display: flex;
	align-items: center;
	margin-top: 30rpx;

	.public-dot {
		width: 6rpx;
		height: 6rpx;
		background: #999999;
		margin-right: 10rpx;
	}

	.public-text {
		font-size: 24rpx;
		font-weight: 400;
		color: #8f92a1;
		line-height: 24rpx;
	}
}

.text-enter {
	width: 100%;
	margin-top: 50rpx;
	height: 96rpx;
	background: $app-theme-color;
	font-weight: 400;
	border-radius: 56rpx;
	color: #ffffff;
	line-height: 16px;
	font-size: 32rpx;
	text-align: center;
	line-height: 96rpx;
}

.head {
	margin-top: 70rpx;
	width: 100%;
	display: flex;
	justify-content: space-between;
}

.back {
	width: 40rpx;
	height: 40rpx;
}

.login {
	text-align: center;
	font-size: 32rpx;
	font-weight: 400;
	color: $app-theme-color;
	line-height: 32rpx;
	margin-top: 48rpx;
}

.agree {
	position: fixed;
	left: 50%;
	transform: translate(-50%, 0);
	bottom: 66rpx;
	width: 100vw;
	display: flex;
	align-items: center;
	justify-content: center;
}

.agree_img image {
	width: 32rpx;
	height: 32rpx;
	display: flex;
	align-items: center;
}

.agree_text {
	margin-left: 8rpx;
	font-size: 24rpx;
	font-weight: 400;
	color: #8f92a1;
	line-height: 24rpx;
	display: flex;
	align-items: center;

	span {
		color: $app-theme-color;
	}
}

.loginWx {
	width: 100%;
	padding-top: 64rpx;
	.title {
		text-align: left;
		font-size: 22px;
		font-family: PingFang-SC-Regular, PingFang-SC;
		font-weight: 400;
		color: #171717;
		line-height: 30px;
		margin-bottom: 12rpx;
	}
	.desc {
		text-align: left;
		font-size: 14px;
		font-family: PingFang-SC-Regular, PingFang-SC;
		font-weight: 400;
		color: #8f92a1;
		line-height: 14px;
	}
	.avatar {
		width: 160rpx;
		height: 160rpx;
		overflow: hidden;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 128rpx auto 160rpx auto;
		image {
			width: 100%;
			height: 100%;
		}
	}
}

.loginSmsCode {
	width: 100%;
}
.smscode {
	font-size: 28rpx;
	font-family: PingFang-SC-Regular, PingFang-SC;
	font-weight: 400;
	color: $app-theme-color;
	line-height: 28rpx;
}
</style>
