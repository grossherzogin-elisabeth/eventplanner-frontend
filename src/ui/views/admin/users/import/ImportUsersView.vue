<template>
    <div class="overflow-hidden">
        <div class="bg-dialog-header sticky top-0 z-10 flex items-center space-x-4 px-8 pb-8 pt-8 lg:px-16">
            <div>
                <h1 class="md mb-2 truncate">Nutzer importieren</h1>
            </div>
            <div class="flex-grow"></div>
            <div class="flex items-stretch justify-end space-x-2">
                <button v-if="uploading" class="btn-primary flex-grow whitespace-nowrap" disabled>
                    <VLoadingSpinner v-if="uploading" />
                    <span>Nutzer werden importiert</span>
                </button>
                <button
                    v-else
                    :disabled="!file || uploading"
                    class="btn-primary flex-grow whitespace-nowrap"
                    @click="upload()"
                >
                    <i class="fa-solid fa-upload"></i>
                    <span>Nutzer importieren</span>
                </button>
            </div>
        </div>
        <div class="px-8 py-8 lg:px-16 lg:py-16">
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
import { useRouter } from 'vue-router';
import { VLoadingSpinner } from '@/ui/components/common';
import { useUserAdministrationUseCase } from '@/ui/composables/Application';
import { Routes } from '@/ui/views/Routes';

interface InputFileEvent extends Event {
    target: HTMLInputElement;
}

const router = useRouter();
const userAdministrationUseCase = useUserAdministrationUseCase();

const fileName = ref<string | null>(null);
const file = ref<Blob | null>(null);
const uploading = ref<boolean>(false);

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
        await userAdministrationUseCase.importUsers(file.value);
        uploading.value = false;
        await router.push({ name: Routes.UsersList });
    } catch (e) {
        uploading.value = false;
    }
}
</script>
