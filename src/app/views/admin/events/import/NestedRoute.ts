import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import type { RouteMetaData } from '@/shared/types';

const routeMeta: RouteMetaData = {
    title: 'Reisen importieren',
    authenticated: true,
    permissions: [Permission.WRITE_EVENTS],
};

const route: RouteRecordRaw = {
    path: 'import',
    name: Routes.EventsImport,
    components: {
        default: () => import('../list/EventsAdminView.vue'),
        dialog: () => import('./ImportEventsView.vue'),
    },
    meta: routeMeta,
};

export default route;
