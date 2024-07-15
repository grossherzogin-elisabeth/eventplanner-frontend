<template>
    <button
        :disabled="props.disabled || loading || success === true"
        class="btn-primary flex-grow whitespace-nowrap"
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
            <slot :failed="success === false" :loading="loading" :success="success === true" name="label" />
        </span>
    </button>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import VLoadingSpinner from '@/ui/components/common/loading/VLoadingSpinner.vue';

interface Props {
    disabled?: boolean;
    action?: () => Promise<unknown>;
}

const props = defineProps<Props>();

const loading = ref<boolean>(false);
const success = ref<boolean | null>(null);

async function onClick(): Promise<void> {
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
