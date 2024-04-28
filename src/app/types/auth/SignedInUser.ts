import type { UserKey } from '@/app/types';
import type { Permission } from './Permission';
import type { Role } from './Role';

export interface SignedInUser {
    key: UserKey;
    gender: 'm' | 'w' | 'd';
    username: string;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    roles: Role[];
    permissions: Permission[];
}
