export interface I18nRepository {
    /**
     * Set the active language
     * @param locale language key, e.g. `de` or `en`
     */
    setLanguage(locale: string): Promise<void>;

    /**
     * Get the active language
     */
    getLanguage(): string;

    /**
     * Register new locales for i18n. This could for example be done in each ctx to register ctx locales.
     * Example usage:
     * ```ts
     * addMessages({
     *   de: () => import('./locales/de.json'),
     *   en: () => import('./locales/en.json'),
     * });
     * ```
     * @param messages: mapping of locale to import statement
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addMessages(messages: { [key: string]: () => Promise<any> }): void;

    /**
     * Load all registered messages for the given language
     * @param locale language key, e.g. `de` or `en`
     */
    loadMessages(locale?: string): Promise<void>;

    /**
     * Wait until i18n messages are initially loaded
     */
    isReady(): Promise<void>;

    /**
     * Return the translated text for the given key. Pass an object with key-value pairs to substitute values
     * in the translation string.
     * @param key i18n key
     * @param params optional parameters
     */
    getText(key: string, params?: { [key: string]: string | number }): string;
}
