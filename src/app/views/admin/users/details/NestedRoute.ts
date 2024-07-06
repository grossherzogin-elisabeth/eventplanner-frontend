import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    authenticated: true,
    title: 'Nutzerdetails',
    permissions: [Permission.READ_USER_DETAILS],
    breadcrumps: () => ['Admin', 'Nutzerverwaltung', 'Nutzer bearbeiten'],
    backTo: Routes.UsersList,
};

const route: RouteRecordRaw = {
    path: 'edit/:key',
    name: Routes.UserDetails,
    component: () => import('./UserDetailsView.vue'),
    meta: routeMeta,
};

export default route;
