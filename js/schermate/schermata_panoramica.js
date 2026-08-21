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
                    <!-- Stesso selettore della pagina Classifica -->
                    <v-btn-toggle v-model="tipoOverviewSelezionato" mandatory color="red-darken-3" variant="outlined" @update:model-value="chiudiDettaglio">
                        <v-btn value="piloti">Piloti</v-btn>
                        <v-btn value="scuderie">Scuderie</v-btn>
                    </v-btn-toggle>
                </v-col>
            </v-row>

            <!-- ========================================================= -->
            <!-- VISTA 1: LISTA PILOTI (Card piccole e uniformi) -->
            <!-- ========================================================= -->
            <div v-if="tipoOverviewSelezionato === 'piloti' && !elementoSelezionato">
                <v-row>
                    <v-col cols="12" sm="6" md="3" v-for="pilota in listaPiloti" :key="pilota.id">
                        <v-card elevation="2" class="pa-4 text-center cursor-pointer hover-card" @click="selezionaElemento(pilota)">
                            <v-chip class="position-absolute" style="top: 10px; right: 10px;" color="red-darken-3" size="small">
                                {{ pilota.posizione }}º
                            </v-chip>
                            <v-avatar size="90" class="my-3 elevation-2">
                                <v-img :src="pilota.foto"></v-img>
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
                                    <div class="text-caption text-grey">Gire Vel.</div>
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
            <div v-if="tipoOverviewSelezionato === 'scuderie' && !elementoSelezionato">
                <v-row>
                    <v-col cols="12" sm="6" md="3" v-for="scuderia in listaScuderie" :key="scuderia.id">
                        <v-card elevation="2" class="pa-4 text-center cursor-pointer hover-card" @click="selezionaElemento(scuderia)">
                            <v-chip class="position-absolute" style="top: 10px; right: 10px;" color="red-darken-3" size="small">
                                {{ scuderia.posizione }}º
                            </v-chip>
                            <v-img :src="scuderia.logo" height="80" contain class="my-3"></v-img>
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
                            <v-img :src="elementoSelezionato.logo" height="130" contain class="my-2" v-else></v-img>
                        </v-col>
                        <v-col cols="12" md="9">
                            <div class="d-flex align-center mb-2">
                                <h2 class="text-h4 font-weight-bold mr-3">{{ elementoSelezionato.nome }}</h2>
                                <v-chip color="red-darken-3" variant="flat">Posizione: {{ elementoSelezionato.posizione }}°</v-chip>
                            </div>
                            
                            <!-- Sottotitolo specifico (Pilota vs Scuderia) -->
                            <p class="text-subtitle-1 text-grey-darken-2 mb-3" v-if="tipoOverviewSelezionato === 'piloti'">
                                🇨🇲 - Numero {{ elementoSelezionato.numero }} - Nato il {{ elementoSelezionato.dataNascita }}
                            </p>
                            <p class="text-subtitle-1 text-grey-darken-2 mb-3" v-else>
                                🇮🇹 - Sede: Maranello, Italia - {{ elementoSelezionato.stagioni }} stagioni nel campionato[cite: 3]
                            </p>

                            <p class="text-body-2 text-grey-darken-1 mb-4">
                                {{ elementoSelezionato.biografia }}
                            </p>

                            <!-- Griglia Statistiche Estese -->
                            <v-row class="text-center bg-white pa-3 rounded elevation-1">
                                <v-col cols="4" sm="2">
                                    <div class="text-caption text-grey">GARE</div>
                                    <div class="text-h6 font-weight-bold">{{ elementoSelezionato.gare }}</div>
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
        const { ref } = Vue;

        const tipoOverviewSelezionato = ref('piloti');
        const elementoSelezionato = ref(null);

        // Lista completa piloti (Card piccole uniformi)
        const listaPiloti = ref([
            { 
                id: 1, nome: "Charles Leclerc", posizione: 5, punti: 150, podi: 35, giriVeloci: 9, poles: 25, vittorie: 8, dnf: 12,
                numero: 16, dataNascita: "16 ottobre 1997", 
                biografia: "Charles Marc Hervé Perceval Leclerc è un pilota automobilistico monegasco che corre in Formula 1 per la Ferrari[cite: 2].",
                gare: 125, foto: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Charles_Leclerc_2019.jpg" 
            },
            { 
                id: 2, nome: "Oscar Piastri", posizione: 7, punti: 380, podi: 3, giriVeloci: 3, poles: 3, vittorie: 3, dnf: 4,
                numero: 81, dataNascita: "6 aprile 2001", 
                biografia: "Oscar Piastri è un pilota automobilistico australiano, vincitore di vari titoli nelle categorie minori e pilota di punta McLaren.",
                gare: 45, foto: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Oscar_Piastri_2023.jpg" 
            },
            { 
                id: 3, nome: "K. Antonelli", posizione: 1, punti: 259, podi: 12, giriVeloci: 4, poles: 6, vittorie: 5, dnf: 2,
                numero: 12, dataNascita: "25 agosto 2006", 
                biografia: "Andrea Kimi Antonelli è un astro nascente dell'automobilismo italiano, impegnato in Formula 1 con Mercedes.",
                gare: 24, foto: "https://www.formularapida.net/wp-content/uploads/2024/04/Antonelli-F2-Melbourne-2024-scaled.jpg" 
            },
            { 
                id: 4, nome: "L. Hamilton", posizione: 2, punti: 210, podi: 197, giriVeloci: 65, poles: 104, vittorie: 105, dnf: 15,
                numero: 44, dataNascita: "7 gennaio 1985", 
                biografia: "Sir Lewis Hamilton è un pilota automobilistico britannico, sette volte campione del mondo di Formula 1.",
                gare: 350, foto: "https://upload.wikimedia.org/wikipedia/commons/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg" 
            }
        ]);

        // Lista completa scuderie (Card piccole uniformi)
        const listaScuderie = ref([
            { 
                id: 1, nome: "Ferrari", posizione: 2, punti: 360, podi: 810, giriVeloci: 260, poles: 253, vittorie: 245, stagioni: 75,
                descrizione: "Ferrari S.p.A., nota come Scuderia Ferrari, è la divisione corse del costruttore italiano Ferrari ed è la squadra più vincente della storia[cite: 3].",
                gare: 1080, logo: "https://cdn.worldvectorlogo.com/logos/scuderia-ferrari-1.svg" 
            },
            { 
                id: 2, nome: "Mercedes-AMG", posizione: 1, punti: 424, podi: 300, giriVeloci: 100, poles: 130, vittorie: 125, stagioni: 16,
                descrizione: "Mercedes-AMG Petronas F1 Team è il costruttore tedesco che ha dominato l'era dei motori ibridi in Formula 1.",
                gare: 300, logo: "https://cdn.worldvectorlogo.com/logos/mercedes-amg-petronas-f1.svg" 
            },
            { 
                id: 3, nome: "McLaren", posizione: 3, punti: 310, podi: 510, giriVeloci: 160, poles: 160, vittorie: 185, stagioni: 59,
                descrizione: "McLaren Racing Limited è una storica scuderia britannica di Formula 1 con sede a Woking.",
                gare: 980, logo: "https://cdn.worldvectorlogo.com/logos/mclaren-f1-2.svg" 
            }
        ]);

        // Funzioni per gestire l'apertura e la chiusura della schermata estesa
        const selezionaElemento = (elemento) => {
            elementoSelezionato.value = elemento;
        };

        const chiudiDettaglio = () => {
            elementoSelezionato.value = null;
        };

        return {
            tipoOverviewSelezionato,
            elementoSelezionato,
            listaPiloti,
            listaScuderie,
            selezionaElemento,
            chiudiDettaglio
        };
    }
};