import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'app.page-title.account',
    authenticated: true,
};

const route: RouteRecordRaw = {
    path: '/account',
    name: Routes.Account,
    component: () => import('./AccountView.vue'),
    meta: routeMeta,
};

export default route;
