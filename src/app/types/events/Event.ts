import type { EventState, Location, PositionKey, Registration, Slot } from '@/app/types';

export type EventKey = string;

export interface Event {
    key: EventKey;
    state: EventState;
    name: string;
    description: string;
    start: Date;
    end: Date;
    locations: Location[];
    slots: Slot[];
    registrations: Registration[];
    assignedUserCount: number;
    signedInUserAssignedPosition?: PositionKey;
    signedInUserWaitingListPosition?: PositionKey;
}
