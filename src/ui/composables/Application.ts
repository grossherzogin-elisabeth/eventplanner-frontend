import { inject } from 'vue';
import type { AuthUseCase, EventUseCase, UsersUseCase } from '@/application';

export const AUTH_USE_CASE = 'application.usecase.auth';
export const EVENT_USE_CASE = 'application.usecase.events';
export const USER_USE_CASE = 'application.usecase.users';

export function useAuthUseCase(): AuthUseCase {
    const useCase = inject<AuthUseCase>(AUTH_USE_CASE);
    if (!useCase) {
        throw new Error('Auth usecase not found!');
    }
    return useCase;
}

export function useEventUseCase(): EventUseCase {
    const useCase = inject<EventUseCase>(EVENT_USE_CASE);
    if (!useCase) {
        throw new Error('Event usecase not found!');
    }
    return useCase;
}

export function useUsersUseCase(): UsersUseCase {
    const useCase = inject<UsersUseCase>(USER_USE_CASE);
    if (!useCase) {
        throw new Error('User usecase not found!');
    }
    return useCase;
}
