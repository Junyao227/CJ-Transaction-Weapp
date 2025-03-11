const Joi = require('joi');

exports.getItemList = Joi.object().keys({
  userId: Joi.string().optional(), // 用户 ID，非必填
  status: Joi.number().optional(), // 商品状态，非必填
  location: Joi.string().valid('index', 'mine').required(), // 位置，只能是 'index' 或 'mine'
});

exports.publishItem = Joi.object().keys({
  userId: Joi.string().required(), // 用户 ID 必须提供
  title: Joi.string().min(3).max(100).required(), // 商品标题
  price: Joi.number().min(0).required(), // 商品价格
  description: Joi.string().max(500).optional(), // 商品描述
  images: Joi.array().items(Joi.string()).min(1).required(), // 至少提供一张图片
});

exports.updateItem = Joi.object().keys({
  itemId: Joi.string().required(), // 商品 ID
  updateData: Joi.object().min(1).required(), // 至少需要一个更新字段
});

exports.deleteItem = Joi.object().keys({
  itemId: Joi.string().required(), // 商品 ID
});
