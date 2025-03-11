// cloudfunctions/getJobInfoById/index.js

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { jobId } = event;

  if (!jobId) {
    return { success: false, message: '兼职ID不能为空' };
  }

  try {
    const res = await db.collection('part_time_jobs')  // 更新表名为 part_time_jobs
      .where({ _id: jobId })  // 使用 _id 进行查询
      .get();

    if (res.data.length === 0) {
      return { success: false, message: '兼职信息不存在' };
    }

    return {
      success: true,
      data: res.data[0], // 返回兼职信息
    };
  } catch (err) {
    console.error('获取兼职信息失败', err);
    return { success: false, message: '获取兼职信息失败' };
  }
};
