<template>
    <button ref="button" :class="$attrs.class" class="cursor-pointer" @click="open = true">
        <slot name="icon">
            <i class="fa-solid fa-ellipsis-vertical mx-1" />
        </slot>
    </button>
    <VDropdownWrapper
        v-if="open"
        :anchor="$refs.button as HTMLElement"
        anchor-align-x="right"
        anchor-align-y="top"
        dropdown-position-x="left"
        max-width="18rem"
        min-width="18rem"
        @close="open = false"
    >
        <div class="mt-2 rounded-xl bg-primary-100 p-4 shadow-xl" @click="open = false">
            <slot />
        </div>
    </VDropdownWrapper>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import VDropdownWrapper from '@/ui/components/common/dropdown/VDropdownWrapper.vue';

const open = ref<boolean>(false);
</script>

<style>
.context-menu-item {
    @apply flex cursor-pointer items-center space-x-4 py-2;
}
</style>
