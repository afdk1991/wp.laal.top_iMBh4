import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { getVersionInfo } from '../../shared/utils/version.js'
import { autoCheckVersion } from '../../shared/services/version-checker.js'

const app = createApp(App)

// 加载版本信息
const versionInfo = getVersionInfo()
app.config.globalProperties.$version = versionInfo

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(router)
app.use(store)
app.mount('#app')

// 打印版本信息
console.log('MIXMLAAL Admin App Version:', versionInfo.fullVersion)

// 自动检查版本更新
autoCheckVersion(versionInfo.version)