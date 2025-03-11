const db = uniCloud.database();
const messagesCollection = db.collection('chat_message');
const sessionCollection = db.collection('chat_session');

exports.main = async (event, context) => {
	try {
		const {
			sessionId,
			userId,
			sellerId,
			messageContent,
			type,
			relatedItemId
		} = event;

		const newMessage = {
			session_id: sessionId,
			sender_id: userId,
			receiver_id: sellerId,
			content: messageContent,
			message_type: 1, // 文本消息
			is_read: 0, // 默认未读
			created_at: new Date(),
			type: type

		};

		// 保存消息
		await messagesCollection.add(newMessage);

		// 更新会话表
		await sessionCollection
			.doc(sessionId)
			.update({
				last_message: messageContent,
				updated_at: new Date(),
				unread_buyer: userId === sellerId ? 1 : 0, // 如果消息是卖家发的，买家有未读消息，设置为 1
				unread_seller: userId !== sellerId ? 1 : 0 // 如果消息是买家发的，卖家有未读消息，设置为 1
			});

		return {
			success: true,
			message: '消息发送成功',
		};
	} catch (err) {
		console.error('发送消息失败', err);
		return {
			success: false,
			message: '发送消息失败',
			error: err,
		};
	}
};