import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'app.page-title.404',
    authenticated: false,
};

const route: RouteRecordRaw = {
    path: '/:catchAll(.*)',
    name: Routes.PageNotFound,
    component: () => import('./PageNotFoundView.vue'),
    meta: routeMeta,
};

export default route;
