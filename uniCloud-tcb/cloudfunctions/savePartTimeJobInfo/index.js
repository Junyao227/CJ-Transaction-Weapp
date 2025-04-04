const db = uniCloud.database();
const collection = db.collection('part_time_jobs');  // jobs是你的数据库表名

exports.main = async (event, context) => {
  const { title, description, salary, job_type, location, publisher_id } = event;

// 设置当前时间为 created_time
  const created_time = new Date();
    const status = 0;
	
  // 数据验证（可选）
  if (!title || !description || !salary || !location) {
    return { success: false, message: '缺少必要字段' };
  }

  // 保存数据到数据库
  try {
    await collection.add({
      title,
      description,
      salary,
      job_type,
      location,
      publisher_id,
      created_time,
	  company,
	  status
    });
    return { success: true, message: '保存成功' };
  } catch (err) {
    console.error(err);
    return { success: false, message: '保存失败' };
  }
};
