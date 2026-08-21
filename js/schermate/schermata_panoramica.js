// js/schermate/schermata_overview.js

const SchermataPanoramica = {
    template: `
        <v-container fluid class="pa-4">
            <!-- INTESTAZIONE E SELETTORE (PILOTI / SCUDERIE) -->
            <v-row align="center" class="mb-6">
                <v-col cols="12" md="8">
                    <h1 class="text-h4 text-red-darken-3 font-weight-bold">Overview Piloti e Scuderie</h1>
                </v-col>
                <v-col cols="12" md="4" class="text-md-right">
                    <v-btn-toggle v-model="tipoOverviewSelezionato" mandatory color="red-darken-3" variant="outlined" @update:model-value="chiudiDettaglio">
                        <v-btn value="piloti">Piloti</v-btn>
                        <v-btn value="scuderie">Scuderie</v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <!-- STATO DI CARICAMENTO -->
            <v-row v-if="caricamento" justify="center" class="my-12">
                <v-col cols="12" class="text-center">
                    <v-progress-circular indeterminate color="red-darken-3" size="64"></v-progress-circular>
                    <p class="text-subtitle-1 mt-4 text-grey">Sincronizzazione dati ufficiali OpenF1 in corso...</p>
                </v-col>
            </v-row>

            <v-alert v-if="!caricamento && errore" type="error" variant="tonal" class="mb-6" closable>
                {{ errore }}
                <template v-slot:append>
                    <v-btn variant="text" @click="caricaDatiOverview">Riprova</v-btn>
                </template>
            </v-alert>

            <!-- ========================================================= -->
            <!-- VISTA 1: LISTA PILOTI (Card piccole e uniformi) -->
            <!-- ========================================================= -->
            <div v-if="!caricamento && tipoOverviewSelezionato === 'piloti' && !elementoSelezionato">
                <v-row>
                    <v-col cols="12" sm="6" md="3" v-for="pilota in listaPiloti" :key="pilota.driver_number">
                        <v-card elevation="2" class="pa-4 text-center cursor-pointer hover-card" @click="selezionaElemento(pilota)">
                            <v-chip class="position-absolute" style="top: 10px; right: 10px;" color="red-darken-3" size="small">
                                {{ pilota.posizione }}º
                            </v-chip>
                            <v-avatar size="90" class="my-3 elevation-2 bg-grey-lighten-2">
                                <v-img :src="pilota.foto" alt="Foto Pilota">
                                    <template v-slot:placeholder>
                                        <v-row class="fill-height ma-0" align="center" justify="center">
                                            <v-progress-circular indeterminate color="grey-lighten-5"></v-progress-circular>
                                        </v-row>
                                    </template>
                                </v-img>
                            </v-avatar>
                            <h3 class="text-h6 font-weight-bold mb-1">{{ pilota.nome }}</h3>
                            <p class="text-subtitle-2 text-red-darken-3 font-weight-bold mb-3">{{ pilota.punti }} pt.</p>
                            
                            <v-divider class="mb-3"></v-divider>
                            
                            <v-row class="text-center text-body-2">
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Podi</div>
                                    <div class="font-weight-bold">{{ pilota.podi }}</div>
                                </v-col>
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Giri Vel.</div>
                                    <div class="font-weight-bold">{{ pilota.giriVeloci }}</div>
                                </v-col>
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Pole</div>
                                    <div class="font-weight-bold">{{ pilota.poles }}</div>
                                </v-col>
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Vitt.</div>
                                    <div class="font-weight-bold">{{ pilota.vittorie }}</div>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
            </div>

            <!-- ========================================================= -->
            <!-- VISTA 2: LISTA SCUDERIE (Card piccole e uniformi) -->
            <!-- ========================================================= -->
            <div v-if="!caricamento && tipoOverviewSelezionato === 'scuderie' && !elementoSelezionato">
                <v-row>
                    <v-col cols="12" sm="6" md="3" v-for="scuderia in listaScuderie" :key="scuderia.nome">
                        <v-card elevation="2" class="pa-4 text-center cursor-pointer hover-card" @click="selezionaElemento(scuderia)">
                            <v-chip class="position-absolute" style="top: 10px; right: 10px;" color="red-darken-3" size="small">
                                {{ scuderia.posizione }}º
                            </v-chip>
                            <v-avatar size="80" class="my-3" :style="{ backgroundColor: '#' + scuderia.coloreTeam }">
                                <span class="text-h5 font-weight-bold text-white">{{ scuderia.nome.substring(0, 2).toUpperCase() }}</span>
                            </v-avatar>
                            <h3 class="text-h6 font-weight-bold mb-1">{{ scuderia.nome }}</h3>
                            <p class="text-subtitle-2 text-red-darken-3 font-weight-bold mb-3">{{ scuderia.punti }} pt.</p>
                            
                            <v-divider class="mb-3"></v-divider>
                            
                            <v-row class="text-center text-body-2">
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Podi</div>
                                    <div class="font-weight-bold">{{ scuderia.podi }}</div>
                                </v-col>
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Giri Vel.</div>
                                    <div class="font-weight-bold">{{ scuderia.giriVeloci }}</div>
                                </v-col>
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Pole</div>
                                    <div class="font-weight-bold">{{ scuderia.poles }}</div>
                                </v-col>
                                <v-col cols="3">
                                    <div class="text-caption text-grey">Vitt.</div>
                                    <div class="font-weight-bold">{{ scuderia.vittorie }}</div>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
            </div>

            <!-- ========================================================= -->
            <!-- SCHERMATA ESTESA (Dettaglio del singolo Pilota o Scuderia) -->
            <!-- ========================================================= -->
            <div v-if="elementoSelezionato">
                <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="chiudiDettaglio">
                    Torna alla lista
                </v-btn>

                <v-card elevation="3" class="pa-6 bg-grey-lighten-4">
                    <v-row align="center">
                        <v-col cols="12" md="3" class="text-center">
                            <v-avatar size="140" class="elevation-3" v-if="tipoOverviewSelezionato === 'piloti'">
                                <v-img :src="elementoSelezionato.foto"></v-img>
                            </v-avatar>
                            <v-avatar size="140" class="elevation-3" :style="{ backgroundColor: '#' + elementoSelezionato.coloreTeam }" v-else>
                                <span class="text-h3 font-weight-bold text-white">{{ elementoSelezionato.nome.substring(0, 2).toUpperCase() }}</span>
                            </v-avatar>
                        </v-col>
                        <v-col cols="12" md="9">
                            <div class="d-flex align-center mb-2">
                                <h2 class="text-h4 font-weight-bold mr-3">{{ elementoSelezionato.nome }}</h2>
                                <v-chip color="red-darken-3" variant="flat">Posizione: {{ elementoSelezionato.posizione }}°</v-chip>
                            </div>
                            
                            <!-- Sottotitolo specifico (Pilota vs Scuderia) -->
                            <p class="text-subtitle-1 text-grey-darken-2 mb-3" v-if="tipoOverviewSelezionato === 'piloti'">
                                Numero #{{ elementoSelezionato.numero }} — Team: {{ elementoSelezionato.teamNome }} — Nazionalità: {{ elementoSelezionato.nazionalita }}
                            </p>
                            <p class="text-subtitle-1 text-grey-darken-2 mb-3" v-else>
                                Scuderia Costruttori Ufficiale — Campionato Mondiale F1
                            </p>

                            <p class="text-body-2 text-grey-darken-1 mb-4">
                                Dettagli completi elaborati tramite le funzioni asincrone ufficiali di OpenF1 API.
                            </p>

                            <!-- Griglia Statistiche Estese -->
                            <v-row class="text-center bg-white pa-3 rounded elevation-1">
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">PUNTI</div>
                                    <div class="text-h6 font-weight-bold">{{ elementoSelezionato.punti }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">VITTORIE</div>
                                    <div class="text-h6 font-weight-bold">{{ elementoSelezionato.vittorie }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">PODI</div>
                                    <div class="text-h6 font-weight-bold">{{ elementoSelezionato.podi }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">POLES</div>
                                    <div class="text-h6 font-weight-bold">{{ elementoSelezionato.poles }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">GIRI VELOCI</div>
                                    <div class="text-h6 font-weight-bold">{{ elementoSelezionato.giriVeloci }}</div>
                                </v-col>
                                <!-- Ultima colonna variabile: DNF per Piloti, STAGIONI per Scuderie -->
                                <v-col cols="4" sm="2" v-if="tipoOverviewSelezionato === 'piloti'">
                                    <div class="text-caption text-grey">DNF (Ritiro)</div>
                                    <div class="text-h6 font-weight-bold text-red-darken-3">{{ elementoSelezionato.dnf }}</div>
                                </v-col>
                                <v-col cols="4" sm="2" v-else>
                                    <div class="text-caption text-grey">STAGIONI</div>
                                    <div class="text-h6 font-weight-bold text-red-darken-3">{{ elementoSelezionato.stagioni }}</div>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card>
            </div>
        </v-container>
    `,
    setup() {
        const { ref, onMounted } = Vue;

        const tipoOverviewSelezionato = ref('piloti');
        const elementoSelezionato = ref(null);
        const caricamento = ref(true);
        const errore = ref('');

        const listaPiloti = ref([]);
        const listaScuderie = ref([]);

        const caricaDatiOverview = async () => {
            caricamento.value = true;
            errore.value = '';
            try {
                const dati = await PanoramicaService.carica();
                listaPiloti.value = dati.piloti;
                listaScuderie.value = dati.scuderie;
            } catch (eccezione) {
                console.error("Errore durante il recupero dei dati dell'overview:", eccezione);
                listaPiloti.value = [];
                listaScuderie.value = [];
                errore.value = "Non è stato possibile recuperare i dati della panoramica.";
            } finally {
                caricamento.value = false;
            }
        };

        onMounted(() => {
            caricaDatiOverview();
        });

        const selezionaElemento = (elemento) => {
            elementoSelezionato.value = elemento;
        };

        const chiudiDettaglio = () => {
            elementoSelezionato.value = null;
        };

        return {
            tipoOverviewSelezionato,
            elementoSelezionato,
            caricamento,
            errore,
            listaPiloti,
            listaScuderie,
            caricaDatiOverview,
            selezionaElemento,
            chiudiDettaglio
        };
    }
};