<template>
  <view class="container">
    <!-- 商品信息 -->
    <view class="product-card">
      <image class="product-image" :src="itemInfo.imageUrl" mode="aspectFill"></image>
      <view class="product-info">
        <view class="price-wrapper">
          <text class="price-symbol">¥</text>
          <text class="price-value">{{ itemInfo.price }}</text>
        </view>
      </view>
      <view class="buy-btn">
        <button class="primary-btn" @click="buyNow">立即购买</button>
      </view>
    </view>

    <!-- 消息列表 -->
    <scroll-view class="message-list" scroll-y :scroll-top="scrollTop">
      <view v-for="(msg, index) in messageList" :key="index" 
            :class="['message-item', msg.senderId === userInfo.userId ? 'sender' : 'receiver']">
        <!-- 接收消息 -->
        <view v-if="msg.senderId !== userInfo.userId" class="avatar">
          <image :src="sellerInfo.sellerAvatar" mode="aspectFill"></image>
        </view>
        
        <view class="message-content">
          <text>{{ msg.content }}</text>
        </view>
        
        <!-- 发送消息 -->
        <view v-if="msg.senderId === userInfo.userId" class="avatar">
          <image :src="userInfo.userAvatar" mode="aspectFill"></image>
        </view>
      </view>
    </scroll-view>

    <!-- 输入框 -->
    <view class="input-area">
      <input type="text" class="message-input" v-model="message" placeholder="输入消息..."/>
      <button class="send-btn" @click="sendMessage">发送</button>
    </view>
    
    <!-- 加载状态 -->
    <u-loading-page :loading="loading" loading-text="加载中..."></u-loading-page>
  </view>
</template>

