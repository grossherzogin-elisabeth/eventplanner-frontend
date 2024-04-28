import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeMainRouteComponent: any | undefined = undefined;
const routes: Array<RouteRecordRaw> = [
    // routes are set in contexts, so this stays empty
];

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            };
        }
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0 };
    },
});

router.afterEach((to) => {
    const route = router.getRoutes().find((it) => it.name === to.name);
    if (route?.components?.default) {
        activeMainRouteComponent = route?.components?.default;
    }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getActiveDefaultRouteOrElse(fallback: any): Promise<any> {
    return activeMainRouteComponent || fallback;
}

export default router;
