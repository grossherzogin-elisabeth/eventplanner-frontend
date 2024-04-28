export interface I18nRepository {
    setLanguage(language: string): void;
    getLanguage(): string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appendMessages(language: string, newMessages: { [key: string]: any }): void;
    getText(key: string, params?: { [key: string]: string | number }): string;
}
