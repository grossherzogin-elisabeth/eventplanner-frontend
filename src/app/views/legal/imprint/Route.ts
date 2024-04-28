import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'app.page-title.imprint',
    authenticated: false,
};

const route: RouteRecordRaw = {
    path: '/impressum',
    name: Routes.Imprint,
    component: () => import('./ImprintView.vue'),
    meta: routeMeta,
};

export default route;
