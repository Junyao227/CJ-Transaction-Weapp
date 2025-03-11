const {constants} = require('wx-common')

const {
  secondHandItemsCollection
} = constants


module.exports = {
  // 获取商品列表
  async getItemList({ status, userId, location }) {
    try {
      let query = {};

      // 根据不同的 location 过滤
      if (location === 'index') {
        if (userId) {
          query.publisher_id = db.command.neq(userId); // 排除当前用户发布的商品
        }
      } else if (location === 'mine') {
        if (userId) {
          query.publisher_id = userId; // 仅查询当前用户发布的商品
        }
      }

      // 处理 status 过滤条件
      if (status !== undefined) {
        query.status = status;
      }

      // 查询数据库
      const res = await secondHandItemsCollection.where(query)
        .orderBy('created_time', 'desc')
        .get();

      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, message: '查询失败', error: err };
    }
  },

  // 发布商品
  async publishItem(itemData) {
    try {
      itemData.created_time = Date.now();
      const res = await secondHandItemsCollection.add(itemData);
      return { success: true, itemId: res.id };
    } catch (err) {
      return { success: false, message: '发布失败', error: err };
    }
  },

  // 更新商品信息
  async updateItem(itemId, updateData) {
    try {
      const res = await secondHandItemsCollection.doc(itemId).update(updateData);
      return { success: res.updated > 0, message: res.updated > 0 ? '更新成功' : '未找到商品' };
    } catch (err) {
      return { success: false, message: '更新失败', error: err };
    }
  },

  // 删除商品
  async deleteItem(itemId) {
    try {
      const res = await secondHandItemsCollection.doc(itemId).remove();
      return { success: res.deleted > 0, message: res.deleted > 0 ? '删除成功' : '未找到商品' };
    } catch (err) {
      return { success: false, message: '删除失败', error: err };
    }
  }
};