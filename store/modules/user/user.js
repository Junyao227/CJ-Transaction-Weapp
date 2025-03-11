export default {
	namespaced: true, // 启用命名空间
	state: {
		userInfo: {}, // 用来存放用户信息
	},
	mutations: {
		setUserInfo(state, userInfo) {
			state.userInfo = userInfo; // 更新用户信息
		},
		clearUserInfo(state) {
			state.userInfo = {}; // 清空用户信息
		}
	},
	actions: {
		updateUserInfo({
			commit
		}, userInfo) {
			commit('setUserInfo', userInfo); // 提交 mutation 更新用户信息
		},
		clearUser({
			commit
		}) {
			commit('clearUserInfo'); // 提交 mutation 清空用户信息
		}
	},
	getters: {
		getUserInfo: state => state.userInfo, // 获取用户信息
	}
};