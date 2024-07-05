<template>
    <div>
        <VTabs v-model="tab" class="sticky top-12 z-10 bg-primary-50 pt-4 xl:top-0" :tabs="tabs">
            <template #[Tab.ACCOUNT_DATA]>
                <section v-if="userDetails" class="-mx-4">
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Geschlecht</VInputLabel>
                        <VInputSelect v-model="user.gender" :options="genderOptions" required />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Vorname</VInputLabel>
                        <VInputText v-model="userDetails.firstName" required disabled />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Nachname</VInputLabel>
                        <VInputText v-model="userDetails.lastName" required disabled />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Geboren am</VInputLabel>
                        <VInputDate required v-model="userDetails.dateOfBirth" />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Geburtsort</VInputLabel>
                        <VInputText v-model="userDetails.placeOfBirth" />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Pass Nummer</VInputLabel>
                        <VInputText v-model="userDetails.passNr" />
                    </div>
                </section>
            </template>
            <template #[Tab.ACCOUNT_CONTACT_DATA]>
                <section v-if="userDetails" class="-mx-4">
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Email</VInputLabel>
                        <VInputText v-model="userDetails.email" required />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Straße, Hausnr</VInputLabel>
                        <VInputText v-model="userDetails.address.addressLine1" />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Adresszusatz</VInputLabel>
                        <VInputText v-model="userDetails.address.addressLine2" />
                    </div>
                    <div class="flex space-x-4 md:w-1/2">
                        <div class="mb-2 w-24">
                            <VInputLabel>PLZ</VInputLabel>
                            <VInputText v-model="userDetails.address.zipcode
" />
                        </div>
                        <div class="mb-2 flex-grow">
                            <VInputLabel>Ort</VInputLabel>
                            <VInputText v-model="userDetails.address.town" />
                        </div>
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Telefon</VInputLabel>
                        <VInputText v-model="userDetails.phone" />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Mobil</VInputLabel>
                        <VInputText v-model="userDetails.mobile" />
                    </div>
                </section>
            </template>
            <template #[Tab.ACCOUNT_CREDENTIALS]>
                <section class="-mx-4">
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>ID</VInputLabel>
                        <VInputText v-model="user.key" disabled />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Benutzername</VInputLabel>
                        <VInputText v-model="user.email" required disabled />
                    </div>
                    <div class="mb-2 md:w-1/2">
                        <VInputLabel>Password</VInputLabel>
                        <VInputText required disabled type="password" model-value="loremipsumdolorsitamet" />
                    </div>
                    <div class="mt-8 rounded-xl bg-primary-100 p-4 text-sm md:w-1/2">
                        <h2 class="mb-2">Hinweis zum Passwort ändern:</h2>
                        <p>
                            Aktuell kannst du dein Passwort noch nicht direkt hier in der App ändern. Bitte nutze dafür
                            vorerst die "Passwort vergessen" Funktion beim Login. Bei Fragen zu deinem Account wende
                            dich gerne an
                            <a href="mailto:admin@grossherzogin-elisabeth.de" class="text-primary-600">
                                admin@grossherzogin-elisabeth.de </a
                            >.
                        </p>
                    </div>
                </section>
            </template>
        </VTabs>
        <div class="h-full overflow-y-auto px-8 pb-8 pt-4 md:px-16 xl:px-20">
            <div class="max-w-2xl space-y-8 xl:space-y-16">
                <div v-if="user" class="fixed bottom-0 right-0 flex justify-end pb-4 pr-3 xl:px-16">
                    <button class="btn-primary btn-floating">
                        <i class="fa-solid fa-save"></i>
                        <span>Speichern</span>
                    </button>
                </div>
                <div class="h-5"></div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { Context } from '@/app/Context';
import { UserDetails } from '@/app/types';
import VTabs from '@/app/components/utils/VTabs.vue';
import { VInputDate, VInputSelect, VInputText } from '@/lib/components';
import VInputLabel from '@/lib/components/input/VInputLabel.vue';
import { useContext } from '@/lib/composables';
import type { InputSelectOption } from '@/lib/types';

enum Tab {
    ACCOUNT_DATA = 'app.account.tab.data',
    ACCOUNT_CONTACT_DATA = 'app.account.tab.contact',
    ACCOUNT_CREDENTIALS = 'app.account.tab.credentials',
}

const ctx = useContext<Context>(Context);
const user = ref(ctx.auth.getSignedInUser());
const userDetails = ref<UserDetails|null>(null);

const genderOptions: InputSelectOption[] = [
    { value: 'm', label: 'männlich' },
    { value: 'f', label: 'weiblich' },
    { value: 'd', label: 'divers' },
];

const tabs = [Tab.ACCOUNT_CREDENTIALS, Tab.ACCOUNT_DATA, Tab.ACCOUNT_CONTACT_DATA];
const tab = ref<Tab>(Tab.ACCOUNT_CREDENTIALS);


async function fetchUserDetails() {
    userDetails.value = await ctx.users.getUserDetailsForSignedInUser();
}

function init() {
    fetchUserDetails();
}

init();
</script>
