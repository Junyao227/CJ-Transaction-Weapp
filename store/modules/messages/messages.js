export default {
	namespaced: true, // 启用命名空间，避免命名冲突
	state: {
		messages: [], // 消息列表
		loading: true // 加载状态
	},
	mutations: {
		// 设置消息列表
		SET_MESSAGES(state, messages) {
			state.messages = messages;
		},
		// 设置加载状态
		SET_LOADING(state, loading) {
			state.loading = loading;
		},
		// 更新或添加单条会话
		UPDATE_MESSAGE(state, updatedMessage) {
			const index = state.messages.findIndex(
				(msg) => msg.sessionId === updatedMessage.sessionId
			);
			if (index !== -1) {
				// 更新已有会话
				state.messages[index] = {
					...state.messages[index],
					...updatedMessage
				};
			} else {
				// 添加新会话
				state.messages.push(updatedMessage);
			}
			// 触发响应式更新
			state.messages = [...state.messages];
		}
	},
	actions: {
		// 公共方法：获取 relatedInfo
		async getRelatedInfo({
			commit
		}, {
			otherUserId,
			type,
			relatedItemId
		}) {
			try {
				const userRes = await uniCloud.callFunction({
					name: 'getUserInfoByUserId',
					data: {
						userId: otherUserId
					}
				});

				if (!userRes.result.success) {
					console.log('获取用户信息失败:', userRes.result.message);
					return null;
				}

				const otherUserInfo = userRes.result.data;
				let relatedInfo = {};

				if (type === 1) {
					const itemRes = await uniCloud.callFunction({
						name: 'getItemInfoById',
						data: {
							itemId: relatedItemId
						}
					});
					if (itemRes.result.success) {
						relatedInfo = {
							...itemRes.result.data,
							avatar: otherUserInfo.avatar,
							nickname: otherUserInfo.nickname,
							otherId: otherUserInfo.user_id
						};
					}
				} else if (type === 2) {
					const jobRes = await uniCloud.callFunction({
						name: 'getJobInfoById',
						data: {
							jobId: relatedItemId
						}
					});
					if (jobRes.result.success) {
						relatedInfo = {
							...jobRes.result.data,
							avatar: otherUserInfo.avatar,
							nickname: otherUserInfo.nickname,
							otherId: otherUserInfo.user_id
						};
					}
				} else if (type === 3) {
					const taskRes = await uniCloud.callFunction({
						name: 'getTaskInfoById',
						data: {
							taskId: relatedItemId
						}
					});
					if (taskRes.result.success) {
						relatedInfo = {
							...taskRes.result.data,
							avatar: otherUserInfo.avatar,
							nickname: otherUserInfo.nickname,
							otherId: otherUserInfo.user_id
						};
					}
				}

				return relatedInfo;
			} catch (error) {
				console.error('获取 relatedInfo 失败:', error);
				return null;
			}
		},
		// 获取消息列表
		async fetchMessages({
			commit,
			dispatch,
			state
		}, userId) {
			commit('SET_LOADING', true);
			try {
				const res = await uniCloud.callFunction({
					name: 'getSessionByUserId',
					data: {
						userId: userId
					}
				});

				if (res.result.success) {
					const messages = await Promise.all(
						res.result.data.map(async (session) => {
							const otherUserId = session.buyer_id === userId ? session.seller_id :
								session.buyer_id;

							const relatedInfo = await dispatch('getRelatedInfo', {
								otherUserId: otherUserId,
								type: session.type,
								relatedItemId: session.related_item_id
							});

							return {
								sessionId: session._id,
								type: session.type,
								lastMessage: session.last_message,
								timestamp: session.updated_at,
								unreadCount: session.unread_count || 0,
								relatedInfo
							};
						})
					);
					commit('SET_MESSAGES', messages.filter(msg => msg !== null));
				}
			} catch (error) {
				console.error('获取消息列表失败:', error);
			} finally {
				commit('SET_LOADING', false);
			}
		},
		// 更新单条消息（实时消息）
		async updateReceiveMessage({
			commit,
			state,
			dispatch
		}, {
			message,
			userId
		}) {


			// 提取发送者和接收者
			const senderId = message.senderId;
			const receiverId = message.receiverId;
			const otherUserId = userId === senderId ? receiverId : senderId;

			// 从 message.payload.customData 中提取 sessionId（根据之前的讨论）
			const sessionId = message.payload?.customData?.sessionId;
			const type = message.payload?.customData?.type;
			console.log("接收到的message sessionId type state.messages", message, sessionId, type, state.messages);
			if (!sessionId) {
				console.warn('未找到 sessionId，尝试从云端获取...');
			}

			// 查找现有会话
			const existingSessionIndex = state.messages.findIndex(
				(msg) => msg.sessionId === sessionId
			);

			let updatedMessage;
			if (existingSessionIndex !== -1) {
				// 如果会话存在，更新现有会话
				const existingSession = state.messages[existingSessionIndex];
				updatedMessage = {
					...existingSession,
					lastMessage: message.payload?.text || '无内容',
					timestamp: message.timestamp || Date.now(),
					unreadCount: (existingSession.unreadCount || 0) + 1 // 未读数递增
				};
			} else {
				// 如果会话不存在，构造新会话

				try {
					const resSession = await uniCloud.callFunction({
						name: 'getChatSessionBySessionId',
						data: {
							sessionId: sessionId
						}
					});
					if (resSession.result.success) {
						const relatedInfo = await dispatch('getRelatedInfo', {
							otherUserId: otherUserId,
							type: type,
							relatedItemId: resSession.result.session[0].related_item_id
						});
						updatedMessage = {
							sessionId: sessionId,
							type: type,
							lastMessage: message.payload?.text || '无内容',
							timestamp: message.timestamp || Date.now(),
							unreadCount: 1,
							relatedInfo
						};
					
					}
				} catch (error) {
					console.error('获取 relatedInfo 失败:', error);
					updatedMessage = {};
				}

			}

			// 提交 mutation 更新 messages
			commit('UPDATE_MESSAGE', updatedMessage);
		},
		// 更新单条消息（实时消息）
		async updateSendMessage({
			commit,
			state,
			dispatch
		}, {
			message,
			sessionId,
			type,
			otherUserId
		}) {


			console.log("接收到的message sessionId  ", message, sessionId);
			if (!sessionId) {
				console.warn('未找到 sessionId，尝试从云端获取...');
			}

			// 查找现有会话
			const existingSessionIndex = state.messages.findIndex(
				(msg) => msg.sessionId === sessionId
			);

			let updatedMessage;
			
			if (existingSessionIndex !== -1) {
				// 如果会话存在，更新现有会话
				const existingSession = state.messages[existingSessionIndex];
				updatedMessage = {
					...existingSession,
					lastMessage: message || '无内容',
					timestamp: Date.now(),
					unreadCount: 0
				};
			} else {
				// 如果会话不存在
				try {
					const resSession = await uniCloud.callFunction({
						name: 'getChatSessionBySessionId',
						data: {
							sessionId: sessionId
						}
					});
					if (resSession.result.success) {
						const relatedInfo = await dispatch('getRelatedInfo', {
							otherUserId: otherUserId,
							type: type,
							relatedItemId: resSession.result.session[0].related_item_id
						});
						updatedMessage = {
							sessionId: sessionId,
							type: type,
							lastMessage: message || '无内容',
							timestamp: Date.now(),
							unreadCount: 0,
							relatedInfo
						};
					
					}
				} catch (error) {
					console.error('获取 relatedInfo 失败:', error);
					updatedMessage = {};
				}
			}

			// 提交 mutation 更新 messages
			commit('UPDATE_MESSAGE', updatedMessage);

		},
		// 更新单条消息（实时消息）
		async updateReadedMessage({
			commit,
			state,
			dispatch
		}, {
			sessionId
		}) {
		
		
			console.log("接收到的message sessionId type ", sessionId);
			if (!sessionId) {
				console.warn('未找到 sessionId，尝试从云端获取...');
			}
		
			// 查找现有会话
			const existingSessionIndex = state.messages.findIndex(
				(msg) => msg.sessionId === sessionId
			);
		
			let updatedMessage;
			if (existingSessionIndex !== -1) {
				// 如果会话存在，更新现有会话
				const existingSession = state.messages[existingSessionIndex];
				updatedMessage = {
					...existingSession,
					unreadCount: 0
				};
			} else {
				// 如果会话不存在
		
			}
		
			// 提交 mutation 更新 messages
			commit('UPDATE_MESSAGE', updatedMessage);
		
		}
	},

	getters: {
		messages: (state) => state.messages,
		loading: (state) => state.loading
	}
};