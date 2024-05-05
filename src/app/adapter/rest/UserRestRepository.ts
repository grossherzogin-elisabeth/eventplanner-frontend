import type { UserRepository } from '@/app/adapter';
import type { PositionKey, User, UserKey } from '@/app/types';

interface UserRepresentation {
    key: string;
    firstName: string;
    lastName: string;
    positions: string[];
}

interface UserDetailsRepresentation {
    key: string;
    authKey: string;
    email: string;
    firstName: string;
    lastName: string;
    positions: string[];
}

export class UserRestRepository implements UserRepository {
    public async findAll(): Promise<User[]> {
        const response = await fetch('/api/v1/users', {
            credentials: 'include',
        });
        if (!response.ok) {
            throw response;
        }
        const representations: UserRepresentation[] = await response.clone().json();
        return representations.map((it) => ({
            key: it.key,
            firstName: it.firstName,
            lastName: it.lastName,
            positionKeys: it.positions as PositionKey[],
        }));
    }

    public async findByKey(key: UserKey): Promise<User> {
        const response = await fetch(`/api/v1/users/by-key/${key}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw response;
        }
        const representation: UserDetailsRepresentation = await response.clone().json();
        return {
            key: representation.key,
            firstName: representation.firstName,
            lastName: representation.lastName,
            positionKeys: representation.positions as PositionKey[],
        };
    }

    public async importUsers(file: Blob): Promise<void> {
        const formParams = new FormData();
        formParams.append('file', file);
        // don't add 'Content-Type': 'multipart/form-data' header, as this will break the upload!
        const response = await fetch('/api/v1/import/users', {
            method: 'POST',
            credentials: 'include',
            body: formParams,
        });
        if (!response.ok) {
            throw response;
        }
    }
}
