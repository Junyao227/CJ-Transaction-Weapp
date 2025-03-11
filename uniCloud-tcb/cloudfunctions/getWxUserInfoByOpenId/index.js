'use strict';
// 云函数入口文件
const usersCollection = uniCloud.database().collection('users');
exports.main = async (event, context) => {
 // 从 event 中获取 WxOpenId
  const { WxOpenId } = event;

  // 检查 WxOpenId 是否传入
  if (!WxOpenId) {
    return {
      code: 400,
      message: '缺少 WxOpenId 参数'
    };
  }

  try {
    // 使用 WxOpenId 查询用户信息
    const result = await usersCollection.where({
      wx_openid: WxOpenId
    }).get();

    // 检查是否找到用户
    if (result.data.length === 0) {
      return {
        code: 404,
        message: '用户未找到'
      };
    }

    // 返回用户信息
    return {
      code: 200,
      message: '查询成功',
      data: result.data[0] // 返回第一条数据
    };
  } catch (error) {
    // 捕获异常
    return {
      code: 500,
      message: '查询失败',
      error: error.message
    };
  }
};
