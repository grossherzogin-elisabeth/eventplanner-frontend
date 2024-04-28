<template>
    <div class="xl:overflow-auto">
        <div class="flex px-8 pb-8 md:px-16 xl:px-20">
            <div class="w-full xl:max-w-2xl">
                <div
                    class="sticky top-12 z-10 -mx-4 flex h-14 justify-end bg-primary-50 pb-2 pt-4 xl:top-0 xl:h-16 xl:pt-8"
                ></div>
                <div v-if="events.length === 0" class="-mx-4 rounded-2xl bg-primary-100 p-4">
                    <h3 class="mb-2">Keine zukünftigen Reisen</h3>
                    <p>Du hast dich bisher noch für keine Reise angemeldet</p>
                </div>
                <div v-else class="-mt-10">
                    <div v-for="entry in eventsByMonth.entries()" :key="entry[0]" class="pb-8">
                        <div class="pointer-events-none sticky top-16 z-10 flex pb-1 pt-2 xl:top-8">
                            <h2 class="inline-block">
                                {{ entry[0] }}
                            </h2>
                        </div>
                        <ul class="-mx-4">
                            <li v-for="event in entry[1]" :key="event.key" class="mt-4">
                                <EventCard :event="event" />
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="hidden w-96 flex-grow p-16 xl:block">
                <div class="sticky top-16 z-10">
                    <div class="ml-auto max-w-lg">
                        <!--                        <h2 class="text-sm pl-8 mb-4">News</h2>-->
                        <div v-for="i in 3" :key="i" class="mb-4 rounded-2xl bg-gray-200 p-8">
                            <div>
                                <h3>Newspost #{{ i }}</h3>
                                <p class="line-clamp-3">
                                    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod
                                    tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
                                    eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea
                                    takimata sanctus est Lorem ipsum dolor sit amet.
                                </p>
                            </div>
                        </div>
                    </div>
                    <!-- https://icons8.de/illustrations/style--daily -->
                    <!--                    <img src="https://ouch-cdn2.icons8.com/2SYnU_bK_BVVRKAxE-1J9RjgVuuBGw0cblRg9fmIXVQ/rs:fit:570:456/extend:false/wm:1:re:0:0:0.8/wmid:ouch/czM6Ly9pY29uczgu/b3VjaC1wcm9kLmFz/c2V0cy9zdmcvNTMz/LzQxODc3YTAxLTYx/ZTUtNGQwMi04MDlm/LTM4ODI4ZDc1OWUz/Yi5zdmc.png">-->
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Event } from '@/app';
import { Context } from '@/app/Context';
import EventCard from '@/app/components/events/EventCard.vue';
import { useContext } from '@/lib/composables';
import { DateTimeFormat } from '@/shared/types';

const ctx = useContext<Context>(Context);
const i18n = useI18n();
const user = ctx.auth.getSignedInUser();

const events = ref<Event[]>([]);
const searchterm = ref<string>('');

const filteredEvents = computed<Event[]>(() =>
    events.value.filter((it) => ctx.events.doesEventMatchFilter(it, searchterm.value))
);

const eventsByMonth = computed<Map<string, Event[]>>(() =>
    filteredEvents.value.reduce((map, it) => {
        const groupName = i18n.d(it.start, DateTimeFormat.MonthAndYear);
        const groupedEvents = map.get(groupName) || [];
        groupedEvents.push(it);
        map.set(groupName, groupedEvents);
        return map;
    }, new Map<string, Event[]>())
);

function init(): void {
    fetchEvents();
}

async function fetchEvents(): Promise<void> {
    events.value = await ctx.events.getFutureEventsByUser(user.key);
}

init();
</script>
