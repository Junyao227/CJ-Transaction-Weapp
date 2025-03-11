'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const { userId, followedUserId } = event;

	// 检查参数是否完整
	if (!userId || !followedUserId) {
		return { success: false, message: '参数缺失' };
	}

	try {
		// 查询关注记录
		const checkRes = await db.collection('users_follow')
			.where({
				user_id: userId,
				followed_user_id: followedUserId
			})
			.get();

		const isFollowed = checkRes.data.length > 0;

		return { success: true, isFollowed };
	} catch (err) {
		console.error('检查关注状态失败:', err);
		return { success: false, message: '检查关注状态失败', error: err };
	}
};
