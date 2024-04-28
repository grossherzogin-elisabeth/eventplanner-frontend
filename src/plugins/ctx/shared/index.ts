// Vue Dependencies
import type { App } from 'vue';
import type { Router } from 'vue-router';
import type { I18n } from 'vue-i18n';
import type { SharedContextParams } from '@/shared';
import { SharedContext } from '@/shared';
// Module Dependencies
import type { Config } from '@/shared/types';

export default function initialize(params: { vue: App; router: Router; i18n: I18n; config: Config }): SharedContext {
    const contextParams: SharedContextParams = {
        vue: params.vue,
        config: params.config,
        i18n: params.i18n,
    };
    return SharedContext.initialize(contextParams);
}
