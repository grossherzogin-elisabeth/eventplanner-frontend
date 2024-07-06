import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: (route) => 'Reisen ' + route.params.year,
    authenticated: true,
    permissions: [Permission.READ_EVENTS],
    hasTransparentHeader: true,
};

const route: RouteRecordRaw = {
    path: '',
    name: Routes.Events,
    component: () => import('./ListEventsView.vue'),
    meta: routeMeta,
};

export default route;
