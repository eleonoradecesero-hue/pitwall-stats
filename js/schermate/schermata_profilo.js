// js/schermate/schermata_profilo.js

const SchermataProfilo = {
    template: `
        <v-container fluid class="pa-4">
            <!-- TITOLO -->
            <v-row>
                <v-col cols="12">
                    <h1 class="text-h4 text-red-darken-3 mb-2 font-weight-bold">Profilo Utente</h1>
                </v-col>
            </v-row>

            <v-row>
                <!-- SEZIONE SINISTRA: Dati Personali (Richiesta v-model del prof) -->
                <v-col cols="12" md="8">
                    <v-card elevation="2" class="pa-4 h-100">
                        <v-card-title class="text-h5 mb-4">Dati personali</v-card-title>
                        <v-card-text>
                            <!-- La direttiva @submit.prevent blocca il ricaricamento della pagina e avvia la funzione -->
                            <v-form @submit.prevent="salvaProfilo">
                                <v-row>
                                    <v-col cols="12" sm="6">
                                        <!-- v-model lega quello che scrivi alla variabile "datiUtente.nome" -->
                                        <v-text-input label="Nome" v-model="datiUtente.nome" variant="outlined"></v-text-input>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-input label="Cognome" v-model="datiUtente.cognome" variant="outlined"></v-text-input>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-input label="Mail" type="email" v-model="datiUtente.email" variant="outlined"></v-text-input>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-input label="Cellulare" v-model="datiUtente.cellulare" variant="outlined"></v-text-input>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-input label="Nome utente" v-model="datiUtente.nomeUtente" variant="outlined"></v-text-input>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-input label="Password" type="password" v-model="datiUtente.password" variant="outlined"></v-text-input>
                                    </v-col>
                                </v-row>
                                <v-btn type="submit" color="red-darken-3" class="mt-4" size="large">
                                    Salva Modifiche
                                </v-btn>
                            </v-form>
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
            <v-row class="mt-6">
                <v-col cols="12">
                    <v-card elevation="2" class="pa-4">
                        <v-card-title class="text-h5 mb-2">I miei Preferiti</v-card-title>
                        <v-card-text>
                            <p class="text-body-1 text-grey-darken-1">
                                Qui implementeremo l'idea di Eleonora: mostreremo le card dei piloti salvati (es. Oscar Piastri) con le statistiche divise per anno (pole, vittorie).
                            </p>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    `,
    setup() {
        const { ref } = Vue;

        // 1. Variabile reattiva che contiene tutti i dati del form legati con v-model
        const datiUtente = ref({
            nome: '',
            cognome: '',
            email: '',
            cellulare: '',
            nomeUtente: '',
            password: '',
            avatar: '',
            puntiAccumulati: 450 // Numero di esempio
        });

        // 2. Lista di emoji da usare come avatar (al posto delle foto rosse del mockup)
        const iconeAvatar = ['🏎️', '🏁', '🏆', '🔥', '🚀', '🏎️💨'];

        // 3. Funzione che scatta quando si preme "Salva Modifiche"
        const salvaProfilo = () => {
            // Per ora lo stampiamo in console. Più avanti lo invieremo a Firebase!
            console.log("Dati utente pronti per Firebase:", datiUtente.value);
            alert("Ottimo! I dati sono stati registrati in locale (guarda la console).");
        };

        return {
            datiUtente,
            iconeAvatar,
            salvaProfilo
        };
    }
};