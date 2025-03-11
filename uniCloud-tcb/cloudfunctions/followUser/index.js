'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const { userId, followedUserId } = event;

	// 检查参数是否完整
	if (!userId || !followedUserId) {
		return { success: false, message: '参数缺失' };
	}

	try {
		// 检查是否已经关注
		const checkRes = await db.collection('users_follow')
			.where({
				user_id: userId,
				followed_user_id: followedUserId
			})
			.get();

		if (checkRes.data.length > 0) {
			return { success: false, message: '已关注该用户' };
		}

		// 插入关注记录
		await db.collection('users_follow').add({
			user_id: userId,
			followed_user_id: followedUserId,
			created_at: new Date() // MongoDB 自动处理时间
		});

		return { success: true, message: '关注成功' };
	} catch (err) {
		console.error('关注失败:', err);
		return { success: false, message: '关注失败', error: err };
	}
};
