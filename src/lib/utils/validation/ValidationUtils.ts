/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HttpError } from '@/lib/utils/http/HttpClient';
import { ArrayUtils } from '@/lib/utils/objects/ArrayUtils';
import { ObjectUtils } from '@/lib/utils/objects/ObjectUtils';
import type { ValidationErrors } from './Validator';

export class ValidationUtils {
    public static mergeErrors(a: ValidationErrors, b: ValidationErrors): ValidationErrors {
        const result: ValidationErrors = ObjectUtils.deepCopy(a);
        Object.entries(b).forEach(([key, errors]) => {
            if (result[key]) {
                result[key] = result[key].concat(errors).filter(ArrayUtils.filterDuplicates);
            } else {
                result[key] = errors;
            }
        });
        return result;
    }

    public static extractValidationErrors(e: HttpError | Error | unknown): ValidationErrors {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const err = e as any;
        const errors = err.message?.Hints || err.details?.Hints || err.validationErrors;
        if (errors) {
            const validationErrors: ValidationErrors = {};
            Object.entries(errors as { [key: string]: string[] })
                .filter(([key, errors]) => typeof key === 'string' && Array.isArray(errors))
                .forEach(([key, errors]) => {
                    validationErrors[key] = errors.map((err) => ({
                        key: `shared.validation.${err}`,
                    }));
                });
            return validationErrors;
        }
        return {};
    }
}
