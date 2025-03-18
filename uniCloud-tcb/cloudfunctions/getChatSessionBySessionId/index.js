
const db = uniCloud.database();
const sessionCollection = db.collection('chat_session');

exports.main = async (event, context) => {
  try {
    const { sessionId} = event;

    const res = await sessionCollection
      .where({
        _id: sessionId
      })
      .get();

    if (res.data.length > 0) {
      return {
        success: true,
        session: res.data
      };
    } else {
      return {
        success: false,
        message: '会话不存在',
      };
    }
  } catch (err) {
    console.error('查询会话失败', err);
    return {
      success: false,
      message: '查询会话失败',
      error: err,
    };
  }
};
