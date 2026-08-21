// js/schermate/schermata_calendario.js

const SchermataCalendario = {
    template: `
        <v-container fluid class="pa-4">
            <!-- INTESTAZIONE E SELETTORE ANNO -->
            <v-row align="center" class="mb-6">
                <v-col cols="12" md="8">
                    <h1 class="text-h4 text-red-darken-3 font-weight-bold">Calendario Gran Premi</h1>
                </v-col>
                <v-col cols="12" md="4">
                    <!-- Menu a tendina per la scelta dell'anno (richiesto nei mockup) -->
                    <v-select
                        v-model="annoSelezionato"
                        :items="anniDisponibili"
                        label="Seleziona Anno"
                        variant="outlined"
                        dense
                        hide-details
                        @update:model-value="aggiornaCalendario"
                    ></v-select>
                </v-col>
            </v-row>

            <!-- SEZIONE: GARE FUTURE -->
            <v-row class="mb-4">
                <v-col cols="12">
                    <h2 class="text-h5 text-grey-darken-2 border-bottom pb-2">Prossimi GP (Future)</h2>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12" sm="6" md="4" v-for="gara in gareFuture" :key="gara.id">
                    <v-card elevation="2" class="pa-3 mb-3">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <span class="text-h3">{{ gara.bandiera }}</span>
                            <v-chip color="red-darken-3" size="small" variant="outlined">In arrivo</v-chip>
                        </div>
                        <v-card-title class="text-h6 font-weight-bold px-0">{{ gara.nomeGranPremio }}</v-card-title>
                        <v-card-subtitle class="px-0 text-grey-darken-1">{{ gara.circuito }}</v-card-subtitle>
                        <v-card-text class="px-0 pt-2 text-body-2">
                            <v-icon icon="mdi-calendar" size="small" class="mr-1"></v-icon> Data: {{ gara.dataGara }}
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- SEZIONE: GARE PASSATE -->
            <v-row class="mt-6 mb-4">
                <v-col cols="12">
                    <h2 class="text-h5 text-grey-darken-2 border-bottom pb-2">Gare Passate / Storico</h2>
                </v-col>
            </v-row>

            <v-row>
                <v-col cols="12" sm="6" md="4" v-for="gara in garePassate" :key="gara.id">
                    <v-card elevation="1" class="pa-3 mb-3 bg-grey-lighten-4">
                        <div class="d-flex align-center justify-space-between mb-2">
                            <span class="text-h3">{{ gara.bandiera }}</span>
                            <v-chip color="grey-darken-2" size="small">Conclusa</v-chip>
                        </div>
                        <v-card-title class="text-h6 font-weight-bold px-0">{{ gara.nomeGranPremio }}</v-card-title>
                        <v-card-subtitle class="px-0 text-grey-darken-1">{{ gara.circuito }}</v-card-subtitle>
                        <v-card-actions class="px-0 pt-2">
                            <v-btn color="red-darken-3" variant="text" size="small" prepend-icon="mdi-trophy">
                                Vedi Risultati
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    `,
    setup() {
        const { ref } = Vue;

        // Gestione dell'anno selezionato (default 2026 come da attuale orologio di sistema)
        const annoSelezionato = ref(2026);
        const anniDisponibili = [2026, 2025, 2024, 2023, 2022];

        // Dati finti di esempio strutturati per imitare le API
        const gareFuture = ref([
            { id: 1, nomeGranPremio: "Miami Gran Premio", circuito: "Miami International Autodrome", bandiera: "🇺🇸", dataGara: "03 Maggio 2026" },
            { id: 2, nomeGranPremio: "Gran Premio d'Italia", circuito: "Autodromo Nazionale di Monza", bandiera: "🇮🇹", dataGara: "06 Settembre 2026" },
            { id: 3, nomeGranPremio: "Gran Premio del Belgio", circuito: "Circuit de Spa-Francorchamps", bandiera: "🇧🇪", dataGara: "30 Agosto 2026" }
        ]);

        const garePassate = ref([
            { id: 4, nomeGranPremio: "Gran Premio del Bahrain", circuito: "Bahrain International Circuit", bandiera: "🇧🇭", dataGara: "01 Marzo 2026" },
            { id: 5, nomeGranPremio: "Gran Premio d'Arabia Saudita", circuito: "Jeddah Corniche Circuit", bandiera: "🇸🇦", dataGara: "08 Marzo 2026" }
        ]);

        // Funzione che scatta quando cambi l'anno nel menu a tendina
        const aggiornaCalendario = (nuovoAnno) => {
            console.log(`Caricamento dati per l'anno: ${nuovoAnno}`);
            // Più tardi qui collegheremo la chiamata API per filtrare i GP in base all'anno selezionato
        };

        return {
            annoSelezionato,
            anniDisponibili,
            gareFuture,
            garePassate,
            aggiornaCalendario
        };
    }
};