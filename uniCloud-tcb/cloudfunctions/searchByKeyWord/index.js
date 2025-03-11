const db = uniCloud.database();

exports.main = async (event, context) => {
  const { type, keyword } = event;

  let collection;

  // 根据 type 判断查询哪个集合
  switch (type) {
    case 0: // 查询二手商品
      collection = db.collection('secondhand_items');
      break;
    case 1: // 查询兼职
      collection = db.collection('part_time_jobs');
      break;
    case 2: // 查询跑腿任务
      collection = db.collection('errand_tasks');
      break;
    default:
      return {
        success: false,
        message: '无效的查询类型'
      };
  }

  try {
    // 执行模糊查询，查找标题中包含关键词的项
    const res = await collection.where({
      title: db.RegExp({
        regexp: keyword,
        options: 'i' // 不区分大小写
      })
    }).get();

    // 返回查询结果
    return {
      success: true,
      data: res.data
    };
  } catch (error) {
    return {
      success: false,
      message: '查询失败',
      error: error.message
    };
  }
};