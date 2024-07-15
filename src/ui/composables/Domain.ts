import { inject } from 'vue';
import type { EventService, UserService } from '@/domain';

export const USER_SERVICE = 'domain.service.user';
export const EVENT_SERVICE = 'domain.service.event';

export function useUserService(): UserService {
    const service = inject<UserService>(USER_SERVICE);
    if (!service) {
        throw new Error('Event domain service not found!');
    }
    return service;
}

export function useEventService(): EventService {
    const service = inject<EventService>(EVENT_SERVICE);
    if (!service) {
        throw new Error('User domain service not found!');
    }
    return service;
}
