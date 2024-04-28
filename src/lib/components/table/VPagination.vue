<template>
    <div v-if="pageCount > 1" class="pagination">
        <button
            class="pagination-page"
            :class="{ enabled: page > 0 }"
            :disabled="page === 0"
            @click="$emit('update:page', page - 1)"
        >
            <IconArrowDown class="h-2.5 w-2.5 rotate-90" />
        </button>

        <template v-for="p in visiblePages" :key="`${p}-group`">
            <button
                v-if="typeof p === 'number'"
                class="pagination-page enabled"
                :class="{ active: p === page }"
                @click="$emit('update:page', p)"
            >
                <span>{{ p + 1 }}</span>
            </button>
            <span v-else class="pagination-page"> ... </span>
        </template>

        <button
            class="pagination-page"
            :class="{ enabled: page < pageCount - 1 }"
            :disabled="page === pageCount - 1"
            @click="$emit('update:page', page + 1)"
        >
            <IconArrowDown class="h-2.5 w-2.5 -rotate-90" />
        </button>
    </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { IconArrowDown } from '@/lib/icons/bold';

interface Props {
    page: number;
    count: number;
    pageSize?: number;
}

interface Emits {
    (e: 'update:page', value: number): void;
}
/**
 * --------------------------------------------------------------------------------------------------------
 * Component Definition
 * --------------------------------------------------------------------------------------------------------
 */

const props = defineProps<Props>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const emit = defineEmits<Emits>();

const visiblePagesCount = ref<number>(7);
const pageSize = computed<number>(() => props.pageSize || 10);
const pageCount = computed<number>(() => Math.ceil(props.count / pageSize.value));

const visiblePages = computed<(number | string)[]>(() => {
    const pages: (number | string)[] = [0];
    const lastPageIndex = pageCount.value - 1;
    // dynamic pages in the middle, first and last slot are reserved
    const centerPages = visiblePagesCount.value - 2;
    let lowerBound = Math.max(props.page - Math.floor(centerPages / 2), 1);
    let upperBound = lowerBound + centerPages;
    if (upperBound > lastPageIndex) {
        const shift = upperBound - lastPageIndex;
        upperBound -= shift;
        lowerBound = Math.max(lowerBound - shift, 1);
    }
    for (let i = lowerBound; i < upperBound; i++) {
        pages.push(i);
    }
    pages.push(lastPageIndex);

    if (pages[1] !== 1) {
        pages[1] = '...';
    }
    if (pages[pages.length - 2] !== lastPageIndex - 1) {
        pages[pages.length - 2] = '...';
    }
    return pages;
});
</script>
