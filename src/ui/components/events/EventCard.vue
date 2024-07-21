<template>
    <RouterLink
        :to="{ name: Routes.EventDetails, params: { year: props.event.start.getFullYear(), key: props.event.key } }"
        class="block hover:no-underline"
    >
        <div class="overflow-hidden rounded-xl hover:shadow-lg">
            <div
                class="event-card"
                :class="{
                    'assigned': props.event.signedInUserAssignedPosition,
                    'bg-striped': props.event.signedInUserWaitingListPosition,
                }"
            >
                <div class="flex flex-col px-4 py-3">
                    <h3 class="mb-2 flex items-center space-x-2">
                        <span class="">{{ event.name }}</span>
                    </h3>
                    <p class="mb-4 flex text-sm">
                        <span class="flex-grow">
                            {{ formatDateRange(props.event.start, props.event.end) }}
                        </span>
                        <span>{{ props.event.assignedUserCount }} Crew</span>
                    </p>
                    <div class="flex flex-col flex-wrap justify-between">
                        <div
                            v-for="(location, index) in props.event.locations"
                            :key="index"
                            class="flex items-center space-x-2"
                        >
                            <i :class="location.icon" class="fa-solid w-4" />
                            <span class="flex-grow">{{ location.name }}</span>
                            <CountryFlag
                                v-if="location.country"
                                :country="location.country"
                                class="border border-gray-200"
                            />
                        </div>
                    </div>
                </div>

                <div
                    v-if="props.event.signedInUserWaitingListPosition"
                    class="mb-2 flex rounded-xl bg-blue-500 bg-opacity-15 px-4 py-2"
                >
                    <p class="flex items-center space-x-2 text-blue-700">
                        <i class="fa-solid fa-circle-info w-4" />
                        <span class="text-sm font-bold">{{ $t('app.event-details.note-waitinglist') }}</span>
                    </p>
                </div>
            </div>
        </div>
    </RouterLink>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { DateTimeFormat } from '@/common/date';
import type { Event } from '@/domain';
import CountryFlag from '@/ui/components/utils/CountryFlag.vue';
import { formatDateRange } from '@/ui/composables/DateRangeFormatter';
import { Routes } from '@/ui/views/Routes';

interface Props {
    event: Event;
}

const props = defineProps<Props>();

const i18n = useI18n();

function formatDate(date: Date): string {
    return i18n.d(date, DateTimeFormat.DD_MM_YYYY);
}
</script>
