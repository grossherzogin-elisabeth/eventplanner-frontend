<template>
    <div class="flex h-full flex-1 flex-col xl:overflow-y-scroll">
        <div class="absolute left-6 top-6 z-20 hidden xl:block">
            <RouterLink
                :to="{ name: Routes.EventsAdmin }"
                class="flex items-center justify-center rounded-full p-3 hover:bg-primary-100"
            >
                <i class="fa-solid fa-arrow-left"></i>
            </RouterLink>
        </div>
        <div class="bg-primary-50">
            <div class="z-10 flex items-center space-x-4 px-8 pb-4 pt-6 md:px-16 xl:px-20">
                <div>
                    <h1>{{ event?.name }} bearbeiten</h1>
                    <p class="mt-1 text-sm">{{ formatDate(event?.start) }}</p>
                </div>
                <div class="flex-grow"></div>
                <div v-if="event" class="hidden items-stretch justify-end space-x-2 xl:flex">
                    <button class="btn-primary" @click="resetTeam()">
                        <span>Zurücksetzen</span>
                    </button>
                    <button
                        v-if="signedInUser.permissions.includes(Permission.WRITE_EVENTS)"
                        class="btn-primary flex-grow"
                    >
                        <i class="fa-solid fa-save"></i>
                        <span>Speichern</span>
                    </button>
                    <ContextMenuButton class="btn-secondary">
                        <ul class="space-y-3 font-bold">
                            <li class="space-x-4">
                                <i class="fa-solid fa-check"></i>
                                <span>Reise freigeben</span>
                            </li>
                            <li class="space-x-4 text-red-600">
                                <i class="fa-solid fa-cancel"></i>
                                <span>Reise absagen</span>
                            </li>
                        </ul>
                    </ContextMenuButton>
                </div>
            </div>
        </div>

        <!-- tabs -->
        <VTabs v-model="tab" :tabs="tabs" class="sticky top-0 z-10 bg-primary-50 pt-4">
            <template #[Tab.EVENT_DATA]>
                <div class="max-w-2xl space-y-8 xl:space-y-16">
                    <section v-if="event" class="-mx-4">
                        <!--<div class="mb-2">-->
                        <!--    <VInputLabel>Typ</VInputLabel>-->
                        <!--    <VInputSelect v-model="event.type" :options="eventTypeOptions" required />-->
                        <!--</div>-->
                        <div class="mb-2">
                            <VInputLabel>Name</VInputLabel>
                            <VInputText v-model="event.name" required />
                        </div>
                        <div class="mb-2">
                            <VInputLabel>Info</VInputLabel>
                            <VInputText v-model="event.description" />
                        </div>
                        <div class="mb-2 flex space-x-4">
                            <div class="flex-grow">
                                <VInputLabel>Startdatum</VInputLabel>
                                <VInputDate v-model="event.start" required />
                            </div>
                            <div class="flex-grow">
                                <VInputLabel>Crew an Board</VInputLabel>
                                <VInputText model-value="16:00" required />
                            </div>
                        </div>

                        <div class="mb-2 flex space-x-4">
                            <div class="flex-grow">
                                <VInputLabel>Enddatum</VInputLabel>
                                <VInputDate v-model="event.end" required />
                            </div>
                            <div class="flex-grow">
                                <VInputLabel>Crew von Board</VInputLabel>
                                <VInputText model-value="16:00" required />
                            </div>
                        </div>
                    </section>
                </div>
            </template>
            <template #[Tab.EVENT_POSITIONS]>
                <!-- position counters -->
                <div class="mb-8 flex flex-wrap gap-2 text-sm font-bold text-white">
                    <div class="flex cursor-pointer items-center rounded-2xl bg-gray-500 p-1">
                        <span class="px-2"> Alle </span>
                        <span
                            class="flex h-5 w-5 items-center justify-center rounded-full bg-white bg-opacity-25 px-1 text-center text-xs"
                        >
                            {{ event?.assignedUserCount }}
                        </span>
                    </div>
                    <div
                        v-for="(count, key) in summary"
                        :key="key"
                        :style="{ 'background-color': position.get(key)?.color }"
                        class="flex cursor-pointer items-center rounded-2xl p-1"
                    >
                        <span class="px-2">
                            {{ position.get(key)?.name }}
                        </span>
                        <span
                            class="flex h-5 w-5 items-center justify-center rounded-full bg-white bg-opacity-25 px-1 text-center text-xs"
                        >
                            {{ count }}
                        </span>
                    </div>
                </div>
                <div class="flex items-start space-x-8">
                    <!-- event team -->
                    <div class="w-3/4">
                        <div v-for="(group, groupIndex) in groupedSlots" :key="groupIndex" class="mb-2">
                            <h3 class="mb-2 text-sm">{{ position.get(groupIndex)?.name }}</h3>
                            <div class="grid grid-cols-4 gap-2">
                                <div
                                    v-for="slot in group"
                                    :key="slot.key + slot.userName"
                                    :class="getClassForSlot(slot)"
                                    :style="{ 'border-color': slot.position.color }"
                                    class="rounded-lg border-l-8 px-2 py-1 pb-2 shadow"
                                    @click="focusSlot(slot)"
                                    @dragover="handleDragOver($event, slot)"
                                    @drop="handleDragStop($event, slot)"
                                >
                                    <div class="inline-block text-sm opacity-100">
                                        {{ slot.positionName }}
                                    </div>
                                    <input
                                        v-if="slot.required"
                                        v-model="slot.userName"
                                        class="w-full truncate border-b border-transparent bg-transparent placeholder-red-500 focus:bg-gray-100"
                                        placeholder="Noch nicht besetzt"
                                    />
                                    <input
                                        v-else
                                        v-model="slot.userName"
                                        class="w-full truncate border-b border-transparent bg-transparent focus:bg-gray-100"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- registrations -->
                    <div class="w-1/4 space-y-2 rounded-2xl bg-primary-100 p-4 shadow">
                        <h3 class="mb-4">Anmeldungen</h3>
                        <div
                            v-for="registration in filteredRegistrations"
                            :key="registration.userKey"
                            class="cursor-move bg-transparent"
                            draggable="true"
                            @dragstart="handleDragStart($event, registration)"
                        >
                            <div class="rounded-2xl">
                                <p class="font-semibold">{{ registration.name }}</p>
                                <p class="text-xs">{{ registration.position.name }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </VTabs>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { ResolvedRegistration } from '@/app';
import { Permission, type Position, type PositionKey, type ResolvedSlot, Routes } from '@/app';
import { Context } from '@/app/Context';
import ContextMenuButton from '@/app/components/utils/ContextMenuButton.vue';
import VTabs from '@/app/components/utils/VTabs.vue';
import type { Event } from '@/app/types';
import { VInputDate, VInputLabel, VInputText } from '@/lib/components';
import { useContext } from '@/lib/composables';
import { DateTimeFormat } from '@/shared/types';

enum Tab {
    EVENT_DATA = 'app.edit-event.tab.data',
    EVENT_POSITIONS = 'app.edit-event.tab.positions',
    EVENT_KAMMERPLAN = 'Kammerplan',
}

const ctx = useContext<Context>(Context);
const signedInUser = ctx.auth.getSignedInUser();
const i18n = useI18n();
const route = useRoute();

const tabs = [Tab.EVENT_DATA, Tab.EVENT_POSITIONS, Tab.EVENT_KAMMERPLAN];
const tab = ref<Tab>(Tab.EVENT_DATA);
const event = ref<Event | null>(null);
const position = ref<Map<PositionKey, Position>>(new Map<PositionKey, Position>());
const focusedSlot = ref<ResolvedSlot | null>(null);
const registrations = ref<ResolvedRegistration[]>([]);
const team = ref<ResolvedSlot[]>([]);

const filteredSlots = computed<ResolvedSlot[]>(() => {
    return team.value;
    // .filter((it) => it.position.key === 'leichtmatrose');
});

const groupedSlots = computed<Record<string, ResolvedSlot[]>>(() => {
    // no grouping
    return { all: filteredSlots.value };

    // group by required
    // const required = filteredSlots.value.filter((it) => it.required || it.userName || it.userKey);
    // const optional = filteredSlots.value.filter((it) => !it.required && !it.userName && !it.userKey);
    // return {
    //     required,
    //     optional,
    // };

    // group by role
    // const grouped: Record<string, ResolvedSlot[]> = {};
    // filteredSlots.value.forEach((it) => {
    //     const group = grouped[it.position.key] || [];
    //     group.push(it);
    //     grouped[it.position.key] = group;
    // });
    // return grouped;
});

const summary = computed<Record<PositionKey, number>>(() => {
    const sum: Record<PositionKey, number> = {};
    team.value
        .filter((it) => it.userName)
        .forEach((it) => {
            let count = sum[it.position.key] || 0;
            count++;
            sum[it.position.key] = count;
        });
    return sum;
});

const filteredRegistrations = computed<ResolvedRegistration[]>(() => {
    if (!focusedSlot.value) {
        return registrations.value;
    }
    return registrations.value.filter((it) => focusedSlot.value?.positionKeys.includes(it.positionKey));
});

function init(): void {
    fetchPositions();
    fetchEvent();
}

function formatDate(date?: Date): string {
    return date ? i18n.d(date, DateTimeFormat.Date) : '';
}

function getClassForSlot(slot: ResolvedSlot): string {
    if (focusedSlot.value?.key === slot.key) {
        return 'shadow-lg bg-primary-100';
    }
    if (slot.required && !slot.userName) {
        return 'bg-red-100 text-red-500';
    }
    return 'bg-white';
}

function handleDragStart(dragEvent: DragEvent, registration: ResolvedRegistration) {
    if (dragEvent.dataTransfer) {
        dragEvent.dataTransfer.setData('application/json', JSON.stringify(registration));
        dragEvent.dataTransfer.dropEffect = 'link';
        // const target = dragEvent.target as HTMLElement
        // target.style.display = 'none';
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleDragOver(dragEvent: DragEvent, targetSlot: ResolvedSlot) {
    if (dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        dragEvent.dataTransfer.dropEffect = 'link';
    }
}

async function handleDragStop(dragEvent: DragEvent, targetSlot: ResolvedSlot) {
    if (event.value && dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        const registration: ResolvedRegistration = JSON.parse(dragEvent.dataTransfer.getData('application/json'));
        const user = await ctx.users.resolveRegistrationUser(registration);
        if (user && !ctx.events.canUserBeAssignedToSlot(event.value, user, targetSlot.key)) {
            // do nothing?
            alert('Das geht nicht');
        } else if (user) {
            event.value = ctx.events.assignUserToSlot(event.value, user, targetSlot.key);
            fetchTeam();
        } else {
            event.value = ctx.events.assignGuestToSlot(event.value, registration.name, targetSlot.key);
            fetchTeam();
        }
    }
}

function focusSlot(slot: ResolvedSlot) {
    if (focusedSlot.value?.key === slot.key) {
        focusedSlot.value = null;
    } else {
        focusedSlot.value = slot;
    }
}

async function fetchPositions(): Promise<void> {
    position.value = await ctx.users.resolvePositionNames();
}

async function fetchEvent(): Promise<void> {
    const year = parseInt(route.params.year as string, 10);
    const key = route.params.key as string;
    event.value = await ctx.events.getEventByKey(year, key);
    fetchTeam();
}

async function fetchTeam(): Promise<void> {
    if (event.value) {
        console.log('fetch team');
        team.value = await ctx.users.resolveEventSlots(event.value);
        registrations.value = await ctx.users.resolveWaitingList(event.value);
    }
}

function resetTeam(): void {
    if (event.value) {
        event.value.registrations.forEach((it) => (it.slotKey = undefined));
        event.value.assignedUserCount = 0;
        fetchTeam();
    }
}

init();
</script>
