
const db = uniCloud.database();
const messagesCollection = db.collection('chat_message');

exports.main = async (event, context) => {
  try {
    const { sessionId } = event;

    const res = await messagesCollection
      .where({ session_id: sessionId })
      .orderBy('created_at', 'asc')
      .get();

    return {
      success: true,
      messages: res.data,
    };
  } catch (err) {
    console.error('获取消息失败', err);
    return {
      success: false,
      message: '获取消息失败',
      error: err,
    };
  }
};
