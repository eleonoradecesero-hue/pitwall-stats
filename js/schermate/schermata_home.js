const SchermataIniziale = {
    template: `
        <v-container fluid class="pa-4">
            <v-row class="text-center mb-8">
                <v-col cols="12">
                    <h1 class="text-h4 text-grey-darken-1 mb-2">Next race will be in</h1>
                    <h2 class="text-h3 font-weight-bold mb-4" v-if="prossimaGara">
                        {{ prossimaGara.nome }}
                    </h2>
                    <div class="d-inline-block elevation-3 bg-red-darken-3 text-white rounded pa-4 text-h3 font-weight-black" style="letter-spacing: 2px;">
                        {{ tempoRimanente }}
                    </div>
                </v-col>
            </v-row>

            <v-row v-for="(sessione, index) in sessioni" :key="index" class="mb-3">
                <v-col cols="12">
                    <v-card elevation="2" class="pa-4">
                        <v-row align="center" no-gutters>
                            <v-col cols="12" md="4" class="text-h6 font-weight-medium">
                                {{ sessione.nome }}
                            </v-col>
                            <v-col cols="12" md="5" class="d-flex align-center text-body-1">
                                <v-icon icon="mdi-clock-outline" class="mr-2 text-red"></v-icon>
                                {{ HomeService.formattaDataLocale(sessione.inizio, sessione.gmt_offset) }} | 
                                {{ HomeService.formattaOraLocale(sessione.inizio, sessione.gmt_offset) }} - 
                                {{ HomeService.formattaOraLocale(sessione.fine, sessione.gmt_offset) }}
                            </v-col>
                            <v-col cols="12" md="3" class="text-md-right text-left mt-3 mt-md-0">
                                <v-btn 
                                    :color="sessione.risultatiDisponibili ? 'red-darken-3' : 'grey-lighten-1'"
                                    :disabled="!sessione.risultatiDisponibili"
                                    @click="apriRisultati(sessione.nome)"
                                >
                                    Risultati
                                </v-btn>
                            </v-col>
                        </v-row>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>
    `,
    setup() {
        const { ref, onMounted, onUnmounted } = Vue;
        const prossimaGara = ref(null);
        const sessioni = ref([]);
        const tempoRimanente = ref("00:00:00:00");
        let timer = null;

        const aggiornaCountdown = () => {
            if (sessioni.value.length > 0) {
                const primoInizio = new Date(sessioni.value[0].inizio);
                const diff = primoInizio - new Date();
                if (diff > 0) {
                    const g = Math.floor(diff / 86400000).toString().padStart(2, '0');
                    const o = Math.floor((diff / 3600000) % 24).toString().padStart(2, '0');
                    const m = Math.floor((diff / 60000) % 60).toString().padStart(2, '0');
                    const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
                    tempoRimanente.value = `${g}:${o}:${m}:${s}`;
                } else {
                    tempoRimanente.value = "IN CORSO";
                }
            }
        };

        onMounted(async () => {
            const dati = await HomeService.recuperaDatiHome();
            prossimaGara.value = dati.prossimaGara;
            sessioni.value = dati.sessioni;
            aggiornaCountdown();
            timer = setInterval(aggiornaCountdown, 1000);
        });

        onUnmounted(() => clearInterval(timer));

        const apriRisultati = (nome) => alert("Navigazione risultati per: " + nome);

        return { prossimaGara, sessioni, tempoRimanente, apriRisultati, HomeService };
    }
};