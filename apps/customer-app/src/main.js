import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import * as uniUi from '@dcloudio/uni-ui';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(uniUi);
app.mount('#app');