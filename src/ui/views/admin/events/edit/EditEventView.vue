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
                    <button class="btn-secondary" @click="resetTeam()">
                        <i class="fa-solid fa-rotate"></i>
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

                        <div class="flex-grow">
                            <VInputLabel>Seemeilen</VInputLabel>
                            <VInputText model-value="300" required />
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
                <div class="grid grid-cols-2 gap-16">
                    <div>
                        <h2 class="mb-8">Crew</h2>
                        <div v-if="dragSource === DragSource.FROM_WAITING_LIST" class="">
                            <div
                                class="flex h-96 items-center justify-center rounded-2xl bg-blue-100"
                                @dragover="handleDragOver($event)"
                                @drop="handleDragStopAddToTeam($event)"
                            >
                                <span class="text-primary-600">Zur Crew hinzufügen</span>
                            </div>
                        </div>
                        <ul v-else class="-mx-4">
                            <template v-for="(it, index) in team" :key="index">
                                <li
                                    :class="{ 'cursor-move': it.userName !== undefined }"
                                    :draggable="it.userName !== undefined"
                                    class="flex items-center space-x-2 rounded-xl px-4 py-2 hover:bg-primary-100 md:space-x-4"
                                    @dragend="dragSource = DragSource.NONE"
                                    @dragstart="handleDragStartFromTeam($event, it)"
                                >
                                    <i class="fa-solid fa-grip-vertical text-sm opacity-25"></i>
                                    <span v-if="it.userName && !it.confirmed">
                                        <i class="fa-solid fa-user-clock text-gray-400"></i>
                                    </span>
                                    <span v-else-if="it.userName && it.confirmed">
                                        <i class="fa-solid fa-user-check text-green-600"></i>
                                    </span>
                                    <span v-else>
                                        <i class="fa-solid fa-user-xmark text-red-500"></i>
                                    </span>
                                    <span v-if="it.userName" class="truncate">{{ it.userName }}</span>
                                    <span v-else-if="it.userKey" class="italic text-red-500"
                                        >err: {{ it.userKey }}</span
                                    >
                                    <span v-else class="truncate italic text-red-500">Noch nicht besetzt</span>
                                    <span v-if="it.userName && !it.userKey" class="">(Gastcrew)</span>
                                    <span class="flex-grow"></span>
                                    <span :style="{ background: it.position.color }" class="position ml-auto">
                                        {{ it.positionName }}
                                    </span>
                                </li>
                            </template>
                        </ul>
                    </div>
                    <div>
                        <h2 class="mb-8">Weitere Anmeldungen</h2>
                        <div v-if="dragSource === DragSource.FROM_TEAM" class="space-y-8">
                            <div
                                class="flex h-44 items-center justify-center rounded-2xl bg-blue-100"
                                @dragover="handleDragOver($event)"
                                @drop="handleDragStopRemoveFromTeam($event)"
                            >
                                <span class="text-primary-600">Auf Warteliste verschieben</span>
                            </div>
                            <div
                                class="flex h-44 items-center justify-center rounded-2xl bg-red-100"
                                @dragover="handleDragOver($event)"
                                @drop="handleDragStopCancelRegistration($event)"
                            >
                                <span class="text-red-600">Anmeldung löschen</span>
                            </div>
                        </div>
                        <ul v-else class="-mx-4">
                            <template v-for="(it, index) in registrations" :key="index">
                                <li
                                    class="flex cursor-move items-center space-x-2 rounded-xl px-4 py-2 hover:bg-primary-100 md:space-x-4"
                                    draggable="true"
                                    @dragend="dragSource = DragSource.NONE"
                                    @dragstart="handleDragStartFromWaitinglist($event, it)"
                                >
                                    <i class="fa-solid fa-grip-vertical text-sm opacity-25"></i>
                                    <span v-if="it.name" class="truncate">{{ it.name }}</span>
                                    <span v-else-if="it.userKey" class="italic text-red-500"
                                        >err: {{ it.userKey }}</span
                                    >
                                    <span class="flex-grow"></span>
                                    <span :style="{ background: it.position.color }" class="position ml-auto">
                                        {{ it.position.name }}
                                    </span>
                                </li>
                            </template>
                        </ul>
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
import { DateTimeFormat } from '@/common/date';
import type { Event, Position, PositionKey, ResolvedRegistration, ResolvedSlot } from '@/domain';
import { Permission } from '@/domain';
import { ContextMenuButton, VInputDate, VInputLabel, VInputText, VTabs } from '@/ui/components/common';
import { useAuthUseCase, useEventUseCase, useUsersUseCase } from '@/ui/composables/Application';
import { useEventService } from '@/ui/composables/Domain';
import { Routes } from '@/ui/views/Routes';

