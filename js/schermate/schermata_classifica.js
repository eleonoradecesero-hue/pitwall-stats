// js/schermate/schermata_classifica.js

const SchermataClassifica = {
    template: `
        <v-container fluid class="pa-4">
            <!-- INTESTAZIONE E SELETTORE TIPO DI CLASSIFICA (PILOTI / SCUDERIE) -->
            <v-row align="center" class="mb-6">
                <v-col cols="12" md="8">
                    <h1 class="text-h4 text-red-darken-3 font-weight-bold">Classifiche di Campionato</h1>
                </v-col>
                <v-col cols="12" md="4" class="text-md-right">
                    <!-- Bottoni per switchare tra Piloti e Scuderie -->
                    <v-btn-toggle v-model="tipoClassificaSelezionata" mandatory color="red-darken-3" variant="outlined">
                        <v-btn value="piloti">Piloti</v-btn>
                        <v-btn value="scuderie">Scuderie</v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <!-- ================= CLASSIFICA PILOTI ================= -->
            <div v-if="tipoClassificaSelezionata === 'piloti'">
                <!-- PODIO DEI PRIMI 3 PILOTI -->
                <v-row class="mb-6 text-center" justify="center">
                    <!-- 2° Posto -->
                    <v-col cols="12" sm="4" md="3" class="order-sm-2 order-md-1">
                        <v-card elevation="3" class="pa-4 bg-grey-lighten-4 border-top-red">
                            <div class="text-h6 font-weight-bold text-grey-darken-2">2° Posto</div>
                            <v-avatar size="80" class="my-3 elevation-2">
                                <v-img :src="pilotiPodio[1].foto" alt="Secondo posto"></v-img>
                            </v-avatar>
                            <h3 class="text-h6 font-weight-bold">{{ pilotiPodio[1].nome }}</h3>
                            <p class="text-subtitle-2 text-grey">{{ pilotiPodio[1].scuderia }}</p>
                            <v-chip color="red-darken-3" class="mt-2 font-weight-bold">{{ pilotiPodio[1].punti }} PT</v-chip>
                        </v-card>
                    </v-col>

                    <!-- 1° Posto (Più alto / centrale) -->
                    <v-col cols="12" sm="4" md="3" class="order-sm-1 order-md-2">
                        <v-card elevation="5" class="pa-4 bg-red-lighten-5 border-red">
                            <v-icon icon="mdi-crown" color="amber-darken-2" size="30" class="mb-1"></v-icon>
                            <div class="text-h6 font-weight-bold text-red-darken-3">1° Posto</div>
                            <v-avatar size="95" class="my-3 elevation-3">
                                <v-img :src="pilotiPodio[0].foto" alt="Primo posto"></v-img>
                            </v-avatar>
                            <h3 class="text-h5 font-weight-bold">{{ pilotiPodio[0].nome }}</h3>
                            <p class="text-subtitle-2 text-grey-darken-2">{{ pilotiPodio[0].scuderia }}</p>
                            <v-chip color="red-darken-3" class="mt-2 font-weight-bold text-h6">{{ pilotiPodio[0].punti }} PT</v-chip>
                        </v-card>
                    </v-col>

                    <!-- 3° Posto -->
                    <v-col cols="12" sm="4" md="3" class="order-sm-3 order-md-3">
                        <v-card elevation="3" class="pa-4 bg-grey-lighten-4">
                            <div class="text-h6 font-weight-bold text-grey-darken-2">3° Posto</div>
                            <v-avatar size="80" class="my-3 elevation-2">
                                <v-img :src="pilotiPodio[2].foto" alt="Terzo posto"></v-img>
                            </v-avatar>
                            <h3 class="text-h6 font-weight-bold">{{ pilotiPodio[2].nome }}</h3>
                            <p class="text-subtitle-2 text-grey">{{ pilotiPodio[2].scuderia }}</p>
                            <v-chip color="red-darken-3" class="mt-2 font-weight-bold">{{ pilotiPodio[2].punti }} PT</v-chip>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- ELENCO DAL 4° POSTO IN POI (PILOTI) -->
                <v-card elevation="2" class="pa-4">
                    <h3 class="text-h6 mb-4 font-weight-bold">Posizioni Successive</h3>
                    <v-table>
                        <thead>
                            <tr>
                                <th class="font-weight-bold">Pos</th>
                                <th class="font-weight-bold">Pilota</th>
                                <th class="font-weight-bold">Scuderia</th>
                                <th class="font-weight-bold text-right">Punti</th>
                                <th class="font-weight-bold text-right">Delta dal 1°</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="pilota in pilotiRestanti" :key="pilota.posizione">
                                <td class="font-weight-bold text-red-darken-3">{{ pilota.posizione }}°</td>
                                <td>
                                    <div class="d-flex align-center py-2">
                                        <v-avatar size="35" class="mr-3">
                                            <v-img :src="pilota.foto"></v-img>
                                        </v-avatar>
                                        <span class="font-weight-medium">{{ pilota.nome }}</span>
                                    </div>
                                </td>
                                <td>{{ pilota.scuderia }}</td>
                                <td class="text-right font-weight-bold">{{ pilota.punti }}</td>
                                <td class="text-right text-grey-darken-1">-{{ pilotiPodio[0].punti - pilota.punti }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </div>

            <!-- ================= CLASSIFICA SCUDERIE ================= -->
            <div v-if="tipoClassificaSelezionata === 'scuderie'">
                <!-- PODIO DELLE PRIME 3 SCUDERIE -->
                <v-row class="mb-6 text-center" justify="center">
                    <!-- 2° Scuderia -->
                    <v-col cols="12" sm="4" md="3" class="order-sm-2 order-md-1">
                        <v-card elevation="3" class="pa-4 bg-grey-lighten-4">
                            <div class="text-h6 font-weight-bold text-grey-darken-2">2° Scuderia</div>
                            <v-img :src="scuderiePodio[1].logo" height="80" contain class="my-3"></v-img>
                            <h3 class="text-h6 font-weight-bold">{{ scuderiePodio[1].nome }}</h3>
                            <v-chip color="red-darken-3" class="mt-2 font-weight-bold">{{ scuderiePodio[1].punti }} PT</v-chip>
                        </v-card>
                    </v-col>

                    <!-- 1° Scuderia -->
                    <v-col cols="12" sm="4" md="3" class="order-sm-1 order-md-2">
                        <v-card elevation="5" class="pa-4 bg-red-lighten-5 border-red">
                            <v-icon icon="mdi-crown" color="amber-darken-2" size="30" class="mb-1"></v-icon>
                            <div class="text-h6 font-weight-bold text-red-darken-3">1° Scuderia</div>
                            <v-img :src="scuderiePodio[0].logo" height="90" contain class="my-3"></v-img>
                            <h3 class="text-h5 font-weight-bold">{{ scuderiePodio[0].nome }}</h3>
                            <v-chip color="red-darken-3" class="mt-2 font-weight-bold text-h6">{{ scuderiePodio[0].punti }} PT</v-chip>
                        </v-card>
                    </v-col>

                    <!-- 3° Scuderia -->
                    <v-col cols="12" sm="4" md="3" class="order-sm-3 order-md-3">
                        <v-card elevation="3" class="pa-4 bg-grey-lighten-4">
                            <div class="text-h6 font-weight-bold text-grey-darken-2">3° Scuderia</div>
                            <v-img :src="scuderiePodio[2].logo" height="80" contain class="my-3"></v-img>
                            <h3 class="text-h6 font-weight-bold">{{ scuderiePodio[2].nome }}</h3>
                            <v-chip color="red-darken-3" class="mt-2 font-weight-bold">{{ scuderiePodio[2].punti }} PT</v-chip>
                        </v-card>
                    </v-col>
                </v-row>

                <!-- ELENCO DAL 4° POSTO IN POI (SCUDERIE) -->
                <v-card elevation="2" class="pa-4">
                    <h3 class="text-h6 mb-4 font-weight-bold">Posizioni Successive</h3>
                    <v-table>
                        <thead>
                            <tr>
                                <th class="font-weight-bold">Pos</th>
                                <th class="font-weight-bold">Scuderia</th>
                                <th class="font-weight-bold text-right">Punti</th>
                                <th class="font-weight-bold text-right">Delta dalla 1°</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="scuderia in scuderieRestanti" :key="scuderia.posizione">
                                <td class="font-weight-bold text-red-darken-3">{{ scuderia.posizione }}°</td>
                                <td class="font-weight-medium">{{ scuderia.nome }}</td>
                                <td class="text-right font-weight-bold">{{ scuderia.punti }}</td>
                                <td class="text-right text-grey-darken-1">-{{ scuderiePodio[0].punti - scuderia.punti }}</td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </div>
        </v-container>
    `,
    setup() {
        const { ref } = Vue;

        // Gestisce quale classifica mostrare ('piloti' o 'scuderie')
        const tipoClassificaSelezionata = ref('piloti');

        // Dati finti strutturati per il podio e l'elenco dei Piloti
        const pilotiPodio = ref([
            { posizione: 1, nome: "K. Antonelli", scuderia: "Mercedes AMG", punti: 259, foto: "https://www.formularapida.net/wp-content/uploads/2024/04/Antonelli-F2-Melbourne-2024-scaled.jpg" },
            { posizione: 2, nome: "L. Hamilton", scuderia: "Scuderia Ferrari", punti: 210, foto: "https://upload.wikimedia.org/wikipedia/commons/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg" },
            { posizione: 3, nome: "O. Piastri", scuderia: "McLaren F1 Team", punti: 180, foto: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Oscar_Piastri_2023.jpg" }
        ]);

        const pilotiRestanti = ref([
            { posizione: 4, nome: "G. Russell", scuderia: "Mercedes AMG", punti: 165, foto: "https://upload.wikimedia.org/wikipedia/commons/3/36/George_Russell_2022.jpg" },
            { posizione: 5, nome: "C. Leclerc", scuderia: "Scuderia Ferrari", punti: 150, foto: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Charles_Leclerc_2019.jpg" },
            { posizione: 6, nome: "M. Verstappen", scuderia: "Red Bull Racing", punti: 142, foto: "https://upload.wikimedia.org/wikipedia/commons/0/0c/Max_Verstappen_2017.jpg" }
        ]);

        // Dati finti strutturati per il podio e l'elenco delle Scuderie
        const scuderiePodio = ref([
            { posizione: 1, nome: "Mercedes-AMG Petronas F1 Team", punti: 424, logo: "https://cdn.worldvectorlogo.com/logos/mercedes-amg-petronas-f1.svg" },
            { posizione: 2, nome: "Scuderia Ferrari HP", punti: 360, logo: "https://cdn.worldvectorlogo.com/logos/scuderia-ferrari-1.svg" },
            { posizione: 3, nome: "McLaren Mastercard F1 Team", punti: 310, logo: "https://cdn.worldvectorlogo.com/logos/mclaren-f1-2.svg" }
        ]);

        const scuderieRestanti = ref([
            { posizione: 4, nome: "Red Bull Racing", punti: 250 },
            { posizione: 5, nome: "Aston Martin F1 Team", punti: 120 },
            { posizione: 6, nome: "Alpine F1 Team", punti: 85 }
        ]);

        return {
            tipoClassificaSelezionata,
            pilotiPodio,
            pilotiRestanti,
            scuderiePodio,
            scuderieRestanti
        };
    }
};