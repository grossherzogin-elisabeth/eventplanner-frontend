import type { SharedContext } from '@/shared';

export class DefaultI18nBridgeRepository {
    private readonly sharedCtx: SharedContext;

    constructor(sharedCtx: SharedContext) {
        this.sharedCtx = sharedCtx;
    }

    public async setLanguage(locale: string): Promise<void> {
        await this.sharedCtx.i18nService.setLanguage(locale);
    }

    public getLanguage(): string {
        return this.sharedCtx.i18nService.getLanguage();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addMessages(messages: { [key: string]: () => Promise<any> }): void {
        this.sharedCtx.i18nService.addMessages(messages);
    }

    public async loadMessages(locale?: string): Promise<void> {
        await this.sharedCtx.i18nService.loadMessages(locale);
    }

    public async isReady(): Promise<void> {
        await this.sharedCtx.i18nService.isReady();
    }

    public getText(key: string, params?: { [key: string]: string | number }): string {
        return this.sharedCtx.i18nService.getText(key, params);
    }
}
