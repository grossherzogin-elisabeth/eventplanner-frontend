import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'app.page-title.unauthorized',
    authenticated: false,
};

const route: RouteRecordRaw = {
    path: '/unauthorized',
    name: Routes.Unauthorized,
    component: () => import('./UnauthorizedView.vue'),
    meta: routeMeta,
};

export default route;
