<template>
    <div class="flex h-full flex-1 flex-col xl:overflow-y-scroll">
        <div class="absolute left-6 top-6 z-20 hidden xl:block">
            <BackButton :to="{ name: Routes.Events }" />
        </div>
        <div
            class="sticky top-12 z-10 hidden items-center space-x-4 bg-primary-50 bg-opacity-80 px-8 pb-8 pt-8 backdrop-blur md:flex md:px-16 xl:top-0 xl:px-20"
        >
            <div class="w-0 flex-grow">
                <h1 class="mb-2 w-full truncate">{{ event?.name }}</h1>
                <p class="text-sm font-semibold text-gray-500">
                    {{ formatDateRange(event?.start, event?.end) }}
                </p>
            </div>
            <div v-if="event" class="flex items-stretch justify-end space-x-2">
                <RouterLink
                    v-if="user.permissions.includes(Permission.WRITE_EVENTS)"
                    :to="{ name: Routes.EventEdit }"
                    class="btn-secondary"
                >
                    <i class="fa-solid fa-edit"></i>
                </RouterLink>
                <button class="btn-secondary" @click="eventUseCase.downloadCalendarEntry(event)">
                    <i class="fa-solid fa-calendar-alt"></i>
                </button>
                <template v-if="user.permissions.includes(Permission.EVENT_TEAM_WRITE_SELF)">
                    <button
                        v-if="event.signedInUserAssignedPosition"
                        class="btn-danger flex-grow whitespace-nowrap"
                        @click="leaveEvent(event)"
                    >
                        <i class="fa-solid fa-cancel"></i>
                        <span>Reise absagen</span>
                    </button>
                    <button
                        v-else-if="event.signedInUserWaitingListPosition"
                        class="btn-danger flex-grow whitespace-nowrap"
                        @click="leaveEvent(event)"
                    >
                        <i class="fa-solid fa-user-minus"></i>
                        <span>Abmelden</span>
                    </button>
                    <button v-else class="btn-primary flex-grow whitespace-nowrap" @click="joinEvent(event)">
                        <i class="fa-solid fa-user-plus"></i>
                        <span>Anmelden</span>
                    </button>
                </template>
            </div>
        </div>
        <teleport to="#nav-right">
            <div class="flex items-center py-2 md:hidden">
                <ContextMenuButton class="-mr-6 -mt-2 pr-6 pt-2">
                    <template #default>
                        <ul>
                            <li
                                v-if="event"
                                class="context-menu-item"
                                @click="eventUseCase.downloadCalendarEntry(event)"
                            >
                                <i class="fa-solid fa-calendar-alt w-6"></i>
                                <span>Kalendereintrag erstellen</span>
                            </li>
                            <li v-if="user.permissions.includes(Permission.WRITE_EVENTS)">
                                <RouterLink :to="{ name: Routes.EventEdit }" class="context-menu-item">
                                    <i class="fa-solid fa-edit w-6"></i>
                                    <span>Reise bearbeiten</span>
                                </RouterLink>
                            </li>
                            <li class="context-menu-item">
                                <i class="fa-solid fa-bell w-6"></i>
                                <span>Ein cooles Feature</span>
                            </li>
                            <li class="context-menu-item">
                                <i class="fa-solid fa-star w-6"></i>
                                <span>Noch ein cooles Feature</span>
                            </li>
                        </ul>
                    </template>
                </ContextMenuButton>
            </div>
        </teleport>
        <div
            v-if="event"
            class="gap-x-20 gap-y-8 space-y-8 px-8 pb-8 pt-6 md:grid md:grid-cols-2 md:space-y-0 md:px-16 xl:px-20"
        >
            <!-- state info banner -->
            <section v-if="state" class="col-start-2 -mx-4 xl:mx-0">
                <div class="top-18 fixed left-4 right-4 overflow-hidden rounded-2xl bg-white md:static">
                    <div :class="state.color">
                        <div class="flex items-center space-x-4 px-4 py-4 lg:px-8">
                            <i :class="state.icon" class="fa-solid" />
                            <!-- eslint-disable-next-line vue/no-v-html -->
                            <p class="text-sm font-bold" v-html="state.text"></p>
                        </div>
                    </div>
                </div>
                <div class="h-16 md:hidden"></div>
            </section>

            <!-- details -->
            <section class="-mx-4 md:col-start-2 xl:mx-0">
                <h2 class="mb-2 ml-4 lg:ml-8">
                    {{ $t('app.event-details.title') }}
                </h2>
                <div class="space-y-1 rounded-2xl bg-primary-100 p-4 lg:px-8">
                    <p class="flex items-center space-x-4">
                        <i class="fa-solid fa-tag w-4 text-gray-700"></i>
                        <span>{{ event.name }}</span>
                    </p>
                    <p class="flex items-center space-x-4">
                        <i class="fa-solid fa-calendar-day w-4 text-gray-700"></i>
                        <span>{{ formatDateRange(event.start, event.end) }}</span>
                    </p>
                    <p class="flex items-center space-x-4">
                        <i class="fa-solid fa-clock w-4 text-gray-700"></i>
                        <span>Crew an Board: 16:00 Uhr</span>
                    </p>
                    <!--                    <p class="flex items-center space-x-4">-->
                    <!--                        <i class="fa-solid fa-route w-4 text-gray-700"></i>-->
                    <!--                        <span>300 Seemeilen (geschätzt)</span>-->
                    <!--                    </p>-->
                    <p class="flex items-center space-x-4">
                        <i class="fa-solid fa-users w-4 text-gray-700"></i>
                        <span v-if="event.assignedUserCount && waitingListCount">
                            {{ event.assignedUserCount }} Crew, {{ waitingListCount }} Warteliste
                        </span>
                        <span v-else-if="event.assignedUserCount"> {{ event.assignedUserCount }} Crew </span>
                        <span v-else> {{ event.registrations.length }} Anmeldungen </span>
                    </p>
                    <p v-if="event.description" class="flex items-center space-x-4">
                        <i class="fa-solid fa-info-circle w-4 text-gray-700"></i>
                        <span>{{ event.description }}</span>
                    </p>
                </div>
            </section>

            <!-- route -->
            <section class="-mx-4 md:col-start-2 xl:mx-0">
                <h2 v-if="event.locations.length === 1" class="mb-2 ml-4 lg:ml-8">Ort</h2>
                <h2 v-else class="mb-2 ml-4 lg:ml-8">Route</h2>
                <div class="space-y-1 rounded-2xl bg-primary-100 p-4 lg:px-8">
                    <div v-if="event.locations.length === 0">
                        <i>Wird noch bekannt gegeben</i>
                    </div>
                    <div
                        v-for="(stop, portIndex) in event.locations"
                        v-else
                        :key="portIndex"
                        class="flex items-center space-x-4"
                    >
                        <i :class="stop.icon" class="fa-solid w-4" />
                        <span class="flex-grow">{{ stop.name }}</span>
                        <CountryFlag v-if="stop.country" :country="stop.country" class="border border-gray-200" />
                    </div>
                </div>
            </section>

            <!-- crew -->
            <section class="col-start-1 row-span-6 -mx-4 md:row-start-1 md:mx-0">
                <h2 v-if="event.state !== EventState.OpenForSignup" class="mb-2 ml-4 flex space-x-4 md:mb-6 md:ml-0">
                    <button :class="{ 'text-primary-600 underline': tab === Tab.Team }" @click="tab = Tab.Team">
                        Crew ({{ event.assignedUserCount }})
                    </button>
                    <button
                        :class="{ 'text-primary-600 underline': tab === Tab.WaitingList }"
                        @click="tab = Tab.WaitingList"
                    >
                        Warteliste ({{ waitingListCount }})
                    </button>
                </h2>
                <h2 v-else class="mb-2 ml-4 flex space-x-4 md:mb-6 md:ml-0">
                    <span>Anmeldungen</span>
                </h2>
                <div class="rounded-2xl bg-primary-100 p-4 md:rounded-none md:bg-transparent md:p-0">
                    <template v-if="tab === Tab.Team">
                        <ul class="space-y-2">
                            <template v-for="(it, index) in team" :key="index">
                                <li class="flex items-center space-x-2 md:space-x-4">
                                    <i v-if="it.userName" class="fa-solid fa-user-circle text-gray-500"></i>
                                    <i v-else class="fa-solid fa-user-circle text-red-500"></i>
                                    <RouterLink
                                        v-if="it.userName && user.permissions.includes(Permission.READ_USER_DETAILS)"
                                        :to="{ name: Routes.UserDetails, params: { key: it.userKey } }"
                                        class="truncate"
                                    >
                                        {{ it.userName }}
                                    </RouterLink>
                                    <span v-else-if="it.userName" class="truncate">{{ it.userName }}</span>
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
                    </template>
                    <template v-else-if="tab === Tab.WaitingList">
                        <ul class="space-y-2">
                            <li
                                v-for="(it, index) in waitingList"
                                :key="index"
                                class="flex items-center justify-between space-x-2 md:space-x-4"
                            >
                                <i class="fa-solid fa-user-circle text-gray-500"></i>
                                <span class="flex-grow">{{ it.name }}</span>
                                <span :style="{ background: it.position.color }" class="position">
                                    {{ it.position.name }}
                                </span>
                            </li>
                        </ul>
                        <div
                            v-if="waitingList.length === 0"
                            class="-mx-4 -mt-4 rounded-xl bg-primary-100 p-4 text-sm lg:-mx-8 lg:px-8"
                        >
                            <p v-if="event.state === EventState.OpenForSignup">
                                Für diesen Termin gibt es noch keine Anmeldungen.
                            </p>
                            <p v-else>Für diesen Termin gibt es keine Anmeldungen auf der Warteliste.</p>
                        </div>
                    </template>
                </div>
            </section>

            <!-- documents -->
            <section class="-mx-4 hidden md:col-start-2 xl:mx-0">
                <h2 class="mb-2 ml-4 lg:ml-8">Dokumente</h2>
                <div class="rounded-2xl bg-primary-100 p-4 lg:px-8">
                    <p v-for="doc in documentsMock" :key="doc" class="mb-1 flex items-center space-x-4">
                        <i class="fa-solid fa-file-pdf w-4 text-gray-700"></i>
                        <span>{{ doc }}</span>
                    </p>
                </div>
            </section>

            <!-- sticky add / remove user buttons -->
            <div class="fixed bottom-0 right-0 flex justify-end pb-4 pr-3 md:hidden">
                <button
                    v-if="event.signedInUserAssignedPosition"
                    class="btn-danger btn-floating"
                    @click="leaveEvent(event)"
                >
                    <i class="fa-solid fa-cancel"></i>
                    <span>Reise absagen</span>
                </button>
                <button
                    v-else-if="event.signedInUserWaitingListPosition"
                    class="btn-danger btn-floating"
                    @click="leaveEvent(event)"
                >
                    <i class="fa-solid fa-user-minus"></i>
                    <span>Warteliste verlassen</span>
                </button>
                <button v-else class="btn-primary btn-floating" @click="joinEvent(event)">
                    <i class="fa-solid fa-user-plus"></i>
                    <span>Anmelden</span>
                </button>
            </div>
            <div class="h-5 md:hidden"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Event, EventState, Permission, Position, PositionKey, ResolvedRegistration, ResolvedSlot } from '@/domain';
