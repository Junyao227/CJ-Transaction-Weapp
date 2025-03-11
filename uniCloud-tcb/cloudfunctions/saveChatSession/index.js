const db = uniCloud.database();
const sessionCollection = db.collection('chat_session');

exports.main = async (event, context) => {
  try {
    const { userId, sellerId,type,relatedItemId } = event;

    const newSession = {
      buyer_id: userId,
      seller_id: sellerId,
      created_at: new Date(),
      updated_at: new Date(),
      last_message: '',
      unread_buyer: 0,
      unread_seller: 0,
      status: 1,  // 活跃
	  type: type,
	  related_item_id: relatedItemId
    };

    const createRes = await sessionCollection.add(newSession);

    return {
      success: true,
      sessionId: createRes.id
    };
  } catch (err) {
    console.error('创建会话失败', err);
    return {
      success: false,
      message: '创建会话失败',
      error: err,
    };
  }
};
