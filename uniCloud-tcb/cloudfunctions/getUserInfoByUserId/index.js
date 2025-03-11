const db = uniCloud.database();
const usersCollection = db.collection('users');  // 假设你的用户信息表名为 users

exports.main = async (event, context) => {
  try {
    const { userId } = event;  // 获取传递的 userId 参数

    if (!userId) {
      return {
        success: false,
        message: '用户ID不能为空',
      };
    }

    // 查询用户信息
    const res = await usersCollection.where({
      user_id: userId,
    }).get();

    // 如果查询到了数据
    if (res.data.length > 0) {
      return {
        success: true,
        data: res.data[0],  // 返回查询到的第一个用户数据
      };
    } else {
      return {
        success: false,
        message: '用户未找到',
      };
    }
  } catch (err) {
    console.error('查询用户信息失败', err);
    return {
      success: false,
      message: '查询失败',
      error: err,
    };
  }
};
