import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/domain';
import type { RouteMetaData } from '@/ui/model/RouteMetaData';
import { Routes } from '@/ui/views/Routes';

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
