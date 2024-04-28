import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'Wiki',
    authenticated: false,
};

const route: RouteRecordRaw = {
    path: '/wiki',
    name: Routes.Wiki,
    component: () => import('./WikiView.vue'),
    meta: routeMeta,
};

export default route;
