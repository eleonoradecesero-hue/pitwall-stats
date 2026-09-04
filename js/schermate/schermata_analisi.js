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
            <div class="d-flex align-center flex-wrap ga-4 mb-4 text-caption text-grey-darken-1">
            </div>
            <v-card v-if="caricamento" class="mb-6 pa-4" elevation="1">
                <div class="d-flex justify-space-between text-caption mb-2"><span>{{ statoCaricamento }}</span><strong>{{ progresso }}%</strong></div>
                <v-progress-linear :model-value="progresso" color="red-darken-3" height="10" rounded></v-progress-linear>
            </v-card>
            <v-alert v-if="errore" type="error" variant="tonal" class="mb-4">{{ errore }}</v-alert>
            <div v-if="caricamento" class="text-center py-8"><v-progress-circular indeterminate color="red-darken-3" size="48"></v-progress-circular><p class="text-body-1 mt-4">I dati vengono scaricati, calcolati e salvati nella cache...</p></div>
            <div v-else-if="!sessioni.length" class="text-center text-grey py-12">
                <v-icon icon="mdi-clock-outline" color="amber-darken-3" size="64"></v-icon>
                <p class="text-h6 mt-3">Dati della sessione non ancora disponibili.</p>
                <p class="text-body-2">Se il Gran Premio è in corso, tempi e telemetria verranno pubblicati dall'API al termine della sessione. Riprova più tardi.</p>
            </div>
            <v-expansion-panels v-else multiple>
                <v-expansion-panel v-for="sessione in sessioni" :key="sessione.session_key">
                    <v-expansion-panel-title>
                        <div class="d-flex align-center flex-wrap ga-2">
                            <strong>{{ etichetta(sessione) }}</strong>
                            <v-chip v-if="sessione.meteo" color="blue-grey-darken-1" variant="tonal" class="font-weight-medium">
                                <v-icon icon="mdi-weather-partly-cloudy"  class="mr-1"></v-icon>
                                {{ sintesiMeteo(sessione.meteo) }}
                            </v-chip>
                            <span v-else class="text-caption text-grey">Meteo non disponibile</span>
                        </div>
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                        <v-table v-if="sessione.tipo === 'Qualifiche'" density="compact" hover><thead><tr><th>Pos</th><th>Pilota</th><th>Giro</th><th>Gap leader</th><th>Gap prec.</th><th>Gap team</th><th>S1</th><th>S2</th><th>S3</th><th>Ideal</th><th>Delta ideal</th><th>Gomma</th><th>Vmax</th><th>Vmedia</th><th>Full gas</th><th>Brake</th><th>Lift&coast</th><th>Clipping</th></tr></thead><tbody><tr v-for="(p, i) in sessione.analisi.classifica" :key="p.numero"><td>{{ i + 1 }}</td><td><b>{{ p.acronimo }}</b></td><td :style="coloreRecord(sessione, p, 'miglior', false)">{{ tempo(p.miglior) }}</td><td>{{ delta(p.deltaLeader) }}</td><td>{{ delta(p.deltaPrecede) }}</td><td>{{ delta(p.deltaTeam) }}</td><td :style="coloreRecord(sessione, p, 's1', false)">{{ tempo(p.s1) }}</td><td :style="coloreRecord(sessione, p, 's2', false)">{{ tempo(p.s2) }}</td><td :style="coloreRecord(sessione, p, 's3', false)">{{ tempo(p.s3) }}</td><td :style="coloreRecord(sessione, p, 'ideal', false)">{{ tempo(p.ideal) }}</td><td>{{ delta(p.deltaIdeal) }}</td><td>{{ inizialiGomme(p.gomme) }}</td><td :style="coloreStatistica(sessione, p, 'telemetria.vmax', 'max')">{{ p.telemetria.vmax ? p.telemetria.vmax + ' km/h' : '-' }}</td><td :style="coloreStatistica(sessione, p, 'telemetria.vmedia', 'max')">{{ p.telemetria.vmedia ? p.telemetria.vmedia.toFixed(1) + ' km/h' : '-' }}</td><td :style="coloreStatistica(sessione, p, 'telemetria.pieno', 'max')">{{ percentuale(p.telemetria.pieno) }}</td><td :style="coloreStatistica(sessione, p, 'telemetria.freno', 'min')">{{ percentuale(p.telemetria.freno) }}</td><td :style="coloreStatistica(sessione, p, 'telemetria.rilascio', 'min')">{{ percentuale(p.telemetria.rilascio) }}</td><td :style="coloreStatistica(sessione, p, 'telemetria.clipping', 'min')">{{ percentuale(p.telemetria.clipping) }}</td></tr></tbody></v-table>
                        <v-table v-else-if="sessione.tipo.startsWith('Practice')" density="compact" hover><thead><tr><th>Pos</th><th>Pilota</th><th>Miglior giro</th><th>S1</th><th>S2</th><th>S3</th><th>Giri</th></tr></thead><tbody><tr v-for="(p, i) in sessione.analisi.classifica" :key="p.acronimo"><td>{{ i + 1 }}</td><td><b>{{ p.acronimo }}</b></td><td :style="coloreRecord(sessione, p, 'miglior', true)">{{ tempo(p.miglior) }}</td><td :style="coloreRecord(sessione, p, 's1', true)">{{ tempo(p.s1) }}</td><td :style="coloreRecord(sessione, p, 's2', true)">{{ tempo(p.s2) }}</td><td :style="coloreRecord(sessione, p, 's3', true)">{{ tempo(p.s3) }}</td><td>{{ p.giri }}</td></tr></tbody></v-table>
                        <v-table v-else density="compact" hover><thead><tr><th>Pos</th><th>Pilota</th><th>Giri</th><th>Tempo totale</th><th>Giro migliore</th><th>S1</th><th>S2</th><th>S3</th><th>Gap leader</th><th>Delta/giro leader</th><th>Gap prec.</th><th>Delta/giro prec.</th><th>Gap team</th><th>Delta/giro team</th><th>Passo mediano</th><th>Dev. standard</th><th>Passo ideale</th><th>Aria pulita</th><th>Pit</th><th>Media pit</th><th>Gomme</th></tr></thead><tbody><tr v-for="(p, i) in sessione.analisi.classifica" :key="p.numero"><td>{{ i + 1 }}</td><td><b>{{ p.acronimo }}</b></td><td>{{ p.giri?.length || p.giri_totali || 0 }}</td><td>{{ p.totale ? tempoGara(p.totale) : '-' }}</td><td :style="coloreRecord(sessione, p, 'miglior', true)">{{ tempo(p.miglior) }}</td><td :style="coloreRecord(sessione, p, 's1', true)">{{ tempo(p.s1) }}</td><td :style="coloreRecord(sessione, p, 's2', true)">{{ tempo(p.s2) }}</td><td :style="coloreRecord(sessione, p, 's3', true)">{{ tempo(p.s3) }}</td><td>{{ p.gapLeader }}</td><td>{{ p.deltaLeaderGiro }}</td><td>{{ p.gapPrecedente }}</td><td>{{ p.deltaPrecedenteGiro }}</td><td>{{ p.gapTeam }}</td><td>{{ p.deltaTeamGiro }}</td><td :style="coloreStatistica(sessione, p, 'mediano', 'min')">{{ p.mediano ? tempo(p.mediano) : '-' }}</td><td :style="coloreStatistica(sessione, p, 'deviazione', 'min')">{{ p.deviazione ? '±' + p.deviazione.toFixed(3) : '-' }}</td><td :style="coloreStatistica(sessione, p, 'ideale', 'min')">{{ Number.isFinite(p.ideale) ? tempo(p.ideale) : '-' }}</td><td :style="coloreStatistica(sessione, p, 'aria', 'max')">{{ p.aria !== undefined ? p.aria + '%' : '-' }}</td><td :style="coloreStatistica(sessione, p, 'pits', 'min')">{{ p.pits !== undefined ? p.pits : '-' }}</td><td :style="coloreStatistica(sessione, p, 'pitMedio', 'min')">{{ p.pitMedio ? p.pitMedio.toFixed(2) + 's' : '-' }}</td><td>{{ inizialiGomme(p.gomme) }}</td></tr></tbody></v-table>
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
        const inizialiGomme = gomme => {
            if (!gomme || gomme === '-') return '-';
            const valori = Array.isArray(gomme) ? gomme : [gomme];
            return valori.filter(Boolean).map(gomma => String(gomma).trim().charAt(0).toUpperCase()).join(' - ') || '-';
        };
        const sintesiMeteo = meteo => {
            if (!meteo) return '';
            return `Temp. aria ${meteo.aria.med}°C · pista ${meteo.pista.med}°C · Umidità ${meteo.umidita.med}% · Vento ${meteo.vento.med} m/s`;
        };
        const coloreRecord = (sessione, pilota, campo, soloAssoluti) => {
            const valore = pilota[campo];
            if (!Number.isFinite(valore)) return {};
            const classifica = sessione.analisi?.classifica || [];
            const valori = classifica.map(elemento => elemento[campo]).filter(Number.isFinite);
            const assoluto = valori.length > 0 && valore === Math.min(...valori);
            if (assoluto) return { color: '#8e24aa', fontWeight: '800' };
            if (!soloAssoluti) return { color: '#16803c', fontWeight: '700' };
            return {};
        };
        const valoreCampo = (oggetto, percorso) => percorso.split('.').reduce((valore, chiave) => valore?.[chiave], oggetto);
        const coloreStatistica = (sessione, pilota, campo, direzione) => {
            const valore = valoreCampo(pilota, campo);
            if (!Number.isFinite(valore)) return {};
            const valori = (sessione.analisi?.classifica || []).map(elemento => valoreCampo(elemento, campo)).filter(Number.isFinite);
            if (!valori.length) return {};
            const record = direzione === 'max' ? Math.max(...valori) : Math.min(...valori);
            return valore === record ? { color: '#8e24aa', fontWeight: '800' } : {};
        };
        onMounted(caricaMeeting); return { anno, anni, meetings, meeting, sessioni, caricamentoMeeting, caricamento, progresso, statoCaricamento, errore, caricaMeeting, caricaAnalisi, etichetta, tempo, tempoGara, delta, percentuale, inizialiGomme, sintesiMeteo, coloreRecord, coloreStatistica };
    }
};