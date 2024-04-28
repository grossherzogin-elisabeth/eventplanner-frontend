<template>
    <div class="v-input-combobox flex h-full items-start" :class="$attrs.class">
        <label v-if="props.label" class="input-label">
            {{ props.label }}
        </label>
        <div class="relative h-full w-1/2 flex-grow">
            <div ref="dropdownAnchor" class="input-field-wrapper overflow-hidden">
                <slot name="before" />
                <div class="relative flex flex-grow items-center">
                    <input
                        :id="id"
                        :value="displayValue"
                        :placeholder="props.placeholder || $t('shared.please-select')"
                        :disabled="props.disabled"
                        :required="props.required"
                        :class="{ invalid: showErrors && hasErrors }"
                        class="input-field w-full cursor-pointer overflow-ellipsis pr-10"
                        :aria-disabled="props.disabled"
                        :aria-invalid="hasErrors"
                        :aria-required="props.required"
                        aria-haspopup="true"
                        readonly
                        @click="showDropdown()"
                        @keydown.down.prevent="focusNextOption()"
                        @keydown.up.prevent="focusPrevOption()"
                        @keydown.enter="selectFocusedOption"
                        @keydown.esc="hideDropdown(true)"
                    />
                    <IconLoading v-if="loading" class="input-icon-right animate-spin transition-transform" />
                    <IconArrowDown
                        v-else
                        class="input-icon-right transition-transform"
                        :class="focusOptionIndex === null ? 'rotate-0' : 'rotate-180'"
                        @click="showDropdown()"
                    />
                </div>
                <slot name="after" />
            </div>
            <div v-if="showErrors && hasErrors" class="input-errors">
                <p v-for="err in errors" :key="err.key" class="input-error">
                    {{ $t(err.key, err.params) }}
                </p>
            </div>
        </div>
    </div>
    <VDropdownWrapper
        v-if="focusOptionIndex !== null"
        :anchor="dropdownAnchor"
        anchor-align-y="top"
        max-height="400px"
        class="input-dropdown combobox"
        @close="hideDropdown(true)"
    >
        <div class="flex h-full flex-col overflow-hidden">
            <div class="flex items-stretch border-b border-gray-500">
                <slot name="before-filter">
                    <IconSearch class="ml-3 mr-2 h-4 w-4 self-center opacity-50" />
                </slot>
                <input
                    :id="id"
                    :value="focusOptionIndex === null ? displayValue : filter"
                    :placeholder="$t('shared.filter-entries')"
                    :disabled="props.disabled"
                    :required="props.required"
                    :class="{ invalid: showErrors && hasErrors }"
                    class="input-field w-full overflow-ellipsis"
                    :aria-disabled="props.disabled"
                    :aria-invalid="hasErrors"
                    :aria-required="props.required"
                    aria-haspopup="true"
                    @click="showDropdown()"
                    @keydown.down.prevent="focusNextOption()"
                    @keydown.up.prevent="focusPrevOption()"
                    @keydown.enter="selectFocusedOption"
                    @keydown.esc="hideDropdown(true)"
                    @blur="onBlur"
                    @input="filterValues($event)"
                />
                <slot name="after-filter">
                    <button v-if="filter" class="flex items-center self-stretch" @click.stop="filter = ''">
                        <IconRemoveCircle class="mr-2 h-4 w-4 opacity-75 hover:opacity-100" />
                    </button>
                </slot>
            </div>
            <slot name="first-option" />
            <div class="flex-1 overflow-y-auto">
                <ul v-if="filteredOptions.length === 0" ref="list">
                    <li v-if="loading" class="input-dropdown-hint">{{ $t('shared.loading') }}</li>
                    <li v-else-if="props.options.length === 0" class="input-dropdown-hint">
                        {{ $t('shared.no-entries') }}
                    </li>
                    <li v-else class="input-dropdown-hint">{{ $t('shared.no-matches') }}</li>
                </ul>
                <template v-else>
                    <ul ref="list">
                        <li v-if="lastUsedOptions.length > 0" class="input-dropdown-heading">Zuletzt verwendet</li>
                        <li
                            v-for="(option, i) in lastUsedOptions"
                            :key="String(option.value)"
                            class="input-dropdown-option"
                            :class="{ 'input-dropdown-option-focus': i === focusOptionIndex }"
                            @click.stop="selectOption(option)"
                            @keydown.enter="selectOption(option)"
                        >
                            <slot name="item" :item="option" :active="option.value === props.modelValue">
                                {{ option.label }}
                            </slot>
                        </li>
                        <li v-if="!filter" class="input-dropdown-heading">Alle Ergebnisse</li>
                        <li v-else class="input-dropdown-heading">Ergebnisse für '{{ filter }}'</li>
                        <li
                            v-for="(option, i) in filteredOptions"
                            :key="String(option.value)"
                            class="input-dropdown-option"
                            :class="{ 'input-dropdown-option-focus': i === focusOptionIndex }"
                            @click.stop="selectOption(option)"
                            @keydown.enter="selectOption(option)"
                        >
                            <slot name="item" :item="option" :active="option.value === props.modelValue">
                                {{ option.label }}
                            </slot>
                        </li>
                    </ul>
                </template>
            </div>
            <slot name="last-option" />
        </div>
    </VDropdownWrapper>
