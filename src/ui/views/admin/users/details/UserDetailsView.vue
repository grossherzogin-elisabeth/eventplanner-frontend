<template>
    <div class="flex h-full flex-1 flex-col xl:overflow-y-scroll">
        <div class="bg-primary-50">
            <div class="z-10 flex items-center space-x-4 px-4 pb-4 pt-6 md:px-12 xl:px-20">
                <div class="-ml-14 hidden xl:block">
                    <RouterLink :to="{ name: Routes.UsersList }" class="btn-back">
                        <i class="fa-solid fa-arrow-left"></i>
                    </RouterLink>
                </div>
                <div>
                    <h1>{{ user?.firstName }} {{ user?.lastName }} bearbeiten</h1>
                    <p v-if="user && signedInUser.key === user.key" class="mt-1 text-sm">Das bist du!</p>
                </div>
                <div class="flex-grow"></div>
                <div v-if="user" class="hidden items-stretch justify-end space-x-2 xl:flex">
                    <button
                        v-if="signedInUser.permissions.includes(Permission.WRITE_USERS)"
                        class="btn-primary flex-grow"
                    >
                        <i class="fa-solid fa-save"></i>
                        <span>Speichern</span>
                    </button>
                    <ContextMenuButton class="btn-secondary">
                        <ul class="space-y-3 font-bold">
                            <!--                    <li class="space-x-4">-->
                            <!--                        <i class="fa-solid fa-key"></i>-->
                            <!--                        <span>Login erstellen</span>-->
                            <!--                    </li>-->
                            <li class="space-x-4">
                                <i class="fa-solid fa-key"></i>
                                <span>Passwort zurücksetzen</span>
                            </li>
                            <li class="space-x-4">
                                <i class="fa-solid fa-ban"></i>
                                <span>Login deaktivieren</span>
                            </li>
                            <li class="space-x-4">
                                <i class="fa-solid fa-user-plus"></i>
                                <span>Zu Reise hinzufügen</span>
                            </li>
                        </ul>
                    </ContextMenuButton>
                </div>
            </div>
        </div>
        <!-- tabs -->
        <VTabs v-model="tab" :tabs="tabs" class="sticky top-12 z-10 bg-primary-50 pt-4 xl:top-0">
            <template #[Tab.USER_DATA]>
                <div class="space-y-8 xl:space-y-16">
                    <section v-if="user" class="-mx-4">
                        <div class="mb-2 md:w-1/4">
                            <VInputLabel>Geschlecht</VInputLabel>
                            <VInputSelect :options="genderOptions" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Vorname</VInputLabel>
                            <VInputText v-model="user.firstName" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Zweiter Vorname</VInputLabel>
                            <VInputText v-model="user.secondName" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Nachname</VInputLabel>
                            <VInputText v-model="user.lastName" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Geboren am</VInputLabel>
                            <VInputDate v-model="user.dateOfBirth" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Geburtsort</VInputLabel>
                            <VInputText v-model="user.placeOfBirth" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Pass Nummer</VInputLabel>
                            <VInputText v-model="user.passNr" required />
                        </div>
                    </section>
                </div>
            </template>
            <template #[Tab.USER_CONTACT_DATA]>
                <div class="space-y-8 xl:space-y-16">
                    <section v-if="user" class="-mx-4">
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Email</VInputLabel>
                            <VInputText v-model="user.email" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Telefon</VInputLabel>
                            <VInputText v-model="user.phone" />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Mobil</VInputLabel>
                            <VInputText v-model="user.mobile" />
                        </div>
                        <div class="mb-2 mt-16 md:w-1/2">
                            <VInputLabel>Straße, Hausnr</VInputLabel>
                            <VInputText v-model="user.address.addressLine1" required />
                        </div>
                        <div class="mb-2 md:w-1/2">
                            <VInputLabel>Adresszusatz</VInputLabel>
                            <VInputText v-model="user.address.addressLine2" />
                        </div>
                        <div class="flex space-x-4 md:w-1/2">
                            <div class="mb-2 w-24">
                                <VInputLabel>PLZ</VInputLabel>
                                <VInputText v-model="user.address.zipcode" required />
                            </div>
                            <div class="mb-2 flex-grow">
                                <VInputLabel>Ort</VInputLabel>
                                <VInputText v-model="user.address.town" required />
                            </div>
                        </div>
                    </section>
                </div>
            </template>
            <template #[Tab.USER_EVENTS]>
                <div class="-mx-4 space-y-4 md:hidden">
                    <div v-for="item in events" :key="item.eventKey" class="space-y-2 rounded-xl bg-primary-100 p-4">
                        <p class="text-sm font-light">{{ item.start }} / {{ item.duration }} Tage</p>
                        <RouterLink
                            :to="{
                                name: Routes.EventDetails,
                                params: { year: item.startDate.getFullYear(), key: item.eventKey },
                            }"
                            class="hover:text-primary-600"
                        >
                            {{ item.name }}
                        </RouterLink>
                        <p class="text-sm font-light">{{ item.locations }}</p>
                        <div
                            :class="{ 'opacity-50': item.waitingList }"
                            :style="{ background: item.position.color }"
                            class="position inline-flex items-center space-x-2"
                        >
                            <span>{{ item.positionName }}</span>
                            <i v-if="item.waitingList" class="fa-solid fa-clock"></i>
                        </div>
                    </div>
                </div>
                <VTable :items="events" :page-size="-1" class="hidden md:table">
                    <template #head>
                        <th class="w-1/2" data-sortby="name">Reise</th>
                        <th class="w-1/6" data-sortby="startDate">Datum</th>
                        <th class="w-1/6" data-sortby="duration">Dauer</th>
                        <th class="w-1/6" data-sortby="position.name">Position</th>
                        <th class="w-0"></th>
                    </template>
                    <template #row="{ item }">
                        <td :class="{ 'opacity-50': item.isPastEvent }" class="w-full border-none font-semibold">
                            <RouterLink
                                :to="{
                                    name: Routes.EventDetails,
                                    params: { year: item.startDate.getFullYear(), key: item.eventKey },
                                }"
                                class="hover:text-primary-600"
                            >
                                {{ item.name }}
                            </RouterLink>
                            <p class="text-sm font-light">{{ item.locations }}</p>
                        </td>
                        <td :class="{ 'opacity-50': item.isPastEvent }" class="hidden md:table-cell">
                            {{ item.start }}
                        </td>
                        <td :class="{ 'opacity-50': item.isPastEvent }" class="hidden md:table-cell">
                            {{ item.duration }} Tage
                        </td>
                        <td class="hidden md:table-cell">
                            <div
                                :class="{ 'opacity-50': item.waitingList }"
                                :style="{ background: item.position.color }"
                                class="position inline-flex items-center space-x-2"
                            >
                                <span>{{ item.positionName }}</span>
                                <i v-if="item.waitingList" class="fa-solid fa-clock"></i>
                            </div>
                        </td>
                        <td class="hidden md:table-cell">
                            <button class="btn-toolbar text-gray-500 hover:text-red-600">
                                <i class="fa-solid fa-xmark-circle"></i>
                            </button>
                        </td>
                    </template>
                </VTable>
            </template>
            <template #[Tab.USER_CERTIFICATES]>
                <div class="space-y-8 overflow-x-auto xl:space-y-16">
                    Hier stehen später einmal Positionen, Zertifikate und sonstige Qualifikationen
                </div>
            </template>
        </VTabs>
        <div
            v-if="user && signedInUser.key !== user.key"
            class="fixed bottom-0 right-0 flex justify-end pb-4 pr-4 xl:px-16"
        >
            <button class="btn-primary btn-floating" @click="impersonateUser()">
                <i class="fa-solid fa-user-check"></i>
                <span>Impersonate</span>
            </button>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ArrayUtils } from '@/common';
