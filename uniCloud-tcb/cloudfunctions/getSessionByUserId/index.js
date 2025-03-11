const db = uniCloud.database();
const sessionCollection = db.collection('chat_session');
const messageCollection = db.collection('chat_message');

exports.main = async (event, context) => {
    try {
        const { userId } = event;

        // **1. 获取用户的所有会话（买家或卖家）**
        const sessionRes = await sessionCollection
            .where({
                $or: [{ buyer_id: userId }, { seller_id: userId }]
            })
            .orderBy("updated_at", "desc")
            .get();

        if (sessionRes.data.length === 0) {
            return {
                success: true,
                data: [],
                message: '没有会话'
            };
        }

        // **2. 计算未读消息数量**
        const sessions = await Promise.all(sessionRes.data.map(async (session) => {
            const unreadCountRes = await messageCollection
                .where({
                    session_id: session._id,
                    receiver_id: userId, // 只计算当前用户是接收者的未读消息
                    is_read: 0
                })
                .count(); // 获取未读消息数量

            return {
                ...session,
                unread_count: unreadCountRes.total // 追加未读消息数量
            };
        }));

        return {
            success: true,
            data: sessions
        };
    } catch (err) {
        console.error('查询会话失败', err);
        return {
            success: false,
            message: '查询会话失败',
            error: err,
        };
    }
};
