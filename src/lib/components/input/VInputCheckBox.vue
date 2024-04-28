<template>
    <div class="flex flex-col justify-center">
        <label :for="id" class="inline-flex items-center">
            <input
                :id="id"
                :checked="props.modelValue"
                :disabled="props.disabled"
                :required="props.required"
                type="checkbox"
                class="check-box-input hidden"
                :aria-checked="props.modelValue"
                :aria-disabled="props.disabled"
                :aria-invalid="hasErrors"
                @input="onInput"
            />
            <span tabindex="0" class="check-box-container" :class="{ invalid: showErrors && hasErrors }">
                <icon-check class="check-box-icon" />
            </span>
            <slot name="label" :invalid="showErrors && hasErrors">
                <span v-if="props.label" class="check-box-label" :class="{ invalid: showErrors && hasErrors }">
                    {{ $t(props.label) }}
                </span>
                <button
                    v-if="hint"
                    class="ml-2 rounded bg-gray-700 px-2 text-sm font-semibold hover:bg-gray-600 hover:text-primary-500"
                    :title="hint"
                >
                    <span>?</span>
                </button>
            </slot>
        </label>
        <div v-if="showErrors && hasErrors" class="input-errors">
            <p v-for="err in errors" :key="err.key" class="input-error">
                {{ $t(err.key, err.params) }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { v4 as uuid4 } from 'uuid';
import { IconCheck } from '@/lib/icons/bold';
import type { ValidationHint } from '@/lib/utils';

interface Props {
    // an optional label to render before the input field
    label?: string;
    // an optional hint to display next to the label
    hint?: string;
    // the value we edit, bind with v-model
    modelValue?: boolean;
    // disables this input
    disabled?: boolean;
    // marks this input as required
    required?: boolean;
    // validation and/or service errors for this input
    errors?: ValidationHint[];
    // show errors, even if this field has not been focused jet, e.g. after pressing save
    errorsVisible?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: boolean): void;
}

/**
 * --------------------------------------------------------------------------------------------------------
 * Component Definition
 * --------------------------------------------------------------------------------------------------------
 */

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const id = uuid4();
const visited = ref(false);
const showErrors = computed<boolean>(() => visited.value || props.errorsVisible === true);
const hasErrors = computed<boolean>(() => props.errors !== undefined && props.errors.length > 0);

function onInput(event: Event) {
    visited.value = true;
    if (!props.disabled) {
        const element = event.target as HTMLInputElement;
        emit('update:modelValue', element.checked);
    }
}
</script>
