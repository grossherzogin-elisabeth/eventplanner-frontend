import type { Position, Registration, Slot } from '@/app/types';

export interface ResolvedSlot extends Slot {
    userName?: string;
    userKey?: string;
    registration?: Registration;
    position: Position;
}
