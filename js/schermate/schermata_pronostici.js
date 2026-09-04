// js/schermate/schermata_pronostici.js

const SchermataPronostici = {
    template: `
        <v-container fluid class="pa-4">
            <v-alert v-if="messaggio" :type="tipoMessaggio" variant="tonal" closable class="mb-4">{{ messaggio }}</v-alert>
            <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
                <div>
                    <h1 class="text-h4 text-red-darken-3 font-weight-bold">Area Pronostici</h1>
                    <p class="text-body-1 text-grey-darken-1 mt-1">Indovina pole e podio prima dell'inizio delle qualifiche.</p>
                </div>
                <v-chip v-if="utente" color="green" variant="tonal" prepend-icon="mdi-account-check">{{ utente.displayName || utente.email }}</v-chip>
            </div>

            <v-card v-if="!utente" elevation="2" class="pa-8 text-center mb-6">
                <v-icon icon="mdi-account-circle" color="red-darken-3" size="52" class="mb-3"></v-icon>
                <h2 class="text-h5 font-weight-bold mb-2">Accedi per partecipare</h2>
                <p class="text-body-2 text-grey-darken-1 mb-4">Crea un account o accedi dal Profilo per salvare pronostici e punti.</p>
                <v-btn color="red-darken-3" prepend-icon="mdi-account-plus" to="/profilo">Accedi o crea account</v-btn>
            </v-card>

            <template v-else>
                <v-card v-if="caricamento" class="pa-8 text-center mb-6">
                    <v-progress-circular indeterminate color="red-darken-3"></v-progress-circular>
                    <p class="mt-3 text-grey-darken-1">Caricamento del prossimo weekend...</p>
                </v-card>

                <v-alert v-else-if="!eventi.length" type="info" variant="tonal" class="mb-6">Non ci sono sessioni di qualifica disponibili per il prossimo weekend.</v-alert>

                <v-alert v-if="eventi.length" type="info" variant="tonal" class="mb-6">
                    <strong>Come si calcolano i punti:</strong> 10 punti per il poleman corretto, più i punti ufficiali ottenuti da ciascun pilota del podio. Quando è presente una Sprint, puoi compilare un pronostico separato per Sprint e gara.
                </v-alert>

                <v-row v-if="eventi.length" class="mb-6">
                    <v-col v-for="evento in eventi" :key="evento.id" cols="12">
                        <v-card elevation="2" class="pa-4 h-100">
                            <v-card-title class="px-0 d-flex align-center justify-space-between flex-wrap ga-2">
                                <span>{{ evento.tipo === 'sprint' ? 'Pronostico Sprint' : 'Pronostico Gara' }}</span>
                                <v-chip size="small" :color="PronosticiService.scaduto(evento) ? 'grey' : 'red-darken-3'" variant="tonal">
                                    {{ PronosticiService.scaduto(evento) ? 'Chiuso' : 'Aperto' }}
                                </v-chip>
                            </v-card-title>
                            <v-card-subtitle class="px-0 mb-3">{{ gara.nome }} · chiusura {{ formattaScadenza(evento) }}</v-card-subtitle>
                            <v-form @submit.prevent="inviaPronostico(evento)">
                                <v-select v-model="moduli[evento.id].poleman" :items="piloti" item-title="nome" item-value="id" label="Poleman" prepend-inner-icon="mdi-flag-checkered" variant="outlined" :disabled="PronosticiService.scaduto(evento)"></v-select>
                                <div class="text-subtitle-2 font-weight-bold mb-2">Podio della {{ evento.tipo === 'sprint' ? 'Sprint' : 'gara' }}</div>
                                <v-row>
                                    <v-col v-for="(etichetta, indice) in ['1° posto', '2° posto', '3° posto']" :key="etichetta" cols="12" sm="4" class="py-1">
                                        <v-select v-model="moduli[evento.id].podio[indice]" :items="pilotiDisponibili(evento, indice)" item-title="nome" item-value="id" :label="etichetta" variant="outlined" :disabled="PronosticiService.scaduto(evento)"></v-select>
                                    </v-col>
                                </v-row>
                                <v-btn type="submit" color="red-darken-3" prepend-icon="mdi-content-save" :disabled="PronosticiService.scaduto(evento)" :loading="salvataggio === evento.id">Salva pronostico</v-btn>
                            </v-form>
                        </v-card>
                    </v-col>
                </v-row>

                <v-card elevation="2" class="pa-4">
                    <v-card-title class="px-0">Storico dei miei pronostici</v-card-title>
                    <v-table v-if="storico.length" density="comfortable">
                        <thead><tr><th>Gran Premio</th><th>Sessione</th><th>Poleman</th><th>Podio</th><th class="text-right">Punti</th></tr></thead>
                        <tbody><tr v-for="pronostico in storico" :key="pronostico.id">
                            <td class="font-weight-bold">{{ pronostico.granPremio }}</td>
                            <td>{{ pronostico.tipo === 'sprint' ? 'Sprint' : 'Gara' }}</td>
                            <td>{{ nomePilota(pronostico.poleman) }}</td>
                            <td>{{ pronostico.podio.map(nomePilota).join(' | ') }}</td>
                            <td class="text-right"><v-chip :color="pronostico.punti === null ? 'grey' : 'success'" size="small">{{ pronostico.punti === null ? 'In attesa' : pronostico.punti + ' PT' }}</v-chip></td>
                        </tr></tbody>
                    </v-table>
                    <p v-else class="text-body-2 text-grey-darken-1">Non hai ancora salvato pronostici.</p>
                </v-card>
            </template>
        </v-container>
    `,
    setup() {
        const { ref, computed, onMounted, onUnmounted } = Vue;
        const utente = ref(null);
        const gara = ref(null);
        const piloti = ref([]);
        const eventi = ref([]);
        const moduli = ref({});
        const storico = ref([]);
        const messaggio = ref('');
        const tipoMessaggio = ref('info');
        const caricamento = ref(true);
        const salvataggio = ref('');
        let annullaAuth = () => {};

        const mostraMessaggio = (testo, tipo = 'info') => { messaggio.value = testo; tipoMessaggio.value = tipo; };
        const nomePilota = id => piloti.value.find(pilota => pilota.id === id)?.nome || id || '-';
        const formattaScadenza = evento => UtilityF1.formattaDataLocale(PronosticiService.scadenza(evento));
        const pilotiDisponibili = (evento, indice) => piloti.value.filter(pilota => {
            const selezionati = moduli.value[evento.id].podio.filter((id, posizione) => posizione !== indice && id);
            return !selezionati.includes(pilota.id);
        });

        const caricaDati = async () => {
            caricamento.value = true;
            try {
                const [datiHome, datiPiloti] = await Promise.all([HomeService.recuperaDatiHome(), PanoramicaService.carica()]);
                gara.value = datiHome.prossimaGara;
                piloti.value = datiPiloti.piloti.map(pilota => ({ ...pilota, id: PronosticiService.pilotaId(pilota) }));
                eventi.value = PronosticiService.costruisciEventi(gara.value);
                eventi.value.forEach(evento => { moduli.value[evento.id] = PronosticiService.creaPronosticoVuoto(evento); });
                storico.value = await PronosticiService.caricaStorico(utente.value.uid);
                storico.value.forEach(pronostico => {
                    if (moduli.value[pronostico.eventoId]) {
                        moduli.value[pronostico.eventoId] = { eventoId: pronostico.eventoId, tipo: pronostico.tipo, poleman: pronostico.poleman, podio: pronostico.podio };
                    }
                });
                for (const indice in storico.value) storico.value[indice] = await PronosticiService.calcolaERegistraPunti(utente.value.uid, storico.value[indice]);
            } catch (errore) { mostraMessaggio('Impossibile caricare i pronostici.', 'error'); console.error(errore); }
            finally { caricamento.value = false; }
        };
        const accedi = async () => { try { await FirebaseService.accediConGoogle(); } catch (errore) { mostraMessaggio(errore.message, 'error'); } };
        const inviaPronostico = async evento => {
            salvataggio.value = evento.id;
            try {
                const dati = await PronosticiService.salva(utente.value.uid, evento, moduli.value[evento.id]);
                const esistente = storico.value.findIndex(pronostico => pronostico.id === evento.id);
                const salvato = { id: evento.id, ...dati };
                if (esistente >= 0) storico.value[esistente] = salvato; else storico.value.unshift(salvato);
                mostraMessaggio('Pronostico salvato su Firebase.', 'success');
            } catch (errore) { mostraMessaggio(errore.message, 'error'); }
            finally { salvataggio.value = ''; }
        };
        onMounted(() => {
            annullaAuth = FirebaseService.osservaAutenticazione(async nuovoUtente => {
                utente.value = nuovoUtente;
                if (nuovoUtente) await caricaDati(); else caricamento.value = false;
            });
            if (!FirebaseService.configurato()) { caricamento.value = false; mostraMessaggio('Configura Firebase in js/firebase_config.js per attivare l\'accesso.', 'warning'); }
        });
        onUnmounted(() => annullaAuth());
        return { PronosticiService, utente, gara, piloti, eventi, moduli, storico, messaggio, tipoMessaggio, caricamento, salvataggio, accedi, inviaPronostico, pilotiDisponibili, nomePilota, formattaScadenza };
    }
};