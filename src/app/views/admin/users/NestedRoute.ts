import type { RouteRecordRaw } from 'vue-router';
import { Routes } from '@/app';
import { Permission } from '@/app/types';
import type { RouteMetaData } from '@/shared/types';
import Details from './details/NestedRoute';
import Import from './import/NestedRoute';
import List from './list/NestedRoute';

const routeMeta: RouteMetaData = {
    title: 'Crewverwaltung',
    authenticated: true,
    permissions: [Permission.READ_USER_DETAILS],
};

const route: RouteRecordRaw = {
    path: 'users',
    meta: routeMeta,
    name: 'app_admin-users-parent',
    children: [List, Details, Import],
};

export default route;
