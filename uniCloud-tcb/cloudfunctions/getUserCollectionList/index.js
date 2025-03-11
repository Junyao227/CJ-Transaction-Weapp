'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { userId } = event; // 获取用户ID

  // 检查参数是否完整
  if (!userId) {
    return {
      success: false,
      message: '缺少用户ID'
    };
  }

  try {
    // 查询用户的收藏记录
    const result = await db.collection('user_collections').where({
      user_id: userId // 根据用户ID查询
    }).get();

    // 根据收藏类型查询对应的信息（商品、兼职、跑腿任务）
    const collectionList = [];

    for (let item of result.data) {
      let dataItem;
      switch (item.type) {
        case 0: // 二手商品
          dataItem = await db.collection('secondhand_items').doc(item.item_id).get();
          break;
        case 1: // 兼职
          dataItem = await db.collection('part_time_jobs').doc(item.item_id).get();
          break;
        case 2: // 跑腿任务
          dataItem = await db.collection('errand_tasks').doc(item.item_id).get();
          break;
        default:
          continue;
      }
      
      if (dataItem.data && dataItem.data.length > 0) {
        collectionList.push({
          ...item,
          data: dataItem.data[0]  // 存储相关数据（商品、兼职、任务）
        });
      }
    }

    return {
      success: true,
      data: collectionList // 返回收藏的所有数据
    };
    
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      message: '获取收藏列表失败',
      error: err
    };
  }
};
