<template>
	<view class="message-list">
		<!-- 如果页面正在加载，显示loading -->
		<u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>

		<view v-if="!loading">
			<view v-for="(msg, index) in messages" :key="index" class="message-item" @click="goToChat(msg)">
				<!-- 头像部分 -->
				<view class="avatar-wrapper">
					<u--image :src="msg.relatedInfo.avatar" width="50px" height="50px" class="avatar" />
					<!-- 未读消息数量 -->
					<view v-if="msg.unreadCount > 0" class="unread-badge">{{ msg.unreadCount > 99 ? '99+' : msg.unreadCount }}</view>
				</view>

				<!-- 右侧的消息内容 -->
				<view class="message-content">
					<text class="nickname">{{ msg.relatedInfo.nickname }}</text>
					<text class="last-message">{{ truncateMessage(msg.lastMessage) }}</text>
				</view>

				<!-- 右侧时间 & 消息类型 -->
				<view class="message-info">
					<text class="timestamp">{{ formatTime(msg.timestamp) }}</text>
					<u-tag :text="getTypeLabel(msg.type)" size="mini" :type="getTypeTag(msg.type)" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import dayjs from 'dayjs';

const GoEasy = uni.$GoEasy; // 假设已在 main.js 中全局引入

export default {
  data() {
    return {
      messages: [],
      userId: '',
      loading: true, // 页面加载状态
      goeasy: null // GoEasy 实例
    };
  },
  onLoad() {
    // 获取当前用户信息
    const userInfo = uni.getStorageSync('USER_INFO');
    this.userId = userInfo.user_id;

    // 初始化 GoEasy
    this.goeasy = GoEasy;
    this.connectGoEasy();

    // 获取消息列表
    this.fetchMessages();

    // 设置实时消息监听
    this.setupRealTimeMessages();
  },
  onShow() {
    // 刷新消息列表，确保实时更新
    this.fetchMessages();
  },
  onUnload() {
    // 关闭 GoEasy 连接和实时监听
    if (this.goeasy) {
      this.goeasy.im.off(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
    }
  },
  methods: {
    // 连接 GoEasy
    connectGoEasy() {
      this.goeasy.connect({
        id: this.userId, // 使用当前用户 ID
        data: {
          avatar: uni.getStorageSync('USER_INFO').avatar || '/static/logo.png',
          nickname: uni.getStorageSync('USER_INFO').user_id
        },
        onSuccess: () => {
          console.log('GoEasy connect successfully.');
        },
        onFailed: (error) => {
          console.log('Failed to connect GoEasy, code:' + error.code + ', error:' + error.content);
        },
        onProgress: (attempts) => {
          console.log('GoEasy is connecting', attempts);
        }
      });
    },

    async fetchMessages() {
      const res = await uniCloud.callFunction({
        name: 'getSessionByUserId',
        data: { userId: this.userId }
      });

      if (res.result.success) {
        // 遍历会话列表，获取对方用户信息
        const messages = await Promise.all(
          res.result.data.map(async (session) => {
            // 确定对方用户的ID
            const otherUserId = session.buyer_id === this.userId ? session.seller_id : session.buyer_id;

            // 调用云函数获取对方用户信息
            const userRes = await uniCloud.callFunction({
              name: 'getUserInfoByUserId',
              data: { userId: otherUserId }
            });

            if (!userRes.result.success) {
              console.log('获取用户信息失败:', userRes.result.message);
              return null;
            }

            const otherUserInfo = userRes.result.data; // 对方用户信息

            // 获取相关的商品、兼职或跑腿信息
            let relatedInfo = {};
            if (session.type === 1) {
              // 二手商品
              const itemRes = await uniCloud.callFunction({
                name: 'getItemInfoById',
                data: { itemId: session.related_item_id }
              });
              if (itemRes.result.success) {
                relatedInfo = { ...itemRes.result.data, avatar: otherUserInfo.avatar, nickname: otherUserInfo.nickname, otherId: otherUserInfo.user_id };
              }
            } else if (session.type === 2) {
              // 兼职
              const jobRes = await uniCloud.callFunction({
                name: 'getJobInfoById',
                data: { jobId: session.related_item_id }
              });
              if (jobRes.result.success) {
                relatedInfo = { ...jobRes.result.data, avatar: otherUserInfo.avatar, nickname: otherUserInfo.nickname, otherId: otherUserInfo.user_id };
              }
            } else if (session.type === 3) {
              // 跑腿
              const taskRes = await uniCloud.callFunction({
                name: 'getTaskInfoById',
                data: { taskId: session.related_item_id }
              });
              if (taskRes.result.success) {
                relatedInfo = { ...taskRes.result.data, avatar: otherUserInfo.avatar, nickname: otherUserInfo.nickname, otherId: otherUserInfo.user_id };
              }
            }

            this.loading = false; // 加载完成，设置 loading 为 false
            return {
              sessionId: session._id,
              userId: session.buyer_id,
              type: session.type, // 1: 二手商品, 2: 兼职, 3: 跑腿
              lastMessage: session.last_message,
              timestamp: session.updated_at,
              unreadCount: session.unread_count || 0, // 未读消息数
              relatedInfo // 动态添加对应的商品、兼职或跑腿信息
            };
          })
        );
		this.messages = [...messages]; // 强制触发更新
      }
    },

    // 设置实时消息监听
    setupRealTimeMessages() {
      // GoEasy 实时消息监听
      this.goeasy.im.on(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);

    },

    // 接收实时消息
    onMessageReceived(message) {
      const senderId = message.senderId;
      const receiverId = message.receiverId;
      const friendId = this.userId === senderId ? receiverId : senderId;

      console.log('接收到私信消息:', message);
      if (friendId) {
        // 更新消息列表，模拟消息到达
        this.fetchMessages(); // 刷新消息列表以显示最新消息
		console.log("现在的消息",this.messages);
      }
    },

    // 获取类型标签
    getTypeLabel(type) {
      switch (type) {
        case 1:
          return '二手商品';
        case 2:
          return '兼职';
        case 3:
          return '跑腿';
        default:
          return '未知';
      }
    },

    // 获取类型标签样式
    getTypeTag(type) {
      switch (type) {
        case 1:
          return 'success';
        case 2:
          return 'primary';
        case 3:
          return 'warning';
        default:
          return 'info';
      }
    },

    // 格式化时间
    formatTime(timestamp) {
      const now = dayjs(); // 当前时间
      const msgDate = dayjs(timestamp); // 消息时间
      const diffInDays = now.diff(msgDate, 'day'); // 计算相差的天数

      if (diffInDays === 0) {
        // 如果是今天，显示时间（如 15:41）
        return msgDate.format('HH:mm'); // 24 小时制
      } else if (diffInDays === 1) {
        // 如果是昨天，显示 "昨天"
        return '昨天';
      } else {
        // 如果是更早的消息，显示日期（如 2025-02-16）
        return msgDate.format('YYYY-MM-DD');
      }
    },

    // 省略过长的消息内容
    truncateMessage(message) {
      if (message.length > 20) {
        return message.substring(0, 20) + '...';
      }
      return message;
    },

    // 跳转到聊天详情页
    goToChat(msg) {
      let url = '';
      if (msg.type === 1) {
        url = `/pages/item/chat/chat?sellerAndItemInfo=${JSON.stringify(msg.relatedInfo)}`;
      } else if (msg.type === 2) {
        url = `/pages/job/chat/chat?publisherAndJobInfo=${JSON.stringify(msg.relatedInfo)}`;
      } else if (msg.type === 3) {
        url = `/pages/task/chat/chat?publisherAndTaskInfo=${JSON.stringify(msg.relatedInfo)}`;
      }

      uni.navigateTo({
        url: url
      });
    }
  }
};
</script>

<style scoped>
.message-list {
	padding: 10px;
}

.message-item {
	display: flex;
	align-items: center;
	padding: 10px;
	border-bottom: 1px solid #eee;
	position: relative;
}

.avatar-wrapper {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: center;
}

.avatar {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	margin-right: 10px;
}

.unread-badge {
	position: absolute;
	top: 0;
	right: 0;
	width: 20px;
	height: 20px;
	background-color: red;
	color: white;
	font-size: 12px;
	font-weight: bold;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	transform: translate(50%, -50%);
}

.message-content {
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.nickname {
	font-size: 16px;
	font-weight: bold;
	color: #333;
}

.last-message {
	font-size: 14px;
	color: #666;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	width: 180px;
}

.message-info {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
}

.timestamp {
	font-size: 12px;
	color: #999;
}
</style>
