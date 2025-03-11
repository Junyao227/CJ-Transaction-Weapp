const https = require('https');  // 引入 https 模块
const { secret, appid } = require('wx-common');  // 加载配置

exports.main = async (event, context) => {
  const { code } = event;  // 前端传过来的 code
  if (!code) {
    return {
      error: 'code is required'
    };
  }

  try {
    // 发起 HTTP 请求
    const response = await new Promise((resolve, reject) => {
      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
      
      https.get(url, (res) => {
        let data = '';
        
        // 接收数据
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        // 完成请求后处理响应
        res.on('end', () => {
          try {
            const responseData = JSON.parse(data);
            if (responseData.errcode) {
              reject({
                error: responseData.errmsg || 'Unknown error',
                details: responseData
              });
            } else {
              resolve({
                openid: responseData.openid,
                session_key: responseData.session_key
              });
            }
          } catch (e) {
            reject({
              error: 'Error parsing response',
              details: e
            });
          }
        });
      }).on('error', (e) => {
        reject({
          error: 'Error with HTTP request',
          details: e
        });
      });
    });

    return response;

  } catch (error) {
    // 输出详细错误信息
    console.error("Error in cloud function:", error);
    return {
      error: 'Error processing request',
      details: error.message || error.stack // 输出错误的详细信息
    };
  }
};
