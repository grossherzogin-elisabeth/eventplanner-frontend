<template>
    <div class="flex h-full flex-1 flex-col xl:overflow-y-scroll">
        <div class="absolute left-6 top-6 z-20 hidden xl:block">
            <BackButton :to="{ name: Routes.EventsAdmin }" />
        </div>
        <div class="bg-primary-50">
            <div class="z-10 flex items-center space-x-4 px-8 pb-4 pt-6 md:px-16 xl:px-20">
                <div class="w-full overflow-hidden">
                    <h1 class="truncate">{{ event?.name }}</h1>
                    <p class="mt-1 text-sm">{{ formatDate(event?.start) }}</p>
                </div>
                <div class="flex-grow"></div>
                <div v-if="event" class="hidden items-stretch justify-end space-x-2 xl:flex">
                    <button
                        v-if="
                            tab === Tab.EVENT_POSITIONS &&
                            signedInUser.permissions.includes(Permission.EVENT_TEAM_WRITE)
                        "
                        class="btn-secondary"
                        @click="resetTeam()"
                    >
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
                </div>
            </div>
        </div>

        <!-- tabs -->
        <VTabs v-model="tab" :tabs="tabs" class="sticky top-10 z-10 bg-primary-50 pt-4 xl:top-0">
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
                            <VInputLabel>Typ</VInputLabel>
                            <VInputSelect
                                :options="[
                                    { value: EventType.WorkEvent, label: 'Arbeitsdienst' },
                                    { value: EventType.VOYAGE, label: 'Mehrtagesreise' },
                                ]"
                                v-model="event.type"
                                required
                            />
                        </div>
                        <div class="mb-2">
                            <VInputLabel>Beschreibung</VInputLabel>
                            <VInputTextArea v-model="event.description" />
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
                <CrewEditor v-if="event" :event.sync="event" />
            </template>
            <template #[Tab.EVENT_CABINS]>
                <div>TODO</div>
            </template>
            <template #[Tab.EVENT_SLOTS]>
                <div class="-mx-8 overflow-y-auto px-4">
                    <VTable :items="slots" :page-size="-1" @click="editSlot($event.key)" class="interactive-table">
                        <template #head>
                            <th class="hidden w-0 md:table-cell"></th>
                            <th class="w-0"></th>
                            <th class="w-1/3">Name</th>
                            <th class="w-2/3">Mögliche Positionen</th>
                            <th class="w-64">Status</th>
                        </template>
                        <template #row="{ item, index }">
                            <td class="hidden md:table-cell">
                                <button class="cursor-move">
                                    <i class="fa-solid fa-grip-vertical text-sm opacity-25"></i>
                                </button>
                            </td>
                            <td>
                                <span
                                    class="inline-block rounded-full bg-gray-200 px-2 py-1 text-sm font-semibold text-gray-700"
                                >
                                    #{{ index + 1 }}
                                </span>
                            </td>
                            <td>
                                <div class="whitespace-nowrap font-semibold">
                                    {{ item.name || item.position.name }}
                                </div>
                            </td>
                            <td class="">
                                <div class="flex items-center">
                                    <div
                                        v-for="position in item.alternativePositions"
                                        :key="position.key"
                                        :style="{ background: position.color }"
                                        class="position mb-1 mr-1"
                                    >
                                        <span>{{ position.name }}</span>
                                    </div>
                                </div>
                            </td>
                            <td class="">
                                <span
                                    v-if="item.filled"
                                    class="inline-flex w-auto items-center rounded-full bg-green-100 py-1 pl-3 pr-4 text-green-700"
                                >
                                    <i class="fa-solid fa-circle-check"></i>
                                    <span class="ml-2 whitespace-nowrap font-semibold">Besetzt</span>
                                </span>
                                <span
                                    v-else-if="item.required"
                                    class="inline-flex w-auto items-center rounded-full bg-yellow-100 py-1 pl-3 pr-4 text-yellow-700"
                                >
                                    <i class="fa-solid fa-warning"></i>
                                    <span class="ml-2 whitespace-nowrap font-semibold">Nicht besetzt</span>
                                </span>
                                <span
                                    v-else
                                    class="inline-flex w-auto items-center rounded-full bg-blue-100 py-1 pl-3 pr-4 text-blue-700"
                                >
                                    <i class="fa-solid fa-circle-info"></i>
                                    <span class="ml-2 whitespace-nowrap font-semibold">Optional</span>
                                </span>
                            </td>
                        </template>
                    </VTable>
                </div>
                <EditEventSlotDlg ref="editSlotDialog" />
            </template>
        </VTabs>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrayUtils } from '@/common';
