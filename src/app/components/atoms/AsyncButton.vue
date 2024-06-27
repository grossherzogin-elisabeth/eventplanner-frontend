<template>
    <button
        class="btn-primary flex-grow whitespace-nowrap"
        :disabled="props.disabled || loading || success === true"
        @click="onClick()"
    >
        <VLoadingSpinner v-if="loading" />
        <span v-else-if="success === true">
            <i class="fa-solid fa-check"></i>
        </span>
        <span v-else-if="success === false">
            <i class="fa-solid fa-warning"></i>
        </span>
        <slot v-else name="icon"></slot>
        <span>
            <slot name="label" :loading="loading" :success="success === true" :failed="success === false"/>
        </span>
    </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VLoadingSpinner } from '@/lib/components';

interface Props {
    disabled?: boolean;
    action?: () => Promise<unknown>;
}

const props = defineProps<Props>();

const loading = ref<boolean>(false);
const success = ref<boolean|null>(null);

async function onClick(): Promise<void> {
    console.log('clicked');
    if (props.action) {
        loading.value = true;
        await props.action();
        try {
            success.value = true;
        } catch (e) {
            success.value = false;
        } finally {
            loading.value = false;
        }
    }
}
</script>

