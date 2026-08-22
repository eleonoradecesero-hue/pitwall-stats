// js/servizi/calendario_service.js

/**
 * ======================================================================================
 * PITWALL STATS - SERVIZIO CALENDARIO (CalendarioService)
 * ======================================================================================
 * Questo servizio gestisce la logica di business e il recupero dei dati del Calendario F1:
 * 1. Recupero dell'intero calendario stagionale da Jolpica F1 API.
 * 2. Suddivisione automatica e dinamica tra "Gare Future / In arrivo" e "Gare Passate / Concluse".
 * 3. Recupero ed elaborazione dell'ordine d'arrivo ufficiale e dei risultati di gara per ogni round.
 * ======================================================================================
 */

const CalendarioService = {

    /**
     * Recupera il calendario completo per una data stagione e suddivide le gare in future e passate.
     * 
     * @param {number|string} [anno='current'] - Stagione selezionata (es. 2026, 2025, 'current')
     * @returns {Promise<{tutte: Array, gareFuture: Array, garePassate: Array, anno: number|string}>}
     */
    async recuperaCalendario(anno = 'current') {
        const queryAnno = (anno === 2026 || anno === new Date().getFullYear()) ? 'current' : anno;
        console.log(`[CalendarioService] 📅 Recupero calendario F1 per la stagione: ${queryAnno}...`);

        try {
            const listaGareGrezze = await recuperaCalendarioStagione(queryAnno);
            const adesso = new Date();

            // Normalizza e arricchisce ogni Gran Premio con bandiere, date e orari italiani
            const tutteLeGare = (listaGareGrezze || []).map(gara => {
                const paese = gara.Circuit?.Location?.country || '';
                const dataOraGaraIso = `${gara.date}T${gara.time || '13:00:00Z'}`;
                const dataOraGara = new Date(dataOraGaraIso);

                return {
                    ...gara,
                    id: gara.round,
                    dataGaraIso: dataOraGaraIso,
                    dataOraGara: dataOraGara,
                    dataFormattata: UtilityF1.formattaDataLocale(gara.date),
                    oraPartenza: UtilityF1.formattaOraLocale(dataOraGaraIso),
                    bandiera: UtilityF1.ottieniBandieraPaese(paese || gara.raceName),
                    circuitoNome: gara.Circuit?.circuitName || 'Circuito',
                    localita: gara.Circuit?.Location?.locality || paese
                };
            });

            // 1. Gare Future (in programma)
            const gareFuture = tutteLeGare.filter(g => {
                // Considera passata una gara dopo 3 ore dall'orario di partenza
                return g.dataOraGara.getTime() + (3 * 60 * 60 * 1000) >= adesso.getTime();
            });

            // 2. Gare Passate (concluse) - ordinate dalla più recente alla più vecchia
            const garePassate = tutteLeGare.filter(g => {
                return g.dataOraGara.getTime() + (3 * 60 * 60 * 1000) < adesso.getTime();
            }).reverse();

            return {
                anno: queryAnno,
                tutte: tutteLeGare,
                gareFuture: gareFuture,
                garePassate: garePassate
            };
        } catch (errore) {
            console.error("[CalendarioService] 🚨 Errore durante il recupero del calendario:", errore);
            return {
                anno: queryAnno,
                tutte: [],
                gareFuture: [],
                garePassate: []
            };
        }
    },

    /**
     * Recupera l'ordine d'arrivo ufficiale e i risultati completi di un singolo Gran Premio.
     * 
     * @param {number|string} stagione - Anno di riferimento (es. 2026, 2024)
     * @param {number|string} round - Numero del round (es. 1, 11)
     * @returns {Promise<Array>} - Array dei risultati normalizzati con piloti, tempi, team e punti
     */
    async recuperaRisultatiGara(stagione, round) {
        console.log(`[CalendarioService] 🏆 Recupero ordine d'arrivo per Round ${round} (${stagione})...`);

        try {
            const risultatiGrezzi = await recuperaRisultatiGara(stagione, round);

            if (!risultatiGrezzi || risultatiGrezzi.length === 0) {
                return [];
            }

            // Normalizza i risultati arricchendoli con bandiere e colori del team
            return risultatiGrezzi.map(res => {
                const nomePilota = `${res.Driver.givenName} ${res.Driver.familyName}`;
                const nomeTeam = res.Constructor.name || 'Team';

                return {
                    posizione: Number(res.position),
                    numero: res.number,
                    nomePilota: nomePilota,
                    siglaPilota: res.Driver.code || res.Driver.familyName.slice(0, 3).toUpperCase(),
                    nazionalitaPilota: res.Driver.nationality,
                    bandieraPilota: UtilityF1.ottieniBandieraNazionalita(res.Driver.nationality),
                    scuderia: nomeTeam,
                    coloreScuderia: UtilityF1.ottieniColoreScuderia(nomeTeam),
                    giriCompletati: res.laps,
                    tempoFinale: res.Time ? res.Time.time : res.status,
                    puntiAssegnati: Number(res.points || 0),
                    giroVeloce: res.FastestLap ? res.FastestLap.Time?.time : null
                };
            });
        } catch (errore) {
            console.error(`[CalendarioService] 🚨 Errore nel recupero dei risultati del Round ${round}:`, errore);
            return [];
        }
    }
};
