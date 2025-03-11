import App from './App'

// #ifndef VUE3
import Vue from 'vue'
import './uni.promisify.adaptor'
import uView from "@/uni_modules/uview-ui";
Vue.use(uView);
uni.$u.config.unit = 'rpx'
Vue.config.productionTip = false
App.mpType = 'app'

// 引入全局主题变量
import appTheme from '@/theme.scss'; 
Vue.prototype.$appTheme = appTheme

// 引入 Vuex
import store from './store/index.js'; // 引入 Vuex store
Vue.prototype.$store = store;  // 注册到 Vue 实例

// 引入 GoEasy SDK
import GoEasy from '@/uni_modules/GOEASY-IM/js_sdk/goeasy-2.13.13.esm.min.js'

// 初始化 GoEasy 实例
let goeasy = GoEasy.getInstance({
    host: "hangzhou.goeasy.io",  // 服务器地址，可选择 singapore.goeasy.io
    appkey: "BC-a829233216eb491fa922cd51512a4acf",  // 你的 common key
    modules: ['im']             // 仅启用即时通讯模块
});

// 将 GoEasy 实例设置为全局变量
uni.$GoEasy = goeasy;

const app = new Vue({
  ...App,
  store  // 将 store 添加到 Vue 实例中
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif
