/* eslint-disable @typescript-eslint/no-explicit-any */
import { ObjectUtils } from '@/lib/utils/objects/ObjectUtils';

export type ValidationHint = { key: string; params?: any };
export type ValidationErrors = { [key: string]: ValidationHint[] };
export type ValidationRule = (value: any) => true | ValidationHint;

export class Validator<T> {
    private rules: { [key: string]: ValidationRule[] } = {};
    private readonly object: T;

    constructor(object: T) {
        this.object = object;
    }

    public static for<T>(object: T): Validator<T> {
        return new Validator<T>(object);
    }

    public with(field: string, ...rules: ValidationRule[]): Validator<T> {
        if (!this.rules[field]) {
            this.rules[field] = [];
        }
        rules.forEach((rule) => this.rules[field].push(rule));
        return this;
    }

    public getErrors(): ValidationErrors {
        const errors: ValidationErrors = {};
        const obj: any = this.object || {};

        Object.keys(this.rules).forEach((field) => {
            const rules = this.rules[field];
            const value = ObjectUtils.extractValue(obj, field);
            errors[field] = rules
                .map((rule) => rule(value)) // execute rule
                .filter((result) => result !== true) // filter out non errors
                .map((error) => error as ValidationHint); // map to ValidationHint for typescript
        });

        // remove all keys without errors
        Object.keys(errors)
            .filter((key) => errors[key].length === 0)
            .forEach((key) => delete errors[key]);
        return errors;
    }
}
