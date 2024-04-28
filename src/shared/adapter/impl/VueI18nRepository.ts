import type { I18n } from 'vue-i18n';
import type { I18nRepository } from '@/shared/adapter';

export class VueI18nRepository implements I18nRepository {
    // TODO figure out these typed parameters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly i18n: I18n<any, any, any, any>;

    constructor(i18n: I18n) {
        this.i18n = i18n;
    }

    public setLanguage(locale: string): void {
        // change active language
        if (this.i18n.mode === 'legacy') {
            this.i18n.global.locale = locale;
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.i18n.global.locale.value = locale;
        }
    }

    public getLanguage(): string {
        if (this.i18n.mode === 'legacy') {
            return this.i18n.global.locale;
        } else {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return this.i18n.global.locale.value;
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public appendMessages(locale: string, messages: any): void {
        let messagesForLocale = this.i18n.global.getLocaleMessage(locale);
        messagesForLocale = Object.assign(messagesForLocale, messages);
        this.i18n.global.setLocaleMessage(locale, messagesForLocale);
    }

    public getText(key: string, params?: { [key: string]: string }): string {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.i18n.global.t(key, params).toString();
    }
}
