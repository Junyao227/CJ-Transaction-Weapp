'use strict';
const db = uniCloud.database();

exports.main = async (event, context) => {
  const {
    userId
  } = event; // 获取用户ID

  // 检查参数是否完整
  if (!userId) {
    return {
      success: false,
      message: '缺少用户ID'
    };
  }

  try {
    // 查询粉丝数量
    const fansCount = await db.collection('users_follow')
      .where({
        followed_user_id: userId
      })
      .count(); // 获取粉丝数量

    // 查询关注数量
    const followCount = await db.collection('users_follow')
      .where({
        user_id: userId
      })
      .count(); // 获取关注数量

    // 查询收藏数量
    const collectCount = await db.collection('user_collections')
      .where({
        user_id: userId
      })
      .count(); // 获取收藏数量

    // 查询用户积分（字段为 score）
    const user = await db.collection('users').where({
      user_id: userId
    }).get();

    const score = user.data[0]?.score || 0; // 获取积分字段，默认值为0

    // 返回查询结果
    return {
      success: true,
      data: {
        score, // 积分
        fans: fansCount.total, // 粉丝数量
        follow: followCount.total, // 关注数量
        collections: collectCount.total // 收藏数量
      }
    };
  } catch (err) {
    console.error('查询失败:', err);
    return {
      success: false,
      message: '查询失败',
      error: err
    };
  }
};
