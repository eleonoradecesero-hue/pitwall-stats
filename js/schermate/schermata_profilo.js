// js/schermate/schermata_profilo.js

const SchermataProfilo = {
    template: `
        <v-container fluid class="pa-4">
            <v-alert v-if="messaggio" :type="tipoMessaggio" variant="tonal" closable class="mb-4">{{ messaggio }}</v-alert>
            <v-card v-if="!utente" elevation="2" class="pa-6 mb-6 text-center">
                <v-icon icon="mdi-google" color="red-darken-3" size="48" class="mb-3"></v-icon>
                <h2 class="text-h5 font-weight-bold mb-2">Accedi per creare il tuo profilo</h2>
                <p class="text-body-2 text-grey-darken-1 mb-4">Salva preferenze e panoramiche su tutti i tuoi dispositivi.</p>
                <v-btn color="red-darken-3" prepend-icon="mdi-google" @click="accedi">Accedi con Google</v-btn>
            </v-card>
            <!-- TITOLO -->
            <v-row v-if="utente">
                <v-col cols="12">
                    <div class="d-flex align-center justify-space-between flex-wrap ga-3">
                        <h1 class="text-h4 text-red-darken-3 mb-2 font-weight-bold">Profilo Utente</h1>
                        <v-btn variant="outlined" color="red-darken-3" prepend-icon="mdi-logout" @click="esci">Esci</v-btn>
                    </div>
                </v-col>
            </v-row>

            <v-row v-if="utente">
                <!-- SEZIONE SINISTRA: Dati Personali -->
                <v-col cols="12" md="8">
                    <v-card elevation="2" class="pa-4 h-100">
                        <v-card-title class="text-h5 mb-4">Dati personali</v-card-title>
                        <v-card-text class="d-flex align-center py-8">
                            <v-avatar size="96" color="red-darken-3" class="mr-5 elevation-3">
                                <v-img v-if="utente.photoURL" :src="utente.photoURL" alt="Foto profilo"></v-img>
                                <span v-else class="text-h4 text-white font-weight-bold">{{ inizialiUtente }}</span>
                            </v-avatar>
                            <div>
                                <div class="text-overline text-grey-darken-1">Account Google</div>
                                <h2 class="text-h4 font-weight-black text-grey-darken-3">{{ datiUtente.nome }} {{ datiUtente.cognome }}</h2>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <!-- SEZIONE DESTRA: Avatar e Punti -->
                <v-col cols="12" md="4">
                    <v-card elevation="2" class="pa-4 text-center h-100">
                        <v-card-title class="justify-center text-h5 mb-4">Scegli il tuo avatar</v-card-title>
                        <v-card-text>
                            <!-- Cerchio dell'Avatar -->
                            <v-avatar size="120" color="grey-lighten-3" class="mb-4 elevation-2">
                                <v-icon icon="mdi-camera" size="50" color="grey" v-if="!datiUtente.avatar"></v-icon>
                                <span class="text-h2" v-else>{{ datiUtente.avatar }}</span>
                            </v-avatar>
                            
                            <!-- Griglia di bottoni per scegliere l'avatar -->
                            <v-row justify="center" class="mt-2">
                                <v-col cols="auto" v-for="icona in iconeAvatar" :key="icona">
                                    <v-btn icon variant="tonal" color="red" @click="datiUtente.avatar = icona">
                                        <span class="text-h5">{{ icona }}</span>
                                    </v-btn>
                                </v-col>
                            </v-row>

                            <v-divider class="my-6"></v-divider>

                            <!-- Punteggio Accumulato -->
                            <h3 class="text-h6 text-grey-darken-1">Punti accumulati</h3>
                            <p class="text-h3 font-weight-black text-red-darken-3 mt-2">
                                {{ datiUtente.puntiAccumulati }}
                                <v-icon icon="mdi-star" color="amber" size="30"></v-icon>
                            </p>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- SEZIONE INFERIORE: I Preferiti di Eleonora -->
            <v-row v-if="utente" class="mt-6">
                <v-col cols="12">
                    <v-card elevation="2" class="pa-4">
                        <v-card-title class="text-h5 mb-2">I miei Preferiti</v-card-title>
                        <v-card-text>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select v-model="preferiti.piloti" :items="listaPiloti" :item-props="pilota => ({ disabled: preferiti.piloti.length >= 2 && !preferiti.piloti.includes(pilota.id) })" item-title="nome" item-value="id" label="I miei piloti (massimo 2)" multiple chips closable-chips variant="outlined" @update:model-value="salvaPreferiti"></v-select>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-select v-model="preferiti.scuderia" :items="listaScuderie" item-title="nome" item-value="id" label="La mia scuderia" clearable variant="outlined" @update:model-value="salvaPreferiti"></v-select>
                                </v-col>
                            </v-row>
                            <v-alert v-if="preferiti.piloti.length < 2 || !preferiti.scuderia" type="info" variant="tonal" class="mb-4">Seleziona due piloti e una scuderia per completare il tuo profilo.</v-alert>
                            <v-row v-if="pilotiPreferiti.length || scuderiaPreferita" class="mt-2">
                                <v-col v-for="pilota in pilotiPreferiti" :key="pilota.id" cols="12" lg="6">
                                    <v-card elevation="3" class="pa-5 h-100 rounded-xl hover-card">
                                        <v-row align="center">
                                            <v-col cols="12" sm="4" class="text-center">
                                                <v-avatar size="130" class="elevation-3" :style="{ border: '4px solid ' + pilota.coloreTeam }">
                                                    <v-img :src="pilota.foto" cover alt="Foto Pilota"></v-img>
                                                </v-avatar>
                                            </v-col>
                                            <v-col cols="12" sm="8">
                                                <div class="d-flex align-center flex-wrap ga-2 mb-2">
                                                    <h2 class="text-h5 font-weight-black">{{ pilota.nome }}</h2>
                                                    <v-chip color="red-darken-3" size="small" class="font-weight-bold">{{ pilota.posizione }}º</v-chip>
                                                </div>
                                                <p class="text-subtitle-1 text-grey-darken-2 mb-3">#{{ pilota.numero }} · {{ pilota.teamNome }} · {{ pilota.nazionalita }}</p>
                                                <v-row class="text-center bg-grey-lighten-4 pa-2 rounded-lg" no-gutters>
                                                    <v-col cols="4"><div class="text-caption text-grey">PUNTI</div><div class="text-h6 font-weight-black text-red-darken-3">{{ pilota.punti }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">VITTORIE</div><div class="text-h6 font-weight-black text-amber-darken-3">{{ pilota.vittorie }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">PODI</div><div class="text-h6 font-weight-black">{{ pilota.podi }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">POLE</div><div class="text-h6 font-weight-black">{{ pilota.poles }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">GIRI V.</div><div class="text-h6 font-weight-black">{{ pilota.giriVeloci }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">DNF</div><div class="text-h6 font-weight-black">{{ pilota.dnf }}</div></v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                                <v-col v-if="scuderiaPreferita" cols="12" lg="6">
                                    <v-card elevation="3" class="pa-5 h-100 rounded-xl hover-card">
                                        <v-row align="center">
                                            <v-col cols="12" sm="4" class="text-center">
                                                <div class="d-flex justify-center align-center" style="height: 130px;">
                                                    <v-img v-if="scuderiaPreferita.logo" :src="scuderiaPreferita.logo" max-height="110" max-width="180" contain alt="Logo scuderia"></v-img>
                                                    <v-avatar v-else size="120" :style="{ backgroundColor: scuderiaPreferita.coloreHex }"><span class="text-h3 font-weight-bold text-white">{{ scuderiaPreferita.nome.substring(0, 2).toUpperCase() }}</span></v-avatar>
                                                </div>
                                            </v-col>
                                            <v-col cols="12" sm="8">
                                                <div class="d-flex align-center flex-wrap ga-2 mb-2">
                                                    <h2 class="text-h5 font-weight-black">{{ scuderiaPreferita.nome }}</h2>
                                                    <v-chip color="red-darken-3" size="small" class="font-weight-bold">{{ scuderiaPreferita.posizione }}º</v-chip>
                                                </div>
                                                <p class="text-subtitle-1 text-grey-darken-2 mb-3">{{ scuderiaPreferita.nazionalita }} · {{ scuderiaPreferita.stagioni }} stagioni</p>
                                                <v-row class="text-center bg-grey-lighten-4 pa-2 rounded-lg" no-gutters>
                                                    <v-col cols="4"><div class="text-caption text-grey">PUNTI</div><div class="text-h6 font-weight-black text-red-darken-3">{{ scuderiaPreferita.punti }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">VITTORIE</div><div class="text-h6 font-weight-black text-amber-darken-3">{{ scuderiaPreferita.vittorie }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">PODI</div><div class="text-h6 font-weight-black">{{ scuderiaPreferita.podi }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">POLE</div><div class="text-h6 font-weight-black">{{ scuderiaPreferita.poles }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">GIRI V.</div><div class="text-h6 font-weight-black">{{ scuderiaPreferita.giriVeloci }}</div></v-col>
                                                    <v-col cols="4"><div class="text-caption text-grey">STAGIONI</div><div class="text-h6 font-weight-black">{{ scuderiaPreferita.stagioni }}</div></v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                    </v-card>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    `,
    setup() {
        const { ref, computed, onMounted } = Vue;

        const utente = ref(null);
        const listaPiloti = ref([]);
        const listaScuderie = ref([]);
        const messaggio = ref('');
        const tipoMessaggio = ref('info');

        // 1. Variabile reattiva che contiene tutti i dati del form legati con v-model
        const datiUtente = ref({ ...ProfiloService.datiUtentePredefiniti });
        const preferiti = ref({ piloti: [], scuderia: null });
        const pilotiPreferiti = computed(() => listaPiloti.value.filter(pilota => preferiti.value.piloti.includes(pilota.id)));
        const scuderiaPreferita = computed(() => listaScuderie.value.find(scuderia => scuderia.id === preferiti.value.scuderia));
        const inizialiUtente = computed(() => `${datiUtente.value.nome[0] || ''}${datiUtente.value.cognome[0] || ''}`.toUpperCase());

        // 2. Lista di emoji da usare come avatar (al posto delle foto rosse del mockup)
        const iconeAvatar = ['🏎️', '🏁', '🏆', '🔥', '🚀', '💨'];

        // 3. Funzione che scatta quando si preme "Salva Modifiche"
        const mostraMessaggio = (testo, tipo = 'info') => {
            messaggio.value = testo;
            tipoMessaggio.value = tipo;
        };

        const caricaPreferenze = async () => {
            const profilo = await ProfiloService.caricaProfilo(utente.value);
            datiUtente.value = profilo.datiUtente;
            preferiti.value = profilo.preferiti;
        };

        const accedi = async () => { try { await ProfiloService.accediConGoogle(); } catch (errore) { mostraMessaggio(errore.message, 'error'); } };
        const esci = () => ProfiloService.esci();
        const salvaPreferiti = async () => {
            preferiti.value.piloti = preferiti.value.piloti.slice(0, 2);
            if (!utente.value) return;
            try {
                preferiti.value = await ProfiloService.salvaPreferiti(utente.value, preferiti.value);
                mostraMessaggio('Preferiti salvati.', 'success');
            } catch (errore) { mostraMessaggio('Impossibile salvare i preferiti su Firebase.', 'error'); }
        };
        onMounted(async () => {
            try {
                const liste = await ProfiloService.caricaListe();
                listaPiloti.value = liste.piloti;
                listaScuderie.value = liste.scuderie;
                ProfiloService.osservaAutenticazione(async nuovoUtente => {
                    utente.value = nuovoUtente;
                    if (nuovoUtente) await caricaPreferenze();
                });
                if (!ProfiloService.configurato()) mostraMessaggio('Configura Firebase in js/firebase_config.js per attivare il login Google.', 'warning');
            } catch (errore) { mostraMessaggio('Impossibile caricare piloti e scuderie.', 'error'); }
        });

        return {
            datiUtente,
            iconeAvatar,
            utente,
            listaPiloti,
            listaScuderie,
            preferiti,
            pilotiPreferiti,
            scuderiaPreferita,
            inizialiUtente,
            messaggio,
            tipoMessaggio,
            accedi,
            esci,
            salvaPreferiti
        };
    }
};