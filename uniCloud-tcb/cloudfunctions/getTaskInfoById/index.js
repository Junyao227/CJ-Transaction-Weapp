// cloudfunctions/getTaskInfoById/index.js

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { taskId } = event;

  if (!taskId) {
    return { success: false, message: '跑腿任务ID不能为空' };
  }

  try {
    const res = await db.collection('errand_tasks')  // 更新表名为 errand_tasks
      .where({ _id: taskId })  // 使用 _id 进行查询
      .get();

    if (res.data.length === 0) {
      return { success: false, message: '跑腿任务信息不存在' };
    }

    return {
      success: true,
      data: res.data[0], // 返回跑腿任务信息
    };
  } catch (err) {
    console.error('获取跑腿任务信息失败', err);
    return { success: false, message: '获取跑腿任务信息失败' };
  }
};
