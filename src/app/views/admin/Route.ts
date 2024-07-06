import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import type { RouteMetaData } from '@/shared/types';
import Events from './events/NestedRoute';
import Users from './users/NestedRoute';

const routeMeta: RouteMetaData = {
    title: 'Admin',
    authenticated: true,
    permissions: [Permission.WRITE_EVENTS],
};

const route: RouteRecordRaw = {
    path: '/admin',
    meta: routeMeta,
    name: 'app_admin-parent',
    children: [Events, Users],
};

export default route;
