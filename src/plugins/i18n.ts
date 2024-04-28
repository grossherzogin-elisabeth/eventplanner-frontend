import type { DateTimeOptions } from 'vue-i18n';
import { createI18n } from 'vue-i18n';
import { DateTimeFormat } from '@/shared/types';
import { config } from './config';

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

export const i18n = createI18n({
    legacy: false, // required to enable useI18n in Vue setup script
    locale: config.i18nLocale,
    fallbackLocale: config.i18nFallbackLocale,
    availableLocales: config.i18nAvailableLocales,
    silentFallbackWarn: true,
    silentTranslationWarn: true,
    missingWarn: false,
    fallbackWarn: false,
    datetimeFormats: {
        de: datetimeFormatsDe,
    },
});

export default i18n;
