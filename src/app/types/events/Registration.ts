import type { PositionKey, SlotKey, UserKey } from '@/app/types';

export interface Registration {
    positionKey: PositionKey;
    userKey?: UserKey;
    name?: string;
    slotKey?: SlotKey;
}
