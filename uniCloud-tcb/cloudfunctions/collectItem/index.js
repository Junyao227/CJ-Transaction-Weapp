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
    // 插入收藏记录
    await db.collection('user_collections').add({
      user_id: userId,
      item_id: itemId,  // 存储具体的 itemId, jobId 或 taskId
      type: type,  // 收藏类型（0=item, 1=job, 2=task）
      created_at: new Date()  // 收藏时间
    });

    return { success: true, message: '收藏成功' };
  } catch (err) {
    return { success: false, message: '收藏失败', error: err };
  }
};