import { ContextMenuButton } from '@/ui/components/common';
import BackButton from '@/ui/components/utils/BackButton.vue';
import CountryFlag from '@/ui/components/utils/CountryFlag.vue';
import { useAuthUseCase, useEventUseCase, useUsersUseCase } from '@/ui/composables/Application';
import { formatDateRange } from '@/ui/composables/DateRangeFormatter';
import { Routes } from '@/ui/views/Routes';

interface State {
    text: string;
    icon: string;
    color?: string;
}

enum Tab {
    Team = 'team',
    WaitingList = 'waitinglist',
}

const i18n = useI18n();
const route = useRoute();
const authUseCase = useAuthUseCase();
const eventUseCase = useEventUseCase();
const usersUseCase = useUsersUseCase();
const user = authUseCase.getSignedInUser();

const event = ref<Event | null>(null);
const tab = ref<Tab>(Tab.Team);
const ownPosition = ref<Position | null>(null);
const documentsMock = ['Kammerplan', 'Wachplan', 'Getränkeliste Crew'];

const position = ref<Map<PositionKey, Position>>(new Map<PositionKey, Position>());
const waitingList = ref<ResolvedRegistration[]>([]);
const team = ref<ResolvedSlot[]>([]);

const state = computed<State | null>(() => {
    if (event.value?.state === EventState.Canceled) {
        return {
            text: i18n.t('app.event-details.note-canceled'),
            icon: 'fa-cancel',
            color: 'bg-red-500 bg-opacity-25 text-red-500',
        };
    }
    if (event.value?.signedInUserAssignedPosition !== undefined) {
        return {
            text: ownPosition.value
                ? i18n.t('app.event-details.note-assigned-position', { position: ownPosition.value.name })
                : i18n.t('app.event-details.note-assigned'),
            icon: 'fa-check',
            color: 'bg-green-200 text-green-800',
        };
    }
    if (event.value?.signedInUserWaitingListPosition) {
        return {
            text: ownPosition.value
                ? i18n.t('app.event-details.note-waitinglist-position', { position: ownPosition.value.name })
                : i18n.t('app.event-details.note-waitinglist'),
            icon: 'fa-clock',
            color: 'bg-yellow-100 text-yellow-900',
        };
    }
    return null;
});

