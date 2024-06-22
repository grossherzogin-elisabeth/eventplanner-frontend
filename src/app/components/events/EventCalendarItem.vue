<template>
    <div
        ref="root"
        class="calendar-event-wrapper"
        :style="{
            height: `calc(var(--row-height) * ${props.durationInMonth} - 3px)`,
            top: `calc(var(--row-height) * ${props.start})`,
        }"
    >
        <div class="calendar-event-entry" :class="`${$attrs.class}`" @click="showDropdown = true">
            <div class="flex items-center space-x-2">
                <span class="block w-full truncate" :title="props.event.name">
                    {{ props.event.name }}
                </span>
            </div>
            <template v-if="props.durationInMonth > 1">
                <span class="block w-full truncate text-xs font-normal"> {{ props.duration }} Tage </span>
                <span v-if="props.event.description" class="block w-full truncate text-xs font-normal">
                    {{ props.event.description }}
                </span>
            </template>
        </div>
        <VDropdownWrapper
            v-if="showDropdown"
            :anchor="$refs.root as HTMLElement"
            anchor-align-x="right"
            anchor-align-y="top"
            min-width="min(30rem, 95vw)"
            max-width="min(30rem, 95vw)"
            @close="showDropdown = false"
        >
            <div class="w-full px-2">
                <div class="rounded-2xl bg-white p-4 px-8 shadow-xl">
                    <div class="-mr-4 mb-4 flex items-center justify-end">
                        <button
                            class="rounded-lg px-2 py-1 hover:bg-gray-100"
                            title="Schließen"
                            @click="showDropdown = false"
                        >
                            <i class="fa-solid fa-close"></i>
                        </button>
                    </div>

                    <!-- title -->
                    <h2 class="mb-4 flex items-center space-x-4 text-lg">
                        <span>{{ props.event.name }}</span>
                    </h2>

                    <!-- state -->
                    <div
                        v-if="props.event.state === EventState.Canceled"
                        class="-mx-4 mb-4 flex items-center space-x-4 rounded-xl bg-red-100 px-4 py-3 text-red-500"
                    >
                        <i class="fa-solid fa-cancel" />
                        <p class="text-sm font-bold">{{ $t('app.event-details.note-canceled') }}</p>
                    </div>
                    <div
                        v-else-if="props.event.signedInUserAssignedPosition"
                        class="-mx-4 mb-4 flex items-center space-x-4 rounded-xl bg-green-200 px-4 py-3 text-green-800"
                    >
                        <i class="fa-solid fa-check" />
                        <p class="text-sm font-bold">{{ $t('app.event-details.note-assigned') }}</p>
                    </div>
                    <div
                        v-else-if="props.event.signedInUserWaitingListPosition"
                        class="-mx-4 mb-4 flex items-center space-x-4 rounded-xl bg-blue-300 px-4 py-3 text-blue-800"
                    >
                        <i class="fa-solid fa-clock" />
                        <p class="text-sm font-bold">{{ $t('app.event-details.note-waitinglist') }}</p>
                    </div>

                    <!-- info -->
                    <div class="mb-4">
                        <p class="flex items-center space-x-4">
                            <i class="fa-solid fa-calendar-day w-4 text-gray-700"></i>
                            <span v-if="formatDate(props.event.start) === formatDate(props.event.end)">
                                {{ formatDate(props.event.start) }}
                            </span>
                            <span v-else>
                                {{ formatDate(props.event.start) }} - {{ formatDate(props.event.end) }}
                            </span>
                        </p>
                        <p class="flex items-center space-x-4">
                            <i class="fa-solid fa-clock w-4 text-gray-700"></i>
                            <span>Crew an Board: 16:00 Uhr</span>
                        </p>
                        <p class="flex items-center space-x-4">
                            <i class="fa-solid fa-route w-4 text-gray-700"></i>
                            <span>300 Seemeilen (geschätzt)</span>
                        </p>
                        <p v-if="props.event.description" class="flex items-center space-x-4">
                            <i class="fa-solid fa-info-circle w-4 text-gray-700"></i>
                            <span>{{ props.event.description }}</span>
                        </p>
                    </div>

                    <!-- route -->
                    <div class="">
                        <p
                            v-for="(location, index) in props.event.locations"
                            :key="index"
                            class="flex items-center space-x-4"
                        >
                            <i class="fa-solid w-4" :class="location.icon" />
                            <span class="flex-grow">{{ location.name }}</span>
                            <CountryFlag
                                v-if="location.country"
                                :country="location.country"
                                class="border border-gray-200"
                            />
                        </p>
                    </div>

                    <!-- primary button -->
                    <div class="mt-4 flex justify-end space-x-2 xl:-mr-4">
                        <RouterLink
                            class="btn-ghost"
                            :to="{ name: Routes.EventDetails, params: { key: props.event.key } }"
                            title="Detailansicht"
                        >
                            <span class="mr-2">Details</span>
                            <i class="fa-solid fa-up-right-from-square"></i>
                        </RouterLink>
                    </div>
                </div>
            </div>
        </VDropdownWrapper>
    </div>
</template>
<script lang="ts" setup>
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { Event } from '@/app';
import { EventState, Routes } from '@/app';
import CountryFlag from '@/app/components/utils/CountryFlag.vue';
import { VDropdownWrapper } from '@/lib/components';
import { DateTimeFormat } from '@/shared/types';

interface Props {
    event: Event;
    duration: number;
    durationInMonth: number;
    start: number;
}

const props = defineProps<Props>();

const i18n = useI18n();
const route = useRoute();

const showDropdown = ref<boolean>(false);

function init(): void {
    watch(
        () => route.fullPath,
        () => (showDropdown.value = false)
    );
}

function formatDate(date: Date): string {
    return i18n.d(date, DateTimeFormat.Date);
}

init();
</script>

<style scoped>
.calendar-event-wrapper {
    @apply absolute left-0 right-0 top-px z-10;
    @apply rounded-lg bg-white;
    @apply overflow-hidden;
}
.calendar-event-entry {
    @apply block h-full w-full px-4 py-1 text-white sm:px-2;
    @apply cursor-pointer;
    @apply text-sm font-semibold;
    --color-1: rgb(255 255 255 / 0.4);
    --color-2: rgb(255 255 255 / 0.25);
    --pattern: linear-gradient(
        135deg,
        var(--color-1) 25%,
        var(--color-2) 25%,
        var(--color-2) 50%,
        var(--color-1) 50%,
        var(--color-1) 75%,
        var(--color-2) 75%,
        var(--color-2) 100%
    );
    background-size: 10px 10px;
}
.calendar-event-entry {
    @apply bg-blue-400 bg-opacity-75;
    @apply bg-primary-700 bg-opacity-75;
    @apply transition-all hover:pl-3;
}
.calendar-event-entry.full {
    background-image: var(--pattern);
}
.calendar-event-entry.assigned {
    @apply bg-green-700 bg-opacity-75;
}
.calendar-event-entry.work {
    @apply bg-indigo-400 bg-opacity-75;
}
.calendar-event-entry.waiting-list {
    @apply bg-green-700 bg-opacity-75;
    background-image: var(--pattern);
}
.calendar-event-entry.small {
    @apply flex items-center py-0;
    font-size: 0.6rem;
}
.calendar-event-entry.in-past {
    @apply bg-primary-800 bg-opacity-35;
}
</style>
