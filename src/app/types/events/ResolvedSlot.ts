import type { Position, Registration, Slot, UserKey } from '@/app/types';

export interface ResolvedSlot extends Slot {
    userName?: string;
    userKey?: UserKey;
    registration?: Registration;
    position: Position;
    confirmed?: boolean;
}
