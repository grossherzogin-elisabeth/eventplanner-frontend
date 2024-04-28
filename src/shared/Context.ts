import type { App } from 'vue';
import type { I18n } from 'vue-i18n';
import { VueI18nRepository } from './adapter/impl/VueI18nRepository';
import { I18nService } from './services/I18nService';
import type { Config } from './types';

/**
 * Parameters used for context initialization.
 */
export interface ContextParams {
    config: Config;
    vue: App;
    i18n: I18n;
}

export class Context {
    // unique name of your context, can be equal to folder name
    public static contextName = 'ctx-shared';
    public readonly i18nService: I18nService;

    constructor(params: ContextParams) {
        console.info(`🚀 Initializing ${Context.contextName}`);

        // -----------------------------------------------------
        // initialize services
        // -----------------------------------------------------
        this.i18nService = new I18nService({
            locales: params.config.i18nAvailableLocales,
            i18nRepository: new VueI18nRepository(params.i18n),
        });

        // -----------------------------------------------------
        // load i18n messages
        // -----------------------------------------------------

        // register locales lib locales
        this.i18nService.addMessages({
            de: () => import('@/lib/locales/de.json'),
        });
        // register shared project locales
        this.i18nService.addMessages({
            de: () => import('./locales/de.json'),
        });
    }

    /**
     * Initialize the context and provide it on the vue instance
     * @param params context parameters
     */
    public static initialize(params: ContextParams): Context {
        const ctx = new Context(params);
        params.vue.provide(Context.contextName, ctx);
        return ctx;
    }
}
