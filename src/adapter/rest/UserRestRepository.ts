import type { UserRepository } from '@/application';
import type { PositionKey, User, UserDetails, UserKey } from '@/domain';

interface UserRepresentation {
    key: string;
    firstName: string;
    lastName: string;
    positions: string[];
}

interface UserDetailsRepresentation {
    key: string;
    authKey: string;
    firstName: string;
    secondName?: string;
    lastName: string;
    positions: string[];
    email: string;
    // qualifications: any[];
    phone?: string;
    mobile?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
    passNr?: string;
    comment?: string;
    address: AddressRepresentation;
}

interface AddressRepresentation {
    addressLine1: string;
    addressLine2?: string;
    town: string;
    zipCode: string;
}

export class UserRestRepository implements UserRepository {
    private static parseDate(value?: string): Date | undefined {
        if (!value) {
            return undefined;
        }
        if (value.includes('+')) {
            return new Date(value.split('+')[0]);
        }
        return new Date(value);
    }

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

    public async findByKey(key: UserKey): Promise<UserDetails> {
        const response = await fetch(`/api/v1/users/by-key/${key}`, {
            credentials: 'include',
        });
        if (!response.ok) {
            throw response;
        }
        const representation: UserDetailsRepresentation = await response.clone().json();
        return {
            key: representation.key,
            authKey: representation.authKey,
            firstName: representation.firstName,
            secondName: representation.secondName,
            lastName: representation.lastName,
            positionKeys: representation.positions as PositionKey[],
            // qualifications: representation.qualifications;
            email: representation.email,
            phone: representation.phone,
            mobile: representation.mobile,
            dateOfBirth: UserRestRepository.parseDate(representation.dateOfBirth),
            placeOfBirth: representation.placeOfBirth,
            passNr: representation.passNr,
            comment: representation.comment,
            address: {
                addressLine1: representation.address.addressLine1,
                addressLine2: representation.address.addressLine2,
                town: representation.address.town,
                zipcode: representation.address.zipCode,
            },
        };
    }

    public async findBySignedInUser(): Promise<UserDetails> {
        const response = await fetch('/api/v1/users/self', {
            credentials: 'include',
        });
        if (!response.ok) {
            throw response;
        }
        const representation: UserDetailsRepresentation = await response.clone().json();
        return {
            key: representation.key,
            authKey: representation.authKey,
            firstName: representation.firstName,
            secondName: representation.secondName,
            lastName: representation.lastName,
            positionKeys: representation.positions as PositionKey[],
            // qualifications: representation.qualifications;
            email: representation.email,
            phone: representation.phone,
            mobile: representation.mobile,
            dateOfBirth: UserRestRepository.parseDate(representation.dateOfBirth),
            placeOfBirth: representation.placeOfBirth,
            passNr: representation.passNr,
            comment: undefined,
            address: {
                addressLine1: representation.address.addressLine1,
                addressLine2: representation.address.addressLine2,
                town: representation.address.town,
                zipcode: representation.address.zipCode,
            },
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
