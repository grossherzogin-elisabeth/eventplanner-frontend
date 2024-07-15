import type { Config } from './entities/Config';
import type { AuthUseCase } from './usecases/AuthUseCase';
import type { EventUseCase } from './usecases/EventUseCase';
import type { UsersUseCase } from './usecases/UsersUseCase';

export interface Application {
    config: Config;
    services: {
        auth: undefined;
    };
    usecases: {
        auth: AuthUseCase;
        users: UsersUseCase;
        events: EventUseCase;
    };
}
