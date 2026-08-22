// js/schermate/schermata_panoramica.js

/**
 * ======================================================================================
 * PITWALL STATS - SCHERMATA PANORAMICA (Piloti e Scuderie)
 * ======================================================================================
 * Questa schermata offre una panoramica dettagliata di tutti i protagonisti della F1:
 * 1. Griglia Piloti: foto, scuderia, punti mondiali, podi, pole, vittorie e giri veloci.
 * 2. Griglia Scuderie: loghi vettoriali, colori ufficiali, punti e statistiche aggregate.
 * 3. Vista espansa al click con scheda anagrafica completa e indicatori di rendimento.
 * ======================================================================================
 */

const SchermataPanoramica = {
    template: `
        <v-container fluid class="pa-2 pa-md-4">
            <!-- HERO HEADER -->
            <v-card elevation="3" class="mb-6 overflow-hidden hero-f1-card text-white">
                <v-card-text class="pa-6 pa-md-8">
                    <v-row align="center" justify="space-between">
                        <v-col cols="12" md="8">
                            <div class="d-flex align-center gap-2 mb-2">
                                <v-chip color="white" variant="outlined" size="small" class="font-weight-bold mr-2">
                                    FORMULA 1
                                </v-chip>
                                <v-chip color="red-lighten-2" variant="tonal" size="small" class="font-weight-bold">
                                    {{ tipoPanoramicaSelezionato === 'piloti' ? 'Griglia Piloti' : 'Scuderie Ufficiali' }}
                                </v-chip>
                            </div>

                            <h1 class="text-h4 text-md-h3 font-weight-black d-flex align-center">
                                <v-icon icon="mdi-view-dashboard" class="mr-3 text-red-accent-2" size="40"></v-icon>
                                <span>Piloti & Scuderie</span>
                            </h1>
                            <p class="text-subtitle-1 text-grey-lighten-2 mt-1">
                                Statistiche avanzate, podi, vittorie e dettagli anagrafici dei protagonisti
                            </p>
                        </v-col>

                        <v-col cols="12" md="4" class="text-md-right mt-3 mt-md-0">
                            <v-btn-toggle 
                                v-model="tipoPanoramicaSelezionato" 
                                mandatory 
                                color="white" 
                                class="elevation-2 bg-black-opacity rounded-pill pa-1"
                                @update:model-value="chiudiDettaglio"
                            >
                                <v-btn value="piloti" prepend-icon="mdi-account" class="rounded-pill font-weight-bold px-4" size="small">
                                    Piloti
                                </v-btn>
                                <v-btn value="scuderie" prepend-icon="mdi-car-sports" class="rounded-pill font-weight-bold px-4" size="small">
                                    Scuderie
                                </v-btn>
                            </v-btn-toggle>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- STATO DI CARICAMENTO -->
            <v-row v-if="caricamento" justify="center" align="center" style="min-height: 350px;">
                <v-col cols="12" class="text-center">
                    <v-progress-circular indeterminate color="red-darken-3" size="64" width="6"></v-progress-circular>
                    <p class="text-h6 mt-4 text-grey-darken-1 font-weight-medium">
                        Sincronizzazione dati con Jolpica F1 API in corso...
                    </p>
                </v-col>
            </v-row>

            <v-alert v-if="!caricamento && errore" type="error" variant="tonal" class="mb-6" closable>
                {{ errore }}
                <template v-slot:append>
                    <v-btn variant="text" @click="caricaDatiPanoramica">Riprova</v-btn>
                </template>
            </v-alert>

            <!-- CONTENUTO PRINCIPALE (Se non in caricamento) -->
            <div v-if="!caricamento && !errore">
                <!-- ========================================================= -->
                <!-- VISTA 1: LISTA PILOTI                                     -->
                <!-- ========================================================= -->
                <div v-if="tipoPanoramicaSelezionato === 'piloti' && !elementoSelezionato">
                    <v-row>
                        <v-col cols="12" sm="6" md="3" v-for="pilota in listaPiloti" :key="pilota.driver_number || pilota.nome">
                            <v-card 
                                elevation="2" 
                                class="pa-4 text-center cursor-pointer hover-card rounded-xl h-100 d-flex flex-column justify-space-between" 
                                @click="selezionaElemento(pilota)"
                            >
                                <div>
                                    <div class="d-flex justify-space-between align-center mb-1">
                                        <span class="text-body-2">{{ pilota.bandieraNazionalita }}</span>
                                        <v-chip color="red-darken-3" size="small" variant="flat" class="font-weight-bold">
                                            {{ pilota.posizione }}º
                                        </v-chip>
                                    </div>

                                    <v-avatar size="95" class="my-3 elevation-3" :style="{ border: '3px solid ' + pilota.coloreTeam }">
                                        <v-img :src="pilota.foto" cover alt="Foto Pilota">
                                            <template v-slot:error>
                                                <span class="text-h5 font-weight-bold">{{ pilota.nome.slice(0, 3).toUpperCase() }}</span>
                                            </template>
                                        </v-img>
                                    </v-avatar>

                                    <h3 class="text-subtitle-1 font-weight-bold text-truncate mb-1">{{ pilota.nome }}</h3>
                                    <p class="text-caption text-grey-darken-1 text-truncate mb-2">{{ pilota.teamNome }}</p>
                                    <v-chip color="red-darken-3" variant="outlined" size="small" class="font-weight-black mb-3">
                                        {{ pilota.punti }} PT
                                    </v-chip>
                                </div>
                                
                                <div>
                                    <v-divider class="mb-3"></v-divider>
                                    <v-row class="text-center text-caption" no-gutters>
                                        <v-col cols="3">
                                            <div class="text-grey">Podi</div>
                                            <div class="font-weight-bold">{{ pilota.podi }}</div>
                                        </v-col>
                                        <v-col cols="3">
                                            <div class="text-grey">Giri V.</div>
                                            <div class="font-weight-bold">{{ pilota.giriVeloci }}</div>
                                        </v-col>
                                        <v-col cols="3">
                                            <div class="text-grey">Pole</div>
                                            <div class="font-weight-bold">{{ pilota.poles }}</div>
                                        </v-col>
                                        <v-col cols="3">
                                            <div class="text-grey">Vitt.</div>
                                            <div class="font-weight-bold text-amber-darken-3">{{ pilota.vittorie }}</div>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <!-- ========================================================= -->
                <!-- VISTA 2: LISTA SCUDERIE                                   -->
                <!-- ========================================================= -->
                <div v-if="tipoPanoramicaSelezionato === 'scuderie' && !elementoSelezionato">
                    <v-row>
                        <v-col cols="12" sm="6" md="3" v-for="scuderia in listaScuderie" :key="scuderia.nome">
                            <v-card 
                                elevation="2" 
                                class="pa-4 text-center cursor-pointer hover-card rounded-xl h-100 d-flex flex-column justify-space-between" 
                                @click="selezionaElemento(scuderia)"
                            >
                                <div>
                                    <div class="d-flex justify-end mb-1">
                                        <v-chip color="red-darken-3" size="small" variant="flat" class="font-weight-bold">
                                            {{ scuderia.posizione }}º
                                        </v-chip>
                                    </div>

                                    <div class="my-3 d-flex justify-center align-center" style="height: 80px;">
                                        <v-img v-if="scuderia.logo" :src="scuderia.logo" max-height="65" max-width="130" contain></v-img>
                                        <v-avatar v-else size="75" :style="{ backgroundColor: scuderia.coloreHex }">
                                            <span class="text-h5 font-weight-bold text-white">{{ scuderia.nome.substring(0, 2).toUpperCase() }}</span>
                                        </v-avatar>
                                    </div>

                                    <h3 class="text-subtitle-1 font-weight-bold text-truncate mb-1">{{ scuderia.nome }}</h3>
                                    <p class="text-caption text-grey mb-2">{{ scuderia.nazionalita }}</p>
                                    <v-chip color="red-darken-3" variant="outlined" size="small" class="font-weight-black mb-3">
                                        {{ scuderia.punti }} PT
                                    </v-chip>
                                </div>
                                
                                <div>
                                    <v-divider class="mb-3"></v-divider>
                                    <v-row class="text-center text-caption" no-gutters>
                                        <v-col cols="3">
                                            <div class="text-grey">Podi</div>
                                            <div class="font-weight-bold">{{ scuderia.podi }}</div>
                                        </v-col>
                                        <v-col cols="3">
                                            <div class="text-grey">Giri V.</div>
                                            <div class="font-weight-bold">{{ scuderia.giriVeloci }}</div>
                                        </v-col>
                                        <v-col cols="3">
                                            <div class="text-grey">Pole</div>
                                            <div class="font-weight-bold">{{ scuderia.poles }}</div>
                                        </v-col>
                                        <v-col cols="3">
                                            <div class="text-grey">Vitt.</div>
                                            <div class="font-weight-bold text-amber-darken-3">{{ scuderia.vittorie }}</div>
                                        </v-col>
                                    </v-row>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <!-- ========================================================= -->
                <!-- VISTA 3: SCHEDA ESTESA DETTAGLIO                         -->
                <!-- ========================================================= -->
                <div v-if="elementoSelezionato">
                    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4 font-weight-bold" @click="chiudiDettaglio">
                        Torna all'elenco
                    </v-btn>

                    <v-card elevation="3" class="pa-6 bg-grey-lighten-4 rounded-xl">
                        <v-row align="center">
                            <v-col cols="12" md="3" class="text-center">
                                <v-avatar size="140" class="elevation-3" v-if="tipoPanoramicaSelezionato === 'piloti'" :style="{ border: '4px solid ' + elementoSelezionato.coloreTeam }">
                                    <v-img :src="elementoSelezionato.foto" cover></v-img>
                                </v-avatar>
                                <div v-else class="d-flex justify-center align-center" style="height: 140px;">
                                    <v-img v-if="elementoSelezionato.logo" :src="elementoSelezionato.logo" max-height="110" max-width="180" contain></v-img>
                                    <v-avatar v-else size="130" :style="{ backgroundColor: elementoSelezionato.coloreHex }">
                                        <span class="text-h3 font-weight-bold text-white">{{ elementoSelezionato.nome.substring(0, 2).toUpperCase() }}</span>
                                    </v-avatar>
                                </div>
                            </v-col>

                            <v-col cols="12" md="9">
                                <div class="d-flex align-center flex-wrap gap-2 mb-2">
                                    <h2 class="text-h4 font-weight-black mr-3">{{ elementoSelezionato.nome }}</h2>
                                    <v-chip color="red-darken-3" variant="flat" class="font-weight-bold">
                                        {{ elementoSelezionato.posizione }}° nel Mondiale
                                    </v-chip>
                                </div>
                                
                                <p class="text-subtitle-1 text-grey-darken-2 mb-3" v-if="tipoPanoramicaSelezionato === 'piloti'">
                                    Numero #{{ elementoSelezionato.numero }} — Scuderia: {{ elementoSelezionato.teamNome }} — Nazionalità: {{ elementoSelezionato.nazionalita }}
                                </p>
                                <p class="text-subtitle-1 text-grey-darken-2 mb-3" v-else>
                                    Scuderia Costruttori Ufficiale — Nazionalità: {{ elementoSelezionato.nazionalita }}
                                </p>

                                <!-- Griglia Statistiche Estese -->
                                <v-row class="text-center bg-white pa-4 rounded-xl elevation-1 mt-2">
                                    <v-col cols="4" sm="2">
                                        <div class="text-caption text-grey font-weight-bold">PUNTI</div>
                                        <div class="text-h6 font-weight-black text-red-darken-3">{{ elementoSelezionato.punti }}</div>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <div class="text-caption text-grey font-weight-bold">VITTORIE</div>
                                        <div class="text-h6 font-weight-black text-amber-darken-3">{{ elementoSelezionato.vittorie }}</div>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <div class="text-caption text-grey font-weight-bold">PODI</div>
                                        <div class="text-h6 font-weight-black">{{ elementoSelezionato.podi }}</div>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <div class="text-caption text-grey font-weight-bold">POLES</div>
                                        <div class="text-h6 font-weight-black">{{ elementoSelezionato.poles }}</div>
                                    </v-col>
                                    <v-col cols="4" sm="2">
                                        <div class="text-caption text-grey font-weight-bold">GIRI VELOCI</div>
                                        <div class="text-h6 font-weight-black">{{ elementoSelezionato.giriVeloci }}</div>
                                    </v-col>
                                    <v-col cols="4" sm="2" v-if="tipoPanoramicaSelezionato === 'piloti'">
                                        <div class="text-caption text-grey font-weight-bold">DNF (Ritiri)</div>
                                        <div class="text-h6 font-weight-black text-grey-darken-1">{{ elementoSelezionato.dnf }}</div>
                                    </v-col>
                                    <v-col cols="4" sm="2" v-else>
                                        <div class="text-caption text-grey font-weight-bold">STAGIONI</div>
                                        <div class="text-h6 font-weight-black text-grey-darken-1">{{ elementoSelezionato.stagioni }}</div>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </div>
            </div>
        </v-container>
    `,

    setup() {
        const { ref, onMounted } = Vue;

        const tipoPanoramicaSelezionato = ref('piloti');
        const elementoSelezionato = ref(null);
        const caricamento = ref(true);
        const errore = ref('');

        const listaPiloti = ref([]);
        const listaScuderie = ref([]);

        const caricaDatiPanoramica = async () => {
            caricamento.value = true;
            errore.value = '';
            try {
                console.log("[SchermataPanoramica] Caricamento panoramica da PanoramicaService...");
                const dati = await PanoramicaService.carica();
                listaPiloti.value = dati.piloti;
                listaScuderie.value = dati.scuderie;
            } catch (eccezione) {
                console.error("Errore durante il recupero dei dati della panoramica:", eccezione);
                listaPiloti.value = [];
                listaScuderie.value = [];
                errore.value = "Non è stato possibile recuperare i dati della panoramica da Jolpica F1 API.";
            } finally {
                caricamento.value = false;
            }
        };

        onMounted(() => {
            caricaDatiPanoramica();
        });

        const selezionaElemento = (elemento) => {
            elementoSelezionato.value = elemento;
        };

        const chiudiDettaglio = () => {
            elementoSelezionato.value = null;
        };

        return {
            tipoPanoramicaSelezionato,
            elementoSelezionato,
            caricamento,
            errore,
            listaPiloti,
            listaScuderie,
            caricaDatiPanoramica,
            selezionaElemento,
            chiudiDettaglio
        };
    }
};