<template>
    <div class="flex h-full flex-1 flex-col">
        <div class="relative flex h-full flex-1 items-stretch">
            <div class="absolute left-2 top-1 z-30 hidden h-10 w-10 lg:block xl:-top-2">
                <button class="btn-back h-full w-full" @click="scrollLeft()">
                    <i class="fa-solid fa-chevron-left"></i>
                </button>
            </div>
            <div class="absolute right-6 top-1 z-30 hidden h-10 w-10 lg:block xl:-top-2">
                <button class="btn-back h-full w-full" @click="scrollRight()">
                    <i class="fa-solid fa-chevron-right"></i>
                </button>
            </div>
            <div ref="calendar" class="calendar" :style="calendarStyle">
                <div v-for="m in months.entries()" :key="m[0]" class="calendar-month">
                    <div class="calendar-header">
                        <span>{{ $t(`month.${m[0]}`) }}</span>
                        <span class="ml-2 sm:hidden">{{ events[0]?.end.getFullYear() }}</span>
                    </div>
                    <div
                        v-for="d in m[1]"
                        :key="d.dayOfMonth"
                        class="calendar-day"
                        :class="{ weekend: d.isWeekend, holiday: d.isHoliday }"
                    >
                        <div class="calendar-day-label">{{ d.weekday }}</div>
                        <div class="calendar-day-label">{{ d.dayOfMonth }}</div>
                        <div class="relative w-0 flex-grow self-start">
                            <EventCalendarItem
                                v-for="evt in d.events"
                                :key="evt.event.key"
                                :event="evt.event"
                                :duration="evt.duration"
                                :duration-in-month="evt.durationInMonth"
                                :start="evt.offset"
                                :class="evt.class"
                            />
                        </div>
                    </div>
                    <div v-for="i in 31 - m[1].length" :key="i" class="calendar-filler"></div>
                </div>
            </div>
            <div class="hidden h-full flex-col space-y-4 border-l border-gray-300 px-2 py-4">
                <ContextMenuButton class="btn-toolbar">
                    <template #icon>
                        <i class="fa-solid fa-filter text-gray-700" />
                    </template>
                    <template #default>
                        <ul class="space-y-3 font-bold">
                            <li
                                class="flex cursor-pointer items-center justify-start space-x-2"
                                @click="emit('update:quick-filter', EventQuickFilter.All)"
                            >
                                <i class="fa-solid fa-route w-8"></i>
                                <span>Alle Reisen</span>
                            </li>
                            <li
                                class="flex cursor-pointer items-center justify-start space-x-2"
                                @click="emit('update:quick-filter', EventQuickFilter.MyEvents)"
                            >
                                <i class="fa-solid fa-check-to-slot w-8"></i>
                                <span>Meine Reisen</span>
                            </li>
                            <li
                                class="flex cursor-pointer items-center justify-start space-x-2"
                                @click="emit('update:quick-filter', EventQuickFilter.FreeSlots)"
                            >
                                <i class="fa-solid fa-info w-8"></i>
                                <span>Offene Crew Plätze</span>
                            </li>
                        </ul>
                    </template>
                </ContextMenuButton>
                <button class="btn-toolbar">
                    <i class="fa-solid fa-calendar-alt" />
                </button>
                <button class="btn-toolbar">
                    <i class="fa-solid fa-table" />
                </button>
                <button class="btn-toolbar">
                    <i class="fa-solid fa-download" />
                    <!--                        <i class="fa-solid fa-file-csv" />-->
                </button>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Context } from '@/app/Context';
import ContextMenuButton from '@/app/components/utils/ContextMenuButton.vue';
import type { Event } from '@/app/types';
import { EventQuickFilter } from '@/app/types';
import { isHoliday } from 'feiertagejs';
import { useContext } from '@/lib/composables';
import { DateUtils, Month } from '@/lib/utils';
import { DateTimeFormat } from '@/shared/types';
import EventCalendarItem from './EventCalendarItem.vue';

interface Props {
    events: Event[];
}

interface Emits {
    (e: 'update:quick-filter', value: EventQuickFilter): void;
}

interface CalendarDay {
    dayOfMonth: number;
    weekday: string;
    isHoliday: boolean;
    isWeekend: boolean;
    events: CalendarDayEvent[];
}

