/* eslint-disable @typescript-eslint/no-explicit-any */
import { ValidationError } from './ValidationError';

// eslint-disable-next-line no-control-regex,prefer-regex-literals
// const regexEmail: RegExp = new RegExp(
//     '(?:[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+\\/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])'
// );

function parseToMillis(value: any): number {
    const date = new Date(value);
    if (date && !Number.isNaN(date.getTime())) {
        return date.getTime();
    }
    const millis = parseInt(value, 10);
    if (!Number.isNaN(millis)) {
        return new Date(millis).getTime();
    }
    return NaN;
}

function currentTime(): number {
    return new Date().getTime();
}

function valueNotSet(value: any): boolean {
    return value === null || value === undefined;
}

function valueNotSetOrEmpty(value: any): boolean {
    return value === null || value === undefined || value.toString().trim() === '';
}

function validNumber(value: any): boolean {
    return typeof value === 'number' || typeof value === 'bigint' || !Number.isNaN(parseFloat(value));
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function debug(value: any, label: string = 'Value'): boolean {
    if (value === null) {
        console.log(`${label}: null}`);
    } else if (value === undefined) {
        console.log(`${label}: undefined`);
    } else if (typeof value === 'number') {
        console.log(`${label}: ${value}`);
    } else if (typeof value === 'string') {
        console.log(`${label}: "${value}"`);
    } else if (typeof value === 'boolean') {
        console.log(`${label}: ${value}`);
    }
    return false;
}

function formatDate(value: any): string {
    const date = new Date(value);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' : ''}${day}.${month < 10 ? '0' : ''}${month}.${year}`;
}

export const Rules = {
    // -------------------------------------------------------------------------------------
    // Generic validation rules
    // -------------------------------------------------------------------------------------
    /** valid when value is not null or undefined */
    NotNull: (value: any) => !valueNotSet(value) || { key: ValidationError.Required },
    /** valid when value is neither null, undefined or an empty string */
    NotNullOrEmpty: (value: any) => !valueNotSetOrEmpty(value) || { key: ValidationError.Required },

    // -------------------------------------------------------------------------------------
    // String validation rules
    // -------------------------------------------------------------------------------------
    /** valid when the trimmed value has not more than `maxLength` characters */
    MaxLength: (maxLength: number) => (value: any) =>
        valueNotSet(value) ||
        String(value).length <= maxLength || {
            key: ValidationError.MaxLength,
            params: { n: maxLength },
        },

    /** valid when the trimmed value has at least `minLength` characters */
    MinLength: (minLength: number) => (value: any) =>
        valueNotSet(value) ||
        String(value).trim().length >= minLength || {
            key: ValidationError.MinLength,
            params: { n: minLength },
        },

    // -------------------------------------------------------------------------------------
    // Numeric validation rules
    // -------------------------------------------------------------------------------------
    /** valid when value is a valid number */
    ValidNumber: (value: any) => valueNotSet(value) || validNumber(value) || { key: ValidationError.InvalidNumber },
    /** valid when value is not a valid number or greater than the provided compare number */
    GreaterThan: (compareTo: number) => (value: any) =>
        valueNotSet(value) ||
        !validNumber(value) ||
        value > compareTo || { key: ValidationError.MinValue, params: { n: compareTo } },
    /** valid when value is undefined or equal to or greater than the provided compare number */
    GreaterThanOrEqual: (compareTo: number) => (value: any) =>
        valueNotSet(value) ||
        !validNumber(value) ||
        value >= compareTo || { key: ValidationError.MinValueIncluding, params: { n: compareTo } },
    /** valid when value is undefined or lesser than the provided compare number */
    LesserThan: (compareTo: number) => (value: any) =>
        valueNotSet(value) ||
        !validNumber(value) ||
        value < compareTo || { key: ValidationError.MaxValue, params: { n: compareTo } },
    /** valid when value is undefined or equal to or lesser than the provided compare number */
    LesserThanOrEqual: (compareTo: number) => (value: any) =>
        valueNotSet(value) ||
        !validNumber(value) ||
        value <= compareTo || { key: ValidationError.MaxValueIncluding, params: { n: compareTo } },

    // Date Validation Rules
    /** valid when value is a valid date */
    ValidDate: (value: any) =>
        valueNotSet(value) ||
        typeof value === 'number' ||
        value instanceof Date || { key: ValidationError.InvalidDate },
    /** valid when value is undefined or after the provided date */
    DateAfter: (compareDate: Date | number | undefined) => (value: any) =>
        valueNotSetOrEmpty(value) ||
        valueNotSetOrEmpty(compareDate) ||
        parseToMillis(value) > parseToMillis(compareDate) || {
            key: ValidationError.MinDate,
            params: { n: formatDate(compareDate) },
        },
    /** valid when value is undefined or before the provided date */
    DateBefore: (compareDate: Date | number | undefined) => (value: any) =>
        valueNotSetOrEmpty(value) ||
        valueNotSetOrEmpty(compareDate) ||
        parseToMillis(value) < parseToMillis(compareDate) || {
            key: ValidationError.MaxDate,
            params: { n: formatDate(compareDate) },
        },
    /** valid when value is undefined or a date in the future */
    DateInFuture: (value: any) =>
        valueNotSet(value) ||
        parseToMillis(value) > currentTime() || {
            key: ValidationError.MinDate,
            params: { n: formatDate(currentTime()) },
        },
    /** valid when value is undefined or a date in the past */
    DateInPast: (value: any) =>
        valueNotSet(value) ||
        parseToMillis(value) < currentTime() || {
            key: ValidationError.MaxDate,
            params: { n: formatDate(currentTime()) },
        },

    // Array Validation Rules
    /** valid when value is an array with one or more entries  */
    ArrayNotEmpty: (value: any) =>
        (Array.isArray(value) && (value as []).length > 0) || {
            key: ValidationError.ArrayNotEmpty,
        },

    ValueNotInBlacklist: (blacklist: any[]) => (value: any) =>
        !blacklist.find((it) => it === value) || { key: ValidationError.InvalidValue },

    ValueInWhitelist: (whitelist: any[]) => (value: any) =>
        whitelist.find((it) => it === value) || { key: ValidationError.InvalidValue },
};
