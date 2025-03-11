const ws = uniCloud.webSocketServer();
const db = uniCloud.database();
const chatCollection = db.collection("chat_message");
const sessionCollection = db.collection("chat_sessions");
const userConnections = db.collection("user_connections");

// 处理 WebSocket 连接
exports._onWebsocketConnection = async function (event) {
  const { connectionId, query } = event;
  const userId = query.userId;

  if (!userId) {
    await ws.send(connectionId, "错误: 用户ID缺失");
    return;
  }

  await userConnections.add({
    userId,
    connectionId,
    connectedAt: Date.now()
  });

  await ws.send(connectionId, "WebSocket 连接成功！");
};

// 处理 WebSocket 消息
exports._onWebsocketMessage = async function (event) {
  const { connectionId, payload } = event;
  const messageData = JSON.parse(payload);

  if (messageData.type === "chat") {
    const targetConnection = await userConnections.where({ userId: messageData.toUserId }).get();
    const targetConnectionId = targetConnection.data.length ? targetConnection.data[0].connectionId : null;

    if (targetConnectionId) {
      await ws.send(targetConnectionId, JSON.stringify({
        from: messageData.fromUserId,
        message: messageData.message,
        timestamp: Date.now()
      }));
    }

    // 存入数据库
    await chatCollection.add({
      session_id: messageData.sessionId,
      sender_id: messageData.fromUserId,
      receiver_id: messageData.toUserId,
      content: messageData.message,
      created_at: Date.now()
    });
  }
};

// 处理 WebSocket 断开连接
exports._onWebsocketDisConnection = async function (event) {
  const { connectionId } = event;
  await userConnections.where({ connectionId }).remove();
};

// 获取历史消息
exports.fetchMessages = async function (event) {
  const { sessionId } = event;
  const res = await chatCollection
    .where({ session_id: sessionId })
    .orderBy("created_at", "asc")
    .get();

  return {
    success: true,
    messages: res.data
  };
};

// 发送消息
exports.sendMessage = async function (event) {
  const { sessionId, userId, sellerId, messageContent, type, relatedItemId } = event;
  await chatCollection.add({
    session_id: sessionId,
    sender_id: userId,
    receiver_id: sellerId,
    content: messageContent,
    message_type: type,
    created_at: Date.now(),
    related_item_id: relatedItemId
  });

  return {
    success: true,
    message: '消息发送成功'
  };
};
