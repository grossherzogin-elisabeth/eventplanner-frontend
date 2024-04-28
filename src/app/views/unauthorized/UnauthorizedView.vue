<template>
    <div class="mt-8">
        <h2 class="card-headline">Diese Seite ist nur für angemeldete Benutzer sichtbar</h2>
    </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Context } from '@/app/Context';
import { Routes } from '@/app/views/Routes';
import { useContext } from '@/lib/composables';

const ctx = useContext<Context>(Context);
const router = useRouter();

async function init(): Promise<void> {
    await ctx.auth.onLogin();
    await router.push({ name: Routes.Events, params: { year: new Date().getFullYear() } });
}
init();
</script>
