<template>
    <div class="overflow-hidden">
        <div class="bg-dialog-header sticky top-0 z-10 flex items-center space-x-4 px-8 pb-8 pt-8 lg:px-16">
            <div>
                <h1 class="md mb-2 truncate">Reisen importieren</h1>
            </div>
            <div class="flex-grow"></div>
            <div class="flex items-stretch justify-end space-x-2">
                <button v-if="uploading" class="btn-primary flex-grow whitespace-nowrap" disabled>
                    <VLoadingSpinner v-if="uploading" />
                    <span>Reisen werden importiert</span>
                </button>
                <button
                    v-else
                    class="btn-primary flex-grow whitespace-nowrap"
                    :disabled="!file || uploading"
                    @click="upload()"
                >
                    <i class="fa-solid fa-upload"></i>
                    <span>Reisen importieren</span>
                </button>
            </div>
        </div>
        <div v-if="errors" class="overflow-auto px-8 py-8 lg:px-16 lg:pb-16">
            <VTable :items="errors" :page-size="-1">
                <template #row="{ item }">
                    <td class="w-full">
                        <p class="mb-2 font-semibold">
                            {{ item.eventName }} ({{ formatDate(item.start) }} - {{ formatDate(item.end) }})
                        </p>
                        <ul class="text-sm">
                            <li v-for="(message, index) in item.messages" :key="index">
                                <i class="fa-solid fa-warning mr-2 text-orange-500"></i>
                                <span>{{ message }}</span>
                            </li>
                        </ul>
                    </td>
                </template>
            </VTable>
        </div>
        <div v-else class="px-8 py-8 lg:px-16 lg:py-16">
            <div
                class="relative flex h-96 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-primary-600 text-blue-700"
            >
                <p class="mb-8 opacity-50">Klicken oder Dateien hierher ziehen</p>
                <p>{{ fileName }}</p>
                <input
                    type="file"
                    class="absolute bottom-0 left-0 right-0 top-0 z-10 cursor-pointer opacity-0"
                    @change="chooseFile($event as InputFileEvent)"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import type { ImportError } from '@/app';
import { Routes } from '@/app';
import { Context } from '@/app/Context';
import VTable from '@/lib/components/table/VTable.vue';
import VLoadingSpinner from '@/lib/components/utils/VLoadingSpinner.vue';
import { useContext } from '@/lib/composables';
import { DateTimeFormat } from '@/shared/types';

interface InputFileEvent extends Event {
    target: HTMLInputElement;
}

const ctx = useContext<Context>(Context);
const i18n = useI18n();
const router = useRouter();

const fileName = ref<string | null>(null);
const file = ref<Blob | null>(null);
const uploading = ref<boolean>(false);
const errors = ref<ImportError[] | null>(null);

function formatDate(date?: Date): string {
    return date !== undefined ? i18n.d(date, DateTimeFormat.Date) : '';
}

function chooseFile(evt: InputFileEvent): void {
    const files = evt.target.files;
    if (!files || files.length > 1) {
        return;
    }
    file.value = files[0];
    const path = String(evt.target.value);
    fileName.value = path.substring(path.lastIndexOf('\\') + 1);
}

async function upload() {
    if (!file.value) {
        return;
    }
    try {
        uploading.value = true;
        errors.value = await ctx.events.importEvents(2024, file.value);
        uploading.value = false;
        await router.push({ name: Routes.Events });
    } catch (e) {
        uploading.value = false;
    }
}
</script>
