// js/schermate/schermata_calendario.js

/**
 * ======================================================================================
 * PITWALL STATS - SCHERMATA CALENDARIO (Calendario)
 * ======================================================================================
 * Questa schermata visualizza il calendario ufficiale della Formula 1:
 * 1. Selezione dinamica della stagione (2026, 2025, 2024, ecc.).
 * 2. Suddivisione automatica tra "Prossimi GP (In arrivo)" e "Gare Passate / Storico"
 *    delegata al servizio specializzato CalendarioService.
 * 3. Consultazione dell'ordine d'arrivo ufficiale completo per ciascun Gran Premio concluso
 *    tramite finestra modale (posizioni, tempi, punti e giri veloci).
 * ======================================================================================
 */

const SchermataCalendario = {
    template: `
        <v-container fluid class="pa-2 pa-md-4">
            <!-- HERO HEADER: INTESTAZIONE E SELETTORE ANNO -->
            <v-card elevation="3" class="mb-6 overflow-hidden hero-f1-card text-white">
                <v-card-text class="pa-6 pa-md-8">
                    <v-row align="center" justify="space-between">
                        <v-col cols="12" md="8">
                            <div class="d-flex align-center gap-2 mb-2">
                                <v-chip color="white" variant="outlined" size="small" class="font-weight-bold mr-2">
                                    CALENDARIO UFFICIALE
                                </v-chip>
                                <v-chip color="red-lighten-2" variant="tonal" size="small" class="font-weight-bold">
                                    Stagione {{ annoSelezionato }}
                                </v-chip>
                            </div>

                            <h1 class="text-h4 text-md-h3 font-weight-black d-flex align-center">
                                <v-icon icon="mdi-calendar-month" class="mr-3 text-red-accent-2" size="40"></v-icon>
                                <span>Calendario Gran Premi</span>
                            </h1>
                            <p class="text-subtitle-1 text-grey-lighten-2 mt-1">
                                Orari di tutte le sessioni, circuiti e archivio risultati ufficiali
                            </p>
                        </v-col>

                        <v-col cols="12" md="4" class="text-md-right mt-3 mt-md-0">
                            <div style="min-width: 170px; max-width: 220px;" class="ml-md-auto">
                                <v-select
                                    v-model="annoSelezionato"
                                    :items="anniDisponibili"
                                    label="Seleziona Stagione"
                                    density="compact"
                                    variant="solo-filled"
                                    bg-color="rgba(0,0,0,0.4)"
                                    color="white"
                                    hide-details
                                    class="rounded-lg text-white"
                                    @update:model-value="caricaCalendario"
                                ></v-select>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- STATO DI CARICAMENTO (Spinner) -->
            <v-row v-if="inCaricamento" justify="center" align="center" style="min-height: 350px;">
                <v-col cols="12" class="text-center">
                    <v-progress-circular indeterminate color="red-darken-3" size="64" width="6"></v-progress-circular>
                    <p class="text-h6 mt-4 text-grey-darken-1 font-weight-medium">
                        Caricamento calendario ufficiale per la stagione {{ annoSelezionato }}...
                    </p>
                </v-col>
            </v-row>

            <!-- CONTENUTO CALENDARIO (Quando i dati sono caricati) -->
            <div v-else>
                <!-- ========================================================= -->
                <!-- SEZIONE 1: GARE IN ARRIVO (FUTURE)                        -->
                <!-- ========================================================= -->
                <div v-if="gareFuture.length > 0" class="mb-8">
                    <div class="d-flex align-center mb-4">
                        <v-icon icon="mdi-flag-checkered" color="red-darken-3" class="mr-2" size="28"></v-icon>
                        <h2 class="text-h5 font-weight-bold text-grey-darken-3">Prossimi Gran Premi</h2>
                        <v-chip color="red-darken-3" size="small" class="ml-3 font-weight-bold">
                            {{ gareFuture.length }} in programma
                        </v-chip>
                    </div>

                    <v-row>
                        <v-col cols="12" sm="6" md="4" v-for="gara in gareFuture" :key="gara.round">
                            <v-card elevation="2" class="pa-4 h-100 hover-card rounded-xl border-left-upcoming d-flex flex-column justify-space-between">
                                <div>
                                    <div class="d-flex align-center justify-space-between mb-2">
                                        <span class="text-h4">{{ gara.bandiera }}</span>
                                        <v-chip color="red-darken-3" size="small" variant="flat" class="font-weight-bold">
                                            ROUND {{ gara.round }}
                                        </v-chip>
                                    </div>

                                    <h3 class="text-h6 font-weight-bold mb-1">{{ gara.raceName }}</h3>
                                    <p class="text-subtitle-2 text-grey-darken-1 mb-2 d-flex align-center">
                                        <v-icon icon="mdi-map-marker-outline" size="small" class="mr-1"></v-icon>
                                        {{ gara.circuitoNome }} ({{ gara.localita }})
                                    </p>
                                </div>

                                <div class="mt-4 pt-3 border-top">
                                    <div class="d-flex align-center text-body-2 font-weight-bold text-grey-darken-2 mb-2">
                                        <v-icon icon="mdi-calendar" size="small" class="mr-1 text-red"></v-icon>
                                        Gara: {{ gara.dataFormattata }}
                                    </div>
                                    <div class="d-flex align-center text-caption text-grey">
                                        <v-icon icon="mdi-clock-outline" size="small" class="mr-1"></v-icon>
                                        Partenza ore {{ gara.oraPartenza }}
                                    </div>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <!-- ========================================================= -->
                <!-- SEZIONE 2: GARE CONCLUSE / ARCHIVIO STORICO               -->
                <!-- ========================================================= -->
                <div v-if="garePassate.length > 0">
                    <div class="d-flex align-center mb-4">
                        <v-icon icon="mdi-trophy-outline" color="grey-darken-2" class="mr-2" size="28"></v-icon>
                        <h2 class="text-h5 font-weight-bold text-grey-darken-3">Gare Concluse / Archivio Risultati</h2>
                        <v-chip color="grey-darken-2" size="small" class="ml-3 font-weight-bold">
                            {{ garePassate.length }} disputate
                        </v-chip>
                    </div>

                    <v-row>
                        <v-col cols="12" sm="6" md="4" v-for="gara in garePassate" :key="gara.round">
                            <v-card elevation="1" class="pa-4 h-100 hover-card rounded-xl bg-grey-lighten-5 d-flex flex-column justify-space-between">
                                <div>
                                    <div class="d-flex align-center justify-space-between mb-2">
                                        <span class="text-h4">{{ gara.bandiera }}</span>
                                        <v-chip color="grey-darken-1" size="small" variant="tonal" class="font-weight-bold">
                                            ROUND {{ gara.round }} • CONCLUSA
                                        </v-chip>
                                    </div>

                                    <h3 class="text-h6 font-weight-bold mb-1">{{ gara.raceName }}</h3>
                                    <p class="text-subtitle-2 text-grey-darken-1 mb-2 d-flex align-center">
                                        <v-icon icon="mdi-map-marker-outline" size="small" class="mr-1"></v-icon>
                                        {{ gara.circuitoNome }}
                                    </p>
                                </div>

                                <div class="mt-4 pt-3 border-top">
                                    <div class="d-flex align-center text-body-2 text-grey-darken-2 mb-3">
                                        <v-icon icon="mdi-calendar-check" size="small" class="mr-1 text-grey"></v-icon>
                                        Disputata il {{ gara.dataFormattata }}
                                    </div>

                                    <v-btn 
                                        color="red-darken-3" 
                                        variant="elevated" 
                                        block 
                                        size="small" 
                                        prepend-icon="mdi-trophy"
                                        @click="mostraRisultatiGara(gara)"
                                    >
                                        Vedi Ordine d'Arrivo
                                    </v-btn>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>

                <!-- FOOTER INFORMATIVO -->
                <v-row class="mt-6">
                    <v-col cols="12" class="text-center text-caption text-grey">
                        <v-icon icon="mdi-sync" size="small" class="mr-1"></v-icon>
                        Calendario ufficiale sincronizzato in tempo reale da Jolpica F1 API
                    </v-col>
                </v-row>
            </div>

            <!-- MODALE RISULTATI GARA UFFICIALI -->
            <v-dialog v-model="dialogRisultati" max-width="700" scrollable>
                <v-card v-if="garaSelezionata" class="rounded-xl">
                    <v-card-title class="pa-4 bg-red-darken-3 text-white d-flex align-center justify-space-between">
                        <div>
                            <div class="text-caption text-red-lighten-4">ROUND {{ garaSelezionata.round }} • {{ garaSelezionata.season }}</div>
                            <div class="text-h6 font-weight-black d-flex align-center">
                                <span class="mr-2">{{ garaSelezionata.bandiera }}</span>
                                <span>{{ garaSelezionata.raceName }}</span>
                            </div>
                        </div>
                        <v-btn icon="mdi-close" variant="text" color="white" @click="dialogRisultati = false"></v-btn>
                    </v-card-title>

                    <v-card-text class="pa-4">
                        <!-- STATO CARICAMENTO RISULTATI -->
                        <div v-if="caricamentoRisultati" class="text-center py-8">
                            <v-progress-circular indeterminate color="red-darken-3" size="48"></v-progress-circular>
                            <p class="text-subtitle-2 mt-3 text-grey">Recupero ordine d'arrivo ufficiale...</p>
                        </div>

                        <!-- TABELLA ORDINE D'ARRIVO -->
                        <div v-else-if="risultatiGara.length > 0">
                            <v-table hover density="compact">
                                <thead>
                                    <tr>
                                        <th class="font-weight-bold text-center">Pos</th>
                                        <th class="font-weight-bold">Pilota</th>
                                        <th class="font-weight-bold">Scuderia</th>
                                        <th class="font-weight-bold text-center">Giri</th>
                                        <th class="font-weight-bold text-right">Tempo / Stato</th>
                                        <th class="font-weight-bold text-right">Punti</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="res in risultatiGara" :key="res.posizione">
                                        <td class="text-center font-weight-bold" :class="{'text-amber-darken-3': res.posizione === 1, 'text-grey-darken-2': res.posizione === 2, 'text-brown-darken-1': res.posizione === 3}">
                                            {{ res.posizione }}°
                                        </td>
                                        <td>
                                            <div class="font-weight-bold d-flex align-center">
                                                <span class="mr-1">{{ res.bandieraPilota }}</span>
                                                <span>{{ res.nomePilota }}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span class="text-caption font-weight-medium" :style="{ color: res.coloreScuderia }">
                                                {{ res.scuderia }}
                                            </span>
                                        </td>
                                        <td class="text-center text-caption">{{ res.giriCompletati }}</td>
                                        <td class="text-right text-caption font-weight-medium">
                                            {{ res.tempoFinale }}
                                        </td>
                                        <td class="text-right font-weight-black text-red-darken-3">
                                            +{{ res.puntiAssegnati }}
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </div>

                        <div v-else class="text-center py-6 text-grey">
                            Risultati dettagliati per questa sessione non ancora disponibili.
                        </div>
                    </v-card-text>

                    <v-card-actions class="pa-4 border-top justify-end">
                        <v-btn color="grey-darken-1" variant="text" @click="dialogRisultati = false">Chiudi</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    `,

    setup() {
        const { ref, onMounted } = Vue;

        // 1. STATO REATTIVO
        const inCaricamento = ref(true);
        const annoSelezionato = ref(2026);
        const anniDisponibili = [2026, 2025, 2024, 2023, 2022];
        const gareFuture = ref([]);
        const garePassate = ref([]);

        // Dialog Risultati
        const dialogRisultati = ref(false);
        const garaSelezionata = ref(null);
        const risultatiGara = ref([]);
        const caricamentoRisultati = ref(false);

        /**
         * 2. Caricamento del Calendario tramite CalendarioService
         */
        const caricaCalendario = async () => {
            inCaricamento.value = true;
            try {
                console.log(`[SchermataCalendario] Caricamento calendario per l'anno ${annoSelezionato.value}...`);
                const dati = await CalendarioService.recuperaCalendario(annoSelezionato.value);
                gareFuture.value = dati.gareFuture;
                garePassate.value = dati.garePassate;
            } catch (errore) {
                console.error("[SchermataCalendario] Errore nel caricamento del calendario:", errore);
                gareFuture.value = [];
                garePassate.value = [];
            } finally {
                inCaricamento.value = false;
            }
        };

        /**
         * 3. Apertura del Dialog dei Risultati tramite CalendarioService
         */
        const mostraRisultatiGara = async (gara) => {
            garaSelezionata.value = gara;
            dialogRisultati.value = true;
            caricamentoRisultati.value = true;
            risultatiGara.value = [];

            try {
                const risultati = await CalendarioService.recuperaRisultatiGara(gara.season, gara.round);
                risultatiGara.value = risultati;
            } catch (errore) {
                console.error("[SchermataCalendario] Errore nel recupero dei risultati:", errore);
            } finally {
                caricamentoRisultati.value = false;
            }
        };

        // 4. LIFECYCLE
        onMounted(async () => {
            await caricaCalendario();
        });

        return {
            inCaricamento,
            annoSelezionato,
            anniDisponibili,
            gareFuture,
            garePassate,
            dialogRisultati,
            garaSelezionata,
            risultatiGara,
            caricamentoRisultati,
            caricaCalendario,
            mostraRisultatiGara
        };
    }
};