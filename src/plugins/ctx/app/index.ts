// Vue Dependencies
import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { I18n } from 'vue-i18n';
// Context Dependencies
import { AppContext } from '@/app';
import type { AppContextParams } from '@/app';
import { DefaultI18nBridgeRepository } from '@/plugins/ctx/default/DefaultI18nBridgeRepository';
import type { SharedContext } from '@/shared';
import type { Config } from '@/shared/types';

export default function initialize(
    params: { vue: App; router: Router; i18n: I18n; config: Config },
    ctx: { shared: SharedContext }
): AppContext {
    const contextParams: AppContextParams = {
        vue: params.vue,
        config: params.config,
        router: params.router,
        i18nRepository: new DefaultI18nBridgeRepository(ctx.shared),
    };
    return AppContext.initialize(contextParams);
}
