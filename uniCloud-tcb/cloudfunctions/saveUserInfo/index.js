'use strict';
const {
	v4: uuidv4
} = require('uuid'); // 使用 UUID 库生成唯一 ID
// 云函数入口文件
const usersCollection = uniCloud.database().collection('users');
exports.main = async (event, context) => {
	const {
		openId,
		userInfo
	} = event;

    const usericId = parseInt(uuidv4().replace(/-/g, '').slice(0, 9), 16).toString().padStart(9, '0');  // 转换为 9 位数字
	// 插入用户信息到 users 表
	const result = await usersCollection.add({
		user_id: usericId,
		wx_openid: openId,
		nickname: userInfo.userInfo.nickName,
		avatar: userInfo.userInfo.avatarUrl,
		gender: userInfo.userInfo.gender,
		province: userInfo.userInfo.province,
		country: userInfo.userInfo.country,
		city: userInfo.userInfo.city,
		createDate: new Date(),
		updateDate: new Date(),
	});

	if (result.id) {
		// 如果插入成功
		return {
			success: true
		};
	} else {
		// 如果插入失败
		return {
			success: false
		};
	}
};