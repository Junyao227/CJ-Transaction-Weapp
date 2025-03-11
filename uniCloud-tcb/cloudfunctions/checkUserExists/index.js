'use strict';
// 云函数入口文件
const usersCollection = uniCloud.database().collection('users');
exports.main = async (event, callBack) => {
	const {
		openId
	} = event;

	// 查询是否有该 openId
	const result = await usersCollection.where({
		wx_openid: openId
	}).get();

	if (result.data.length > 0) {
		// 如果找到了该 openId，则表示用户已存在
		return {
			exist: true
		};
	} else {
		// 如果没有找到该 openId，则表示用户不存在
		return {
			exist: false
		};
	}
};