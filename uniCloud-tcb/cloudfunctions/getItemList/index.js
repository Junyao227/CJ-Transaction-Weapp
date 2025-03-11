const db = uniCloud.database();
const collection = db.collection('secondhand_items'); // items 是你的数据库表名

exports.main = async (event, context) => {
  try {
    const { status, userId, location } = event; // 获取传入的 status, userId 和 location 参数

    let query = {}; // 默认查询所有商品

    // 判断 location 来区分查询条件
    if (location === 'index') {
      // 如果是首页，排除当前用户发布的商品
      if (userId) {
        query.publisher_id = db.command.neq(userId); // 排除当前用户发布的商品
      }
    } else if (location === 'mine') {
      // 如果是我的页面，查询用户发布的商品，并根据 status 分类
      if (userId) {
        query.publisher_id = userId; // 查询当前用户发布的商品
      }
     
    }
	if (status !== undefined) {
	  query.status = status; // 根据 status 分类“在卖”，“草稿”，“已下架”
	}

    // 查询商品，使用过滤条件，并根据 created_time 字段进行升序排序
    const res = await collection.where(query)
      .orderBy('created_time', 'desc') // 按照 created_time 字段降序排列
      .get();

    // 返回查询结果
    return {
      success: true,
      data: res.data
    };
  } catch (err) {
    return {
      success: false,
      message: '查询失败',
      error: err
    };
  }
};
