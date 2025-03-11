const db = uniCloud.database();
const collection = db.collection('errand_tasks'); // tasks 是跑腿任务的数据库表名

exports.main = async (event, context) => {
	try {
		// 查询所有跑腿任务，按创建时间降序排列
		const res = await collection.where({
			status: 0 // 状态为 0
		}).orderBy('created_time', 'desc').get();

		// 返回查询结果
		return {
			success: true,
			data: res.data
		};
	} catch (err) {
		console.error('查询跑腿任务失败', err);
		return {
			success: false,
			message: '查询跑腿任务失败',
			error: err
		};
	}
};