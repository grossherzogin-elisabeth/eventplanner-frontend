import type { User, UserKey } from '@/app/types';

export interface UserRepository {
    findAll(): Promise<User[]>;
    findByKey(key: UserKey): Promise<User>;
}
