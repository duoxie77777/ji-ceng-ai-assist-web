import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { store } from './store'
import './style.less'
// 引入iconfont
import './assets/iconfont/iconfont.css'
import './assets/iconfont/iconfont.js'

// 引入 SvgIcon 组件
import SvgIcon from './components/SvgIcon/SvgIcon.vue'

const app = createApp(App)

// 全局注册 SvgIcon 组件
app.component('SvgIcon', SvgIcon)

app.use(store)
app.use(router)

app.mount('#app')
