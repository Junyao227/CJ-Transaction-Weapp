import Vue from "vue";
import Vuex from "vuex";
import detailInfo from "./modules/secondItem/detailInfo";
import userInfo from "./modules/user/user";
import messages from "./modules/messages/messages.js"

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    detailInfo, // 注册模块
	userInfo,
	messages
  },
});