</template>

<script lang="ts" setup generic="T extends any = any">
import type { Ref } from 'vue';
import { computed, nextTick, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { IconArrowDown, IconLoading, IconRemoveCircle } from '@/lib/icons/bold';
import { IconSearch } from '@/lib/icons/light';
import type { InputSelectOption } from '@/lib/types';
import type { ValidationHint } from '@/lib/utils';
import VDropdownWrapper from '../utils/VDropdownWrapper.vue';

interface Props {
    // an optional label to render before the input field
    label?: string;
    // the value we edit, bind with v-model
    modelValue?: T;
    // disables this input
    disabled?: boolean;
    // marks this input as required
    required?: boolean;
    // validation and/or service errors for this input
    errors?: ValidationHint[];
    // show errors, even if this field has not been focused jet, e.g. after pressing save
    errorsVisible?: boolean;
    // placeholder to display if no value is entered
    placeholder?: string;
    // Show a spinning icon instead of the dropdown arrow
    loading?: boolean;
    // the options to choose from in this select
    options: InputSelectOption<T>[];
    lastUsed?: T[];
}

interface Emits {
    (e: 'update:modelValue', value: T): void;
}

/**
 * --------------------------------------------------------------------------------------------------------
 * Component Definition
 * --------------------------------------------------------------------------------------------------------
 */
// `as props` is a workaround
// generic="T" in combination with optional props causes some compiler errors
// this issue might be related: https://github.com/vuejs/core/issues/8969
const props = defineProps<Props>() as Props;
const emit = defineEmits<Emits>();

const id = uuidv4();
const visited = ref(false);

const showErrors = computed<boolean>(() => visited.value || props.errorsVisible === true);
const hasErrors = computed<boolean>(() => props.errors !== undefined && props.errors.length > 0);

const list = ref<HTMLUListElement | null>(null);
const dropdownAnchor = ref<HTMLInputElement | null>(null);
const focusOptionIndex: Ref<number | null> = ref(null);
const filter = ref('');

const selectedOptionIndex = computed<number>(() =>
    filteredOptions.value.findIndex((opt) => opt.value === props.modelValue)
);

const visibleOptions = computed<InputSelectOption<T>[]>(() => {
    return props.options.filter((it) => !it.hidden || it.value === props.modelValue);
});

const lastUsedOptions = computed<InputSelectOption<T>[]>(() => {
    return visibleOptions.value.filter((it) => props.lastUsed?.includes(it.value));
});

const filteredOptions = computed<InputSelectOption<T>[]>(() => {
    let filtered = visibleOptions.value;
    const f = filter.value.trim().toLowerCase();
    if (f !== '') {
        filtered = filtered.filter((opt) => opt.label.toLowerCase().includes(f));
    }
    return filtered;
});
const displayValue = computed<string>(() => props.options.find((it) => it.value === props.modelValue)?.label || '');

function showDropdown(): void {
    focusOptionIndex.value = selectedOptionIndex.value;
    scrollFocussedOptionIntoView();
}

function onBlur(evt: FocusEvent): void {
    // when clicking on a dropdown option, the blur event will be triggered without a new input element as target
    // don`t close the dropdown in that case to prevent the click pointing to nowhere
    if (evt.relatedTarget) {
        hideDropdown();
    }
}

function hideDropdown(focusInput: boolean = false): void {
    setTimeout(() => {
        focusOptionIndex.value = null;
        visited.value = true;
        if (dropdownAnchor.value && focusInput) {
            dropdownAnchor.value.focus();
        }
    }, 100);
}

function selectOption(option: InputSelectOption<T>): void {
    visited.value = true;
    emit('update:modelValue', option.value);
    hideDropdown(true);
}

function focusNextOption(): void {
    if (focusOptionIndex.value === null) {
        showDropdown();
    } else if (focusOptionIndex.value === filteredOptions.value.length - 1) {
        focusOptionIndex.value = 0;
        scrollFocussedOptionIntoView();
    } else {
        focusOptionIndex.value += 1;
        scrollFocussedOptionIntoView();
    }
}

function focusPrevOption(): void {
    if (focusOptionIndex.value === null) {
        showDropdown();
    } else if (focusOptionIndex.value === 0) {
        focusOptionIndex.value = filteredOptions.value.length - 1;
        scrollFocussedOptionIntoView();
    } else {
        focusOptionIndex.value -= 1;
        scrollFocussedOptionIntoView();
    }
}

function selectFocusedOption(e: KeyboardEvent): void {
    if (focusOptionIndex.value !== null) {
        selectOption(filteredOptions.value[focusOptionIndex.value]);
        hideDropdown(true);
        e.preventDefault();
        nextTick(() => (filter.value = ''));
    }
}

function scrollFocussedOptionIntoView(): void {
    nextTick(() => {
        if (list.value) {
            const activeEntry = list.value.querySelector('.input-dropdown-option-focus');
            if (activeEntry) {
                activeEntry.scrollIntoView({ block: 'center' });
            }
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterValues(event: any): void {
    filter.value = event.target.value;
    focusOptionIndex.value = 0;
}
</script>
