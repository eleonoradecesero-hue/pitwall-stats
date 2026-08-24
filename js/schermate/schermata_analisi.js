// js/schermate/schermata_analisi.js

const SchermataAnalisi = {
    template: `
        <v-container fluid class="pa-2 pa-md-4">
            <v-card class="mb-6 hero-f1-card text-white" elevation="3">
                <v-card-text class="pa-6">
                    <v-row align="center">
                        <v-col cols="12" md="7"><div class="text-overline">OpenF1 + Firestore</div><h1 class="text-h4 font-weight-black"><v-icon icon="mdi-chart-timeline-variant" class="mr-2"></v-icon>Analisi sessioni</h1><p class="text-subtitle-1 text-grey-lighten-2 mb-0">Tempi, passo, gomme, telemetria e condizioni, con le formule della sezione statistiche.</p></v-col>
                        <v-col cols="12" md="2"><v-select v-model="anno" :items="anni" label="Anno" variant="solo-filled" hide-details bg-color="white" @update:model-value="caricaMeeting"></v-select></v-col>
                        <v-col cols="12" md="3"><v-select v-model="meeting" :items="meetings" item-title="meeting_name" item-value="meeting_key" label="Gran Premio" variant="solo-filled" hide-details bg-color="white" :loading="caricamentoMeeting" @update:model-value="caricaAnalisi"></v-select></v-col>
                    </v-row>
                </v-card-text>
            </v-card>
            <v-card v-if="caricamento" class="mb-6 pa-4" elevation="1">
                <div class="d-flex justify-space-between text-caption mb-2"><span>{{ statoCaricamento }}</span><strong>{{ progresso }}%</strong></div>
                <v-progress-linear :model-value="progresso" color="red-darken-3" height="10" rounded></v-progress-linear>
            </v-card>
            <v-alert v-if="errore" type="error" variant="tonal" class="mb-4">{{ errore }}</v-alert>
            <div v-if="caricamento" class="text-center py-8"><v-progress-circular indeterminate color="red-darken-3" size="48"></v-progress-circular><p class="text-body-1 mt-4">I dati vengono scaricati, calcolati e salvati nella cache...</p></div>
            <div v-else-if="!sessioni.length" class="text-center text-grey py-12"><v-icon icon="mdi-chart-box-outline" size="64"></v-icon><p class="text-h6">Seleziona un Gran Premio per iniziare.</p></div>
            <v-expansion-panels v-else multiple>
                <v-expansion-panel v-for="sessione in sessioni" :key="sessione.session_key">
                    <v-expansion-panel-title><strong>{{ etichetta(sessione) }}</strong><span class="text-caption text-grey ml-4">Sessione #{{ sessione.session_key }}</span></v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-alert v-if="sessione.meteo" density="compact" variant="tonal" color="blue-grey" class="mb-4">Meteo: aria {{ sessione.meteo.aria.min }} / {{ sessione.meteo.aria.med }} / {{ sessione.meteo.aria.max }} °C, pista {{ sessione.meteo.pista.min }} / {{ sessione.meteo.pista.med }} / {{ sessione.meteo.pista.max }} °C, umidita {{ sessione.meteo.umidita.med }}%, vento {{ sessione.meteo.vento.med }} m/s</v-alert>
                        <v-table v-if="sessione.tipo === 'Qualifiche'" density="compact" hover><thead><tr><th>Pos</th><th>Pilota</th><th>Giro</th><th>Gap leader</th><th>Gap prec.</th><th>Gap team</th><th>S1</th><th>S2</th><th>S3</th><th>Ideal</th><th>Delta ideal</th><th>Gomma</th><th>Vmax</th><th>Vmedia</th><th>Full gas</th><th>Brake</th><th>Lift&coast</th><th>Clipping</th></tr></thead><tbody><tr v-for="(p, i) in sessione.analisi.classifica" :key="p.numero"><td>{{ i + 1 }}</td><td><b>{{ p.acronimo }}</b></td><td>{{ tempo(p.miglior) }}</td><td>{{ delta(p.deltaLeader) }}</td><td>{{ delta(p.deltaPrecede) }}</td><td>{{ delta(p.deltaTeam) }}</td><td>{{ tempo(p.s1) }}</td><td>{{ tempo(p.s2) }}</td><td>{{ tempo(p.s3) }}</td><td>{{ tempo(p.ideal) }}</td><td>{{ delta(p.deltaIdeal) }}</td><td>{{ p.gomme || '-' }}</td><td>{{ p.telemetria.vmax ? p.telemetria.vmax + ' km/h' : '-' }}</td><td>{{ p.telemetria.vmedia ? p.telemetria.vmedia.toFixed(1) + ' km/h' : '-' }}</td><td>{{ percentuale(p.telemetria.pieno) }}</td><td>{{ percentuale(p.telemetria.freno) }}</td><td>{{ percentuale(p.telemetria.rilascio) }}</td><td>{{ percentuale(p.telemetria.clipping) }}</td></tr></tbody></v-table>
                        <v-table v-else-if="sessione.tipo.startsWith('Practice')" density="compact" hover><thead><tr><th>Pos</th><th>Pilota</th><th>Miglior giro</th><th>S1</th><th>S2</th><th>S3</th><th>Giri</th></tr></thead><tbody><tr v-for="(p, i) in sessione.analisi.classifica" :key="p.acronimo"><td>{{ i + 1 }}</td><td><b>{{ p.acronimo }}</b></td><td>{{ tempo(p.miglior) }}</td><td>{{ tempo(p.s1) }}</td><td>{{ tempo(p.s2) }}</td><td>{{ tempo(p.s3) }}</td><td>{{ p.giri }}</td></tr></tbody></v-table>
                        <v-table v-else density="compact" hover><thead><tr><th>Pos</th><th>Pilota</th><th>Giri</th><th>Tempo totale</th><th>Gap leader</th><th>Delta/giro leader</th><th>Gap prec.</th><th>Delta/giro prec.</th><th>Gap team</th><th>Delta/giro team</th><th>Passo mediano</th><th>Dev. standard</th><th>Passo ideale</th><th>Aria pulita</th><th>Pit</th><th>Media pit</th><th>Gomme</th></tr></thead><tbody><tr v-for="(p, i) in sessione.analisi.classifica" :key="p.numero"><td>{{ i + 1 }}</td><td><b>{{ p.acronimo }}</b></td><td>{{ p.giri?.length || p.giri_totali || 0 }}</td><td>{{ p.totale ? tempoGara(p.totale) : '-' }}</td><td>{{ p.gapLeader }}</td><td>{{ p.deltaLeaderGiro }}</td><td>{{ p.gapPrecedente }}</td><td>{{ p.deltaPrecedenteGiro }}</td><td>{{ p.gapTeam }}</td><td>{{ p.deltaTeamGiro }}</td><td>{{ p.mediano ? tempo(p.mediano) : '-' }}</td><td>{{ p.deviazione ? '±' + p.deviazione.toFixed(3) : '-' }}</td><td>{{ Number.isFinite(p.ideale) ? tempo(p.ideale) : '-' }}</td><td>{{ p.aria !== undefined ? p.aria + '%' : '-' }}</td><td>{{ p.pits !== undefined ? p.pits : '-' }}</td><td>{{ p.pitMedio ? p.pitMedio.toFixed(2) + 's' : '-' }}</td><td>{{ p.gomme?.join(' - ') || '-' }}</td></tr></tbody></v-table>
                    </v-expansion-panel-text>
                </v-expansion-panel>
            </v-expansion-panels>
        </v-container>
    `,
    setup() {
        const { ref, onMounted } = Vue;
        const anno = ref(new Date().getFullYear()), anni = [2026, 2025, 2024, 2023], meetings = ref([]), meeting = ref(null), sessioni = ref([]), caricamentoMeeting = ref(false), caricamento = ref(false), progresso = ref(0), statoCaricamento = ref('Preparazione...'), errore = ref('');
        const caricaMeeting = async () => { caricamentoMeeting.value = true; errore.value = ''; try { meetings.value = (await AnalisiService.recuperaMeeting(anno.value)).filter(m => !(m.meeting_name || '').toLowerCase().includes('test')); } catch (e) { errore.value = 'Impossibile recuperare i Gran Premi da OpenF1.'; } finally { caricamentoMeeting.value = false; } };
        const caricaAnalisi = async () => { if (!meeting.value) return; caricamento.value = true; progresso.value = 0; statoCaricamento.value = 'Recupero sessioni...'; errore.value = ''; try { sessioni.value = await AnalisiService.carica(anno.value, meeting.value, (valore, stato) => { progresso.value = valore; statoCaricamento.value = stato; }); } catch (e) { console.error(e); errore.value = 'Analisi non disponibile per questo Gran Premio.'; } finally { caricamento.value = false; } };
        const etichetta = s => s.session_name === 'Race' ? 'Gara' : s.session_name === 'Qualifying' ? 'Qualifiche' : s.session_name;
        const tempo = s => !Number.isFinite(s) ? '-' : `${Math.floor(s / 60) ? Math.floor(s / 60) + ':' : ''}${(s % 60).toFixed(3).padStart(6, '0')}`;
        const tempoGara = s => tempo(s); const delta = d => d === '-' || !Number.isFinite(d) || d === 0 ? '-' : `+${d.toFixed(3)}`; const percentuale = p => Number.isFinite(p) ? p.toFixed(1) + '%' : '-';
        onMounted(caricaMeeting); return { anno, anni, meetings, meeting, sessioni, caricamentoMeeting, caricamento, progresso, statoCaricamento, errore, caricaMeeting, caricaAnalisi, etichetta, tempo, tempoGara, delta, percentuale };
    }
};