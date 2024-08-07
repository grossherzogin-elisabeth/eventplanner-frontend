import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/domain';
import type { RouteMetaData } from '@/ui/model/RouteMetaData';
import { Routes } from '@/ui/views/Routes';

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
