import type { RouteRecordRaw } from 'vue-router';
import { Permission } from '@/app/types';
import List from '@/app/views/events/calendar/NestedRoute';
import type { RouteMetaData } from '@/shared/types';
import Details from './details/NestedRoute';

const routeMeta: RouteMetaData = {
    title: (route) => 'Reisen ' + route.params.year,
    authenticated: true,
    permissions: [Permission.READ_EVENTS],
};

const route: RouteRecordRaw = {
    path: '/events/:year',
    meta: routeMeta,
    name: 'app_event-parent',
    children: [List, Details],
};

export default route;
