// cloudfunctions/getSession/index.js
const db = uniCloud.database();
const followCollection = db.collection('users_follow');
const userInfoCollection = db.collection('users');
const _ = db.command;
exports.main = async (event, context) => {
	try {
		const {
			user_id
		} = event; // 从 event 中获取当前用户的 user_id
		// 查询当前用户的关注列表
		const followList = await followCollection.where({
				user_id: user_id // 查询当前用户的关注记录
			})
			.get();


		const followedUserIds = followList.data.map(item => item.followed_user_id); // 获取被关注的用户ID列表

		// 查询关注的用户的详细信息（如头像、昵称等）
		const users = await userInfoCollection.where({
				user_id: _.in(followedUserIds) // 查询在关注列表中的用户
			})
			.get();

		return {
			code: 0,
			data: users.data, // 返回关注的用户信息
			message: '获取关注的用户列表成功'
		};
	} catch (e) {
		return {
			code: -1,
			message: '获取关注的用户列表失败',
			error: e
		};
	}
};