import { DateTimeFormat } from '@/common/date';
import type { InputSelectOption, Position, UserDetails } from '@/domain';
import { Permission } from '@/domain';
import {
    ContextMenuButton,
    VInputDate,
    VInputLabel,
    VInputSelect,
    VInputText,
    VTable,
    VTabs,
} from '@/ui/components/common';
import {
    useAuthUseCase,
    useEventUseCase,
    useUserAdministrationUseCase,
    useUsersUseCase,
} from '@/ui/composables/Application';
import { Routes } from '@/ui/views/Routes';

enum Tab {
    USER_DATA = 'app.user-details.tab.data',
    USER_CONTACT_DATA = 'app.user-details.tab.contact',
    USER_CERTIFICATES = 'app.user-details.tab.certificates',
    USER_EVENTS = 'app.user-details.tab.events',
}

interface EventTableViewItem {
    eventKey: string;
    name: string;
    locations: string;
    start: string;
    end: string;
    startDate: Date;
    endDate: Date;
    duration: number;
    position: Position;
    positionName?: string;
    waitingList: boolean;
    isPastEvent: boolean;
}

const route = useRoute();
const i18n = useI18n();
const userAdministrationUseCase = useUserAdministrationUseCase();
const usersUseCase = useUsersUseCase();
const eventsUseCase = useEventUseCase();
const authUseCase = useAuthUseCase();
const signedInUser = authUseCase.getSignedInUser();

const tabs = [Tab.USER_DATA, Tab.USER_CONTACT_DATA, Tab.USER_CERTIFICATES, Tab.USER_EVENTS];
const tab = ref<Tab>(Tab.USER_DATA);
const user = ref<UserDetails | null>(null);
const events = ref<EventTableViewItem[]>([]);

const genderOptions: InputSelectOption[] = [
    { value: 'm', label: 'männlich' },
    { value: 'f', label: 'weiblich' },
    { value: 'd', label: 'divers' },
];

function init(): void {
    fetchUser();
    fetchUserEvents();
}

async function fetchUser(): Promise<void> {
    const key = route.params.key as string;
    user.value = await userAdministrationUseCase.getUserDetailsByKey(key);
}

async function fetchUserEvents(): Promise<void> {
    const userKey = route.params.key as string;
    const year = new Date().getFullYear();
    const evts = await eventsUseCase.getEventsByUser(year, userKey);
    const positions = await usersUseCase.resolvePositionNames();
    events.value = evts
        .map((evt) => {
            const registration = evt.registrations.find((it) => it.userKey === userKey);
            const slot = evt.slots.find((it) => it.key === registration?.slotKey);
            const position = positions.get(registration?.positionKey || '');
            if (position) {
                return {
                    eventKey: evt.key,
                    name: evt.name,
                    start: i18n.d(evt.start, DateTimeFormat.Date),
                    startDate: evt.start,
                    end: i18n.d(evt.end, DateTimeFormat.Date),
                    endDate: evt.end,
                    duration: new Date(evt.end.getTime() - evt.start.getTime()).getDate(),
                    position: position,
                    positionName: slot?.positionName || position.name,
                    waitingList: slot === undefined,
                    locations: evt.locations.map((it) => it.name).join(' - '),
                    isPastEvent: evt.start.getTime() < new Date().getTime(),
                };
            }
            console.warn('Failed to get users position');
            return undefined;
        })
        .filter(ArrayUtils.filterUndefined);
}

function impersonateUser() {
    if (user.value) {
        localStorage.setItem('eventplanner.overrideSignedInUserKey', user.value.key);
        window.location.reload();
    }
}

init();
</script>
