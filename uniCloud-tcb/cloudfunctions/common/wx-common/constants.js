const db = uniCloud.database()
exports.dbCmd = db.command
exports.chatMessageCollection = db.collection('chat_message')
exports.chatSessionCollection = db.collection('chat_session')
exports.errandTasksCollection = db.collection('errand_tasks')
exports.itemUserOrderCollection = db.collection('item_user_order')
exports.partTimeJobsCollection = db.collection('part_time_jobs')
exports.secondHandItemsCollection = db.collection('secondhand_items')
exports.tasksUserOrderCollection = db.collection('tasks_user_order')
exports.userCollectionCollection = db.collection('user_collections')
exports.usersCollection = db.collection('users')
exports.usersFollowCollection = db.collection('users_follow')
exports.usersRoleCollection = db.collection('users_role')



exports.sessionTypes = {
  user: 'user',
  group: 'group'
}

exports.webSocketMessageActions = {
  sync: "SYNC",
  syncMessage: 'SYNC_MESSAGE',
  syncOnlineStatus: 'SYNC_ONLINE_STATUS'
}

exports.messageTypes = {
  text: "TEXT",
  joinGroup: "JOIN_GROUP",
  leaveGroup: "LEAVE_GROUP",
  system: "SYSTEM"
}

