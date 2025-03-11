// cloudfunctions/getItemInfoById/index.js

const db = uniCloud.database();

exports.main = async (event, context) => {
  const { itemId } = event;

  if (!itemId) {
    return { success: false, message: '商品ID不能为空' };
  }

  try {
    const res = await db.collection('secondhand_items')  // 更新表名为 secondhand_items
      .where({ _id: itemId })  // 使用 _id 进行查询
      .get();

    if (res.data.length === 0) {
      return { success: false, message: '商品信息不存在' };
    }

    return {
      success: true,
      data: res.data[0], // 返回商品信息
    };
  } catch (err) {
    console.error('获取商品信息失败', err);
    return { success: false, message: '获取商品信息失败' };
  }
};
