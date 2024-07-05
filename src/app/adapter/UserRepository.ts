import type { User, UserDetails, UserKey } from '@/app/types';

export interface UserRepository {
    findAll(): Promise<User[]>;
    findByKey(key: UserKey): Promise<UserDetails>;
    findBySignedInUser(): Promise<UserDetails>;
    importUsers(file: Blob): Promise<void>;
}
