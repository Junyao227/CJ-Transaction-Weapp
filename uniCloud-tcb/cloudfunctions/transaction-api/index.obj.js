const controller = require('./controller')

module.exports = {
  _before: function () {
    // 这里可以进行身份验证、日志记录等
  },

  _after: function (error, result) {
    if (error) {
      console.error(error)
      return {
        errCode: error.name || '400',
        errMsg: error.message
      }
    }

    return {
      errCode: 0,
      errMsg: '',
      data: result || {}
    }
  },

  // 交易相关 API
  getItemList: controller.item.getItemList,
  publishItem: controller.item.publishItem,
  updateItem: controller.item.updateItem,
  deleteItem: controller.item.deleteItem,
}
