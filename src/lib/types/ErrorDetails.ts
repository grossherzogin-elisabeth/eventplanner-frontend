import type { HttpError } from '@/lib/utils';

export interface ErrorDetails {
    title: string;
    message: string;
    retry?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error?: HttpError | Error | any;
}
