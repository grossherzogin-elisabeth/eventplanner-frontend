<template>
    <div class="flex min-h-screen flex-col bg-primary-50 from-primary-900 to-primary-800 to-50% xl:bg-gradient-to-r">
        <div v-if="initialized && loggedIn" class="xl:hidden">
            <AppNavbar />
        </div>
        <div v-if="initialized && loggedIn" class="flex flex-1 items-stretch">
            <div class="relative hidden h-screen w-96 flex-col pt-4 text-white xl:flex">
                <AppMenu class="relative z-10" />
            </div>
            <div
                class="relative flex h-full w-0 flex-grow flex-col bg-primary-50 xl:h-screen xl:overflow-hidden xl:rounded-l-3xl xl:shadow-2xl"
            >
                <RouterView class="flex flex-1 flex-col" />
                <div
                    v-if="routeHasDialog"
                    class="fixed bottom-0 left-0 right-0 top-0 z-30 bg-gray-700 bg-opacity-80 pt-12 lg:px-4 lg:pb-4 lg:pt-16 xl:p-8"
                    @click="closeDialog()"
                >
                    <div class="mx-auto flex h-full max-w-screen-lg items-start">
                        <div
                            class="flex h-full w-full max-w-screen-lg flex-col overflow-hidden bg-white lg:rounded-2xl lg:shadow-lg"
                            @click.stop
                        >
                            <!-- dialog header -->
                            <div class="bg-dialog-header flex h-16 w-full items-center justify-between">
                                <div class="flex w-20 items-center justify-center lg:w-16">
                                    <button
                                        v-if="dialogStack.length > 1"
                                        class="h-10 w-10 rounded-full text-gray-700 hover:bg-primary-200 hover:text-gray-950"
                                        @click="router.back()"
                                    >
                                        <i class="fa-solid fa-arrow-left"></i>
                                    </button>
                                </div>
                                <div
                                    v-if="(route.meta as any).breadcrumps"
                                    class="flex-grow text-sm font-semibold text-gray-400"
                                >
                                    <template
                                        v-for="breadcrump in (route.meta as any).breadcrumps(route)"
                                        :key="breadcrump"
                                    >
                                        <span class="">{{ breadcrump }}</span>
                                        <i class="fa-solid fa-chevron-right mx-4 h-3 last:hidden"></i>
                                    </template>
                                </div>
                                <div class="flex w-20 items-center justify-center lg:w-16">
                                    <button
                                        class="h-10 w-10 rounded-full text-gray-700 hover:bg-primary-200 hover:text-gray-950"
                                        @click="closeDialog()"
                                    >
                                        <i class="fa-solid fa-close"></i>
                                    </button>
                                </div>
                            </div>
                            <!-- dialog content -->
                            <div class="flex h-0 flex-1 flex-col">
                                <RouterView name="dialog" class="flex flex-1 flex-col" />
                            </div>
                        </div>
                        <!--                        <div class="hidden lg:block">-->
                        <!--                            <button class="rounded-full w-10 h-10 ml-2 text-white hover:text-primary-600 hover:bg-primary-50 flex items-center justify-center">-->
                        <!--                                <i class="fa-solid fa-close"></i>-->
                        <!--                            </button>-->
                        <!--                        </div>-->
                    </div>
                </div>
            </div>
        </div>
        <div
            v-else
            class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-t from-primary-900 to-primary-800 to-50% p-8"
        >
            <WorldMap class="mb-16 w-full max-w-xl animate-pulse text-white text-opacity-25" />
            <span class="text-xl font-light text-white">Anwendung wird geladen...</span>
        </div>
    </div>
    <AppFooter />
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import WorldMap from '@/app/assets/images/worldmap.svg?component';
import { useViewportSize } from '@/app/composables/ViewportSize';
import { useContext } from '@/lib/composables';
import { Context } from './Context';
import AppFooter from './components/partials/AppFooter.vue';
import AppMenu from './components/partials/AppMenu.vue';
import AppNavbar from './components/partials/AppNavbar.vue';

const ctx = useContext<Context>(Context);
const route = useRoute();
const router = useRouter();
useViewportSize();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cachedMainView = ref<any>(undefined);
const initialized = ref<boolean>(false);
const loggedIn = ref<boolean>(false);

const routeHasDialog = computed<boolean>(() => route.matched[0]?.components?.dialog !== undefined);

let mainRoute: string | null = null;
let dialogStack: string[] = [];

function closeDialog(): void {
    dialogStack = [];
    if (mainRoute) {
        router.push(mainRoute);
    } else {
        router.push('/');
    }
}

async function init(): Promise<void> {
    console.info('🚀 Mounting app');
    await ctx.app.initialize();
    initialized.value = true;
    const redirect = await ctx.auth.login();
    loggedIn.value = true;
    if (redirect) {
        await router.push(redirect);
    }
    router.afterEach((to, from) => {
        const route = router.getRoutes().find((it) => it.name === to.name);
        if (route?.components?.dialog) {
            if (dialogStack.length === 0) {
                mainRoute = from?.fullPath || '/users';
            }
            dialogStack.push(to.fullPath);
        } else {
            dialogStack = [];
        }
        if (route?.components?.default) {
            cachedMainView.value = route?.components?.default;
        }
    });
}

init();
</script>
<style>
.europe {
    @apply text-primary-600;
}
</style>
