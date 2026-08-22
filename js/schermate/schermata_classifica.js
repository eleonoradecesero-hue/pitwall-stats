// js/schermate/schermata_classifica.js

/**
 * ======================================================================================
 * PITWALL STATS - SCHERMATA CLASSIFICHE (Classifica)
 * ======================================================================================
 * Questa schermata visualizza le classifiche ufficiali di Formula 1:
 * 1. Switch dinamico tra Classifica Piloti (Drivers) e Classifica Costruttori (Constructors).
 * 2. Selettore dell'anno di campionato (2026, 2025, 2024, ecc.).
 * 3. Podio interattivo dei primi 3 posti con altezze differenziate, medaglie e animazioni.
 * 4. Tabella completa delle posizioni con indicatori cromatici della scuderia, foto/loghi reali,
 *    punti totali, vittorie e distacco (delta) dal leader.
 * 5. Barra di ricerca in tempo reale per filtrare piloti o scuderie.
 * 6. Finestra di dialogo con dettagli e statistiche approfondite del pilota/costruttore selezionato.
 * ======================================================================================
 */

const SchermataClassifica = {
    template: `
        <v-container fluid class="pa-2 pa-md-4">
            <!-- HERO HEADER: TITOLO, SELETTORE ANNO E TOGGLE CLASSIFICA -->
            <v-card elevation="3" class="mb-6 overflow-hidden hero-f1-card text-white">
                <v-card-text class="pa-6 pa-md-8">
                    <v-row align="center" justify="space-between">
                        <v-col cols="12" md="7">
                            <div class="d-flex align-center gap-2 mb-2">
                                <v-chip color="white" variant="outlined" size="small" class="font-weight-bold mr-2">
                                    MONDIALE F1 {{ annoSelezionato }}
                                </v-chip>
                                <v-chip color="red-lighten-2" variant="tonal" size="small" class="font-weight-bold">
                                    {{ tipoClassifica === 'piloti' ? 'Campionato Piloti' : 'Campionato Costruttori' }}
                                </v-chip>
                            </div>

                            <h1 class="text-h4 text-md-h3 font-weight-black d-flex align-center">
                                <v-icon icon="mdi-trophy" class="mr-3 text-amber-accent-2" size="40"></v-icon>
                                <span>Classifiche Mondiali</span>
                            </h1>
                            <p class="text-subtitle-1 text-grey-lighten-2 mt-1">
                                Punteggi ufficiali, vittorie e distacchi aggiornati in tempo reale
                            </p>
                        </v-col>

                        <!-- SELETTORE ANNO E BOTTONI PILOTI / COSTRUTTORI -->
                        <v-col cols="12" md="5" class="text-md-right mt-4 mt-md-0">
                            <div class="d-flex flex-column align-md-end gap-3">
                                <!-- Bottoni switch Piloti / Scuderie -->
                                <v-btn-toggle
                                    v-model="tipoClassifica"
                                    mandatory
                                    color="white"
                                    class="elevation-2 bg-black-opacity rounded-pill pa-1"
                                >
                                    <v-btn value="piloti" prepend-icon="mdi-account" class="rounded-pill font-weight-bold px-4" size="small">
                                        Piloti
                                    </v-btn>
                                    <v-btn value="scuderie" prepend-icon="mdi-car-sports" class="rounded-pill font-weight-bold px-4" size="small">
                                        Scuderie
                                    </v-btn>
                                </v-btn-toggle>

                                <!-- Selettore Anno compatto -->
                                <div style="min-width: 160px; max-width: 200px;" class="mt-2">
                                    <v-select
                                        v-model="annoSelezionato"
                                        :items="anniDisponibili"
                                        label="Stagione"
                                        density="compact"
                                        variant="solo-filled"
                                        bg-color="rgba(0,0,0,0.4)"
                                        color="white"
                                        hide-details
                                        class="rounded-lg text-white"
                                        @update:model-value="caricaClassifiche"
                                    ></v-select>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- STATO DI CARICAMENTO (Spinner) -->
            <v-row v-if="inCaricamento" justify="center" align="center" style="min-height: 350px;">
                <v-col cols="12" class="text-center">
                    <v-progress-circular indeterminate color="red-darken-3" size="64" width="6"></v-progress-circular>
                    <p class="text-h6 mt-4 text-grey-darken-1 font-weight-medium">
                        Caricamento classifiche ufficiali per il {{ annoSelezionato }}...
                    </p>
                </v-col>
            </v-row>

            <!-- CONTENUTO CLASSIFICA (Quando i dati sono caricati) -->
            <div v-else>
                <!-- ========================================================= -->
                <!-- SEZIONE 1: CLASSIFICA PILOTI                             -->
                <!-- ========================================================= -->
                <div v-if="tipoClassifica === 'piloti'">
                    <!-- PODIO DEI PRIMI 3 PILOTI -->
                    <v-row v-if="pilotiPodio.length >= 3" class="mb-8" justify="center" align="end">
                        <!-- 2° Posto (Sinistra) -->
                        <v-col cols="12" sm="4" md="3" class="order-2 order-sm-1">
                            <v-card 
                                elevation="3" 
                                class="pa-4 text-center hover-card podium-card podium-second rounded-xl"
                                @click="apriDettaglio(pilotiPodio[1], 'pilota')"
                            >
                                <v-chip color="grey-darken-2" size="small" class="font-weight-bold mb-2">
                                    🥈 2° POSTO
                                </v-chip>
                                
                                <div class="d-flex justify-center my-3">
                                    <v-avatar size="85" class="elevation-3 border-podium" :style="{ borderColor: pilotiPodio[1].coloreTeam }">
                                        <v-img :src="pilotiPodio[1].foto" cover alt="2° Posto">
                                            <template v-slot:error>
                                                <span class="text-h5 font-weight-bold">{{ pilotiPodio[1].sigla }}</span>
                                            </template>
                                        </v-img>
                                    </v-avatar>
                                </div>

                                <h3 class="text-h6 font-weight-bold text-truncate">{{ pilotiPodio[1].nome }}</h3>
                                <p class="text-caption text-grey-darken-1 d-flex align-center justify-center">
                                    <span class="team-dot mr-1" :style="{ backgroundColor: pilotiPodio[1].coloreTeam }"></span>
                                    <span class="text-truncate">{{ pilotiPodio[1].scuderia }}</span>
                                </p>

                                <div class="mt-3 d-flex justify-center gap-2">
                                    <v-chip color="red-darken-3" class="font-weight-bold px-3">
                                        {{ pilotiPodio[1].punti }} PT
                                    </v-chip>
                                    <v-chip v-if="pilotiPodio[1].vittorie > 0" color="amber-darken-3" size="small" class="font-weight-bold">
                                        🏆 {{ pilotiPodio[1].vittorie }}
                                    </v-chip>
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 1° Posto (Centro - Più alto ed evidenziato) -->
                        <v-col cols="12" sm="4" md="4" class="order-1 order-sm-2">
                            <v-card 
                                elevation="6" 
                                class="pa-5 text-center hover-card podium-card podium-first rounded-xl"
                                @click="apriDettaglio(pilotiPodio[0], 'pilota')"
                            >
                                <v-icon icon="mdi-crown" color="amber-darken-2" size="36" class="mb-1 pulse-animation"></v-icon>
                                <div>
                                    <v-chip color="amber-darken-3" size="small" class="font-weight-bold mb-2">
                                        🥇 LEADER DEL MONDIALE
                                    </v-chip>
                                </div>

                                <div class="d-flex justify-center my-3">
                                    <v-avatar size="105" class="elevation-4 border-podium-gold" :style="{ borderColor: pilotiPodio[0].coloreTeam }">
                                        <v-img :src="pilotiPodio[0].foto" cover alt="1° Posto">
                                            <template v-slot:error>
                                                <span class="text-h4 font-weight-bold">{{ pilotiPodio[0].sigla }}</span>
                                            </template>
                                        </v-img>
                                    </v-avatar>
                                </div>

                                <h2 class="text-h5 font-weight-black text-truncate">{{ pilotiPodio[0].nome }}</h2>
                                <p class="text-subtitle-2 text-grey-darken-2 d-flex align-center justify-center font-weight-medium">
                                    <span class="team-dot mr-1" :style="{ backgroundColor: pilotiPodio[0].coloreTeam }"></span>
                                    <span>{{ pilotiPodio[0].scuderia }}</span>
                                </p>

                                <div class="mt-4 d-flex justify-center gap-2">
                                    <v-chip color="red-darken-3" size="large" class="font-weight-black text-h6 px-4">
                                        {{ pilotiPodio[0].punti }} PT
                                    </v-chip>
                                    <v-chip v-if="pilotiPodio[0].vittorie > 0" color="amber-darken-3" class="font-weight-bold">
                                        🏆 {{ pilotiPodio[0].vittorie }} VITTORIE
                                    </v-chip>
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 3° Posto (Destra) -->
                        <v-col cols="12" sm="4" md="3" class="order-3 order-sm-3">
                            <v-card 
                                elevation="3" 
                                class="pa-4 text-center hover-card podium-card podium-third rounded-xl"
                                @click="apriDettaglio(pilotiPodio[2], 'pilota')"
                            >
                                <v-chip color="brown-darken-1" size="small" class="font-weight-bold mb-2">
                                    🥉 3° POSTO
                                </v-chip>

                                <div class="d-flex justify-center my-3">
                                    <v-avatar size="85" class="elevation-3 border-podium" :style="{ borderColor: pilotiPodio[2].coloreTeam }">
                                        <v-img :src="pilotiPodio[2].foto" cover alt="3° Posto">
                                            <template v-slot:error>
                                                <span class="text-h5 font-weight-bold">{{ pilotiPodio[2].sigla }}</span>
                                            </template>
                                        </v-img>
                                    </v-avatar>
                                </div>

                                <h3 class="text-h6 font-weight-bold text-truncate">{{ pilotiPodio[2].nome }}</h3>
                                <p class="text-caption text-grey-darken-1 d-flex align-center justify-center">
                                    <span class="team-dot mr-1" :style="{ backgroundColor: pilotiPodio[2].coloreTeam }"></span>
                                    <span class="text-truncate">{{ pilotiPodio[2].scuderia }}</span>
                                </p>

                                <div class="mt-3 d-flex justify-center gap-2">
                                    <v-chip color="red-darken-3" class="font-weight-bold px-3">
                                        {{ pilotiPodio[2].punti }} PT
                                    </v-chip>
                                    <v-chip v-if="pilotiPodio[2].vittorie > 0" color="amber-darken-3" size="small" class="font-weight-bold">
                                        🏆 {{ pilotiPodio[2].vittorie }}
                                    </v-chip>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- TABELLA COMPLETA DEI PILOTI -->
                    <v-card elevation="2" class="pa-4 rounded-xl">
                        <v-row align="center" justify="space-between" class="mb-3">
                            <v-col cols="12" sm="6">
                                <h3 class="text-h6 font-weight-bold text-grey-darken-3 d-flex align-center">
                                    <v-icon icon="mdi-format-list-numbered" color="red-darken-3" class="mr-2"></v-icon>
                                    Classifica Completa Piloti
                                </h3>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-input
                                    v-model="filtroTesto"
                                    placeholder="Cerca pilota o scuderia..."
                                    density="compact"
                                    variant="outlined"
                                    prepend-inner-icon="mdi-magnify"
                                    clearable
                                    hide-details
                                ></v-text-input>
                            </v-col>
                        </v-row>

                        <v-table hover class="table-classifica">
                            <thead>
                                <tr>
                                    <th class="font-weight-bold text-center" style="width: 70px;">Pos</th>
                                    <th class="font-weight-bold">Pilota</th>
                                    <th class="font-weight-bold">Scuderia</th>
                                    <th class="font-weight-bold text-center">Vittorie</th>
                                    <th class="font-weight-bold text-right">Distacco</th>
                                    <th class="font-weight-bold text-right">Punti</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr 
                                    v-for="pilota in pilotiFiltrati" 
                                    :key="pilota.posizione"
                                    @click="apriDettaglio(pilota, 'pilota')"
                                    class="cursor-pointer"
                                >
                                    <td class="text-center font-weight-black" :class="{'text-red-darken-3': pilota.posizione <= 3}">
                                        {{ pilota.posizione }}°
                                    </td>
                                    <td>
                                        <div class="d-flex align-center py-2">
                                            <v-avatar size="38" class="mr-3 elevation-1" :style="{ border: '2px solid ' + pilota.coloreTeam }">
                                                <v-img :src="pilota.foto" cover>
                                                    <template v-slot:error>
                                                        <span class="text-caption font-weight-bold">{{ pilota.sigla }}</span>
                                                    </template>
                                                </v-img>
                                            </v-avatar>
                                            <div>
                                                <div class="font-weight-bold d-flex align-center">
                                                    <span class="mr-2">{{ pilota.bandieraNazionalita }}</span>
                                                    <span>{{ pilota.nome }}</span>
                                                </div>
                                                <div class="text-caption text-grey">{{ pilota.sigla }} #{{ pilota.numero }}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <v-chip size="small" variant="outlined" :style="{ borderColor: pilota.coloreTeam, color: pilota.coloreTeam }">
                                            {{ pilota.scuderia }}
                                        </v-chip>
                                    </td>
                                    <td class="text-center">
                                        <span v-if="pilota.vittorie > 0" class="font-weight-bold text-amber-darken-3">
                                            🏆 {{ pilota.vittorie }}
                                        </span>
                                        <span v-else class="text-grey-lighten-1">-</span>
                                    </td>
                                    <td class="text-right text-caption text-grey-darken-1">
                                        <span v-if="pilota.posizione === 1" class="font-weight-bold text-green-darken-2">LEADER</span>
                                        <span v-else>-{{ pilota.deltaDalPrimo }} PT</span>
                                    </td>
                                    <td class="text-right font-weight-black text-subtitle-1">
                                        <v-chip color="red-darken-3" variant="flat" size="small" class="font-weight-bold">
                                            {{ pilota.punti }}
                                        </v-chip>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </div>

                <!-- ========================================================= -->
                <!-- SEZIONE 2: CLASSIFICA SCUDERIE / COSTRUTTORI             -->
                <!-- ========================================================= -->
                <div v-else-if="tipoClassifica === 'scuderie'">
                    <!-- PODIO DELLE PRIME 3 SCUDERIE -->
                    <v-row v-if="scuderiePodio.length >= 3" class="mb-8" justify="center" align="end">
                        <!-- 2° Scuderia (Sinistra) -->
                        <v-col cols="12" sm="4" md="3" class="order-2 order-sm-1">
                            <v-card 
                                elevation="3" 
                                class="pa-4 text-center hover-card podium-card podium-second rounded-xl"
                                @click="apriDettaglio(scuderiePodio[1], 'scuderia')"
                            >
                                <v-chip color="grey-darken-2" size="small" class="font-weight-bold mb-2">
                                    🥈 2° SCUDERIA
                                </v-chip>

                                <div class="my-3 d-flex justify-center align-center" style="height: 70px;">
                                    <v-img v-if="scuderiePodio[1].logo" :src="scuderiePodio[1].logo" max-height="60" max-width="120" contain></v-img>
                                    <v-icon v-else icon="mdi-car-sports" size="50" :color="scuderiePodio[1].coloreTeam"></v-icon>
                                </div>

                                <h3 class="text-h6 font-weight-bold text-truncate">{{ scuderiePodio[1].nome }}</h3>

                                <div class="mt-3 d-flex justify-center gap-2">
                                    <v-chip color="red-darken-3" class="font-weight-bold px-3">
                                        {{ scuderiePodio[1].punti }} PT
                                    </v-chip>
                                    <v-chip v-if="scuderiePodio[1].vittorie > 0" color="amber-darken-3" size="small" class="font-weight-bold">
                                        🏆 {{ scuderiePodio[1].vittorie }}
                                    </v-chip>
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 1° Scuderia (Centro - Più alto ed evidenziato) -->
                        <v-col cols="12" sm="4" md="4" class="order-1 order-sm-2">
                            <v-card 
                                elevation="6" 
                                class="pa-5 text-center hover-card podium-card podium-first rounded-xl"
                                @click="apriDettaglio(scuderiePodio[0], 'scuderia')"
                            >
                                <v-icon icon="mdi-crown" color="amber-darken-2" size="36" class="mb-1 pulse-animation"></v-icon>
                                <div>
                                    <v-chip color="amber-darken-3" size="small" class="font-weight-bold mb-2">
                                        🥇 LEADER COSTRUTTORI
                                    </v-chip>
                                </div>

                                <div class="my-3 d-flex justify-center align-center" style="height: 85px;">
                                    <v-img v-if="scuderiePodio[0].logo" :src="scuderiePodio[0].logo" max-height="75" max-width="150" contain></v-img>
                                    <v-icon v-else icon="mdi-car-sports" size="65" :color="scuderiePodio[0].coloreTeam"></v-icon>
                                </div>

                                <h2 class="text-h5 font-weight-black text-truncate">{{ scuderiePodio[0].nome }}</h2>

                                <div class="mt-4 d-flex justify-center gap-2">
                                    <v-chip color="red-darken-3" size="large" class="font-weight-black text-h6 px-4">
                                        {{ scuderiePodio[0].punti }} PT
                                    </v-chip>
                                    <v-chip v-if="scuderiePodio[0].vittorie > 0" color="amber-darken-3" class="font-weight-bold">
                                        🏆 {{ scuderiePodio[0].vittorie }} VITTORIE
                                    </v-chip>
                                </div>
                            </v-card>
                        </v-col>

                        <!-- 3° Scuderia (Destra) -->
                        <v-col cols="12" sm="4" md="3" class="order-3 order-sm-3">
                            <v-card 
                                elevation="3" 
                                class="pa-4 text-center hover-card podium-card podium-third rounded-xl"
                                @click="apriDettaglio(scuderiePodio[2], 'scuderia')"
                            >
                                <v-chip color="brown-darken-1" size="small" class="font-weight-bold mb-2">
                                    🥉 3° SCUDERIA
                                </v-chip>

                                <div class="my-3 d-flex justify-center align-center" style="height: 70px;">
                                    <v-img v-if="scuderiePodio[2].logo" :src="scuderiePodio[2].logo" max-height="60" max-width="120" contain></v-img>
                                    <v-icon v-else icon="mdi-car-sports" size="50" :color="scuderiePodio[2].coloreTeam"></v-icon>
                                </div>

                                <h3 class="text-h6 font-weight-bold text-truncate">{{ scuderiePodio[2].nome }}</h3>

                                <div class="mt-3 d-flex justify-center gap-2">
                                    <v-chip color="red-darken-3" class="font-weight-bold px-3">
                                        {{ scuderiePodio[2].punti }} PT
                                    </v-chip>
                                    <v-chip v-if="scuderiePodio[2].vittorie > 0" color="amber-darken-3" size="small" class="font-weight-bold">
                                        🏆 {{ scuderiePodio[2].vittorie }}
                                    </v-chip>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>

                    <!-- TABELLA COMPLETA COSTRUTTORI -->
                    <v-card elevation="2" class="pa-4 rounded-xl">
                        <v-row align="center" justify="space-between" class="mb-3">
                            <v-col cols="12" sm="6">
                                <h3 class="text-h6 font-weight-bold text-grey-darken-3 d-flex align-center">
                                    <v-icon icon="mdi-format-list-numbered" color="red-darken-3" class="mr-2"></v-icon>
                                    Classifica Completa Costruttori
                                </h3>
                            </v-col>
                            <v-col cols="12" sm="6" md="4">
                                <v-text-input
                                    v-model="filtroTesto"
                                    placeholder="Cerca scuderia..."
                                    density="compact"
                                    variant="outlined"
                                    prepend-inner-icon="mdi-magnify"
                                    clearable
                                    hide-details
                                ></v-text-input>
                            </v-col>
                        </v-row>

                        <v-table hover class="table-classifica">
                            <thead>
                                <tr>
                                    <th class="font-weight-bold text-center" style="width: 70px;">Pos</th>
                                    <th class="font-weight-bold">Scuderia</th>
                                    <th class="font-weight-bold text-center">Nazionalità</th>
                                    <th class="font-weight-bold text-center">Vittorie</th>
                                    <th class="font-weight-bold text-right">Distacco</th>
                                    <th class="font-weight-bold text-right">Punti</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr 
                                    v-for="scuderia in scuderieFiltrate" 
                                    :key="scuderia.posizione"
                                    @click="apriDettaglio(scuderia, 'scuderia')"
                                    class="cursor-pointer"
                                >
                                    <td class="text-center font-weight-black" :class="{'text-red-darken-3': scuderia.posizione <= 3}">
                                        {{ scuderia.posizione }}°
                                    </td>
                                    <td>
                                        <div class="d-flex align-center py-2">
                                            <span class="team-bar mr-3" :style="{ backgroundColor: scuderia.coloreTeam }"></span>
                                            <span class="font-weight-bold text-subtitle-1">{{ scuderia.nome }}</span>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span class="mr-1">{{ scuderia.bandieraNazionalita }}</span>
                                        <span class="text-caption text-grey-darken-1">{{ scuderia.nazionalita }}</span>
                                    </td>
                                    <td class="text-center">
                                        <span v-if="scuderia.vittorie > 0" class="font-weight-bold text-amber-darken-3">
                                            🏆 {{ scuderia.vittorie }}
                                        </span>
                                        <span v-else class="text-grey-lighten-1">-</span>
                                    </td>
                                    <td class="text-right text-caption text-grey-darken-1">
                                        <span v-if="scuderia.posizione === 1" class="font-weight-bold text-green-darken-2">LEADER</span>
                                        <span v-else>-{{ scuderia.deltaDallaPrima }} PT</span>
                                    </td>
                                    <td class="text-right font-weight-black text-subtitle-1">
                                        <v-chip color="red-darken-3" variant="flat" size="small" class="font-weight-bold">
                                            {{ scuderia.punti }}
                                        </v-chip>
                                    </td>
                                </tr>
                            </tbody>
                        </v-table>
                    </v-card>
                </div>

                <!-- FOOTER INFORMATIVO SULLA SORGENTE DATI -->
                <v-row class="mt-4">
                    <v-col cols="12" class="text-center text-caption text-grey">
                        <v-icon icon="mdi-sync" size="small" class="mr-1"></v-icon>
                        Fonte classifiche: {{ sorgenteDati }} • Stagione {{ annoSelezionato }}
                    </v-col>
                </v-row>
            </div>

            <!-- MODALE DIALOG DI DETTAGLIO PILOTA / SCUDERIA -->
            <v-dialog v-model="dialogDettaglio" max-width="500">
                <v-card v-if="elementoSelezionato" class="pa-4 rounded-xl">
                    <v-card-title class="d-flex align-center justify-space-between">
                        <div class="d-flex align-center">
                            <span class="text-h6 font-weight-black">{{ elementoSelezionato.nome }}</span>
                        </div>
                        <v-chip :color="elementoSelezionato.posizione === 1 ? 'amber-darken-3' : 'red-darken-3'" class="font-weight-bold">
                            {{ elementoSelezionato.posizione }}° Posizione
                        </v-chip>
                    </v-card-title>
                    <v-card-text class="py-3">
                        <div class="text-center my-3" v-if="tipoElementoDettaglio === 'pilota'">
                            <v-avatar size="100" class="elevation-3" :style="{ border: '3px solid ' + elementoSelezionato.coloreTeam }">
                                <v-img :src="elementoSelezionato.foto" cover></v-img>
                            </v-avatar>
                            <p class="text-subtitle-1 font-weight-bold mt-2">{{ elementoSelezionato.scuderia }}</p>
                        </div>

                        <v-list density="compact">
                            <v-list-item prepend-icon="mdi-flag" title="Nazionalità" :subtitle="elementoSelezionato.nazionalita + ' ' + elementoSelezionato.bandieraNazionalita"></v-list-item>
                            <v-list-item prepend-icon="mdi-trophy" title="Vittorie Stagionali" :subtitle="elementoSelezionato.vittorie + ' GP vinti'"></v-list-item>
                            <v-list-item prepend-icon="mdi-counter" title="Punti Totali" :subtitle="elementoSelezionato.punti + ' punti'"></v-list-item>
                            <v-list-item v-if="elementoSelezionato.posizione > 1" prepend-icon="mdi-arrow-expand-vertical" title="Distacco dal Leader" :subtitle="'-' + (elementoSelezionato.deltaDalPrimo || elementoSelezionato.deltaDallaPrima) + ' PT'"></v-list-item>
                        </v-list>
                    </v-card-text>
                    <v-card-actions class="justify-end">
                        <v-btn color="red-darken-3" variant="text" @click="dialogDettaglio = false">Chiudi</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
        </v-container>
    `,

    setup() {
        const { ref, computed, onMounted } = Vue;

        // 1. STATO REATTIVO
        const inCaricamento = ref(true);
        const tipoClassifica = ref('piloti'); // 'piloti' o 'scuderie'
        const annoSelezionato = ref(2026);
        const anniDisponibili = [2026, 2025, 2024, 2023, 2022];
        const filtroTesto = ref('');
        const sorgenteDati = ref('');

        const listaPiloti = ref([]);
        const listaScuderie = ref([]);

        // Dialog dettagli
        const dialogDettaglio = ref(false);
        const elementoSelezionato = ref(null);
        const tipoElementoDettaglio = ref('pilota');

        /**
         * 2. PODIO DEI PRIMI 3 PILOTI E SCUDERIE
         */
        const pilotiPodio = computed(() => {
            return listaPiloti.value.slice(0, 3);
        });

        const scuderiePodio = computed(() => {
            return listaScuderie.value.slice(0, 3);
        });

        /**
         * 3. FILTRO RICERCA PER LA TABELLA
         */
        const pilotiFiltrati = computed(() => {
            if (!filtroTesto.value) return listaPiloti.value;
            const query = filtroTesto.value.toLowerCase().trim();
            return listaPiloti.value.filter(p => 
                p.nome.toLowerCase().includes(query) || 
                p.scuderia.toLowerCase().includes(query) ||
                p.sigla.toLowerCase().includes(query)
            );
        });

        const scuderieFiltrate = computed(() => {
            if (!filtroTesto.value) return listaScuderie.value;
            const query = filtroTesto.value.toLowerCase().trim();
            return listaScuderie.value.filter(s => 
                s.nome.toLowerCase().includes(query)
            );
        });

        /**
         * 4. CARICAMENTO DATI DAL SERVIZIO
         */
        const caricaClassifiche = async () => {
            inCaricamento.value = true;
            try {
                const dati = await ClassificaService.recuperaClassifiche(annoSelezionato.value);
                listaPiloti.value = dati.piloti;
                listaScuderie.value = dati.scuderie;
                sorgenteDati.value = dati.sorgenteDati;
            } catch (errore) {
                console.error("[SchermataClassifica] Errore nel caricamento delle classifiche:", errore);
            } finally {
                inCaricamento.value = false;
            }
        };

        /**
         * 5. APERTURA DIALOG DETTAGLIO
         */
        const apriDettaglio = (elemento, tipo) => {
            elementoSelezionato.value = elemento;
            tipoElementoDettaglio.value = tipo;
            dialogDettaglio.value = true;
        };

        // 6. LIFECYCLE
        onMounted(async () => {
            await caricaClassifiche();
        });

        return {
            inCaricamento,
            tipoClassifica,
            annoSelezionato,
            anniDisponibili,
            filtroTesto,
            sorgenteDati,
            listaPiloti,
            listaScuderie,
            pilotiPodio,
            scuderiePodio,
            pilotiFiltrati,
            scuderieFiltrate,
            dialogDettaglio,
            elementoSelezionato,
            tipoElementoDettaglio,
            caricaClassifiche,
            apriDettaglio
        };
    }
};