// js/api.js

/**
 * ======================================================================================
 * PITWALL STATS - CLIENT API UFFICIALE JOLPICA-F1 (Jolpica Ergast F1 API)
 * ======================================================================================
 * Questo modulo funge da connettore ufficiale per tutte le richieste dati dell'applicazione.
 * Interroga l'API aperta e standard Jolpica F1 (compatibile Ergast):
 * Documentazione: https://api.jolpi.ca/ergast/f1/
 *
 * Supporta:
 * - Calendario e orari completi delle sessioni per qualsiasi stagione (current, 2026, 2025...)
 * - Prossimo Gran Premio con tutte le sessioni live (/current/next.json)
 * - Ultimo Gran Premio completato con risultati ufficiali (/current/last/results.json)
 * - Classifiche mondiali Piloti e Costruttori in tempo reale (/driverStandings, /constructorStandings)
 * - Risultati completi di Gara, Qualifiche e Sprint per round specifici
 * - Elenco ufficiale dei Piloti e delle Scuderie per stagione
 * ======================================================================================
 */

/**
 * Indirizzo di base per tutte le chiamate alle API di Jolpica-F1.
 * @constant {string}
 */
const INDIRIZZO_BASE_JOLPICA = "https://api.jolpi.ca/ergast/f1";

/**
 * Cache in memoria per evitare richieste duplicate identiche nella stessa sessione di navigazione.
 */
const cacheRichiesteJolpica = new Map();

/**
 * Funzione generica per eseguire richieste HTTP GET a Jolpica F1 API con gestione errori e log strutturato.
 * 
 * @param {string} endpoint - Il percorso relativo dell'endpoint (es. '/current/next.json', '/2026/driverStandings.json').
 * @param {Object} [parametri={}] - Parametri opzionali da aggiungere alla query string (es. { limit: 100 }).
 * @param {boolean} [usaCache=true] - Se true, memorizza e riutilizza la risposta in memoria per velocizzare l'app.
 * @returns {Promise<Object|null>} - Oggetto MRData restituito dall'API oppure null in caso di errore.
 */
async function eseguiRichiestaJolpica(endpoint, parametri = {}, usaCache = true) {
    // Normalizza l'endpoint assicurandosi che termini con .json
    let percorso = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (!percorso.includes('.json')) {
        const parti = percorso.split('?');
        percorso = `${parti[0]}.json${parti[1] ? '?' + parti[1] : ''}`;
    }

    // Costruisci i parametri di query string
    const urlOggetto = new URL(`${INDIRIZZO_BASE_JOLPICA}${percorso}`);
    for (const [chiave, valore] of Object.entries(parametri)) {
        if (valore !== undefined && valore !== null) {
            urlOggetto.searchParams.append(chiave, valore);
        }
    }

    const urlCompleto = urlOggetto.toString();

    // Controlla se la risposta è già presente in cache
    if (usaCache && cacheRichiesteJolpica.has(urlCompleto)) {
        console.log(`[Jolpica F1 API (Cache)] ⚡ ${percorso}`);
        return cacheRichiesteJolpica.get(urlCompleto);
    }

    try {
        console.log(`[Jolpica F1 API] 🌐 Chiamata in corso: ${urlCompleto}`);
        const risposta = await fetch(urlCompleto);

        if (!risposta.ok) {
            console.warn(`[Jolpica F1 API] ⚠️ Risposta con stato HTTP non OK (${risposta.status}) per: ${urlCompleto}`);
            return null;
        }

        const corpoJson = await risposta.json();
        const datiMR = corpoJson?.MRData || null;

        if (datiMR && usaCache) {
            cacheRichiesteJolpica.set(urlCompleto, datiMR);
        }

        return datiMR;
    } catch (errore) {
        console.error(`[Jolpica F1 API] 🚨 Errore di rete durante la richiesta a ${urlCompleto}:`, errore.message || errore);
        return null;
    }
}


// ======================================================================================
// 1. FUNZIONI PER IL CALENDARIO E I GRAN PREMI
// ======================================================================================

/**
 * Recupera le informazioni sul PROSSIMO Gran Premio in arrivo, comprensivo di tutte le sessioni (FP1, FP2, FP3, Qualifiche, Sprint, Gara).
 * @returns {Promise<Object|null>} - I dati della gara in arrivo o null.
 */
async function recuperaProssimoGranPremio() {
    const mrData = await eseguiRichiestaJolpica('/current/next.json', {}, false);
    const gare = mrData?.RaceTable?.Races;
    return (gare && gare.length > 0) ? gare[0] : null;
}

/**
 * Recupera le informazioni sull'ULTIMO Gran Premio completato (con data, circuito e vincitore).
 * @returns {Promise<Object|null>} - I dati dell'ultima gara disputata o null.
 */
async function recuperaUltimoGranPremio() {
    const mrData = await eseguiRichiestaJolpica('/current/last/results.json', {}, false);
    const gare = mrData?.RaceTable?.Races;
    return (gare && gare.length > 0) ? gare[0] : null;
}

/**
 * Recupera l'elenco completo di tutti i Gran Premi in programma per una data stagione (calendario ufficiale).
 * @param {string|number} [stagione='current'] - L'anno di campionato (es. 2026, 2025, 'current').
 * @returns {Promise<Array>} - Array contenente tutti i Gran Premi della stagione con le rispettive sessioni.
 */
async function recuperaCalendarioStagione(stagione = 'current') {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}.json`, { limit: 100 });
    return mrData?.RaceTable?.Races || [];
}

/**
 * Recupera i dettagli specifici di un singolo Gran Premio per stagione e numero di round.
 * @param {string|number} stagione - Anno di campionato.
 * @param {string|number} round - Numero del round (es. 1, 12).
 * @returns {Promise<Object|null>}
 */
async function recuperaDettaglioGranPremio(stagione, round) {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/${round}.json`);
    const gare = mrData?.RaceTable?.Races;
    return (gare && gare.length > 0) ? gare[0] : null;
}


