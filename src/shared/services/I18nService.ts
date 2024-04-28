import type { I18nRepository } from '@/shared/adapter';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LoadMessagesFunction = () => Promise<any>;
type OnLoadCallback = () => void;

interface MessageResource {
    loaded: boolean;
    load: LoadMessagesFunction;
}

export class I18nService {
    private readonly locales: string[];
    private readonly i18nRepository: I18nRepository;
    private readonly messageResources: Map<string, MessageResource[]> = new Map<string, MessageResource[]>();
    private loaded: boolean = false;
    private onLoadCallbacks: OnLoadCallback[] = [];

    constructor(params: { i18nRepository: I18nRepository; locales: string[] }) {
        this.locales = params.locales;
        this.i18nRepository = params.i18nRepository;
        params.locales.forEach((lc) => this.messageResources.set(lc, []));
    }

    public async setLanguage(locale: string): Promise<void> {
        if (!this.locales.includes(locale)) {
            console.error(`Language ${locale} is not supported! Supported languages are: ${this.locales.join(', ')}.`);
            return;
        }
        // load missing messages
        await this.loadMessages(locale);
        this.i18nRepository.setLanguage(locale);
        document.querySelector('html')?.setAttribute('lang', locale);
    }

    public getLanguage(): string {
        return this.i18nRepository.getLanguage();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public addMessages(messages: { [key: string]: () => Promise<any> }): void {
        // check if all languages are included
        const newMessageLocales = Object.keys(messages);
        const missingLocales = [...this.messageResources.keys()]
            .filter((lc) => !newMessageLocales.includes(lc))
            .join(', ');
        if (missingLocales.length > 0) {
            console.warn(`Attempting to append incomplete locale mapping for context! 
                The following locales are missing: ${missingLocales}`);
        }

        Object.entries(messages).forEach(([lang, loadMessagesFunction]) => {
            const paths = this.messageResources.get(lang) || [];
            paths.push({
                load: loadMessagesFunction,
                loaded: false,
            });
            this.messageResources.set(lang, paths);
        });
    }

    public async loadMessages(locale?: string): Promise<void> {
        if (locale && !this.locales.includes(locale)) {
            console.error(
                `Cannot load messages for unsupported language ${locale}! Supported languages are: ${this.locales.join(
                    ', '
                )}.`
            );
            return;
        }
        const lang = locale || this.getLanguage();
        const resources = this.messageResources.get(lang);
        if (!resources) {
            console.warn(`No resource mappings for language ${lang}!`);
            return;
        }
        for (let i = 0; i < resources.length; i++) {
            const res = resources[i];
            if (res.loaded) {
                continue;
            }
            const newMessages = await res.load();
            if (Object.keys(newMessages.default).length > 0) {
                this.i18nRepository.appendMessages(lang, newMessages.default);
            }
            res.loaded = true;
        }
        this.loaded = true;
        this.onLoadCallbacks.forEach((cb) => cb());
        this.onLoadCallbacks = [];
    }

    public async isReady(): Promise<void> {
        if (this.loaded) {
            return;
        }
        return new Promise((resolve) => {
            this.onLoadCallbacks.push(resolve);
        });
    }

    public getText(key: string, params?: { [key: string]: string | number }): string {
        return this.i18nRepository.getText(key, params);
    }
}
