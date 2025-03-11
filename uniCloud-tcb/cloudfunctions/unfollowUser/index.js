'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
	const { userId, followedUserId } = event;

	// 检查参数是否完整
	if (!userId || !followedUserId) {
		return { success: false, message: '参数缺失' };
	}

	try {
		// 删除关注记录
		const deleteRes = await db.collection('users_follow')
			.where({
				user_id: userId,
				followed_user_id: followedUserId
			})
			.remove();

		if (deleteRes.deleted === 0) {
			return { success: false, message: '未找到关注记录' };
		}

		return { success: true, message: '取消关注成功' };
	} catch (err) {
		console.error('取消关注失败:', err);
		return { success: false, message: '取消关注失败', error: err };
	}
};
