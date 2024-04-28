import { createApp } from 'vue';
import { App } from './app';
import config from './plugins/config';
import ctx from './plugins/ctx';
import './plugins/fontawesome';
import i18n from './plugins/i18n';
import router from './plugins/router';

const app = createApp(App);
app.use(i18n);
app.use(ctx, { router, i18n, config });
app.use(router); // register router after context, because routes are added dynamically

app.config.errorHandler = (err, instance, info) => {
    console.error(err);
    alert(err);
};
app.mount('#app');
