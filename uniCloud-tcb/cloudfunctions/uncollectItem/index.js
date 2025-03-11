'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  const { userId, itemId, type } = event;  // type: 0=item / 1=job / 2=task

 // 检查参数是否完整
  if (!userId || !itemId || typeof type === 'undefined') {
    console.log('缺少必要的参数', event);
    return {
      success: false,
      message: '缺少必要的参数'
    };
  }

  try {
    // 删除收藏记录
    await db.collection('user_collections').where({
      user_id: userId,
      item_id: itemId,  // 根据 itemId 查找对应的收藏记录
      type: type  // 根据类型删除
    }).remove();

    return { success: true, message: '取消收藏成功' };
  } catch (err) {
    return { success: false, message: '取消收藏失败', error: err };
  }
};
