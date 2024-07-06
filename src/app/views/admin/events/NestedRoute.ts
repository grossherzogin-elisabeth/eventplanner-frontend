import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import type { RouteMetaData } from '@/shared/types';
import Edit from './edit/NestedRoute';
import Import from './import/NestedRoute';
import List from './list/NestedRoute';

const routeMeta: RouteMetaData = {
    title: 'Reisen verwalten',
    authenticated: true,
    permissions: [Permission.WRITE_EVENTS],
};

const route: RouteRecordRaw = {
    path: 'events',
    meta: routeMeta,
    name: 'app_admin-events-parent',
    children: [List, Import, Edit],
};

export default route;
