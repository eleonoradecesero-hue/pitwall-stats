// js/servizi/home_service.js

/**
 * ======================================================================================
 * PITWALL STATS - SERVIZIO HOME (HomeService)
 * ======================================================================================
 * Questo servizio si occupa di recuperare i dati LIVE del prossimo Gran Premio
 * tramite le chiamate ufficiali a Jolpica F1 API (/current/next.json e /current.json):
 * 1. Prossimo Gran Premio con tutte le sessioni reali (Prove Libere, Qualifiche, Sprint, Gara).
 * 2. Logica del Countdown dinamico:
 *    - Se il weekend NON è iniziato: countdown alla prima sessione del weekend.
 *    - Se il weekend È INIZIATO (es. sabato qualifiche): countdown automatico alla GARA DI DOMENICA.
 *    - Se la gara della domenica è in corso: stato dedicato "GARA IN CORSO".
 * 3. Calcolo reale dello stato di svolgimento di ciascuna sessione.
 * ======================================================================================
 */

const HomeService = {

    /**
     * Determina lo stato temporale di una sessione rispetto all'orario attuale.
     * @param {Date} dataInizio - Data e ora di inizio della sessione
     * @param {Date} dataFine - Data e ora di fine stimata della sessione
     * @returns {'conclusa'|'in_corso'|'da_disputare'}
     */
    calcolaStatoSessione(dataInizio, dataFine) {
        const adesso = new Date();
        const inizioMs = dataInizio.getTime();
        const fineMs = dataFine ? dataFine.getTime() : (inizioMs + 90 * 60 * 1000);

        if (adesso.getTime() > fineMs) {
            return 'conclusa';
        } else if (adesso.getTime() >= inizioMs && adesso.getTime() <= fineMs) {
            return 'in_corso';
        } else {
            return 'da_disputare';
        }
    },

    /**
     * Normalizza una singola sessione rendendola uniforme per l'interfaccia.
     */
    normalizzaSessione(datiSessione) {
        const inizio = new Date(datiSessione.inizio);
        const fine = datiSessione.fine 
            ? new Date(datiSessione.fine) 
            : new Date(inizio.getTime() + (90 * 60 * 1000)); // Durata standard 1h30m

        const stato = this.calcolaStatoSessione(inizio, fine);
        const nomeItaliano = UtilityF1.traduciNomeSessione(datiSessione.nome || datiSessione.session_name);

        return {
            id: datiSessione.id || `${nomeItaliano}_${inizio.getTime()}`,
            nome: nomeItaliano,
            nomeOriginale: datiSessione.session_name || nomeItaliano,
            inizioIso: inizio.toISOString(),
            fineIso: fine.toISOString(),
            dataInizio: inizio,
            dataFine: fine,
            dataFormattata: UtilityF1.formattaDataLocale(inizio),
            oraInizio: UtilityF1.formattaOraLocale(inizio),
            oraFine: UtilityF1.formattaOraLocale(fine),
            stato: stato, // 'conclusa', 'in_corso', 'da_disputare'
            risultatiDisponibili: stato === 'conclusa' || (new Date().getTime() > fine.getTime())
        };
    },

    /**
     * Elabora l'oggetto Gara restituito da Jolpica F1 API estraendo tutte le sessioni del weekend.
     * @param {Object} garaApi - Oggetto gara restituito da Jolpica
     */
    elaboraGaraDaJolpica(garaApi) {
        if (!garaApi) return null;

        const sessioniGrezze = [];

        // 1. Prove Libere 1
        if (garaApi.FirstPractice) {
            sessioniGrezze.push({
                nome: 'Prove Libere 1',
                session_name: 'Practice 1',
                inizio: `${garaApi.FirstPractice.date}T${garaApi.FirstPractice.time || '10:30:00Z'}`
            });
        }

        // 2. Prove Libere 2
        if (garaApi.SecondPractice) {
            sessioniGrezze.push({
                nome: 'Prove Libere 2',
                session_name: 'Practice 2',
                inizio: `${garaApi.SecondPractice.date}T${garaApi.SecondPractice.time || '14:00:00Z'}`
            });
        }

        // 3. Prove Libere 3
        if (garaApi.ThirdPractice) {
            sessioniGrezze.push({
                nome: 'Prove Libere 3',
                session_name: 'Practice 3',
                inizio: `${garaApi.ThirdPractice.date}T${garaApi.ThirdPractice.time || '11:30:00Z'}`
            });
        }

        // 4. Qualifiche Sprint / Sprint Shootout
        if (garaApi.SprintQualifying) {
            sessioniGrezze.push({
                nome: 'Qualifiche Sprint',
                session_name: 'Sprint Qualifying',
                inizio: `${garaApi.SprintQualifying.date}T${garaApi.SprintQualifying.time || '14:30:00Z'}`
            });
        }

        // 5. Gara Sprint
        if (garaApi.Sprint) {
            sessioniGrezze.push({
                nome: 'Gara Sprint',
                session_name: 'Sprint',
                inizio: `${garaApi.Sprint.date}T${garaApi.Sprint.time || '10:00:00Z'}`
            });
        }

        // 6. Qualifiche Ufficiali
        if (garaApi.Qualifying) {
            sessioniGrezze.push({
                nome: 'Qualifiche',
                session_name: 'Qualifying',
                inizio: `${garaApi.Qualifying.date}T${garaApi.Qualifying.time || '14:00:00Z'}`
            });
        }

        // 7. Gara Domenicale Principale
        if (garaApi.date) {
            sessioniGrezze.push({
                nome: 'Gara',
                session_name: 'Race',
                inizio: `${garaApi.date}T${garaApi.time || '13:00:00Z'}`
            });
        }

        // Normalizza e ordina cronologicamente tutte le sessioni
        const sessioniNormalizzate = sessioniGrezze
            .map(s => this.normalizzaSessione(s))
            .sort((a, b) => a.dataInizio.getTime() - b.dataInizio.getTime());

        // Individua la sessione di Gara (domenica) e la primissima sessione del weekend
        const sessioneGara = sessioniNormalizzate.find(s => s.nome === 'Gara') || sessioniNormalizzate[sessioniNormalizzate.length - 1];
        const primaSessione = sessioniNormalizzate[0];

        const adesso = new Date();
        const dataInizioPrimaSessione = primaSessione ? primaSessione.dataInizio : new Date(`${garaApi.date}T10:00:00Z`);
        const dataInizioGara = sessioneGara ? sessioneGara.dataInizio : new Date(`${garaApi.date}T${garaApi.time || '13:00:00Z'}`);
        const dataFineGara = sessioneGara ? sessioneGara.dataFine : new Date(dataInizioGara.getTime() + (2 * 60 * 60 * 1000));

        // Determina lo stato del weekend
        const weekendIniziato = adesso.getTime() >= dataInizioPrimaSessione.getTime();
        const garaIniziata = adesso.getTime() >= dataInizioGara.getTime();
        const garaInCorso = adesso.getTime() >= dataInizioGara.getTime() && adesso.getTime() <= dataFineGara.getTime();
        const garaConclusa = adesso.getTime() > dataFineGara.getTime();

        // LOGICA DEL TARGET DEL COUNTDOWN:
        // 1. Se il weekend NON è iniziato -> Countdown alla prima sessione (es. Prove Libere 1 del venerdì).
        // 2. Se il weekend È INIZIATO -> Countdown alla GARA DELLA DOMENICA!
        let targetCountdown;
        let etichettaTarget;
        let statoCountdown;

        if (!weekendIniziato) {
            targetCountdown = dataInizioPrimaSessione;
            etichettaTarget = "Inizio del Weekend (Prove Libere)";
            statoCountdown = 'futuro_weekend';
        } else if (!garaIniziata) {
            targetCountdown = dataInizioGara;
            etichettaTarget = "Gara della Domenica";
            statoCountdown = 'weekend_in_corso_verso_gara';
        } else if (garaInCorso) {
            targetCountdown = dataFineGara;
            etichettaTarget = "Gara in corso!";
            statoCountdown = 'gara_in_corso';
        } else {
            targetCountdown = null;
            etichettaTarget = "Gran Premio Concluso";
            statoCountdown = 'concluso';
        }

        const paese = garaApi.Circuit?.Location?.country || '';
        const circuito = garaApi.Circuit?.circuitName || 'Circuito';
        const localita = garaApi.Circuit?.Location?.locality || '';
        const bandiera = UtilityF1.ottieniBandieraPaese(paese || garaApi.raceName);

        return {
            id: garaApi.round || 1,
            nome: garaApi.raceName || 'Gran Premio',
            circuito: circuito,
            localita: localita ? `${localita}, ${paese}` : paese,
            paese: paese,
            bandiera: bandiera,
            round: garaApi.round || null,
            stagione: garaApi.season || new Date().getFullYear(),
            dataInizioWeekend: dataInizioPrimaSessione,
            dataGaraDomenica: dataInizioGara,
            sessioni: sessioniNormalizzate,
            sessioneGara: sessioneGara,
            // Proprietà del Countdown
            targetCountdown: targetCountdown ? targetCountdown.toISOString() : null,
            etichettaTarget: etichettaTarget,
            statoCountdown: statoCountdown,
            weekendIniziato: weekendIniziato,
            garaInCorso: garaInCorso,
            garaConclusa: garaConclusa
        };
    },

    /**
     * METODO PRINCIPALE
     * Recupera in tempo reale il prossimo Gran Premio da Jolpica F1 API.
     * @returns {Promise<{prossimaGara: Object|null, sessioni: Array, sorgenteDati: string}>}
     */
    async recuperaDatiHome() {
        console.log("[HomeService] 🏁 Recupero prossimo Gran Premio da Jolpica F1 API...");
        
        let garaGrezza = await recuperaProssimoGranPremio();

        // Se /current/next.json è null (es. a fine stagione), prendi l'elenco del campionato
        if (!garaGrezza) {
            console.log("[HomeService] /next.json non disponibile, ricerca nel calendario stagionale...");
            const calendario = await recuperaCalendarioStagione('current');
            const adesso = new Date();

            garaGrezza = calendario.find(g => {
                const dataGara = new Date(`${g.date}T${g.time || '13:00:00Z'}`);
                return dataGara.getTime() + (3 * 60 * 60 * 1000) >= adesso.getTime();
            });

            if (!garaGrezza && calendario.length > 0) {
                garaGrezza = calendario[calendario.length - 1];
            }
        }

        if (!garaGrezza) {
            console.warn("[HomeService] Nessun dato Gran Premio disponibile da Jolpica API.");
            return {
                prossimaGara: null,
                sessioni: [],
                sorgenteDati: 'Jolpica Ergast F1 API (Nessun dato)'
            };
        }

        const prossimaGaraElaborata = this.elaboraGaraDaJolpica(garaGrezza);

        return {
            prossimaGara: prossimaGaraElaborata,
            sessioni: prossimaGaraElaborata ? prossimaGaraElaborata.sessioni : [],
            sorgenteDati: 'Jolpica Ergast F1 API (Dati Live)'
        };
    }
};