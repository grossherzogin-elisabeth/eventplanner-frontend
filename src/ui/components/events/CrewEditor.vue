<template>
    <div>
        <!-- position counters -->
        <div class="mb-8 flex flex-wrap gap-2 text-sm font-bold text-white">
            <div class="flex cursor-pointer items-center rounded-2xl bg-gray-500 p-1">
                <span class="px-2"> Alle </span>
                <span
                    class="flex h-5 w-5 items-center justify-center rounded-full bg-white bg-opacity-25 px-1 text-center text-xs"
                >
                    {{ props.event?.assignedUserCount }}
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
        <div class="grid grid-cols-2 gap-32">
            <div>
                <h2 class="mb-4">Crew</h2>
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
                            <span v-else-if="it.userKey" class="italic text-red-500">err: {{ it.userKey }}</span>
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
                <h2 class="mb-4">Warteliste</h2>
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
                            <span v-else-if="it.userKey" class="italic text-red-500"> err: {{ it.userKey }} </span>
                            <span class="flex-grow"></span>
                            <span :style="{ background: it.position.color }" class="position ml-auto">
                                {{ it.position.name }}
                            </span>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import type { Event, Position, PositionKey, ResolvedRegistration, ResolvedSlot } from '@/domain';
import { useUsersUseCase } from '@/ui/composables/Application';
import { useEventService } from '@/ui/composables/Domain';

enum DragSource {
    NONE = 'none',
    FROM_TEAM = 'team',
    FROM_WAITING_LIST = 'waitinglist',
}

interface Props {
    event: Event;
}

interface Emits {
    (e: 'update:event', value: Event): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const usersUseCase = useUsersUseCase();
const eventService = useEventService();

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
    fetchTeam();
    watch(props.event.registrations, () => fetchTeam(), { deep: true });
    watch(props.event.slots, () => fetchTeam(), { deep: true });
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

function handleDragOver(dragEvent: DragEvent) {
    if (dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        dragEvent.dataTransfer.dropEffect = 'link';
    }
}

async function handleDragStopAddToTeam(dragEvent: DragEvent) {
    dragSource.value = DragSource.NONE;
    if (dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        const registration: ResolvedRegistration = JSON.parse(dragEvent.dataTransfer.getData('application/json'));
        const user = await usersUseCase.resolveRegistrationUser(registration);

        const slot = eventService
            .getOpenSlots(props.event)
            .find((it) => it.positionKeys.includes(registration.positionKey));
        if (!slot) {
            alert('Das geht nicht');
        } else if (user) {
            emit('update:event', eventService.assignUserToSlot(props.event, user, slot.key));
        } else {
            emit('update:event', eventService.assignGuestToSlot(props.event, registration.name, slot.key));
        }
    }
}

async function handleDragStopRemoveFromTeam(dragEvent: DragEvent) {
    dragSource.value = DragSource.NONE;
    if (dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        const slot: ResolvedSlot = JSON.parse(dragEvent.dataTransfer.getData('application/json'));
        if (slot) {
            emit('update:event', eventService.unassignSlot(props.event, slot.key));
        }
    }
}

async function handleDragStopCancelRegistration(dragEvent: DragEvent) {
    dragSource.value = DragSource.NONE;
    if (dragEvent.dataTransfer) {
        dragEvent.preventDefault();
        const slot: ResolvedSlot = JSON.parse(dragEvent.dataTransfer.getData('application/json'));
        if (slot.userKey) {
            emit('update:event', eventService.cancelUserRegistration(props.event, slot.userKey));
        } else if (slot.userName) {
            emit('update:event', eventService.cancelGuestRegistration(props.event, slot.userName));
        }
    }
}

async function fetchPositions(): Promise<void> {
    position.value = await usersUseCase.resolvePositionNames();
}

async function fetchTeam(): Promise<void> {
    console.log('fetch team');
    const resolvedSlots = await usersUseCase.resolveEventSlots(props.event);
    team.value = resolvedSlots.filter((it) => it.userName || it.userKey || it.required);
    registrations.value = await usersUseCase.resolveWaitingList(props.event);
}

init();
</script>
