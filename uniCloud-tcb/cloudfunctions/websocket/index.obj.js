// 引入 chat.js 中的函数来处理 WebSocket 和消息逻辑
const chatController = require('./websocket/chat');

module.exports = {
  _before: function () {
    // 这里可以放一些逻辑，如果需要在每个请求前执行
  },

  _after: function (error, result) {
    // 这里处理请求后的一些逻辑，主要是错误处理
    if (error) {
      console.error(error);
      if (error.name === 'ValidationError') {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return {
          errCode: 'ValidationError',
          errMsg: errorMessage
        };
      }
      return {
        errCode: error.name || '400',
        errMsg: error.message
      };
    }

    return {
      errCode: 0,
      errMsg: '',
      data: result || {}
    };
  },

  // WebSocket 相关的事件
  _onWebsocketConnection: chatController._onWebsocketConnection,
  _onWebsocketMessage: chatController._onWebsocketMessage,
  _onWebsocketDisConnection: chatController._onWebsocketDisConnection,
  _onWebsocketError: chatController._onWebsocketError,

  // 消息相关的操作
  fetchMessages: chatController.fetchMessages, // 获取历史消息
  sendMessage: chatController.sendMessage,     // 发送消息
  // 如果你有其他相关的操作，可以在这里继续添加
};
