<template>
    <div v-if="renderContent" class="dialog-background" :class="dialogOpen ? 'open' : 'closed'" @click="reject()">
        <div class="dialog-wrapper" @click.stop="">
            <slot name="dialog">
                <div
                    class="dialog"
                    :class="`
                        ${props.width || 'w-screen max-w-xl'}
                        ${props.height || 'max-h-xl h-screen'}
                    `"
                >
                    <div class="dialog-header">
                        <div class="flex flex-grow items-center">
                            <slot name="title"></slot>
                        </div>
                        <button class="dialog-close-button" @click="reject()">
                            <IconClose class="h-full w-full" />
                        </button>
                    </div>
                    <div class="dialog-content flex flex-1 flex-col overflow-y-auto">
                        <slot name="content"></slot>
                        <slot name="default"></slot>
                    </div>
                    <div v-if="$slots.buttons" class="dialog-buttons">
                        <slot name="buttons" :close="reject" :submit="submit" :reject="reject"></slot>
                    </div>
                </div>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue';
import { nextTick, ref } from 'vue';
import { WindowUtils } from '@/lib/utils';

import { IconClose } from '@/lib/icons/regular';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = any; // Result type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type E = any; // Error type

interface Props {
    // dialog width css class
    width?: string;
    // dialog height css class
    height?: string;
}

interface Emits {
    // Dialog is opening with animation
    (e: 'opening'): void;
    // Dialogs open animation finished
    (e: 'opened'): void;
    // Dialog is closing with animation
    (e: 'closing'): void;
    // Dialogs close animation finished
    (e: 'closed'): void;
}

/**
 * --------------------------------------------------------------------------------------------------------
 * Component Definition
 * --------------------------------------------------------------------------------------------------------
 */

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
defineExpose<Dialog>({
    open: () => open(),
    close: () => reject(),
    submit: (result?: T) => submit(result),
    reject: (reason?: E) => reject(reason),
});

const dialogOpen: Ref<boolean> = ref(false);
const renderContent: Ref<boolean> = ref(false);
let promiseResolve: ((result: T) => void) | null = null;
let promiseReject: ((reason: T) => void) | null = null;
let closeTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

async function open(): Promise<T> {
    WindowUtils.disableScrolling();
    clearTimeout(closeTimeout);
    emit('opening');
    renderContent.value = true;
    await nextTick(() => (dialogOpen.value = true));
    emit('opened');

    // this promise is resolved, when the dialog is closed
    return new Promise<T>((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });
}

async function submit(result?: T): Promise<void> {
    if (promiseResolve !== null) {
        promiseResolve(result);
    }
    await close();
}

async function reject(reason?: E): Promise<void> {
    if (promiseReject !== null) {
        promiseReject(reason);
    }
    await close();
}

async function close<T>(): Promise<void> {
    dialogOpen.value = false;
    emit('closing');

    await nextTick();
    closeTimeout = setTimeout(() => {
        renderContent.value = false;
        emit('closed');
        WindowUtils.enableScrolling();
    }, 400);
}
</script>

<script lang="ts">
// fake default export for typescript
export default {};

// Type definition for exposed functions
export interface Dialog<T = void, E = void> {
    /**
     * Open this dialog, returning a promise that is resolve when it is closed
     */
    open(): Promise<T>;

    /**
     * Close this dialog, resulting in the rejection of the open promise
     */
    close(): void;

    /**
     * Submit an optional positive result and close the dialog resolving the promise
     */
    submit(result?: T): void;

    /**
     * Submit an optional negative result and close the dialog rejecting the promise
     */
    reject(reason?: E): void;
}
</script>
