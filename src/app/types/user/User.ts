import type { PositionKey } from './Position';

export type UserKey = string;

export interface User {
    key: UserKey;
    firstName: string;
    lastName: string;
    positionKeys: PositionKey[];

    // gender?: 'm' | 'w' | 'd';
    // phone?: string;
    // birthday?: Date;
    email?: string;
    // authKey?: string;
    // certificates?: Record<CertificateKey, Date | undefined>[];
}