enum Tab {
    EVENT_DATA = 'app.edit-event.tab.data',
    EVENT_POSITIONS = 'app.edit-event.tab.positions',
    EVENT_KAMMERPLAN = 'Kammerplan',
}

enum DragSource {
    NONE = 'none',
    FROM_TEAM = 'team',
    FROM_WAITING_LIST = 'waitinglist',
}

const i18n = useI18n();
const route = useRoute();
const eventUseCase = useEventUseCase();
const usersUseCase = useUsersUseCase();
const eventService = useEventService();
const authUseCase = useAuthUseCase();
const signedInUser = authUseCase.getSignedInUser();

const tabs = [Tab.EVENT_POSITIONS, Tab.EVENT_DATA, Tab.EVENT_KAMMERPLAN];
const tab = ref<Tab>(Tab.EVENT_POSITIONS);
const event = ref<Event | null>(null);
const position = ref<Map<PositionKey, Position>>(new Map<PositionKey, Position>());
const registrations = ref<ResolvedRegistration[]>([]);
const team = ref<ResolvedSlot[]>([]);
const dragSource = ref<DragSource>(DragSource.NONE);

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

function init(): void {
    fetchPositions();
    fetchEvent();
}

function formatDate(date?: Date): string {
    return date ? i18n.d(date, DateTimeFormat.Date) : '';
}

function handleDragStartFromTeam(dragEvent: DragEvent, slot: ResolvedSlot) {
    if (dragEvent.dataTransfer && slot.userName) {
        dragSource.value = DragSource.FROM_TEAM;
        dragEvent.dataTransfer.setData('application/json', JSON.stringify(slot));
        dragEvent.dataTransfer.dropEffect = 'link';
    } else {
        dragEvent.preventDefault();
    }
}

function handleDragStartFromWaitinglist(dragEvent: DragEvent, registration: ResolvedRegistration) {
    if (dragEvent.dataTransfer) {
        dragSource.value = DragSource.FROM_WAITING_LIST;
        dragEvent.dataTransfer.setData('application/json', JSON.stringify(registration));
        dragEvent.dataTransfer.dropEffect = 'link';
    } else {
        dragEvent.preventDefault();
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleDragOver(dragEvent: DragEvent) {
    if (dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        dragEvent.dataTransfer.dropEffect = 'link';
    }
}

async function handleDragStopAddToTeam(dragEvent: DragEvent) {
    dragSource.value = DragSource.NONE;
    if (event.value && dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        const registration: ResolvedRegistration = JSON.parse(dragEvent.dataTransfer.getData('application/json'));
        const user = await usersUseCase.resolveRegistrationUser(registration);

        const slot = eventService
            .getOpenSlots(event.value)
            .find((it) => it.positionKeys.includes(registration.positionKey));
        if (!slot) {
            alert('Das geht nicht');
        } else if (user) {
            event.value = eventService.assignUserToSlot(event.value, user, slot.key);
            await fetchTeam();
        } else {
            event.value = eventService.assignGuestToSlot(event.value, registration.name, slot.key);
            await fetchTeam();
        }
    }
}

async function handleDragStopRemoveFromTeam(dragEvent: DragEvent) {
    dragSource.value = DragSource.NONE;
    if (event.value && dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        const slot: ResolvedSlot = JSON.parse(dragEvent.dataTransfer.getData('application/json'));
        if (slot) {
            event.value = eventService.unassignSlot(event.value, slot.key);
            await fetchTeam();
        }
    }
}

async function handleDragStopCancelRegistration(dragEvent: DragEvent) {
    dragSource.value = DragSource.NONE;
    if (event.value && dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        const slot: ResolvedSlot = JSON.parse(dragEvent.dataTransfer.getData('application/json'));
        if (slot.userKey) {
            event.value = eventService.cancelUserRegistration(event.value, slot.userKey);
            await fetchTeam();
        } else if (slot.userName) {
            event.value = eventService.cancelGuestRegistration(event.value, slot.userName);
            await fetchTeam();
        }
    }
}

async function fetchPositions(): Promise<void> {
    position.value = await usersUseCase.resolvePositionNames();
}

async function fetchEvent(): Promise<void> {
    const year = parseInt(route.params.year as string, 10);
    const key = route.params.key as string;
    event.value = await eventUseCase.getEventByKey(year, key);
    await fetchTeam();
}

async function fetchTeam(): Promise<void> {
    if (event.value) {
        team.value = (await usersUseCase.resolveEventSlots(event.value)).filter(
            (it) => it.userName || it.userKey || it.required
        );
        registrations.value = await usersUseCase.resolveWaitingList(event.value);
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