interface CalendarDayEvent {
    event: Event;
    durationInMonth: number;
    duration: number;
    class: string;
    isContinuation: boolean;
    offset: number;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const ctx = useContext<Context>(Context);
const i18n = useI18n();

const months = ref<Map<Month, CalendarDay[]>>(new Map<Month, CalendarDay[]>());
const calendar = ref<HTMLDivElement | null>(null);
const calendarStyle = ref({
    '--scrollcontainer-width': '100vw',
    '--scrollcontainer-height': '100vh',
});

function init(): void {
    onEventsChanged();
    onMounted(() => mounted());
    onBeforeUnmount(() => beforeUnmount());
    window.addEventListener('resize', updateCalendarWith, { passive: true });
    watch(() => props.events, onEventsChanged, { deep: true });
}

async function mounted(): Promise<void> {
    await updateCalendarWith();
    const savedScrollPosition = localStorage.getItem('eventplanner.calendar.scrollposition');
    if (calendar.value && savedScrollPosition) {
        const scrollPosition = JSON.parse(savedScrollPosition);
        calendar.value.scrollLeft = scrollPosition.left;
        calendar.value.scrollTop = scrollPosition.top;
    }
}

function beforeUnmount(): void {
    if (calendar.value) {
        const scrollPosition = {
            top: calendar.value.scrollTop,
            left: calendar.value.scrollLeft,
        };
        localStorage.setItem('eventplanner.calendar.scrollposition', JSON.stringify(scrollPosition));
    }
}

function onEventsChanged(): void {
    const year = props.events[0]?.start.getFullYear() || new Date().getFullYear();
    buildCalender(year);
    fillEvents();
}

async function updateCalendarWith(): Promise<void> {
    await nextTick();
    if (calendar.value) {
        calendarStyle.value['--scrollcontainer-width'] = `${calendar.value.clientWidth}px`;
        calendarStyle.value['--scrollcontainer-height'] = `${calendar.value.clientHeight}px`;
    }
}

function buildCalender(year: number): void {
    let date = new Date(year, Month.JANUARY, 1);
    const temp: Map<Month, CalendarDay[]> = new Map<Month, CalendarDay[]>();
    while (date.getFullYear() === year) {
        if (!temp.has(date.getMonth())) {
            temp.set(date.getMonth(), []);
        }
        temp.get(date.getMonth())?.push({
            dayOfMonth: date.getDate(),
            weekday: i18n.d(date, DateTimeFormat.WeekdayShort),
            isHoliday: isHoliday(date, 'NI'),
            isWeekend: date.getDay() === 0 || date.getDay() === 6,
            events: [],
        });
        date = DateUtils.add(date, { days: 1 });
    }
    months.value = temp;
}

function fillEvents(): void {
    for (let i = 0; i < props.events.length; i++) {
        const event: Event = props.events[i];
        if (!event?.start.getMonth()) {
            console.log(event);
            continue;
        }
        const daysOfMonth = months.value.get(event.start.getMonth());
        if (!daysOfMonth) {
            console.error(`Missing month with index ${event.start.getMonth()}!`);
            continue;
        }
        const dayIndex = event.start.getDate() - 1;
        const day = daysOfMonth[dayIndex];

        const overlapsWithPrevious = ctx.events.doEventsHaveOverlappingDays(props.events[i - 1], props.events[i]);
        const overlapsWithNext = ctx.events.doEventsHaveOverlappingDays(props.events[i], props.events[i + 1]);

        const calendarDayEvent: CalendarDayEvent = {
            event: event,
            duration: new Date(event.end.getTime() - event.start.getTime()).getDate(),
            durationInMonth: new Date(event.end.getTime() - event.start.getTime()).getDate(),
            class: '',
            isContinuation: false,
            offset: 0,
        };
        if (overlapsWithPrevious) {
            calendarDayEvent.durationInMonth -= 0.5;
            calendarDayEvent.offset = 0.5;
        }
        if (overlapsWithNext) {
            calendarDayEvent.durationInMonth -= 0.5;
        }
        if (day.events.length === 1) {
            calendarDayEvent.offset = 0.5;
        }

        // add user event relation class
        if (event.signedInUserAssignedPosition) {
            calendarDayEvent.class += 'assigned';
        } else if (event.signedInUserWaitingListPosition) {
            calendarDayEvent.class += 'waiting-list';
        } else if (event.assignedUserCount >= 23) {
            calendarDayEvent.class += 'full';
        }

        if (event.start.getTime() < new Date().getTime()) {
            calendarDayEvent.class += ' in-past';
        }

        if (calendarDayEvent.durationInMonth < 1) {
            calendarDayEvent.class += ' small';
        }
        // TODO add category
        if (event.name.toLowerCase().includes('arbeitsdienst')) {
            calendarDayEvent.class += ' work';
        }

        // check if event ends in next month and split into two events
        if (dayIndex + calendarDayEvent.durationInMonth >= daysOfMonth.length) {
            calendarDayEvent.durationInMonth = daysOfMonth.length - dayIndex;
            const daysOfNextMonth = months.value.get(event.start.getMonth() + 1);
            if (!daysOfNextMonth) {
                console.error(`Missing month with index ${event.start.getMonth() + 1}!`);
                continue;
            }

            const continuedCalendarDayEvent: CalendarDayEvent = {
                ...calendarDayEvent,
                duration: new Date(event.end.getTime() - event.start.getTime()).getDate(),
                durationInMonth: calendarDayEvent.duration - calendarDayEvent.durationInMonth,
                isContinuation: true,
                offset: 0,
            };
            if (overlapsWithNext) {
                continuedCalendarDayEvent.durationInMonth -= 0.5;
            }
            if (overlapsWithPrevious) {
                calendarDayEvent.durationInMonth -= 0.5;
            }
            daysOfNextMonth[0].events.push(continuedCalendarDayEvent);
        }

        day.events.push(calendarDayEvent);
    }
}

function scrollLeft(): void {
    if (calendar.value) {
        const w = calendar.value.scrollWidth;
        let l = calendar.value.scrollLeft;
        l = Math.max(l - w / 12, 0);
        calendar.value.scrollTo({ left: l, behavior: 'smooth' });
    }
}

function scrollRight(): void {
    if (calendar.value) {
        const w = calendar.value.scrollWidth;
        let l = calendar.value.scrollLeft;
        l = Math.min(l + w / 12, w);
        calendar.value.scrollTo({ left: l, behavior: 'smooth' });
    }
}

init();
</script>

<style>
.calendar {
    --row-height: max(2rem, calc((var(--viewport-height) - var(--nav-height) - 3.5rem) / 31));
    --scrollcontainer-width: 100vw;
    --scrollcontainer-height: 100vh;
    --columns: 1.4;
    height: var(--viewport-height);
    @apply flex snap-x snap-always items-stretch overflow-scroll;
    @apply fixed left-0 right-0 top-0;
}
.calendar-month {
    @apply snap-start;
}
.calendar-header {
    @apply sticky top-0 z-50 sm:z-20;
    @apply bg-navbar pb-2.5 pl-20 pr-4 pt-2.5 text-white sm:ml-2 sm:pl-16 md:ml-0 md:pl-20 xl:pt-0;
    @apply border-r border-transparent sm:border-r-gray-50;
    @apply text-lg font-bold;
}
.calendar-day {
    height: var(--row-height);
    width: calc(var(--scrollcontainer-width) / var(--columns));
    @apply flex items-center border-b border-r border-gray-100 pl-2 pr-1;
}
.calendar-day:nth-child(2) {
    @apply mt-2 sm:mt-0;
}
.calendar-filler {
    height: var(--row-height);
    @apply border-r border-r-gray-100;
    @apply border-b border-b-transparent;
}
.calendar-day-label {
    @apply w-7 text-sm font-bold opacity-40 md:w-8;
}
.calendar-day.weekend {
    @apply bg-gray-500 bg-opacity-5 text-red-500;
}
.calendar-day.holiday {
    @apply bg-gray-500 bg-opacity-5 text-red-500;
}
@media only screen and (min-width: 450px) {
    .calendar {
        --columns: 2;
    }
}
@media only screen and (min-width: 640px) {
    .calendar {
        --columns: 3;
        height: calc(var(--viewport-height) - var(--nav-height));
        position: static;
    }
    .calendar-header {
        @apply bg-primary-50 font-normal text-black;
    }
}
@media only screen and (min-width: 850px) {
    .calendar {
        --columns: 4;
    }
}
@media only screen and (min-width: 1100px) {
    .calendar {
        --columns: 4;
    }
}
@media only screen and (min-width: 1280px) {
    .calendar {
        height: calc(var(--viewport-height) - 6rem);
    }
}

@media only screen and (min-width: 1500px) {
    .calendar {
        --columns: 5;
    }
}
</style>