// ======================================================================================
// 2. FUNZIONI PER LE CLASSIFICHE MONDIALI (STANDINGS)
// ======================================================================================

/**
 * Recupera la classifica mondiale Piloti aggiornata per una determinata stagione.
 * @param {string|number} [stagione='current'] - Anno di riferimento (es. 'current', 2026, 2025).
 * @returns {Promise<{stagione: string, round: string, piloti: Array}>} - Dati della classifica piloti.
 */
async function recuperaClassificaPiloti(stagione = 'current') {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/driverStandings.json`, { limit: 100 }, false);
    const standingsList = mrData?.StandingsTable?.StandingsLists?.[0];
    return {
        stagione: standingsList?.season || String(stagione),
        round: standingsList?.round || '0',
        piloti: standingsList?.DriverStandings || []
    };
}

/**
 * Recupera la classifica mondiale Costruttori/Scuderie aggiornata per una determinata stagione.
 * @param {string|number} [stagione='current'] - Anno di riferimento (es. 'current', 2026, 2025).
 * @returns {Promise<{stagione: string, round: string, costruttori: Array}>} - Dati della classifica costruttori.
 */
async function recuperaClassificaCostruttori(stagione = 'current') {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/constructorStandings.json`, { limit: 100 }, false);
    const standingsList = mrData?.StandingsTable?.StandingsLists?.[0];
    return {
        stagione: standingsList?.season || String(stagione),
        round: standingsList?.round || '0',
        costruttori: standingsList?.ConstructorStandings || []
    };
}


// ======================================================================================
// 3. FUNZIONI PER I RISULTATI UFFICIALI DI SESSIONE
// ======================================================================================

/**
 * Recupera i risultati completi di arrivo di una Gara (classifica finale, punti, tempo, giri veloci).
 * @param {string|number} stagione - Anno di riferimento.
 * @param {string|number} round - Numero del round.
 * @returns {Promise<Array>} - Array dei risultati dei piloti al traguardo.
 */
async function recuperaRisultatiGara(stagione, round) {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/${round}/results.json`, { limit: 100 });
    const gare = mrData?.RaceTable?.Races;
    return (gare && gare.length > 0 && gare[0].Results) ? gare[0].Results : [];
}

/**
 * Recupera i risultati ufficiali delle Qualifiche (Q1, Q2, Q3, Pole Position e griglia di partenza).
 * @param {string|number} stagione - Anno di riferimento.
 * @param {string|number} round - Numero del round.
 * @returns {Promise<Array>} - Array dei risultati delle qualifiche dei piloti.
 */
async function recuperaRisultatiQualifiche(stagione, round) {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/${round}/qualifying.json`, { limit: 100 });
    const gare = mrData?.RaceTable?.Races;
    return (gare && gare.length > 0 && gare[0].QualifyingResults) ? gare[0].QualifyingResults : [];
}

/**
 * Recupera i risultati della Gara Sprint (se prevista nel weekend di gara).
 * @param {string|number} stagione - Anno di riferimento.
 * @param {string|number} round - Numero del round.
 * @returns {Promise<Array>} - Array dei risultati della gara sprint.
 */
async function recuperaRisultatiSprint(stagione, round) {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/${round}/sprint.json`, { limit: 100 });
    const gare = mrData?.RaceTable?.Races;
    return (gare && gare.length > 0 && gare[0].SprintResults) ? gare[0].SprintResults : [];
}


// ======================================================================================
// 4. FUNZIONI PER PILOTI, SCUDERIE E CIRCUITI
// ======================================================================================

/**
 * Recupera l'elenco ufficiale di tutti i Piloti che hanno partecipato a una data stagione.
 * @param {string|number} [stagione='current'] - Anno di riferimento.
 * @returns {Promise<Array>} - Array con i dettagli anagrafici di ciascun pilota.
 */
async function recuperaPilotiStagione(stagione = 'current') {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/drivers.json`, { limit: 100 });
    return mrData?.DriverTable?.Drivers || [];
}

/**
 * Recupera l'elenco ufficiale di tutte le Scuderie/Costruttori partecipanti a una data stagione.
 * @param {string|number} [stagione='current'] - Anno di riferimento.
 * @returns {Promise<Array>} - Array con i dettagli di ciascun costruttore.
 */
async function recuperaCostruttoriStagione(stagione = 'current') {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/constructors.json`, { limit: 100 });
    return mrData?.ConstructorTable?.Constructors || [];
}

/**
 * Recupera l'elenco di tutti i Circuiti su cui si gareggia in una determinata stagione.
 * @param {string|number} [stagione='current'] - Anno di riferimento.
 * @returns {Promise<Array>} - Array dei circuiti con coordinate geografiche e località.
 */
async function recuperaCircuitiStagione(stagione = 'current') {
    const mrData = await eseguiRichiestaJolpica(`/${stagione}/circuits.json`, { limit: 100 });
    return mrData?.CircuitTable?.Circuits || [];
}

/**
 * Recupera l'archivio di tutte le stagioni di Formula 1 disponibili nelle API.
 * @returns {Promise<Array>} - Array degli anni disponibili.
 */
async function recuperaStagioniDisponibili() {
    const mrData = await eseguiRichiestaJolpica('/seasons.json', { limit: 100 });
    const stagioni = mrData?.SeasonTable?.Seasons || [];
    return stagioni.map(s => Number(s.season)).sort((a, b) => b - a);
}