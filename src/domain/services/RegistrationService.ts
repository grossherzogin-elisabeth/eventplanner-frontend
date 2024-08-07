import { ArrayUtils } from '@/common';
import type { Event, Position, Registration, ResolvedRegistration, ResolvedSlot, User } from '@/domain';

export class RegistrationService {
    public resolveRegistrationsWithAssignedSlots(
        event: Event,
        users: User[],
        positions: Map<string, Position>
    ): ResolvedSlot[] {
        return event.slots
            .map((slot) => {
                const registration = event.registrations.find((it) => it.slotKey === slot.key);
                if (registration) {
                    const userName = this.resolveRegistrationUserName(registration, users);
                    const position = positions.get(registration.positionKey) || this.unknownPosition();
                    return {
                        ...slot,
                        userName: userName,
                        userKey: registration.userKey,
                        registration: registration,
                        position: position,
                        positionName: slot.positionName || position.name,
                        confirmed: false,
                    };
                }
                const position = positions.get(slot.positionKeys[0]) || this.unknownPosition();
                return {
                    ...slot,
                    userName: undefined,
                    userKey: undefined,
                    registration: registration,
                    position: position,
                    positionName: slot.positionName || position.name,
                    confirmed: false,
                };
            })
            .sort(
                (a, b) =>
                    b.position.prio - a.position.prio ||
                    a.order - b.order ||
                    a.userName?.localeCompare(b.userName || '') ||
                    0
            );
    }

    public resolveRegistrationsOnWaitingList(
        event: Event,
        users: User[],
        positions: Map<string, Position>
    ): ResolvedRegistration[] {
        return event.registrations
            .filter((registration) => !registration.slotKey)
            .map(
                (registration) =>
                    ({
                        ...registration,
                        name: this.resolveRegistrationUserName(registration, users),
                        position: positions.get(registration.positionKey) || this.unknownPosition(),
                    }) as ResolvedRegistration
            )
            .filter(ArrayUtils.filterUndefined)
            .sort((a, b) => b.position.prio - a.position.prio || a.name.localeCompare(b.name));
    }

    private resolveRegistrationUserName(registration: Registration, users: User[]): string {
        if (!registration.userKey) {
            return registration.name || '';
        }
        const user = users.find((user) => user.key === registration.userKey);
        if (!user) {
            return '';
        }
        return `${user.firstName} ${user.lastName}`.trim();
    }

    private unknownPosition(): Position {
        return { key: '', name: '?', prio: 0, color: '' };
    }
}