const waitingListCount = computed<number>(() => {
    if (!event.value) return 0;
    return event.value.registrations.length - event.value.assignedUserCount;
});

function init(): void {
    fetchPositions();
    fetchEvent();
}

async function fetchPositions(): Promise<void> {
    position.value = await usersUseCase.resolvePositionNames();
}

async function fetchEvent(): Promise<void> {
    const key = route.params.key as string;
    const year = parseInt(route.params.year as string, 10) || new Date().getFullYear();
    event.value = await eventUseCase.getEventByKey(year, key);
    if (event.value.state === EventState.OpenForSignup) {
        tab.value = Tab.WaitingList;
    }
    await fetchTeam(event.value);
}

async function fetchTeam(event: Event): Promise<void> {
    const slots = await usersUseCase.resolveEventSlots(event);
    team.value = slots.filter((it) => it.required || it.userName);
    waitingList.value = await usersUseCase.resolveWaitingList(event);
}

async function joinEvent(evt: Event): Promise<void> {
    // TODO get real user position
    event.value = await eventUseCase.joinEvent(evt, 'deckshand');
    await fetchTeam(event.value);
}

async function leaveEvent(evt: Event): Promise<void> {
    event.value = await eventUseCase.leaveEvent(evt);
    await fetchTeam(event.value);
}

init();
</script>
