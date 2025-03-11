'use strict';
const db = uniCloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data } = event
  
  switch(action) {
    case 'login':
      return await handleLogin(data)
    case 'updateUserInfo':
      return await updateUserInfo(data)
    case 'getUserInfo':
      return await getUserInfo(data)
    default:
      return {
        code: -1,
        msg: '未知操作'
      }
  }
}

// 处理微信登录
async function handleLogin(data) {
  const { openid, userInfo } = data
  const users = db.collection('users')
  
  // 查找用户是否存在
  let user = await users.where({
    openid: openid
  }).get()
  
  if (user.data.length === 0) {
    // 新用户，创建记录
    const newUser = {
      openid,
      nickname: userInfo.nickName,
      avatar: userInfo.avatarUrl,
      points: 0,
      fans_count: 0,
      follow_count: 0,
      created_at: Date.now()
    }
    
    const result = await users.add(newUser)
    return {
      code: 0,
      data: {
        ...newUser,
        _id: result.id
      }
    }
  }
  
  return {
    code: 0,
    data: user.data[0]
  }
} 