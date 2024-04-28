import type { App } from 'vue';
import type { RouteRecordRaw, Router } from 'vue-router';
import { PositionRestRepository } from '@/app/adapter/rest/PositionRestRepository';
import type { SignedInUser } from '@/app/types';
import { IndexedDB, IndexedDBRepository } from '@/lib/utils';
import type { Config, RouteMetaData } from '@/shared/types';
import type { AuthRepository, EventRepository, I18nRepository, PositionRepository, UserRepository } from './adapter';
import { AuthRestRepository } from './adapter/rest/AuthRestRepository';
import { EventRestRepository } from './adapter/rest/EventRestRepository';
import { UserRestRepository } from './adapter/rest/UserRestRepository';
import './assets/css/main.css';
import { AppService } from './services/AppService';
import { AuthService } from './services/AuthService';
import { EventService } from './services/EventService';
import { UserService } from './services/UserService';

/**
 * Parameters used for context initialization.
 */
export interface ContextParams {
    // config contains your app config defined in main.ts and is available to all contexts
    config: Config;
    // vue instance
    vue: App;
    // instance of the vue router
    router: Router;
    // repository dependency injection
    i18nRepository: I18nRepository;
    // repositories may be optional if this context has an own implementation to use as default
    authRepository?: AuthRepository;
    positionRepository?: PositionRepository;
    eventRepository?: EventRepository;
    userRepository?: UserRepository;
}

enum StoreNames {
    Events = 'events',
    Users = 'users',
    Positions = 'positions',
}

/**
 * Context is a singleton holding the initialized services for this context
 */
export class Context {
    // unique name of your context, can be equal to folder name
    public static contextName = 'app';
    public readonly auth: AuthService;
    public readonly app: AppService;
    public readonly events: EventService;
    public readonly users: UserService;
    public signedInUser: SignedInUser;

    constructor(params: ContextParams) {
        console.info(`🚀 Initializing ${Context.contextName}`);

        // -----------------------------------------------------
        // load i18n messages
        // -----------------------------------------------------
        params.i18nRepository.addMessages({
            de: () => import('./locales/de.json'),
        });

        // -----------------------------------------------------
        // initialize context routes
        // -----------------------------------------------------
        // Dynamically load all routes of this context. Routes must be defined in a `Route.ts` file containing a single
        // route and exported as default.
        console.log(Object.values(import.meta.glob('./views/**/Route.ts', { eager: true })));
        Object.values(import.meta.glob<{ default?: RouteRecordRaw }>('./views/**/Route.ts', { eager: true }))
            .map((it) => {
                console.log(it.default);
                return it;
            })
            .filter((module) => module.default !== undefined)
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            .map((module) => module.default!)
            .forEach((route) => {
                console.log(`🛤️ Adding route ${String(route.name)}`);
                params.router.addRoute(route);
            });

        // -----------------------------------------------------
        // initialize indexed db
        // -----------------------------------------------------
        const indexedDB = IndexedDB.getConnection('lissi', Object.values(StoreNames), 2);

        // -----------------------------------------------------
        // initialize services
        // -----------------------------------------------------
        const authRepository = params.authRepository || new AuthRestRepository(params.config);
        const i18nRepository = params.i18nRepository;
        const positionRepository = params.positionRepository || new PositionRestRepository();
        const userRepository = params.userRepository || new UserRestRepository();
        const eventRepository = params.eventRepository || new EventRestRepository();

        this.auth = new AuthService({
            authRepository: authRepository,
        });
        this.app = new AppService({
            i18nRepository: i18nRepository,
        });
        this.events = new EventService({
            eventRepository: eventRepository,
            authRepository: authRepository,
            eventCache: new IndexedDBRepository(indexedDB, StoreNames.Events, {
                invalidateOnReload: true,
            }),
        });
        this.users = new UserService({
            userRepository: userRepository,
            positionRepository: positionRepository,
            userCache: new IndexedDBRepository(indexedDB, StoreNames.Users, {
                invalidateOnReload: true,
            }),
            positionCache: new IndexedDBRepository(indexedDB, StoreNames.Positions, {
                invalidateOnReload: true,
            }),
        });

        this.signedInUser = this.auth.getSignedInUser();
        this.auth.onLogin().then((signedInUser) => (this.signedInUser = signedInUser));

        // -----------------------------------------------------
        // Finalize router
        // -----------------------------------------------------
        this.finalizeRouter(params.router, i18nRepository, authRepository);
    }

    /**
     * Add an authentication guard to the router. This guard requires the auth service of app context and therefore
     * must be initialized here instead of within the router plugin
     * @param router router instance
     * @param i18n i18n repo for title localization
     * @param auth auth repo for permission guard
     */
    private finalizeRouter(router: Router, i18n: I18nRepository, auth: AuthRepository) {
        console.log('🛤️ Adding authentication guard to router');
        router.beforeResolve(async (to, from, next) => {
            const meta = to.meta as RouteMetaData | undefined;
            const user = auth.getSignedInUser();
            // authentication guard
            if (meta?.authenticated && user === undefined) {
                await auth.onLogin();
                // console.warn(`🛤️ Login required for route '${to.fullPath}'!`);
                // next({ path: '/unauthorized' });
            }
            // permission guard
            // if (meta?.permissions && meta.permissions.find((it) => !user?.permissions.includes(it as Permission))) {
            //     console.warn(`🛤️ Missing permission for route '${to.fullPath}'!`);
            //     next({ path: '/' });
            //     return;
            // }
            console.log(`🛤️ Entering route '${to.fullPath}'`);
            next();
        });

        /**
         * This hook sets the tab title based on the title set in your route meta
         */
        router.afterEach(async (to) => {
            await i18n.isReady();
            const meta = to.meta as RouteMetaData | undefined;
            if (typeof meta?.title === 'string') {
                document.title = `Lissi App | ${i18n.getText(meta.title)}`;
            } else if (typeof meta?.title === 'function') {
                document.title = `Lissi App | ${meta.title(to)}`;
            } else {
                document.title = 'Lissi App';
            }
        });
    }

    /**
     * Initialize the context and provide it on the vue instance
     * @param params context parameters
     */
    public static initialize(params: ContextParams): Context {
        const ctx = new Context(params);
        params.vue.provide(Context.contextName, ctx);
        return ctx;
    }
}
