import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'Nutzer importieren',
    authenticated: true,
    permissions: [Permission.WRITE_USERS],
};

const route: RouteRecordRaw = {
    path: 'import',
    name: Routes.UsersImport,
    components: {
        default: () => import('../list/UsersListView.vue'),
        dialog: () => import('./ImportUsersView.vue'),
    },
    meta: routeMeta,
};

export default route;
