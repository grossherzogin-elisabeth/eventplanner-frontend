import type { Position, Registration, User } from '@/app/types';

export interface ResolvedRegistration extends Registration {
    name: string;
    position: Position;
    user?: User;
}
