const fs = require("fs"); // 引入文件系统模块，处理本地文件

exports.main = async (event, context) => {
  try {
    // 获取客户端传递过来的文件数据
    const { fileContent, fileName } = event; // 假设客户端传递了文件内容（fileContent）和文件名（fileName）

    // 上传文件到云存储
    const result = await uniCloud.uploadFile({
      cloudPath: `uploads/${Date.now()}_${fileName}`, // 设置上传到云存储的路径和文件名
      fileContent: Buffer.from(fileContent, 'base64')  // 转换为 Buffer 格式上传
    });

    return {
      fileID: result.fileID  // 返回上传后文件的 fileID
    };
  } catch (err) {
    return {
      error: err.message || JSON.stringify(err)  // 错误信息
    };
  }
};
