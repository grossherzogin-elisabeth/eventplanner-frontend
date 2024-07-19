<template>
    <RouterLink
        :to="{ name: Routes.EventDetails, params: { year: props.event.start.getFullYear(), key: props.event.key } }"
        class="block hover:no-underline"
    >
        <div
            class="overflow-hidden rounded-2xl bg-primary-100 text-primary-950 transition-all hover:bg-primary-200 hover:shadow"
        >
            <div class="flex flex-col px-4 py-3">
                <h3 class="mb-2 flex items-center space-x-2">
                    <span v-if="props.event.state === EventState.Canceled" class="text-red-500 line-through">
                        {{ props.event.name }}
                    </span>
                    <span v-else>{{ event.name }}</span>
                </h3>
                <p class="mb-4 flex text-sm">
                    <span class="flex-grow">
                        {{ formatDate(props.event.start) }} - {{ formatDate(props.event.end) }}
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

            <div v-if="props.event.state === EventState.Canceled" class="mb-2 flex px-4 py-2">
                <p class="flex items-center space-x-2 text-red-600">
                    <i class="fa-solid fa-circle-xmark w-4" />
                    <span class="text-sm font-bold">{{ $t('app.event-details.note-canceled') }}</span>
                </p>
            </div>
            <div v-else-if="props.event.signedInUserWaitingListPosition" class="mb-2 flex px-4 py-2">
                <p class="flex items-center space-x-2 text-orange-400">
                    <i class="fa-solid fa-circle-info w-4" />
                    <span class="text-sm font-bold">{{ $t('app.event-details.note-waitinglist') }}</span>
                </p>
            </div>
        </div>
    </RouterLink>
</template>
<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { DateTimeFormat } from '@/common/date';
import type { Event } from '@/domain';
import { EventState } from '@/domain';
import CountryFlag from '@/ui/components/utils/CountryFlag.vue';
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
