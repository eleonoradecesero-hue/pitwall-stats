const SchermataIniziale = {
    template: `
        <v-container fluid class="pa-4">
            <!-- SEZIONE HEADER: Titolo e Countdown -->
            <v-row class="text-center mb-8">
                <v-col cols="12">
                    <h1 class="text-h4 text-grey-darken-1 mb-2">Next race will be in</h1>
                    <h2 class="text-h3 font-weight-bold mb-4" v-if="prossimaGara">
                        {{ prossimaGara.bandiera }} {{ prossimaGara.nome }}
                    </h2>
                    
                    <div class="d-inline-block elevation-3 bg-red-darken-3 text-white rounded pa-4 text-h3 font-weight-black" style="letter-spacing: 2px;">
                        {{ tempoRimanente }}
                    </div>
                    <div class="text-subtitle-1 mt-2 text-grey">alla prima prova libera (FP1)</div>
                </v-col>
            </v-row>

            <!-- SEZIONE SESSIONI -->
            <v-row v-for="(sessione, index) in sessioni" :key="index" class="mb-3">
                <v-col cols="12">
                    <v-card elevation="2" class="pa-4">
                        <v-row align="center" no-gutters>
                            <v-col cols="12" md="4" class="text-h6 font-weight-medium">
                                {{ sessione.nome }}
                            </v-col>
                            
                            <v-col cols="12" md="5" class="d-flex align-center text-body-1">
                                <v-icon icon="mdi-clock-outline" class="mr-2 text-red"></v-icon>
                                {{ formattaDataLocale(sessione.inizio) }} 
                                <strong class="mx-2">|</strong> 
                                {{ formattaOraLocale(sessione.inizio) }} - {{ formattaOraLocale(sessione.fine) }}
                            </v-col>
                            
                            <v-col cols="12" md="3" class="text-md-right text-left mt-3 mt-md-0">
                                <v-btn 
                                    :color="sessione.risultatiDisponibili ? 'red-darken-3' : 'grey-lighten-1'"
                                    :disabled="!sessione.risultatiDisponibili"
                                    prepend-icon="mdi-format-list-bulleted"
                                    @click="apriRisultati(sessione.nome)"
                                    width="150"
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
        let timerOrologio = null;

        const formattaDataLocale = (dataIso) => {
            const data = new Date(dataIso);
            return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: '2-digit', month: 'long' }).format(data);
        };

        const formattaOraLocale = (dataIso) => {
            const data = new Date(dataIso);
            return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(data);
        };

        const aggiornaDinamicheTempo = () => {
            const oraAttuale = new Date();

            if (sessioni.value.length > 0) {
                const inizioFP1 = new Date(sessioni.value[0].inizio);
                const differenza = inizioFP1 - oraAttuale;

                if (differenza > 0) {
                    const giorni = Math.floor(differenza / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
                    const ore = Math.floor((differenza / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
                    const minuti = Math.floor((differenza / 1000 / 60) % 60).toString().padStart(2, '0');
                    const secondi = Math.floor((differenza / 1000) % 60).toString().padStart(2, '0');
                    tempoRimanente.value = `${giorni}:${ore}:${minuti}:${secondi}`;
                } else {
                    tempoRimanente.value = "00:00:00:00";
                }
            }

            sessioni.value.forEach(sessione => {
                const fineSessione = new Date(sessione.fine);
                const tempoSblocco = new Date(fineSessione.getTime() + (15 * 60 * 1000));
                sessione.risultatiDisponibili = oraAttuale >= tempoSblocco;
            });
        };

        const apriRisultati = (nomeSessione) => {
            alert(`Naviga ai risultati di: ${nomeSessione}`);
        };

        onMounted(() => {
            // Dati statici per testare la UI
            const oraBase = new Date();
            
            prossimaGara.value = { nome: "Miami Gran Prix", bandiera: "🇺🇸" };

            sessioni.value = [
                { nome: "Prove Libere 1", inizio: new Date(oraBase.getTime() + (2 * 24 * 60 * 60 * 1000)).toISOString(), fine: new Date(oraBase.getTime() + (2 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)).toISOString(), risultatiDisponibili: false },
                { nome: "Prove Libere 2", inizio: new Date(oraBase.getTime() + (2 * 24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000)).toISOString(), fine: new Date(oraBase.getTime() + (2 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000)).toISOString(), risultatiDisponibili: false },
                { nome: "Prove Libere 3", inizio: new Date(oraBase.getTime() + (3 * 24 * 60 * 60 * 1000)).toISOString(), fine: new Date(oraBase.getTime() + (3 * 24 * 60 * 60 * 1000) + (60 * 60 * 1000)).toISOString(), risultatiDisponibili: false },
                { nome: "Qualifiche", inizio: new Date(oraBase.getTime() + (3 * 24 * 60 * 60 * 1000) + (3 * 60 * 60 * 1000)).toISOString(), fine: new Date(oraBase.getTime() + (3 * 24 * 60 * 60 * 1000) + (4 * 60 * 60 * 1000)).toISOString(), risultatiDisponibili: false },
                { nome: "Gara", inizio: new Date(oraBase.getTime() + (4 * 24 * 60 * 60 * 1000)).toISOString(), fine: new Date(oraBase.getTime() + (4 * 24 * 60 * 60 * 1000) + (2 * 60 * 60 * 1000)).toISOString(), risultatiDisponibili: false }
            ];

            aggiornaDinamicheTempo();
            timerOrologio = setInterval(aggiornaDinamicheTempo, 1000);
        });

        onUnmounted(() => {
            if (timerOrologio) clearInterval(timerOrologio);
        });

        return {
            prossimaGara, sessioni, tempoRimanente, formattaDataLocale, formattaOraLocale, apriRisultati
        };
    }
};