<script>
const GoEasy = uni.$GoEasy;
import { mapState, mapActions, mapGetters } from 'vuex';
export default {
  data() {
    return {
      userInfo: {
        userId: '',
        userAvatar: ''
      },
      sellerInfo: {
        sellerId: '',
        sellNickName: '',
        sellerAvatar: ''
      },
      sessionId: '', // 会话ID
      messageList: [], // 消息列表
      message: '', // 用户输入的消息
      scrollTop: 0, // 控制滚动位置
      itemInfo: {
        imageUrl: '',
        price: ''
      },
      loading: true,
      sellerAndItemInfo: {},
      to: {}, // GoEasy 发送目标
      goeasy: null
    };
  },
  onLoad(options) {
    const sellerAndItemInfo = JSON.parse(options.sellerAndItemInfo);
    this.sellerAndItemInfo = sellerAndItemInfo;
    console.log("this.sellerAndItemInf",this.sellerAndItemInfo);
    this.itemInfo.price = sellerAndItemInfo.price;
    this.getItemTempImagesUrl(sellerAndItemInfo);

    const userInfo = uni.getStorageSync('USER_INFO');
    this.userInfo.userId = userInfo.user_id;
    this.userInfo.userAvatar = userInfo.avatar;

    this.sellerInfo.sellerAvatar = sellerAndItemInfo.avatar;
    this.sellerInfo.sellNickName = sellerAndItemInfo.nickname;
    this.sellerInfo.sellerId = sellerAndItemInfo.publisher_id;

    // 优化：将 to 初始化移到 onLoad 中，避免重复定义
    this.to = {
      id: this.sellerAndItemInfo.otherId && this.userInfo.userId === this.sellerInfo.sellerId ? this.sellerAndItemInfo.otherId : this.sellerInfo.sellerId,
      type: GoEasy.IM_SCENE.PRIVATE,
      data: {
        name: this.sellerInfo.sellNickName || this.sellerInfo.sellerId,
        avatar: this.sellerInfo.sellerAvatar,
        sessionId: this.sessionId
      }
    };
    this.goeasy = GoEasy; // 假设已在 main.js 中全局引入
    this.connectGoEasy();
    this.initSession();
    this.setupRealTimeMessages();
  },
  onUnload() {
    // 优化：移除 GoEasy 监听器，移除无用的 watcher 检查
    this.goeasy.im.off(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
  },
  computed: {
    // 映射 Vuex 的状态和 getters
    ...mapState('messages', ['messages']),
    ...mapGetters('messages')
  },
  methods: {
    // 映射 Vuex 的 actions
    ...mapActions('messages', ['updateSendMessage', 'updateReadedMessage']),
    async getItemTempImagesUrl(sellerAndItemInfo) {
      // 获取每个商品的临时图片链接
      // 调用 uniCloud.getTempFileURL 获取图片的临时 URL
      const result = await uniCloud.getTempFileURL({
        fileList: [sellerAndItemInfo.images]
      });

      if (result.fileList && result.fileList.length > 0) {
        this.itemInfo.imageUrl = result.fileList[0]?.tempFileURL;
      } else {
        uni.showToast({
          icon: 'none',
          title: '获取图片链接失败'
        });
      }
    },
    connectGoEasy() {
      this.goeasy.connect({
        id: this.userInfo.userId, // 使用当前用户 ID
        data: {
          avatar: this.userInfo.userAvatar || '/static/logo.png',
          nickname: this.userInfo.userId
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
    async getSellerAvatar(sellerId) {
      const sellerRes = await uniCloud.callFunction({
        name: 'getUserInfoByUserId',
        data: { userId: sellerId }
      });

      if (sellerRes.result.success) {
        this.sellerInfo.sellerAvatar = sellerRes.result.data.avatar;
      } else {
        uni.showToast({
          icon: 'none',
          title: sellerRes.result.message || '查询用户头像失败'
        });
      }
    },
    async initSession() {
      let res;
      try {
        if (this.sellerAndItemInfo.otherId && this.userInfo.userId === this.sellerInfo.sellerId) {
          res = await uniCloud.callFunction({
            name: 'getChatSessionBySellerIdAndUserId',
            data: { userId: this.sellerAndItemInfo.otherId, sellerId: this.userInfo.userId, related_id:this.sellerAndItemInfo._id,type: 1 }
          });
        } else {
          res = await uniCloud.callFunction({
            name: 'getChatSessionBySellerIdAndUserId',
            data: { userId: this.userInfo.userId, sellerId: this.sellerInfo.sellerId, related_id:this.sellerAndItemInfo._id, type: 1 }
          });
        }

        if (res.result.success) {
          this.sessionId = res.result.sessionId;
          this.updateReadedMessage({ sessionId: this.sessionId });
          await uniCloud.callFunction({
            name: 'markMessagesAsRead',
            data: { sessionId: this.sessionId, userId: this.userInfo.userId }
          });
          this.fetchMessages();
        } else {
          const createRes = await uniCloud.callFunction({
            name: 'saveChatSession',
            data: { userId: this.userInfo.userId, sellerId: this.sellerInfo.sellerId, type: 1, relatedItemId: this.sellerAndItemInfo._id }
          });
          if (createRes.result.success) {
            this.sessionId = createRes.result.sessionId;
            this.fetchMessages();
          }
        }
      } catch (e) {
        uni.showToast({
          title: `错误: ${e.message}`,
          icon: 'none',
          duration: 2000
        });
      }
    },
    async fetchMessages() {
      try {
        const res = await uniCloud.callFunction({
          name: 'getChatMessageBySessionId',
          data: { sessionId: this.sessionId }
        });
        if (res.result.success) {
          this.messageList = res.result.messages.map((msg) => ({
            senderId: msg.sender_id,
            content: msg.content,
            timestamp: msg.created_at
          }));
          this.scrollToBottom(); // 优化：调用统一的方法
        }
      } catch (e) {
        uni.showToast({
          title: `错误: ${e.message}`,
          icon: 'none',
          duration: 2000
        });
      } finally {
        this.loading = false;
      }
    },
    // [GoEasy 修改] 使用 GoEasy 发送消息并保存到云数据库
    sendMessage() {
      if (!this.message.trim()) return;
      GoEasy.im.createTextMessage({
        text: this.message,
        to: this.to,
        onSuccess: (message) => {
          message.payload.customData = {
            sessionId: this.sessionId,
            type: 1
          };

          // 本地立即显示
          this.messageList.push({
            senderId: this.userInfo.userId,
            content: this.message,
            timestamp: Date.now()
          });

          this.updateSendMessage({ message: this.message,sessionId: this.sessionId,type: 1,otherUserId: this.to.id});

          this.scrollToBottom();

          // 发送消息并保存到云数据库
          GoEasy.im.sendMessage({
            message: message,
            onSuccess: async () => {
              try {
                await uniCloud.callFunction({
                  name: 'saveMessage',
                  data: {
                    sessionId: this.sessionId,
                    userId: this.userInfo.userId,
                    sellerId: this.to.id, // 优化：使用 to.id 统一接收者
                    type: 1,
                    messageContent: message.payload.text
                  }
                });
              } catch (e) {
                uni.showToast({
                  title: `保存消息失败: ${e.message}`,
                  icon: 'none'
                });
              }
            },
            onFailed: (error) => {
              uni.showToast({
                title: `发送失败: ${error.message}`,
                icon: 'none'
              });
            }
          });

          this.message = ''; // 清空输入框
        },
        onFailed: (error) => {
          uni.showToast({
            title: `创建消息失败: ${error.message}`,
            icon: 'none'
          });
        }
      });
    },
    buyNow() {
      uni.navigateTo({
        url: `/pages/item/purchase/purchase?sellerAndItemInfo=${JSON.stringify(this.sellerAndItemInfo)}`
      });
    },
    // 优化：提取 scrollToBottom 为独立方法
    scrollToBottom() {
      this.$nextTick(() => {
        this.scrollTop = 999999; // 直接设置一个足够大的值
      });
    },
    setupRealTimeMessages() {
      this.goeasy.im.on(GoEasy.IM_EVENT.PRIVATE_MESSAGE_RECEIVED, this.onMessageReceived);
    },
    // 优化：新增 onMessageReceived 方法处理接收消息
    onMessageReceived(message) {
      const senderId = message.senderId;
      const receiverId = message.receiverId;
      const friendId = this.userInfo.userId === senderId ? receiverId : senderId;
      console.log('接收到私信消息:', message);
      if (friendId === this.to.id) {
        // 优化：使用 to.id 判断
        this.messageList.push({
          senderId: message.senderId,
          content: message.payload.text,
          timestamp: message.timestamp
        });
        this.updateReadedMessage({ sessionId: this.sessionId });
        this.scrollToBottom();
      }
    },
    navigateBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style>
page {
  height: 100%;
}

.container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8f8f8;
}



.more-icon {
  margin-left: 30rpx;
}

.product-card {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  margin-bottom: 20rpx;
}

.product-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 12rpx;
}

.product-info {
  flex: 1;
  margin-left: 20rpx;
}

.price-wrapper {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  color: #ff4d4f;
}

.price-value {
  font-size: 20px;
  font-weight: 600;
  color: #ff4d4f;
}

.primary-btn {
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  padding: 0 30rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 32rpx;
}

.message-list {
  flex: 1;
  padding: 20rpx 30rpx;
  overflow-y: auto;
}

.message-item {
  display: flex;
  margin-bottom: 30rpx;
}

.message-item.receiver {
  justify-content: flex-start;
}

.message-item.sender {
  justify-content: flex-end;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  overflow: hidden;
}

.avatar image {
  width: 100%;
  height: 100%;
}

.message-content {
  max-width: 60%;
  padding: 20rpx 24rpx;
  border-radius: 16rpx;
  margin: 0 20rpx;
  word-break: break-all;
}

.receiver .message-content {
  background-color: #ffffff;
  color: #333333;
}

.sender .message-content {
  background-color: #1890ff;
  color: #ffffff;
}

.input-area {
  display: flex;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #ffffff;
  border-top: 1px solid #f0f0f0;
}

.message-input {
  flex: 1;
  height: 72rpx;
  background-color: #f8f8f8;
  border-radius: 36rpx;
  padding: 0 30rpx;
  font-size: 14px;
  margin-right: 20rpx;
}

.send-btn {
  background-color: #1890ff;
  color: #ffffff;
  font-size: 14px;
  padding: 0 30rpx;
  height: 72rpx;
  line-height: 72rpx;
  border-radius: 36rpx;
}
</style>