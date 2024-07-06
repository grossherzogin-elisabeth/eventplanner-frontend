<template>
    <div class="flex h-full flex-1 flex-col xl:overflow-y-auto">
        <ViewToolbar>
            <template #breadcrumps>
                <span class="text-gray-400">Admin</span>
                <i class="fa-solid fa-chevron-right mx-4 h-3 text-gray-400"></i>
                <span class="text-gray-400">Reisen verwalten</span>
                <i class="fa-solid fa-chevron-right mx-4 h-3 text-gray-400"></i>
            </template>
            <template #right>
                <RouterLink
                    v-if="user.permissions.includes(Permission.WRITE_EVENTS)"
                    :to="{ name: Routes.EventsImport }"
                    class="btn-secondary"
                >
                    <i class="fa-solid fa-upload"></i>
                    <span>Reisen importieren</span>
                </RouterLink>
                <button class="btn-primary">
                    <i class="fa-solid fa-calendar-plus"></i>
                    <span>Reise erstellen</span>
                </button>
            </template>
        </ViewToolbar>
        <div class="w-full overflow-x-auto px-8 pt-6 md:px-16 xl:px-20 xl:pt-0">
            <div class="-mx-4 px-4">
                <VTable :items="events" :page-size="-1" class="hidden md:table">
                    <template #head>
                        <th class="w-1/2" data-sortby="name">Reise</th>
                        <th class="w-1/6" data-sortby="duration"></th>
                        <th class="w-1/6" data-sortby="duration">Anmeldungen</th>
                        <th class="w-1/6" data-sortby="startDate">Datum</th>
                        <th class="w-1/6" data-sortby="duration">Dauer</th>
                    </template>
                    <template #row="{ item }">
                        <td class="w-full border-none font-semibold">
                            <RouterLink
                                :to="{
                                    name: Routes.EventEdit,
                                    params: { year: item.startDate.getFullYear(), key: item.eventKey },
                                }"
                                class="hover:text-primary-600"
                            >
                                {{ item.name }}
                            </RouterLink>
                            <p class="text-sm font-light">{{ item.locations }}</p>
                        </td>
                        <td>
                            <div
                                v-if="item.hasOpenRequiredSlots"
                                class="inline-flex w-auto items-center space-x-2 rounded-full bg-yellow-100 py-1 pl-3 pr-4 text-yellow-700"
                            >
                                <i class="fa-solid fa-warning"></i>
                                <span class="whitespace-nowrap font-semibold">Fehlende Crew</span>
                            </div>
                            <div
                                v-else-if="item.hasOpenSlots"
                                class="inline-flex w-auto items-center space-x-2 rounded-full bg-green-100 py-1 pl-3 pr-4 text-green-700"
                            >
                                <i class="fa-solid fa-check-circle"></i>
                                <span class="whitespace-nowrap font-semibold">Freie Plätze</span>
                            </div>
                            <div
                                v-else
                                class="inline-flex w-auto items-center space-x-2 rounded-full bg-green-100 py-1 pl-3 pr-4 text-green-700"
                            >
                                <i class="fa-solid fa-check-circle"></i>
                                <span class="whitespace-nowrap font-semibold">Voll belegt</span>
                            </div>
                        </td>
                        <td>
                            {{ item.registrations }}
                        </td>
                        <td class="hidden md:table-cell">
                            {{ item.start }}
                        </td>
                        <td class="hidden md:table-cell">{{ item.duration }} Tage</td>
                    </template>
                </VTable>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Event, Permission, Routes } from '@/app';
import { Context } from '@/app/Context';
import ViewToolbar from '@/app/components/partials/ViewToolbar.vue';
import { VTable } from '@/lib/components';
import { useContext } from '@/lib/composables';
import { ArrayUtils } from '@/lib/utils';
import { DateTimeFormat } from '@/shared/types';

interface EventTableViewItem {
    eventKey: string;
    name: string;
    locations: string;
    start: string;
    end: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    isPastEvent: boolean;
    registrations: number;
    waitingList: number;
    hasOpenSlots: boolean;
    hasOpenRequiredSlots: boolean;
}

const ctx = useContext<Context>(Context);
const route = useRoute();
const i18n = useI18n();
const user = ctx.auth.getSignedInUser();

const events = ref<EventTableViewItem[]>([]);
const year = ref<number>(new Date().getFullYear());

function init(): void {
    fetchEvents();
    watch(route, () => fetchEvents());
}

async function fetchEvents(): Promise<void> {
    year.value = parseInt(route.params.year as string, 10) || new Date().getFullYear();
    const evts = await ctx.events.getEvents(year.value);
    events.value = evts.map((evt) => {
        return {
            eventKey: evt.key,
            name: evt.name,
            start: i18n.d(evt.start, DateTimeFormat.Date),
            startDate: evt.start,
            end: i18n.d(evt.end, DateTimeFormat.Date),
            endDate: evt.end,
            duration: new Date(evt.end.getTime() - evt.start.getTime()).getDate(),
            locations: evt.locations.map((it) => it.name).join(' - '),
            isPastEvent: evt.start.getTime() < new Date().getTime(),
            registrations: evt.registrations.length,
            waitingList: evt.registrations.filter((it) => it.slotKey).length,
            hasOpenSlots: hasOpenSlots(evt),
            hasOpenRequiredSlots: hasOpenRequiredSlots(evt),
        };
    });
}

function hasOpenSlots(event: Event): boolean {
    const filledSlotKeys = event.registrations.map((it) => it.slotKey).filter(ArrayUtils.filterUndefined);
    return filledSlotKeys.length < 23;
}

function hasOpenRequiredSlots(event: Event): boolean {
    const filledSlotKeys = event.registrations.map((it) => it.slotKey).filter(ArrayUtils.filterUndefined);
    const openRequiredSlots = event.slots.filter((it) => it.required).filter((it) => !filledSlotKeys.includes(it.key));
    return openRequiredSlots.length > 0;
}

init();
</script>
