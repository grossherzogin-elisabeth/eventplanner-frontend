import type { DateTimeOptions, I18n } from 'vue-i18n';
import { createI18n } from 'vue-i18n';
import type { Config } from '@/application/values/Config';
import { DateTimeFormat } from '@/common/date';
import messagesDe from '@/ui/locales/de.json';

const datetimeFormatsDe: { [key: string]: DateTimeOptions } = {};
datetimeFormatsDe[DateTimeFormat.Date] = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
};
datetimeFormatsDe[DateTimeFormat.ShortDate] = {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
};
datetimeFormatsDe[DateTimeFormat.MonthAndYear] = {
    month: 'long',
    year: 'numeric',
};
datetimeFormatsDe[DateTimeFormat.WeekdayShort] = {
    weekday: 'short',
};

export function setupI18n(config: Config): I18n {
    return createI18n({
        legacy: false, // required to enable useI18n in Vue setup script
        locale: config.i18nLocale,
        fallbackLocale: config.i18nFallbackLocale,
        messages: {
            de: messagesDe,
        },
        availableLocales: config.i18nAvailableLocales,
        silentFallbackWarn: true,
        silentTranslationWarn: true,
        missingWarn: false,
        fallbackWarn: false,
        datetimeFormats: {
            de: datetimeFormatsDe,
        },
    });
}
