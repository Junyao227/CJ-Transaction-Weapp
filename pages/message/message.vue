<template>
  <view class="message-page">
    <!-- 如果页面正在加载，显示loading -->
    <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>

    <view v-if="!loading" class="message-list">
      <view v-for="(msg, index) in messages" :key="index" class="message-item" hover-class="message-item-hover" @click="goToChat(msg)">
        <view class="avatar-box">
          <image v-if="msg.relatedInfo.avatar" :src="msg.relatedInfo.avatar" class="avatar" mode="aspectFill" />
          <view v-else class="default-avatar">
            <uni-icons type="person" size="24" color="#999"></uni-icons>
          </view>
		  <!-- 头像右下角 -->
          <view v-if="msg.hasAvatar" class="avatar-badge">
            <image class="sun-icon" :src="sunIconUrl" mode="aspectFit" />
          </view>
          <view v-if="msg.unreadCount > 0" class="unread-badge">
            {{msg.unreadCount > 99 ? '99+' : msg.unreadCount}}
          </view>
        </view>
        <view class="content">
          <view class="name-wrap">
            <text class="name">{{msg.relatedInfo.nickname}}</text>
          </view>
          <view class="desc-wrap">
            <text class="desc">{{truncateMessage(msg.lastMessage)}}</text>
          </view>
        </view>
        <view class="right">
          <text class="time">{{formatTime(msg.timestamp)}}</text>
          <view :class="['tag', getTypeClass(msg.type)]">{{getTypeLabel(msg.type)}}</view>
        </view>
      </view>
      <u-empty :show="!messages || messages.length === 0" mode="data"></u-empty>
    </view>
  </view>
</template>

<script>
import dayjs from 'dayjs';
import { mapState, mapActions, mapGetters } from 'vuex';
const GoEasy = uni.$GoEasy; // 假设已在 main.js 中全局引入

export default {
  data() {
    return {
      userId: '',
      goeasy: null, // GoEasy 实例
      sunIconUrl: '' // 如果需要太阳图标，请设置正确的路径
    };
  },
  computed: {
    // 映射 Vuex 的状态和 getters
    ...mapState('messages', ['messages']),
    ...mapGetters('messages', ['loading'])
  },
  async onLoad() {
    // 获取当前用户信息
    const userInfo = uni.getStorageSync('USER_INFO');
    this.userId = userInfo.user_id;

    // 初始化 GoEasy
    this.goeasy = GoEasy;
    this.connectGoEasy();

    // 获取消息列表
    await this.fetchMessages(this.userId);

    // 设置实时消息监听
    this.setupRealTimeMessages();
  },
  onUnload() {
    // 关闭 GoEasy 连接和实时监听
    if (this.goeasy) {
      this.goeasy.im.off(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
    }
  },
  methods: {
    // 映射 Vuex 的 actions
    ...mapActions('messages', ['fetchMessages', 'updateReceiveMessage']),
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

    // 设置实时消息监听
    setupRealTimeMessages() {
      // GoEasy 实时消息监听
      this.goeasy.im.on(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
    },

    // 接收实时消息
    async onMessageReceived(message) {
      this.updateReceiveMessage({ message, userId: this.userId });
      console.log('现在的消息   message', this.messages, message);
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
    
    // 获取类型对应的class
    getTypeClass(type) {
      switch (type) {
        case 1:
          return 'job';
        case 2:
          return 'second';
        case 3:
          return 'errand';
        default:
          return '';
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
      if (message && message.length > 20) {
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

<style>
page {
  height: 100%;
  background-color: #f8f8f8;
}
.message-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #fff;
}
.message-list {
  flex: 1;
  overflow: auto;
}
.message-item {
  display: flex;
  align-items: center;
  padding: 32rpx 32rpx;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
}
.message-item-hover {
  background-color: #f8f8f8;
}
.avatar-box {
  position: relative;
  width: 94rpx;
  height: 94rpx;
  margin-right: 28rpx;
  flex-shrink: 0;
}
.avatar {
  width: 94rpx;
  height: 94rpx;
  border-radius: 48rpx;
  background-color: #f5f5f5;
}
.default-avatar {
  width: 94rpx;
  height: 94rpx;
  border-radius: 48rpx;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-badge {
  position: absolute;
  right: -8rpx;
  bottom: -8rpx;
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  overflow: hidden;
}
.unread-badge {
  position: absolute;
  right: -10rpx;
  top: -10rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  background-color: #ff5a5f;
  color: #fff;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sun-icon {
  width: 100%;
  height: 100%;
}
.content {
  flex: 1;
  overflow: hidden;
}
.name-wrap {
  margin-bottom: 8rpx;
}
.name {
  font-size:  33rpx;
  color: #333;
  font-weight: 500;
}
.desc-wrap {
  width: 100%;
}
.desc {
  font-size: 29rpx;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 24rpx;
}
.time {
  font-size: 12px;
  color: #999;
  margin-bottom: 25rpx;
}
.tag {
  padding: 4rpx 16rpx;
  border-radius: 24rpx;
  font-size: 12px;
}
.job {
  background-color: rgba(41, 121, 255, 0.1);
  color: #2979ff;
}
.second {
  background-color: rgba(25, 190, 107, 0.1);
  color: #19be6b;
}
.errand {
  background-color: rgba(255, 153, 0, 0.1);
  color: #ff9900;
}
</style>