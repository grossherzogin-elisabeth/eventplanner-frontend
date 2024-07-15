import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/domain';
import type { RouteMetaData } from '@/ui/model/RouteMetaData';
import { Routes } from '@/ui/views/Routes';

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
