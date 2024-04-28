import type { PositionRepository, UserRepository } from '@/app/adapter';
import type { Registration, ResolvedRegistration, ResolvedSlot } from '@/app/types';
import type { Event, PositionKey } from '@/app/types';
import type { Position, User, UserKey } from '@/app/types';
import type { Cache } from '@/lib/utils';
import { ArrayUtils } from '@/lib/utils';

export class UserService {
    private readonly userRepository: UserRepository;
    private readonly positionRepository: PositionRepository;
    private readonly userCache: Cache<UserKey, User>;
    private readonly positionCache: Cache<PositionKey, Position>;

    constructor(params: {
        userRepository: UserRepository;
        positionRepository: PositionRepository;
        userCache: Cache<UserKey, User>;
        positionCache: Cache<PositionKey, Position>;
    }) {
        this.userRepository = params.userRepository;
        this.positionRepository = params.positionRepository;
        this.userCache = params.userCache;
        this.positionCache = params.positionCache;
    }

    public doesUserMatchFilter(user: User, filter: string): boolean {
        const filterLc = filter.toLowerCase();
        const fullname = `${user.firstName} ${user.lastName}`;
        if (fullname.toLowerCase().includes(filterLc)) {
            return true;
        }
        // const positions = this.positionRepository.findAll();
        // if (user.positionKeys.find((it) => it.includes(filterLc))) {
        //     return true;
        // }
        return false;
    }

    public async getUserByKey(key: UserKey): Promise<User> {
        let cached = await this.userCache.findByKey(key);
        if (cached) {
            return cached;
        }
        return await this.userRepository.findByKey(key);
    }

    public async getUsers(keys?: UserKey[]): Promise<User[]> {
        let users = await this.userCache.findAll();
        if (users.length === 0) {
            users = await this.fetchUsers();
        }
        if (keys) {
            users = users.filter((it) => keys.includes(it.key));
        }
        const positions = await this.getPositions();
        return users.sort((a, b) => {
            const prioA = a.positionKeys
                .map((key) => positions.find((it) => it.key === key))
                .reduce((prio, it) => Math.max(prio, it?.prio || 0), 0);
            const prioB = b.positionKeys
                .map((key) => positions.find((it) => it.key === key))
                .reduce((prio, it) => Math.max(prio, it?.prio || 0), 0);
            return prioA - prioB || a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName);
        });
    }

    public async getPositions(): Promise<Position[]> {
        const cached = await this.positionCache.findAll();
        if (cached.length > 0) {
            return cached;
        }
        return this.fetchPositions();
    }

    public async resolvePositionNames(): Promise<Map<PositionKey, Position>> {
        const map = new Map<PositionKey, Position>();
        const positions = await this.getPositions();
        positions.forEach((it) => map.set(it.key, it));
        return map;
    }

    public async resolveUserNames(keys: UserKey[]): Promise<Map<UserKey, string>> {
        const map = new Map<UserKey, string>();
        const users = await this.getUsers(keys);
        users.forEach((it) => map.set(it.key, `${it.firstName} ${it.lastName}`));
        return map;
    }

    public async resolveEventSlots(event: Event): Promise<ResolvedSlot[]> {
        const users = await this.getUsers();
        const positions = await this.resolvePositionNames();
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

    public async resolveWaitingList(event: Event): Promise<ResolvedRegistration[]> {
        const users = await this.getUsers();
        const positions = await this.resolvePositionNames();
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

    public async resolveRegistrationUser(registration: Registration): Promise<User | undefined> {
        if (!registration.userKey) {
            return undefined;
        }
        return await this.getUserByKey(registration.userKey);
    }

    private unknownPosition(): Position {
        return { key: '', name: '?', prio: 0, color: '' };
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

    private async fetchPositions(): Promise<Position[]> {
        const positions = await this.positionRepository.findAll();
        await this.positionCache.saveAll(positions);
        return positions;
    }

    private async fetchUsers(): Promise<User[]> {
        const users = await this.userRepository.findAll();
        await this.userCache.saveAll(users);
        return users;
    }
}
