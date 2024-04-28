import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    authenticated: true,
    title: 'Nutzerdetails',
    permissions: [Permission.READ_USERS],
    breadcrumps: () => ['Admin', 'Nutzerverwaltung', 'Nutzer bearbeiten'],
    backTo: Routes.UsersList,
};

const route: RouteRecordRaw = {
    path: '/users/edit/:key',
    name: Routes.UserDetails,
    components: {
        default: () => import('./UserDetailsView.vue'),
        // default: () => getActiveDefaultRouteOrElse(import('../list/UsersListView.vue')),
        // dialog: () => import('./UserDetailsView.vue'),
    },
    meta: routeMeta,
};

export default route;
