import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'app.page-title.privacy',
    authenticated: false,
};

const route: RouteRecordRaw = {
    path: '/privacy',
    name: Routes.Privacy,
    component: () => import('./PrivacyView.vue'),
    meta: routeMeta,
};

export default route;
