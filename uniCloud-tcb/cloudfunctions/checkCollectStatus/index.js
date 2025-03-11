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
    // 查询用户是否已经收藏过该 item
    const result = await db.collection('user_collections').where({
      user_id: userId,     // 用户ID
      item_id: itemId,     // 对应的 itemId
      type: type           // 对应的类型（0 - item，1 - job，2 - task）
    }).get();

    // 判断是否存在收藏记录
    if (result.data.length > 0) {
      return { success: true, isCollected: true }; // 如果有收藏记录，返回 true
    } else {
      return { success: true, isCollected: false }; // 如果没有收藏记录，返回 false
    }

  } catch (err) {
    return { success: false, message: '检查收藏状态失败', error: err };
  }
};
