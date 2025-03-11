// cloudfunctions/getSession/index.js
const db = uniCloud.database();
const fanCollection = db.collection('users_follow');
const userInfoCollection = db.collection('users');
const _ = db.command;
exports.main = async (event, context) => {
	const {
		userId
	} = event;

	try {
		// 获取当前用户的粉丝列表
		const fansList = await fanCollection.where({
				followed_user_id: userId
			}) // 查询当前用户的粉丝
			.get();

		// 获取粉丝的详细信息
		const fanUserIds = fansList.data.map(fan => fan.user_id);

		const users = await userInfoCollection.where({
				user_id: db.command.in(fanUserIds) // 查找粉丝的详细信息
			})
			.get();

		return {
			success: true,
			data: users.data
		};
	} catch (e) {
		return {
			success: false,
			message: '获取粉丝列表失败',
			error: e
		};
	}
};