import { DateTimeFormat } from '@/common/date';
import { Event, EventType, Permission, Position, PositionKey, Slot, SlotKey } from '@/domain';
import {
    Dialog,
    VInputDate,
    VInputLabel,
    VInputSelect,
    VInputText,
    VInputTextArea,
    VTable,
    VTabs,
} from '@/ui/components/common';
import CrewEditor from '@/ui/components/events/CrewEditor.vue';
import EditEventSlotDlg from '@/ui/components/events/EditEventSlotDlg.vue';
import BackButton from '@/ui/components/utils/BackButton.vue';
import { useAuthUseCase, useEventUseCase, useUsersUseCase } from '@/ui/composables/Application';
import { useEventService } from '@/ui/composables/Domain';
import { Routes } from '@/ui/views/Routes';

enum Tab {
    EVENT_DATA = 'app.edit-event.tab.data',
    EVENT_POSITIONS = 'app.edit-event.tab.positions',
    EVENT_CABINS = 'Kammerplan',
    EVENT_SLOTS = 'Slots',
}

interface SlotTableItem {
    key: SlotKey;
    name?: string;
    required: boolean;
    position: Position;
    alternativePositions: Position[];
    filled: boolean;
}

const i18n = useI18n();
const route = useRoute();
const eventService = useEventService();
const eventUseCase = useEventUseCase();
const usersUseCase = useUsersUseCase();
const authUseCase = useAuthUseCase();
const signedInUser = authUseCase.getSignedInUser();

const tabs = [Tab.EVENT_POSITIONS, Tab.EVENT_DATA, Tab.EVENT_SLOTS];
const tab = ref<Tab>(Tab.EVENT_POSITIONS);
const event = ref<Event | null>(null);
const positions = ref<Map<PositionKey, Position>>(new Map<PositionKey, Position>());
const editSlotDialog = ref<Dialog<Slot> | null>(null);

const slots = computed<SlotTableItem[]>(() => {
    if (!event.value) {
        return [];
    }
    return event.value.slots.map((slot) => ({
        key: slot.key,
        name: slot.positionName,
        required: slot.required,
        position: positions.value.get(slot.positionKeys[0])!,
        alternativePositions: slot.positionKeys.map((it) => positions.value.get(it)).filter(ArrayUtils.filterUndefined),
        filled: eventService.isSlotFilled(event.value, slot.key),
    }));
});

async function init(): Promise<void> {
    await fetchPositions();
    await fetchEvent();
}

function formatDate(date?: Date): string {
    return date ? i18n.d(date, DateTimeFormat.DD_MM_YYYY) : '';
}

async function fetchPositions(): Promise<void> {
    positions.value = await usersUseCase.resolvePositionNames();
}

async function fetchEvent(): Promise<void> {
    const year = parseInt(route.params.year as string, 10);
    const key = route.params.key as string;
    event.value = await eventUseCase.getEventByKey(year, key);
}

function resetTeam(): void {
    if (event.value) {
        event.value.registrations.forEach((it) => (it.slotKey = undefined));
        event.value.assignedUserCount = 0;
    }
}

async function editSlot(slotkey: SlotKey): Promise<void> {
    let slot = event.value?.slots.find((it) => it.key === slotkey);
    try {
        slot = await editSlotDialog.value?.open(slot);
        if (event.value && slot) {
            event.value = eventService.updateSlot(event.value, slot);
        }
    } catch (e) {
        // ignore, dialog has been cancelled
    }
}

init();
</script>
