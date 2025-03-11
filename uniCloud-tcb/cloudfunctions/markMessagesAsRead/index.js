// 云函数：markMessagesAsRead.js
exports.main = async (event, context) => {
    const { sessionId, userId } = event;
    const db = uniCloud.database();

    // 将该会话中，当前用户是接收者的未读消息全部标记为已读
    const updateRes = await db.collection('chat_message')
        .where({
            session_id: sessionId,
            receiver_id: userId, // 只更新接收者是当前用户的消息
            is_read: 0
        })
        .update({
            is_read: 1
        });

    return {
        success: updateRes.updated > 0,
        message: updateRes.updated > 0 ? '消息已标记为已读' : '无未读消息'
    };
};
