<template>
    <div class="flex h-full flex-1 flex-col xl:overflow-y-auto">
        <teleport to="#nav-right">
            <NavbarFilter v-model="filter" placeholder="Nutzer durchsuchen" />
        </teleport>
        <div
            class="top-12 z-10 hidden bg-primary-50 px-4 pb-8 pt-4 md:pl-12 md:pr-16 md:pt-8 xl:top-0 xl:block xl:pl-16 xl:pr-20"
        >
            <div class="flex items-center space-x-4">
                <VInputText v-model="filter" placeholder="Nutzer filtern" class="input-search w-96">
                    <template #before>
                        <i class="fa-solid fa-magnifying-glass ml-4 text-primary-900 text-opacity-25" />
                    </template>
                </VInputText>
                <div class="hidden flex-grow md:block"></div>
                <div class="hidden items-stretch justify-end space-x-2 md:flex">
                    <button class="btn-primary flex-grow whitespace-nowrap">
                        <i class="fa-solid fa-user-plus"></i>
                        <span>Nutzer erstellen</span>
                    </button>
                </div>
            </div>
        </div>
        <div class="w-full overflow-x-auto px-8 pt-6 md:px-16 xl:px-20 xl:pt-0">
            <div class="-mx-4 px-4">
                <VTable
                    :items="filteredCrewMembers"
                    :page-size="50"
                    class="interactive-table"
                    @click="editUser($event)"
                >
                    <template #head>
                        <th data-sortby="firstName">Name</th>
                        <th class="hidden md:table-cell" data-sortby="lastName">Nachname</th>
                        <th>Zertifikate</th>
                        <th data-sortby="role">Rolle</th>
                    </template>
                    <template #row="{ item }">
                        <td class="whitespace-nowrap font-semibold">
                            <span>{{ item.firstName }}</span>
                            <span class="ml-2 md:hidden">{{ item.lastName }}</span>
                        </td>
                        <td class="hidden font-semibold md:table-cell">{{ item.lastName }}</td>
                        <td>
                            <div
                                class="inline-flex w-auto items-center space-x-2 rounded-full bg-green-100 py-1 pl-3 pr-4 text-green-700"
                            >
                                <i class="fa-solid fa-check-circle"></i>
                                <span class="whitespace-nowrap font-semibold">Alle gültig</span>
                            </div>
                        </td>
                        <td>
                            <div class="flex">
                                <span
                                    v-for="position in item.positionKeys"
                                    :key="position"
                                    class="position mr-2 bg-gray-500"
                                >
                                    {{ position }}
                                </span>
                            </div>
                        </td>
                    </template>
                </VTable>
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Context } from '@/app/Context';
import ViewToolbar from '@/app/components/partials/ViewToolbar.vue';
import NavbarFilter from '@/app/components/utils/NavbarFilter.vue';
import { Permission } from '@/app/types';
import type { User } from '@/app/types';
import { Routes } from '@/app/views/Routes';
import { VInputText, VTable } from '@/lib/components';
import { useContext } from '@/lib/composables';
import type { Selectable } from '@/shared/types/Selectable';

const ctx = useContext<Context>(Context);
const router = useRouter();

const showSearch = ref<boolean>(false);
const filter = ref<string>('');
const crewMembers = ref<(User & Selectable)[]>([]);
const filteredCrewMembers = computed<(User & Selectable)[]>(() =>
    crewMembers.value.filter((it) => ctx.users.doesUserMatchFilter(it, filter.value))
);

function init(): void {
    fetchCrewMembers();
}

function editUser(user: User): void {
    router.push({ name: Routes.UserDetails, params: { key: user.key } });
}

async function fetchCrewMembers(): Promise<void> {
    crewMembers.value = await ctx.users.getUsers();
}

init();
</script>
