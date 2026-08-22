// js/schermate/schermata_home.js

/**
 * ======================================================================================
 * PITWALL STATS - SCHERMATA INIZIALE (Home)
 * ======================================================================================
 * Questa schermata visualizza:
 * 1. La scheda principale del prossimo Gran Premio in programma con bandiera, circuito e round.
 * 2. Il COUNTDOWN DINAMICO:
 *    - Se il weekend NON è iniziato -> countdown alla prima sessione (es. Prove Libere 1).
 *    - Se il weekend È INIZIATO (es. sabato durante le qualifiche) -> countdown per la GARA DI DOMENICA.
 *    - Se la gara è in corso -> indicatore "GARA IN CORSO".
 * 3. Il programma completo delle sessioni del weekend (PL1, PL2, PL3, Qualifiche, Sprint, Gara)
 *    con stato di svolgimento e pulsante Risultati.
 * 4. Finestra di dialogo per la consultazione dei risultati di sessione.
 * ======================================================================================
 */

const SchermataIniziale = {
    template: `
        <v-container fluid class="pa-2 pa-md-4">
            <!-- STATO DI CARICAMENTO (Loading Spinner) -->
            <v-row v-if="inCaricamento" justify="center" align="center" style="min-height: 350px;">
                <v-col cols="12" class="text-center">
                    <v-progress-circular indeterminate color="red-darken-3" size="64" width="6"></v-progress-circular>
                    <p class="text-h6 mt-4 text-grey-darken-1 font-weight-medium">
                        Sincronizzazione dati Gran Premio in corso...
                    </p>
                </v-col>
            </v-row>

            <!-- CONTENUTO PRINCIPALE (Mostrato quando i dati sono pronti) -->
            <div v-else-if="prossimaGara">
                <!-- HERO CARD: INFORMAZIONI GRAN PREMIO E COUNTDOWN -->
                <v-card elevation="3" class="mb-6 overflow-hidden hero-f1-card text-white">
                    <v-card-text class="pa-6 pa-md-8">
                        <!-- INTESTAZIONE GP: BADGE ROUND, STATO E TITOLO -->
                        <v-row align="center" justify="space-between" class="mb-2">
                            <v-col cols="12" sm="8">
                                <div class="d-flex align-center flex-wrap gap-2 mb-2">
                                    <!-- Chip del Round se disponibile -->
                                    <v-chip v-if="prossimaGara.round" color="white" variant="outlined" size="small" class="font-weight-bold mr-2">
                                        ROUND {{ prossimaGara.round }}
                                    </v-chip>
                                    
                                    <!-- Badge di stato del Weekend -->
                                    <v-chip v-if="prossimaGara.garaInCorso" color="yellow-accent-3" variant="flat" size="small" class="font-weight-bold text-black pulse-animation mr-2">
                                        🔴 GARA IN DIRETTA
                                    </v-chip>
                                    <v-chip v-else-if="prossimaGara.weekendIniziato" color="orange-lighten-2" variant="tonal" size="small" class="font-weight-bold mr-2">
                                        🏁 Weekend in corso
                                    </v-chip>
                                    <v-chip v-else color="grey-lighten-2" variant="tonal" size="small" class="font-weight-bold mr-2">
                                        Prossimo Gran Premio
                                    </v-chip>
                                </div>

                                <!-- Titolo Gran Premio con Bandiera -->
                                <h1 class="text-h4 text-md-h3 font-weight-black d-flex align-center flex-wrap">
                                    <span class="mr-3">{{ prossimaGara.bandiera }}</span>
                                    <span>{{ prossimaGara.nome }}</span>
                                </h1>

                                <!-- Sottotitolo Circuito e Località -->
                                <div class="text-subtitle-1 text-grey-lighten-2 mt-2 d-flex align-center">
                                    <v-icon icon="mdi-map-marker-outline" size="small" class="mr-1"></v-icon>
                                    <span>{{ prossimaGara.circuito }} — {{ prossimaGara.localita }}</span>
                                </div>
                            </v-col>

                            <v-col cols="12" sm="4" class="text-sm-right mt-3 mt-sm-0">
                                <v-icon icon="mdi-flag-checkered" size="64" class="opacity-30 d-none d-sm-inline-block"></v-icon>
                            </v-col>
                        </v-row>

                        <v-divider class="my-5 border-opacity-25"></v-divider>

                        <!-- SEZIONE DEL COUNTDOWN DINAMICO -->
                        <v-row justify="center" class="text-center">
                            <v-col cols="12">
                                <!-- Etichetta descrittiva del target del countdown -->
                                <div class="text-subtitle-1 font-weight-bold text-uppercase letter-spacing-1 mb-3 text-grey-lighten-1">
                                    <v-icon icon="mdi-timer-sand" size="small" class="mr-1 text-red-accent-2"></v-icon>
                                    {{ etichettaCountdownDescrittiva }}
                                </div>

                                <!-- Se la gara è attualmente in corso -->
                                <div v-if="prossimaGara.garaInCorso" class="pa-4 bg-yellow-accent-4 text-black rounded-lg elevation-2 d-inline-block font-weight-black text-h5">
                                    🏎️ GARA IN DIRETTA IN CORSO! SEGUI IL LIVE TIMING
                                </div>

                                <!-- Blocchi digitali del Countdown (Giorni, Ore, Minuti, Secondi) -->
                                <div v-else class="d-flex justify-center align-center flex-wrap ga-2 ga-md-3">
                                    <!-- Giorni -->
                                    <div class="countdown-blocco elevation-2">
                                        <div class="countdown-cifra">{{ tempo.giorni }}</div>
                                        <div class="countdown-etichetta">GIORNI</div>
                                    </div>
                                    <span class="text-h4 font-weight-bold opacity-60">:</span>

                                    <!-- Ore -->
                                    <div class="countdown-blocco elevation-2">
                                        <div class="countdown-cifra">{{ tempo.ore }}</div>
                                        <div class="countdown-etichetta">ORE</div>
                                    </div>
                                    <span class="text-h4 font-weight-bold opacity-60">:</span>

                                    <!-- Minuti -->
                                    <div class="countdown-blocco elevation-2">
                                        <div class="countdown-cifra">{{ tempo.minuti }}</div>
                                        <div class="countdown-etichetta">MIN</div>
                                    </div>
                                    <span class="text-h4 font-weight-bold opacity-60">:</span>

                                    <!-- Secondi -->
                                    <div class="countdown-blocco elevation-2">
                                        <div class="countdown-cifra text-red-lighten-2">{{ tempo.secondi }}</div>
                                        <div class="countdown-etichetta">SEC</div>
                                    </div>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>

                <!-- PROGRAMMA DETTAGLIATO DELLE SESSIONI DEL WEEKEND -->
                <v-row class="mb-3">
                    <v-col cols="12" class="d-flex align-center justify-space-between flex-wrap">
                        <div class="d-flex align-center">
                            <v-icon icon="mdi-calendar-clock" color="red-darken-3" size="28" class="mr-2"></v-icon>
                            <h2 class="text-h5 font-weight-bold text-grey-darken-3">Programma del Weekend</h2>
                        </div>
                        <span class="text-caption text-grey-darken-1">Orari con fuso orario locale (Italia)</span>
                    </v-col>
                </v-row>

                <!-- LISTA DELLE SCHEDE DI OGNI SESSIONE -->
                <v-row>
                    <v-col cols="12" v-for="(sessione, indice) in sessioni" :key="sessione.id || indice" class="py-2">
                        <v-card 
                            elevation="2" 
                            class="pa-4 hover-card transition-swing"
                            :class="{
                                'border-left-live': sessione.stato === 'in_corso',
                                'border-left-upcoming': sessione.stato === 'da_disputare' && sessione.nome === 'Gara',
                                'bg-grey-lighten-5 opacity-90': sessione.stato === 'conclusa'
                            }"
                        >
                            <v-row align="center" no-gutters>
                                <!-- NOME E ICONA DELLA SESSIONE -->
                                <v-col cols="12" sm="4" class="d-flex align-center mb-2 mb-sm-0">
                                    <v-avatar 
                                        size="40" 
                                        :color="sessione.nome === 'Gara' ? 'red-darken-3' : (sessione.stato === 'in_corso' ? 'green-darken-2' : 'grey-lighten-3')" 
                                        class="mr-3 text-white"
                                    >
                                        <v-icon :icon="ottieniIconaSessione(sessione.nome)" :color="sessione.nome === 'Gara' || sessione.stato === 'in_corso' ? 'white' : 'grey-darken-3'"></v-icon>
                                    </v-avatar>
                                    <div>
                                        <div class="text-subtitle-1 font-weight-bold" :class="{'text-red-darken-3': sessione.nome === 'Gara'}">
                                            {{ sessione.nome }}
                                        </div>
                                        <div class="text-caption text-grey">{{ sessione.nomeOriginale }}</div>
                                    </div>
                                </v-col>

                                <!-- DATA E ORARIO LOCALE -->
                                <v-col cols="12" sm="5" class="d-flex align-center flex-wrap mb-2 mb-sm-0">
                                    <div class="d-flex align-center mr-4 text-body-2 font-weight-medium">
                                        <v-icon icon="mdi-calendar" size="small" class="mr-1 text-grey"></v-icon>
                                        {{ sessione.dataFormattata }}
                                    </div>
                                    <div class="d-flex align-center text-body-2 font-weight-bold text-grey-darken-2">
                                        <v-icon icon="mdi-clock-outline" size="small" class="mr-1 text-red"></v-icon>
                                        {{ sessione.oraInizio }} - {{ sessione.oraFine }}
                                    </div>
                                </v-col>

                                <!-- STATO SESSIONE E PULSANTE RISULTATI -->
                                <v-col cols="12" sm="3" class="text-sm-right text-left d-flex align-center justify-sm-end justify-space-between mt-2 mt-sm-0">
                                    <!-- Chip dello stato -->
                                    <v-chip 
                                        size="small" 
                                        class="mr-2 font-weight-bold"
                                        :color="sessione.stato === 'conclusa' ? 'grey-darken-1' : (sessione.stato === 'in_corso' ? 'green' : 'blue-grey-lighten-1')"
                                        :variant="sessione.stato === 'in_corso' ? 'flat' : 'tonal'"
                                    >
                                        <span v-if="sessione.stato === 'in_corso'">🟢 Live</span>
                                        <span v-else-if="sessione.stato === 'conclusa'">Conclusa</span>
                                        <span v-else>In programma</span>
                                    </v-chip>

                                    <!-- Pulsante Risultati -->
                                    <v-btn 
                                        size="small"
                                        :color="sessione.risultatiDisponibili ? 'red-darken-3' : 'grey-lighten-2'"
                                        :variant="sessione.risultatiDisponibili ? 'elevated' : 'tonal'"
                                        :disabled="!sessione.risultatiDisponibili"
                                        @click="mostraDettaglioRisultati(sessione)"
                                        prepend-icon="mdi-trophy-outline"
                                    >
                                        Risultati
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- FOOTER INFORMATIVO DELLA SORGENTE DATI -->
                <v-row class="mt-4">
                    <v-col cols="12" class="text-center text-caption text-grey">
                        <v-icon icon="mdi-sync" size="small" class="mr-1"></v-icon>
                        Fonte orari: {{ sorgenteDati }} • Aggiornato automaticamente
                    </v-col>
                </v-row>
            </div>

            <!-- MESSAGGIO SE NESSUN DATO È DISPONIBILE -->
            <v-row v-else justify="center" class="text-center my-12">
                <v-col cols="12" md="6">
                    <v-card elevation="2" class="pa-6">
                        <v-icon icon="mdi-alert-circle-outline" color="amber-darken-3" size="48" class="mb-3"></v-icon>
                        <h3 class="text-h6 font-weight-bold mb-2">Dati Gran Premio al momento non disponibili</h3>
                        <p class="text-body-2 text-grey-darken-1 mb-4">
                            Non è stato possibile caricare il calendario in tempo reale.
                        </p>
                        <v-btn color="red-darken-3" @click="caricaDati" prepend-icon="mdi-refresh">
                            Riprova Caricamento
                        </v-btn>
                    </v-card>
                </v-col>
            </v-row>

            <!-- MODALE DIALOG RISULTATI SESSIONE -->
            <v-dialog v-model="dialogRisultati" max-width="500">
                <v-card v-if="sessioneSelezionata" class="pa-4">
                    <v-card-title class="d-flex align-center justify-space-between">
                        <span class="text-h6 font-weight-bold">{{ sessioneSelezionata.nome }}</span>
                        <v-chip color="green" size="small">Conclusa</v-chip>
                    </v-card-title>
                    <v-card-text class="py-3">
                        <p class="text-body-2 mb-2">
                            <strong>Gran Premio:</strong> {{ prossimaGara?.nome }}
                        </p>
                        <p class="text-body-2 mb-2">
                            <strong>Data svolgimento:</strong> {{ sessioneSelezionata.dataFormattata }} ({{ sessioneSelezionata.oraInizio }} - {{ sessioneSelezionata.oraFine }})
                        </p>
                        <v-alert type="info" variant="tonal" class="mt-3 text-caption">
                            I tempi dettagliati sul giro e la telemetria completa sono consultabili nella sezione <strong>Classifica</strong> e <strong>Piloti e Scuderie</strong>.
                        </v-alert>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn color="grey-darken-1" variant="text" @click="dialogRisultati = false">Chiudi</v-btn>
                        <v-btn color="red-darken-3" variant="elevated" to="/classifica">Vai a Classifiche</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    `,

    setup() {
        const { ref, reactive, computed, onMounted, onUnmounted } = Vue;

        // 1. STATO REATTIVO
        const inCaricamento = ref(true);
        const prossimaGara = ref(null);
        const sessioni = ref([]);
        const sorgenteDati = ref('');
        
        // Oggetto reattivo per le singole cifre del Countdown
        const tempo = reactive({
            giorni: "00",
            ore: "00",
            minuti: "00",
            secondi: "00"
        });

        // Stato modale risultati
        const dialogRisultati = ref(false);
        const sessioneSelezionata = ref(null);

        let timerIntervallo = null;

        /**
         * 2. LOGICA DEL CALCOLO DEL COUNTDOWN
         * Calcola la differenza tra adesso e l'orario target calcolato da HomeService.
         * Se il weekend è iniziato, punta alla Gara della Domenica.
         */
        const aggiornaCountdown = () => {
            if (!prossimaGara.value || !prossimaGara.value.targetCountdown) {
                tempo.giorni = "00";
                tempo.ore = "00";
                tempo.minuti = "00";
                tempo.secondi = "00";
                return;
            }

            const dataTarget = new Date(prossimaGara.value.targetCountdown);
            const adesso = new Date();
            const differenzaMs = dataTarget.getTime() - adesso.getTime();

            if (differenzaMs > 0) {
                const giorni = Math.floor(differenzaMs / (1000 * 60 * 60 * 24));
                const ore = Math.floor((differenzaMs / (1000 * 60 * 60)) % 24);
                const minuti = Math.floor((differenzaMs / (1000 * 60)) % 60);
                const secondi = Math.floor((differenzaMs / 1000) % 60);

                tempo.giorni = String(giorni).padStart(2, '0');
                tempo.ore = String(ore).padStart(2, '0');
                tempo.minuti = String(minuti).padStart(2, '0');
                tempo.secondi = String(secondi).padStart(2, '0');
            } else {
                // Il target è stato raggiunto: ricalcoliamo lo stato per verificare se passare alla gara o al prossimo GP
                tempo.giorni = "00";
                tempo.ore = "00";
                tempo.minuti = "00";
                tempo.secondi = "00";
            }
        };

        /**
         * Etichetta descrittiva calcolata per chiarire all'utente a quale evento si riferisce il conto alla rovescia.
         */
        const etichettaCountdownDescrittiva = computed(() => {
            if (!prossimaGara.value) return "Conto alla rovescia";
            if (prossimaGara.value.garaInCorso) {
                return "GARA IN DIRETTA";
            }
            if (prossimaGara.value.weekendIniziato) {
                return "Weekend in corso! Conto alla rovescia per la GARA di Domenica";
            }
            return "Conto alla rovescia per l'Inizio del Weekend (Prove Libere)";
        });

        /**
         * Assegna l'icona Material Design più adatta per ciascun tipo di sessione.
         */
        const ottieniIconaSessione = (nome) => {
            const n = String(nome).toLowerCase();
            if (n.includes('gara') && !n.includes('sprint')) return 'mdi-flag-checkered';
            if (n.includes('sprint')) return 'mdi-lightning-bolt';
            if (n.includes('qualifiche')) return 'mdi-timer-outline';
            return 'mdi-car-speed-limiter';
        };

        /**
         * 3. CARICAMENTO DATI DA HOMESERVICE
         */
        const caricaDati = async () => {
            inCaricamento.value = true;
            try {
                const dati = await HomeService.recuperaDatiHome();
                prossimaGara.value = dati.prossimaGara;
                sessioni.value = dati.sessioni;
                sorgenteDati.value = dati.sorgenteDati;
                
                aggiornaCountdown();
            } catch (errore) {
                console.error("[SchermataIniziale] Errore nel caricamento della Home:", errore);
            } finally {
                inCaricamento.value = false;
            }
        };

        /**
         * Mostra la finestra di dialogo dei risultati per una sessione completata.
         */
        const mostraDettaglioRisultati = (sessione) => {
            sessioneSelezionata.value = sessione;
            dialogRisultati.value = true;
        };

        // 4. CICLO DI VITA (Lifecycle Hooks)
        onMounted(async () => {
            await caricaDati();
            // Aggiorna il conto alla rovescia ogni secondo
            timerIntervallo = setInterval(aggiornaCountdown, 1000);
        });

        onUnmounted(() => {
            if (timerIntervallo) {
                clearInterval(timerIntervallo);
            }
        });

        return {
            inCaricamento,
            prossimaGara,
            sessioni,
            sorgenteDati,
            tempo,
            etichettaCountdownDescrittiva,
            dialogRisultati,
            sessioneSelezionata,
            ottieniIconaSessione,
            mostraDettaglioRisultati,
            caricaDati,
            HomeService
        };
    }
};