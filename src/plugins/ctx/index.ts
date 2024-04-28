/* eslint-disable @typescript-eslint/no-unused-vars */
// Vue Dependencies
import type { App, Plugin } from 'vue';
import type { Router } from 'vue-router';
import type { I18n } from 'vue-i18n';
import type { Config } from '@/shared/types';
// Module Dependencies
import initializeAppContext from './app';
import initializeSharedContext from './shared';

const plugin: Plugin = {
    install(app: App, options: { router: Router; i18n: I18n; config: Config }) {
        const contextOptions = {
            vue: app,
            router: options.router,
            i18n: options.i18n,
            config: options.config,
        };
        // context plugins
        const ctxShared = initializeSharedContext(contextOptions);
        const ctxApp = initializeAppContext(contextOptions, { shared: ctxShared });
    },
};

export default plugin;
