// eslint-disable-next-line @typescript-eslint/no-explicit-any
import type { ValidationErrors } from '@/lib/utils/validation';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RequestBody<T = any> =
    | Blob
    | ReadableStream<T>
    | ArrayBufferView
    | ArrayBuffer
    | FormData
    | string
    | URLSearchParams;

export interface HttpError extends Error {
    requestMethod?: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH';
    requestURL?: string;
    status?: number;
    type?: string;
    instance?: string;
    validationErrors?: ValidationErrors;
}

/**
 * Custom http fetch client for rest api calls
 */
export class HttpClient {
    private readonly baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async get<T>(url: string): Promise<T> {
        return this.fetch('GET', url);
    }

    public async post<T>(url: string, body?: RequestBody): Promise<T> {
        return this.fetch('POST', url, body);
    }

    public async put<T>(url: string, body?: RequestBody): Promise<T> {
        return this.fetch('PUT', url, body);
    }

    public async delete<T>(url: string): Promise<T> {
        return this.fetch('DELETE', url);
    }

    private async fetch<T>(
        method: 'GET' | 'POST' | 'DELETE' | 'PUT' | 'PATCH',
        url: string,
        body?: RequestBody
    ): Promise<T> {
        const requestURL: string = `${this.baseUrl}${url}`;
        const requestHeaders: { [key: string]: string } = {};
        if (body) {
            requestHeaders['Content-Type'] = 'application/json';
        }
        let res: Response | undefined = undefined;
        try {
            res = await fetch(requestURL, {
                method: method,
                body: body,
                credentials: 'include',
                headers: requestHeaders,
                redirect: 'error',
            });
        } catch (e) {
            const networkError: HttpError = {
                name: 'Failed to fetch',
                message: 'The request failed without a response',
                requestMethod: method,
                requestURL: requestURL,
                status: undefined,
                type: 'Failed to fetch',
            };
            throw networkError;
        }
        const resBody = (await this.mapResponseToJSON(res)) || (await this.mapResponseToString(res)) || {};
        if (res.status >= 200 && res.status < 300) {
            return resBody as unknown as T;
        }
        const responseError: HttpError = {
            name: res.status + ' ' + res.statusText,
            message: resBody?.details !== undefined ? resBody?.details : resBody,
            status: res.status,
            type: res.statusText,
            requestMethod: method,
            requestURL: requestURL,
            instance: resBody?.instance,
            validationErrors: resBody?.validationErrors,
        };
        throw responseError;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async mapResponseToJSON(response: Response): Promise<any | undefined> {
        try {
            const clone = await response.clone();
            const responseBody = await clone.json();
            if (responseBody) {
                return responseBody;
            }
        } catch (e) {
            // console.log('Failed to map response to json');
        }
        return undefined;
    }

    private async mapResponseToString(response: Response): Promise<string | undefined> {
        const clone = await response.clone();
        const responseBody = await clone.text();
        if (responseBody) {
            return responseBody;
        }
        return undefined;
    }
}
