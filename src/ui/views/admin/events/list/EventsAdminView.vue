<template>
    <div class="flex h-full flex-1 flex-col xl:overflow-y-auto">
        <teleport to="#nav-right">
            <NavbarFilter v-model="filter" placeholder="Nutzer durchsuchen" />
        </teleport>
        <div
            class="top-12 z-10 hidden bg-primary-50 px-4 pb-8 pt-4 md:pl-12 md:pr-16 md:pt-8 xl:top-0 xl:block xl:pl-16 xl:pr-20"
        >
            <div class="flex items-center space-x-4">
                <VInputText v-model="filter" class="input-search w-96" placeholder="Reisen filtern">
                    <template #before>
                        <i class="fa-solid fa-magnifying-glass ml-4 text-primary-900 text-opacity-25" />
                    </template>
                </VInputText>
                <div class="hidden flex-grow md:block"></div>
                <div class="hidden items-stretch justify-end space-x-2 md:flex">
                    <RouterLink
                        v-if="user.permissions.includes(Permission.WRITE_EVENTS)"
                        :to="{ name: Routes.EventsImport }"
                        class="btn-secondary"
                    >
                        <i class="fa-solid fa-upload"></i>
                        <span>Reisen importieren</span>
                    </RouterLink>
                    <button class="btn-primary" @click="createEvent()">
                        <i class="fa-solid fa-calendar-plus"></i>
                        <span>Reise erstellen</span>
                    </button>
                </div>
            </div>
        </div>
        <VTabs :tabs="tabs" v-model="tab"></VTabs>
        <div class="w-full overflow-x-auto px-8 pt-6 md:px-16 xl:px-20 xl:pt-0">
            <div class="-mx-4 px-4">
                <VTable :items="filteredEvents" :page-size="-1" class="">
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
        <CreateEventDlg ref="createEventDlg" />
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrayUtils } from '@/common';
import { DateTimeFormat } from '@/common/date';
import type { Event } from '@/domain';
import { Permission } from '@/domain';
import { Dialog, VInputText, VTable, VTabs } from '@/ui/components/common';
import CreateEventDlg from '@/ui/components/events/CreateEventDlg.vue';
import NavbarFilter from '@/ui/components/utils/NavbarFilter.vue';
import { useAuthUseCase, useEventUseCase } from '@/ui/composables/Application';
import { Routes } from '@/ui/views/Routes';

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

const eventUseCase = useEventUseCase();
const authUseCase = useAuthUseCase();
const route = useRoute();
const i18n = useI18n();
const user = authUseCase.getSignedInUser();

const events = ref<EventTableViewItem[]>([]);
const tab = ref<string>(String(new Date().getFullYear()));
const filter = ref<string>('');
const createEventDlg = ref<Dialog<Event> | null>(null);

const filteredEvents = computed(() => {
    const f = filter.value.toLowerCase();
    return events.value.filter((it) => it.name.toLowerCase().includes(f));
});

const tabs = computed<string[]>(() => {
    const currentYear = new Date().getFullYear();
    return [
        'Zukünftige',
        String(currentYear + 1),
        String(currentYear),
        String(currentYear - 1),
        String(currentYear - 2),
    ];
});

function init(): void {
    fetchEvents();
    watch(route, () => fetchEvents());
    watch(tab, () => fetchEvents());
}

async function fetchEvents(): Promise<void> {
    if (tab.value === tabs.value[0]) {
        const now = new Date();
        const currentYear = await fetchEventsByYear(now.getFullYear());
        const nextYear = await fetchEventsByYear(now.getFullYear() + 1);
        events.value = currentYear.concat(nextYear).filter((it) => it.endDate.getTime() > now.getTime());
    } else {
        const year = parseInt(tab.value);
        if (year) {
            events.value = await fetchEventsByYear(year);
        }
    }
}

async function fetchEventsByYear(year: number): Promise<EventTableViewItem[]> {
    const evts = await eventUseCase.getEvents(year);
    return evts.map((evt) => {
        return {
            eventKey: evt.key,
            name: evt.name,
            start: i18n.d(evt.start, DateTimeFormat.DD_MM_YYYY),
            startDate: evt.start,
            end: i18n.d(evt.end, DateTimeFormat.DD_MM_YYYY),
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

async function createEvent(): Promise<void> {
    try {
        const event = await createEventDlg.value?.open();
        console.log(event);
    } catch (e) {
        // ignore, dialog was probably canceled
    }
}

init();
</script>
