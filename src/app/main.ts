import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import { router } from './router';
import { registerCourseTools } from './webmcp';
import './styles.css';

createApp(App).use(createPinia()).use(router).mount('#app');

const disposeTools = registerCourseTools(router);
if (import.meta.hot) import.meta.hot.dispose(disposeTools);
