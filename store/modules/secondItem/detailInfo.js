export default {
  namespaced: true, // 启用命名空间
  state: {
    // 兼职详情信息
    detailInfo: {}
  },
  mutations: {
    // 设置兼职详情信息
    SET_DETAIL_INFO(state, data) {
      state.detailInfo = data;
    },
    // 清空兼职详情信息
    CLEAR_DETAIL_INFO(state) {
      state.detailInfo = {};
    }
  },
  actions: {
    // 从云函数获取兼职详情信息
    async fetchDetailInfo({ commit }, jobId) {
      try {
        // 调用云函数
        const res = await uniCloud.callFunction({
          name: 'getJobDetail', // 云函数名称
          data: { jobId } // 传递的参数
        });

        if (res.result.success) {
          // 成功获取数据，提交到 Vuex
          commit('SET_DETAIL_INFO', res.result.data);
          return res.result.data; // 返回数据供调用方使用
        } else {
          throw new Error(res.result.message || '获取详情失败');
        }
      } catch (error) {
        console.error('获取兼职详情信息失败:', error);
        throw error; // 抛出错误供调用方处理
      }
    },

    // 清空兼职详情信息
    clearDetailInfo({ commit }) {
      commit('CLEAR_DETAIL_INFO');
    }
  },
  getters: {
    // 获取兼职标题
    getDetailTitle: (state) => state.detailInfo.title || '无标题',
    // 获取工资
    getSalary: (state) => state.detailInfo.salary || '无信息',
    // 获取发布者昵称
    getPublisherNickname: (state) => state.detailInfo.nickname || '未知发布者'
  }
};
