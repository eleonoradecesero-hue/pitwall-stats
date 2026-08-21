// js/schermate/schermata_pronostici.js

const SchermataPronostici = {
    template: `
        <v-container fluid class="pa-4">
            <!-- INTESTAZIONE E COUNTDOWN SCADENZA -->
            <v-row class="mb-6">
                <v-col cols="12">
                    <h1 class="text-h4 text-red-darken-3 font-weight-bold mb-2">Area Pronostici</h1>
                    <div class="d-flex align-center bg-grey-lighten-4 pa-3 rounded elevation-1">
                        <v-icon icon="mdi-clock-alert-outline" color="red-darken-3" size="large" class="mr-3"></v-icon>
                        <div>
                            <div class="text-subtitle-2 text-grey-darken-1">Inserisci il tuo pronostico entro la scadenza:</div>
                            <div class="text-h6 font-weight-black text-red-darken-3">09:12:35:06 — 🇺🇸 Miami Gran Prix</div>
                        </div>
                    </div>
                </v-col>
            </v-row>

            <!-- FORM DI INSERIMENTO PRONOSTICO (Requisito v-model del professore) -->
            <v-row class="mb-8">
                <v-col cols="12">
                    <v-card elevation="2" class="pa-4">
                        <v-card-title class="text-h5 mb-4 font-weight-bold">Fai il tuo pronostico per la gara</v-card-title>
                        <v-card-text>
                            <v-form @submit.prevent="inviaPronostico">
                                <v-row>
                                    <!-- Scelta Poleman -->
                                    <v-col cols="12" md="4">
                                        <v-text-input 
                                            label="Poleman (Pilota in Pole)" 
                                            v-model="nuovoPronostico.poleman" 
                                            variant="outlined"
                                            prepend-inner-icon="mdi-flag-checkered"
                                            placeholder="Es. Charles Leclerc"
                                        ></v-text-input>
                                    </v-col>

                                    <!-- Podio: 1°, 2°, 3° posto -->
                                    <v-col cols="12" md="4">
                                        <v-text-input 
                                            label="Vincitore 1° Posto" 
                                            v-model="nuovoPronostico.podioPrimo" 
                                            variant="outlined"
                                            prepend-inner-icon="mdi-trophy"
                                            placeholder="Es. L. Hamilton"
                                        ></v-text-input>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-input 
                                            label="2° Posto" 
                                            v-model="nuovoPronostico.podioSecondo" 
                                            variant="outlined"
                                            placeholder="Es. O. Piastri"
                                        ></v-text-input>
                                    </v-col>
                                    <v-col cols="12" md="4">
                                        <v-text-input 
                                            label="3° Posto" 
                                            v-model="nuovoPronostico.podioTerzo" 
                                            variant="outlined"
                                            placeholder="Es. M. Verstappen"
                                        ></v-text-input>
                                    </v-col>
                                </v-row>

                                <v-btn type="submit" color="red-darken-3" class="mt-4" size="large" prepend-icon="mdi-send">
                                    Conferma e Salva Pronostico
                                </v-btn>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>

            <!-- STORICO PRONOSTICI (Ispirato agli appunti di Eleonora) -->
            <v-row>
                <v-col cols="12">
                    <v-card elevation="2" class="pa-4">
                        <v-card-title class="text-h5 mb-4 font-weight-bold">Storico pronostici 2025</v-card-title>
                        <v-card-text>
                            <v-table>
                                <thead>
                                    <tr>
                                        <th class="font-weight-bold">Gran Premio</th>
                                        <th class="font-weight-bold">Poleman Pronosticato</th>
                                        <th class="font-weight-bold">Podio Pronosticato</th>
                                        <th class="font-weight-bold text-right">Punti Totali</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="storico in storicoPronostici" :key="storico.id">
                                        <td class="font-weight-bold text-red-darken-3">
                                            <v-icon icon="mdi-map-marker" size="small" class="mr-1"></v-icon>
                                            {{ storico.granPremio }}
                                        </td>
                                        <td>{{ storico.poleman }}</td>
                                        <td>{{ storico.podio }}</td>
                                        <td class="text-right font-weight-bold">
                                            <v-chip color="success" size="small">{{ storico.punti }} PT</v-chip>
                                        </td>
                                    </tr>
                                </tbody>
                            </v-table>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    `,
    setup() {
        const { ref } = Vue;

        // Oggetto reattivo collegato ai campi del form tramite v-model
        const nuovoPronostico = ref({
            poleman: '',
            podioPrimo: '',
            podioSecondo: '',
            podioTerzo: ''
        });

        // Storico dei pronostici passati (preso direttamente dai dati testuali di Eleonora)
        const storicoPronostici = ref([
            { id: 1, granPremio: "GP Miami", poleman: "HAM", podio: "HAM | VER | HAM", punti: 25 },
            { id: 2, granPremio: "GP Imola", poleman: "LEC", podio: "LEC | HAM | NOR", punti: 18 },
            { id: 3, granPremio: "GP Monaco", poleman: "VER", podio: "VER | LEC | SAI", punti: 10 }
        ]);

        // Funzione di invio del pronostico
        const inviaPronostico = () => {
            console.log("Pronostico registrato:", nuovoPronostico.value);
            alert("Pronostico salvato con successo! (In futuro lo scriveremo direttamente su Cloud Firestore).");
            
            // Pulisce il form
            nuovoPronostico.value = { poleman: '', podioPrimo: '', podioSecondo: '', podioTerzo: '' };
        };

        return {
            nuovoPronostico,
            storicoPronostici,
            inviaPronostico
        };
    }
};