<template>
    <div class="bg-primary-50">
        <ViewToolbar>
            <template #breadcrumps>
                <span class="text-gray-400">Reisen</span>
                <i class="fa-solid fa-chevron-right mx-4 h-3 text-gray-400"></i>
                <span class="text-gray-400">{{ year }}</span>
                <i class="fa-solid fa-chevron-right mx-4 h-3 text-gray-400"></i>
                <ContextMenuButton class="btn-ghost">
                    <template #icon>
                        <span class="text-primary-600">
                            {{ $t(`app.event-quickfilter.${quickfilter}`) }}
                            <i class="fa-solid fa-caret-down ml-1 text-sm"></i>
                        </span>
                    </template>
                    <template #default>
                        <ul class="space-y-3 font-bold">
                            <li
                                class="flex cursor-pointer items-center justify-start space-x-2"
                                @click="fetchEvents(EventQuickFilter.All)"
                            >
                                <i class="fa-solid fa-route w-8"></i>
                                <span>Alle Reisen</span>
                            </li>
                            <li
                                class="flex cursor-pointer items-center justify-start space-x-2"
                                @click="fetchEvents(EventQuickFilter.MyEvents)"
                            >
                                <i class="fa-solid fa-user w-8"></i>
                                <span>Meine Reisen</span>
                            </li>
                        </ul>
                    </template>
                </ContextMenuButton>
            </template>
            <template #right>
                <RouterLink
                    v-if="user.permissions.includes(Permission.WRITE_EVENTS)"
                    :to="{ name: Routes.EventsImport }"
                    class="btn-primary"
                >
                    <i class="fa-solid fa-upload"></i>
                    <span>Reisen importieren</span>
                </RouterLink>
            </template>
        </ViewToolbar>
        <div class="flex flex-1 flex-col">
            <template v-if="events">
                <EventCalendar class="bg-primary-50" :events="events" @update:quick-filter="fetchEvents($event)" />
            </template>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import type { Event } from '@/app';
import { Permission } from '@/app';
import { EventQuickFilter, Routes } from '@/app';
import { Context } from '@/app/Context';
import EventCalendar from '@/app/components/events/EventCalendar.vue';
import ViewToolbar from '@/app/components/partials/ViewToolbar.vue';
import ContextMenuButton from '@/app/components/utils/ContextMenuButton.vue';
import { useContext } from '@/lib/composables';

const ctx = useContext<Context>(Context);
const route = useRoute();
const user = ctx.auth.getSignedInUser();

const events = ref<Event[]>([]);
const year = ref<number>(new Date().getFullYear());
const quickfilter = ref<EventQuickFilter>(EventQuickFilter.All);

function init(): void {
    fetchEvents();
    watch(route, () => fetchEvents());
}

async function fetchEvents(filter?: EventQuickFilter): Promise<void> {
    year.value = parseInt(route.params.year as string, 10) || new Date().getFullYear();
    quickfilter.value = filter || EventQuickFilter.All;
    switch (filter) {
        case EventQuickFilter.MyEvents:
            events.value = await ctx.events.getEventsByUser(year.value, user.key);
            break;
        case EventQuickFilter.All:
        default:
            events.value = await ctx.events.getEvents(year.value);
    }
}

init();
</script>
