import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'Meine nächsten Reisen',
    authenticated: true,
};

const route: RouteRecordRaw = {
    path: '/',
    name: Routes.Home,
    component: () => import('./HomeView.vue'),
    meta: routeMeta,
};

export default route;
