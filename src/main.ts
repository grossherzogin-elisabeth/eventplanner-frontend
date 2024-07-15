import { AuthRestRepository, EventRestRepository, PositionRestRepository, UserRestRepository } from '@/adapter';
import type { Application, AuthRepository, EventRepository, PositionRepository, UserRepository } from '@/application';
import { AuthUseCase, EventUseCase, UsersUseCase } from '@/application';
import { IndexedDB, IndexedDBRepository } from '@/common';
import type { Domain } from '@/domain';
import { EventService, UserService } from '@/domain';
import { setupVue } from '@/ui';
import { config } from './config';

enum StoreNames {
    Events = 'events',
    Users = 'users',
    Positions = 'positions',
}

// -----------------------------------------------------
// initialize indexed db
// -----------------------------------------------------
const indexedDB = IndexedDB.getConnection('lissi', Object.values(StoreNames), 2);

// -----------------------------------------------------
// initialize domain services
// -----------------------------------------------------
const domain: Domain = {
    services: {
        users: new UserService(),
        events: new EventService(),
    },
};

// -----------------------------------------------------
// initialize adapters
// -----------------------------------------------------
const authRepository: AuthRepository = new AuthRestRepository(config);
const positionRepository: PositionRepository = new PositionRestRepository();
const userRepository: UserRepository = new UserRestRepository();
const eventRepository: EventRepository = new EventRestRepository();

// -----------------------------------------------------
// initialize use cases and application services
// -----------------------------------------------------
const application: Application = {
    config: config,
    services: {},
    usecases: {
        auth: new AuthUseCase({
            authRepository: authRepository,
        }),
        events: new EventUseCase({
            eventRepository: eventRepository,
            authRepository: authRepository,
            eventCache: new IndexedDBRepository(indexedDB, StoreNames.Events, {
                invalidateOnReload: true,
            }),
        }),
        users: new UsersUseCase({
            userRepository: userRepository,
            positionRepository: positionRepository,
            userCache: new IndexedDBRepository(indexedDB, StoreNames.Users, {
                invalidateOnReload: true,
            }),
            positionCache: new IndexedDBRepository(indexedDB, StoreNames.Positions, {
                invalidateOnReload: true,
            }),
        }),
    },
};

// -----------------------------------------------------
// initialize ui
// -----------------------------------------------------
setupVue({ domain, application });
