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
                    <v-btn-toggle v-model="vistaSelezionata" mandatory color="red-darken-3" variant="outlined">
                        <v-btn value="piloti">Piloti</v-btn>
                        <v-btn value="scuderie">Scuderie</v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <!-- ================= VISTA PILOTI (Ispirata al mockup di Eleonora) ================= -->
            <div v-if="vistaSelezionata === 'piloti'">
                <!-- Sezione Dettaglio Singolo Pilota (es. Charles Leclerc) -->
                <v-card elevation="3" class="pa-6 mb-8 bg-grey-lighten-4">
                    <v-row align="center">
                        <v-col cols="12" md="3" class="text-center">
                            <v-avatar size="140" class="elevation-3">
                                <v-img :src="pilotaInEvidenza.foto" alt="Foto pilota"></v-img>
                            </v-avatar>
                        </v-col>
                        <v-col cols="12" md="9">
                            <div class="d-flex align-center mb-2">
                                <h2 class="text-h4 font-weight-bold mr-3">{{ pilotaInEvidenza.nome }}</h2>
                                <v-chip color="red-darken-3" variant="flat">{{ pilotaInEvidenza.posizione }}° Posizione</v-chip>
                            </div>
                            <p class="text-subtitle-1 text-grey-darken-2 mb-3">
                                🇨🇲 - Numero {{ pilotaInEvidenza.numero }} - Nato il {{ pilotaInEvidenza.dataNascita }} - {{ pilotaInEvidenza.eta }} anni
                            </p>
                            <p class="text-body-2 text-grey-darken-1 mb-4">
                                {{ pilotaInEvidenza.biografia }}
                            </p>
                            
                            <!-- Griglia Statistiche Rapide del Pilota (dal mockup) -->
                            <v-row class="text-center bg-white pa-3 rounded elevation-1">
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">GARE</div>
                                    <div class="text-h6 font-weight-bold">{{ pilotaInEvidenza.gare }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">VITTORIE</div>
                                    <div class="text-h6 font-weight-bold">{{ pilotaInEvidenza.vittorie }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">PODI</div>
                                    <div class="text-h6 font-weight-bold">{{ pilotaInEvidenza.podi }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">POLES</div>
                                    <div class="text-h6 font-weight-bold">{{ pilotaInEvidenza.poles }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">GIRI VELOCI</div>
                                    <div class="text-h6 font-weight-bold">{{ pilotaInEvidenza.giriVeloci }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">PUNTI</div>
                                    <div class="text-h6 font-weight-bold text-red-darken-3">{{ pilotaInEvidenza.punti }}</div>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card>

                <!-- Griglia Altri Piloti (Card con statistiche richieste da Eleonora) -->
                <v-row>
                    <v-col cols="12" sm="6" md="4" v-for="pilota in listaPiloti" :key="pilota.id">
                        <v-card elevation="2" class="pa-4 position-relative">
                            <v-chip class="position-absolute" style="top: 15px; right: 15px;" color="red-darken-3" size="small">
                                {{ pilota.posizione }}º
                            </v-chip>
                            <div class="d-flex align-center mb-3">
                                <v-avatar size="65" class="mr-3 elevation-1">
                                    <v-img :src="pilota.foto"></v-img>
                                </v-avatar>
                                <div>
                                    <h3 class="text-h6 font-weight-bold">{{ pilota.nome }}</h3>
                                    <p class="text-subtitle-2 text-red-darken-3 font-weight-bold">{{ pilota.punti }} pt.</p>
                                </div>
                            </div>
                            <v-divider class="mb-3"></v-divider>
                            <!-- Statistiche: Podi, Giri veloci, Pole, Vittorie -->
                            <v-row class="text-center">
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

            <!-- ================= VISTA SCUDERIE (Ispirata al mockup Ferrari) ================= -->
            <div v-if="vistaSelezionata === 'scuderie'">
                <!-- Dettaglio Scuderia in Evidenza (es. Ferrari) -->
                <v-card elevation="3" class="pa-6 mb-8 bg-grey-lighten-4">
                    <v-row align="center">
                        <v-col cols="12" md="3" class="text-center">
                            <v-img :src="scuderiaInEvidenza.logo" height="130" contain class="my-2"></v-img>
                        </v-col>
                        <v-col cols="12" md="9">
                            <div class="d-flex align-center mb-2">
                                <h2 class="text-h4 font-weight-bold mr-3">{{ scuderiaInEvidenza.nome }}</h2>
                                <v-chip color="red-darken-3" variant="flat">Posizione: {{ scuderiaInEvidenza.posizione }}°</v-chip>
                            </div>
                            <p class="text-subtitle-1 text-grey-darken-2 mb-3">
                                🇮🇹 - Sede: Maranello, Italia - {{ scuderiaInEvidenza.stagioni }} stagioni nel campionato
                            </p>
                            <p class="text-body-2 text-grey-darken-1 mb-4">
                                {{ scuderiaInEvidenza.descrizione }}
                            </p>

                            <!-- Statistiche Scuderia (Gare, Podi, Vittorie, Poles, Punti) -->
                            <v-row class="text-center bg-white pa-3 rounded elevation-1">
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">GARE</div>
                                    <div class="text-h6 font-weight-bold">{{ scuderiaInEvidenza.gare }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">VITTORIE</div>
                                    <div class="text-h6 font-weight-bold">{{ scuderiaInEvidenza.vittorie }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">PODI</div>
                                    <div class="text-h6 font-weight-bold">{{ scuderiaInEvidenza.podi }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">POLES</div>
                                    <div class="text-h6 font-weight-bold">{{ scuderiaInEvidenza.poles }}</div>
                                </v-col>
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">PUNTI</div>
                                    <div class="text-h6 font-weight-bold text-red-darken-3">{{ scuderiaInEvidenza.punti }}</div>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card>
            </div>
        </v-container>
    `,
    setup() {
        const { ref } = Vue;

        const vistaSelezionata = ref('piloti');

        // Dati pilota in evidenza presi direttamente dal testo del mockup di Eleonora
        const pilotaInEvidenza = ref({
            nome: "Charles Leclerc",
            posizione: 5,
            numero: 16,
            dataNascita: "16 ottobre 1997[cite: 2]",
            eta: 28,
            biografia: "Charles Marc Hervé Perceval Leclerc è un pilota automobilistico monegasco che corre in Formula 1 per la Ferrari. È stato vicecampione del mondo nel 2022 e ha vinto numerosi Gran Premi[cite: 2].",
            gare: 125,
            vittorie: 8,
            podi: 35,
            poles: 25,
            giriVeloci: 9,
            punti: 150,
            foto: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Charles_Leclerc_2019.jpg"
        });

        // Lista di piloti per le card sottostanti (con le metriche richieste: Podi, Giri veloci, Pole, Vittorie)[cite: 2]
        const listaPiloti = ref([
            { id: 1, nome: "Oscar Piastri[cite: 2]", posizione: 7, punti: 380, podi: 3, giriVeloci: 3, poles: 3, vittorie: 3, foto: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Oscar_Piastri_2023.jpg" },
            { id: 2, nome: "K. Antonelli", posizione: 1, punti: 259, podi: 12, giriVeloci: 4, poles: 6, vittorie: 5, foto: "https://www.formularapida.net/wp-content/uploads/2024/04/Antonelli-F2-Melbourne-2024-scaled.jpg" },
            { id: 3, nome: "L. Hamilton", posizione: 2, punti: 210, podi: 10, giriVeloci: 5, poles: 4, vittorie: 3, foto: "https://upload.wikimedia.org/wikipedia/commons/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg" },
            { id: 4, nome: "G. Russell", posizione: 4, punti: 165, podi: 6, giriVeloci: 2, poles: 2, vittorie: 1, foto: "https://upload.wikimedia.org/wikipedia/commons/3/36/George_Russell_2022.jpg" }
        ]);

        // Dati scuderia in evidenza (Ferrari) presi dal mockup
        const scuderiaInEvidenza = ref({
            nome: "Ferrari[cite: 2]",
            posizione: 2,
            stagioni: 75,
            descrizione: "Ferrari S.p.A., nota come Scuderia Ferrari, è la divisione corse del costruttore italiano di automobili di lusso Ferrari ed è la squadra più longeva e vincente nella storia della Formula 1[cite: 2].",
            gare: 1080,
            vittorie: 245,
            podi: 810,
            poles: 253,
            punti: 360,
            logo: "https://cdn.worldvectorlogo.com/logos/scuderia-ferrari-1.svg"
        });

        return {
            vistaSelezionata,
            pilotaInEvidenza,
            listaPiloti,
            scuderiaInEvidenza
        };
    }
};