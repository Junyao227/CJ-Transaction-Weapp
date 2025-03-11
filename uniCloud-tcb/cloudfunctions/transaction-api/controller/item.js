const itemService = require('../service/item')
const {validate, validations} = require('wx-common').validate

module.exports = {
  // 获取商品列表
  async getItemList(params) {
    params = validate(validations.getItemList, params);
    return await itemService.getItemList(params);
  },

  // 发布商品
  async publishItem(params) {
    params = validate(validations.publishItem, params);
    return await itemService.publishItem(params);
  },

  // 更新商品
  async updateItem(params) {
    params = validate(validations.updateItem, params);
    return await itemService.updateItem(params.itemId, params.updateData);
  },

  // 删除商品
  async deleteItem(params) {
    params = validate(validations.deleteItem, params);
    return await itemService.deleteItem(params.itemId);
  }
};