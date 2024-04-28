import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'Crewverwaltung',
    authenticated: true,
    permissions: [Permission.READ_USERS],
};

const route: RouteRecordRaw = {
    path: '/users',
    name: Routes.UsersList,
    component: () => import('./UsersListView.vue'),
    meta: routeMeta,
};

export default route;
