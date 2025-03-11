const db = uniCloud.database();
const collection = db.collection('part_time_jobs'); // jobs 是兼职职位的数据库表名

exports.main = async (event, context) => {
	try {
		// 查询所有兼职职位，按创建时间降序排列
		const res = await collection.where({
			status: 0 // 状态为 0
		}).orderBy('created_time', 'desc').get();

		// 返回查询结果
		return {
			success: true,
			data: res.data
		};
	} catch (err) {
		console.error('查询兼职职位失败', err);
		return {
			success: false,
			message: '查询兼职职位失败',
			error: err
		};
	}
};