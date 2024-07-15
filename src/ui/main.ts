import { createApp } from 'vue';
import type { Application } from '@/application';
import type { Domain } from '@/domain';
import { AUTH_USE_CASE, EVENT_USE_CASE, USER_USE_CASE } from '@/ui/composables/Application';
import { EVENT_SERVICE, USER_SERVICE } from '@/ui/composables/Domain';
import App from './App.vue';
import './assets/css/main.css';
import './plugins/fontawesome';
import { setupI18n } from './plugins/i18n';
import { setupRouter } from './plugins/router';

export function setupVue(context: { domain: Domain; application: Application }) {
    const app = createApp(App);
    app.use(setupI18n(context.application.config));
    app.use(setupRouter(context.application.usecases.auth));
    app.provide(AUTH_USE_CASE, context.application.usecases.auth);
    app.provide(EVENT_USE_CASE, context.application.usecases.events);
    app.provide(USER_USE_CASE, context.application.usecases.users);
    app.provide(USER_SERVICE, context.domain.services.users);
    app.provide(EVENT_SERVICE, context.domain.services.events);
    app.mount('#app');
}
