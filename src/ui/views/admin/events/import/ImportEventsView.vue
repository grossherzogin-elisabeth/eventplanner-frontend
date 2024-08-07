<template>
    <div class="overflow-hidden">
        <div class="bg-dialog-header sticky top-0 z-10 flex items-center space-x-4 px-8 pb-8 pt-8 lg:px-16">
            <div>
                <h1 class="md mb-2 truncate">Reisen importieren</h1>
            </div>
            <div class="flex-grow"></div>
            <div class="flex items-stretch justify-end space-x-2">
                <AsyncButton :action="upload" :disabled="!file">
                    <template #icon>
                        <i class="fa-solid fa-upload"></i>
                    </template>
                    <template #label="{ loading }">
                        <template v-if="loading">Reisen werden importiert</template>
                        <template v-else>Reisen importieren</template>
                    </template>
                </AsyncButton>
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
                    class="absolute bottom-0 left-0 right-0 top-0 z-10 cursor-pointer opacity-0"
                    type="file"
                    @change="chooseFile($event as InputFileEvent)"
                />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { DateTimeFormat } from '@/common/date';
import type { ImportError } from '@/domain';
import { AsyncButton, VTable } from '@/ui/components/common';
import { useEventAdministrationUseCase } from '@/ui/composables/Application';

interface InputFileEvent extends Event {
    target: HTMLInputElement;
}

const eventAdministrationUseCase = useEventAdministrationUseCase();
const i18n = useI18n();

const fileName = ref<string | null>(null);
const file = ref<Blob | null>(null);
const errors = ref<ImportError[] | null>(null);

function formatDate(date?: Date): string {
    return date !== undefined ? i18n.d(date, DateTimeFormat.DD_MM_YYYY) : '';
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
    errors.value = await eventAdministrationUseCase.importEvents(2024, file.value);
}
</script>
