import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'Reise bearbeiten',
    authenticated: true,
    permissions: [Permission.WRITE_EVENTS],
    backTo: Routes.EventDetails,
    breadcrumps: (route) => ['Reisen', String(route?.params?.year), 'Reise bearbeiten'],
};

const route: RouteRecordRaw = {
    path: 'edit/:key',
    name: Routes.EventEdit,
    component: () => import('./EditEventView.vue'),
    meta: routeMeta,
};

export default route;
