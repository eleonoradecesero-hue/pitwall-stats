/**
 * ======================================================================================
 * PITWALL STATS - SERVIZIO HOME (HomeService)
 * ======================================================================================
 * Questo servizio si occupa di orchestrare il recupero dei dati per la schermata principale:
 * 1. Prossimo Gran Premio e orari completi di tutte le sessioni (Prove Libere, Qualifiche, Sprint, Gara).
 * 2. Gestione multi-provider resiliente:
 *    - Provider 1: OpenF1 API (quando disponibile e non limitata da sessioni live)
 *    - Provider 2: Jolpica / Ergast F1 API (standard aperto per calendari e orari ufficiali F1)
 *    - Provider 3: Dataset offline di riserva (garantisce il funzionamento anche offline)
 * 3. Logica del Countdown intelligente:
 *    - Se il weekend NON è iniziato: countdown alla prima sessione (es. Prove Libere 1 del venerdì).
 *    - Se il weekend È INIZIATO: countdown automatico alla GARA DELLA DOMENICA!
 *    - Se la gara è in corso: stato dedicato "GARA IN CORSO".
 * ======================================================================================
 */

const HomeService = {

    /**
     * Dizionario per mappare i paesi o i codici nazione con la rispettiva bandiera emoji.
     * @param {string} paese - Nome del paese o codice ISO (es. 'Netherlands', 'Italy', 'Monaco', 'USA')
     * @returns {string} - Emoji della bandiera corrispondente
     */
    ottieniBandieraPaese(paese) {
        if (!paese) return '🏁';
        const p = String(paese).toLowerCase().trim();

        const mappaBandiere = {
            'italy': '🇮🇹', 'italia': '🇮🇹', 'ita': '🇮🇹', 'monza': '🇮🇹', 'imola': '🇮🇹',
            'netherlands': '🇳🇱', 'paesi bassi': '🇳🇱', 'nld': '🇳🇱', 'zandvoort': '🇳🇱', 'dutch': '🇳🇱',
            'monaco': '🇲🇨', 'monte carlo': '🇲🇨', 'mco': '🇲🇨',
            'great britain': '🇬🇧', 'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'gbr': '🇬🇧', 'silverstone': '🇬🇧',
            'belgium': '🇧🇪', 'belgio': '🇧🇪', 'bel': '🇧🇪', 'spa': '🇧🇪',
            'spain': '🇪🇸', 'spagna': '🇪🇸', 'esp': '🇪🇸', 'barcelona': '🇪🇸', 'madrid': '🇪🇸',
            'austria': '🇦🇹', 'aut': '🇦🇹', 'spielberg': '🇦🇹', 'red bull ring': '🇦🇹',
            'hungary': '🇭🇺', 'ungheria': '🇭🇺', 'hun': '🇭🇺', 'hungaroring': '🇭🇺',
            'australia': '🇦🇺', 'aus': '🇦🇺', 'melbourne': '🇦🇺',
            'japan': '🇯🇵', 'giappone': '🇯🇵', 'jpn': '🇯🇵', 'suzuka': '🇯🇵',
            'china': '🇨🇳', 'cina': '🇨🇳', 'chn': '🇨🇳', 'shanghai': '🇨🇳',
            'bahrain': '🇧🇭', 'bhr': '🇧🇭', 'sakhir': '🇧🇭',
            'saudi arabia': '🇸🇦', 'arabia saudita': '🇸🇦', 'sau': '🇸🇦', 'jeddah': '🇸🇦',
            'miami': '🇺🇸', 'united states': '🇺🇸', 'usa': '🇺🇸', 'austin': '🇺🇸', 'las vegas': '🇺🇸',
            'canada': '🇨🇦', 'can': '🇨🇦', 'montreal': '🇨🇦',
            'mexico': '🇲🇽', 'messico': '🇲🇽', 'mex': '🇲🇽', 'mexico city': '🇲🇽',
            'brazil': '🇧🇷', 'brasile': '🇧🇷', 'bra': '🇧🇷', 'interlagos': '🇧🇷', 'sao paulo': '🇧🇷',
            'singapore': '🇸🇬', 'sgp': '🇸🇬', 'marina bay': '🇸🇬',
            'azerbaijan': '🇦🇿', 'azerbaigian': '🇦🇿', 'aze': '🇦🇿', 'baku': '🇦🇿',
            'qatar': '🇶🇦', 'qat': '🇶🇦', 'losail': '🇶🇦',
            'abu dhabi': '🇦🇪', 'uae': '🇦🇪', 'yas marina': '🇦🇪'
        };

        for (const [chiave, bandiera] of Object.entries(mappaBandiere)) {
            if (p.includes(chiave)) {
                return bandiera;
            }
        }
        return '🏁';
    },

    /**
     * Converte i nomi inglesi delle sessioni in italiano chiaro.
     * @param {string} nomeOriginale - Nome della sessione restituito dall'API (es. 'Practice 1', 'Qualifying')
     * @returns {string} - Nome formattato in italiano
     */
    traduciNomeSessione(nomeOriginale) {
        if (!nomeOriginale) return 'Sessione';
        const n = String(nomeOriginale).toLowerCase().trim();

        if (n.includes('practice 1') || n === 'fp1' || n === 'prove libere 1') return 'Prove Libere 1';
        if (n.includes('practice 2') || n === 'fp2' || n === 'prove libere 2') return 'Prove Libere 2';
        if (n.includes('practice 3') || n === 'fp3' || n === 'prove libere 3') return 'Prove Libere 3';
        if (n.includes('sprint shootout') || n.includes('sprint qualifying') || n.includes('qualifiche sprint')) return 'Qualifiche Sprint';
        if (n.includes('sprint') && !n.includes('qualifying') && !n.includes('shootout')) return 'Gara Sprint';
        if (n.includes('qualifying') || n.includes('qualifica') || n.includes('qualifiche')) return 'Qualifiche';
        if (n.includes('race') || n.includes('gara')) return 'Gara';

        return nomeOriginale;
    },

    /**
     * Calcola lo scostamento in minuti da una stringa GMT offset (es. "+02:00" o "-05:00").
     */
    minutiDaOffsetGmt(gmtOffset) {
        if (!gmtOffset) return null;
        const corrispondenza = String(gmtOffset).match(/^([+-])(\d{2}):?(\d{2})(?::?(\d{2}))?$/);
        if (!corrispondenza) return null;
        const minuti = Number(corrispondenza[2]) * 60 + Number(corrispondenza[3]);
        return corrispondenza[1] === '-' ? -minuti : minuti;
    },

    /**
     * Formatta una data ISO nel formato italiano (es. "Venerdì 21 Agosto 2026").
     * @param {string|Date} dataIso - Data in formato ISO o oggetto Date
     * @returns {string} - Data formattata per l'utente italiano
     */
    formattaDataLocale(dataIso) {
        if (!dataIso) return 'Data non disponibile';
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) return 'Data non disponibile';

        return new Intl.DateTimeFormat('it-IT', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(data);
    },

    /**
     * Formatta una data ISO in orario locale italiano (es. "15:00").
     * @param {string|Date} dataIso - Data in formato ISO o oggetto Date
     * @returns {string} - Orario formattato HH:mm
     */
    formattaOraLocale(dataIso) {
        if (!dataIso) return '--:--';
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) return '--:--';

        return new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(data);
    },

    /**
     * Determina lo stato temporale di una sessione rispetto all'orario attuale.
     * @param {Date} dataInizio - Data e ora di inizio della sessione
     * @param {Date} dataFine - Data e ora di fine stimata della sessione
     * @returns {'conclusa'|'in_corso'|'da_disputare'}
     */
    calcolaStatoSessione(dataInizio, dataFine) {
        const adesso = new Date();
        const inizioMs = dataInizio.getTime();
        // Se la data di fine non è specificata, ipotizziamo una durata di 1 ora e mezza
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
        const inizio = new Date(datiSessione.inizio || datiSessione.date_start);
        const fine = datiSessione.fine || datiSessione.date_end 
            ? new Date(datiSessione.fine || datiSessione.date_end) 
            : new Date(inizio.getTime() + (90 * 60 * 1000)); // Default 1h30m se assente

        const stato = this.calcolaStatoSessione(inizio, fine);
        const nomeItaliano = this.traduciNomeSessione(datiSessione.nome || datiSessione.session_name);

        return {
            id: datiSessione.id || datiSessione.session_key || `${nomeItaliano}_${inizio.getTime()}`,
            nome: nomeItaliano,
            nomeOriginale: datiSessione.session_name || nomeItaliano,
            tipo: datiSessione.tipo || datiSessione.session_type || 'standard',
            inizioIso: inizio.toISOString(),
            fineIso: fine.toISOString(),
            dataInizio: inizio,
            dataFine: fine,
            dataFormattata: this.formattaDataLocale(inizio),
            oraInizio: this.formattaOraLocale(inizio),
            oraFine: this.formattaOraLocale(fine),
            stato: stato, // 'conclusa', 'in_corso', 'da_disputare'
            risultatiDisponibili: stato === 'conclusa' || (new Date().getTime() > fine.getTime())
        };
    },

    /**
     * Calcola i dettagli completi del prossimo Gran Premio e la logica del countdown.
     * @param {Object} granPremioGrezzo - Oggetto contenente i dati del Gran Premio
     * @param {Array} sessioniGrezze - Lista di sessioni grezze
     */
    costruisciDatiProssimoGP(granPremioGrezzo, sessioniGrezze) {
        if (!granPremioGrezzo) return null;

        // Normalizza tutte le sessioni e ordinale cronologicamente
        const sessioniNormalizzate = (sessioniGrezze || [])
            .map(s => this.normalizzaSessione(s))
            .sort((a, b) => a.dataInizio.getTime() - b.dataInizio.getTime());

        // Individua la sessione di Gara (domenica) e la primissima sessione del weekend
        const sessioneGara = sessioniNormalizzate.find(s => s.nome === 'Gara') || sessioniNormalizzate[sessioniNormalizzate.length - 1];
        const primaSessione = sessioniNormalizzate[0];

        const adesso = new Date();
        const dataInizioPrimaSessione = primaSessione ? primaSessione.dataInizio : new Date(granPremioGrezzo.date_start || adesso);
        const dataInizioGara = sessioneGara ? sessioneGara.dataInizio : new Date(granPremioGrezzo.date_end || adesso);
        const dataFineGara = sessioneGara ? sessioneGara.dataFine : new Date(dataInizioGara.getTime() + (2 * 60 * 60 * 1000));

        // Determina lo stato del weekend
        const weekendIniziato = adesso.getTime() >= dataInizioPrimaSessione.getTime();
        const garaIniziata = adesso.getTime() >= dataInizioGara.getTime();
        const garaInCorso = adesso.getTime() >= dataInizioGara.getTime() && adesso.getTime() <= dataFineGara.getTime();
        const garaConclusa = adesso.getTime() > dataFineGara.getTime();

        // LOGICA CHIAVE DEL COUNTDOWN:
        // 1. Se il weekend NON è iniziato -> Countdown alla prima sessione (es. Prove Libere 1 del venerdì).
        // 2. Se il weekend È INIZIATO (es. venerdì pomeriggio, sabato qualifiche) -> Countdown alla GARA DELLA DOMENICA!
        let targetCountdown;
        let etichettaTarget;
        let statoCountdown; // 'futuro_weekend', 'weekend_in_corso_verso_gara', 'gara_in_corso', 'concluso'

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

        const paese = granPremioGrezzo.country_name || granPremioGrezzo.country || (granPremioGrezzo.Circuit && granPremioGrezzo.Circuit.Location ? granPremioGrezzo.Circuit.Location.country : '');
        const circuito = granPremioGrezzo.circuit_short_name || granPremioGrezzo.circuit_name || (granPremioGrezzo.Circuit ? granPremioGrezzo.Circuit.circuitName : 'Circuito');
        const localita = granPremioGrezzo.location || (granPremioGrezzo.Circuit && granPremioGrezzo.Circuit.Location ? granPremioGrezzo.Circuit.Location.locality : '');
        const bandiera = this.ottieniBandieraPaese(paese || granPremioGrezzo.meeting_name || granPremioGrezzo.raceName);

        return {
            id: granPremioGrezzo.meeting_key || granPremioGrezzo.round || 1,
            nome: granPremioGrezzo.meeting_name || granPremioGrezzo.meeting_official_name || granPremioGrezzo.raceName || 'Gran Premio',
            circuito: circuito,
            localita: localita ? `${localita}, ${paese}` : paese,
            paese: paese,
            bandiera: bandiera,
            round: granPremioGrezzo.round || null,
            stagione: granPremioGrezzo.year || granPremioGrezzo.season || new Date().getFullYear(),
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
     * Provider 2: Jolpica / Ergast F1 API
     * Recupera il prossimo GP ufficiale e tutti gli orari delle sessioni.
     */
    async recuperaDaJolpica() {
        try {
            console.log('[HomeService] Interrogazione Jolpica/Ergast API (Provider di riserva ufficiale)...');
            const risposta = await fetch('https://api.jolpi.ca/ergast/f1/current/next.json');
            if (!risposta.ok) throw new Error(`HTTP ${risposta.status}`);
            const dati = await risposta.json();
            
            const gare = dati?.MRData?.RaceTable?.Races;
            if (!gare || gare.length === 0) return null;

            const gara = gare[0];
            const sessioni = [];

            // Costruisci le sessioni disponibili nel formato Jolpica/Ergast
            if (gara.FirstPractice) {
                sessioni.push({
                    nome: 'Prove Libere 1',
                    session_name: 'Practice 1',
                    inizio: `${gara.FirstPractice.date}T${gara.FirstPractice.time || '10:30:00Z'}`
                });
            }
            if (gara.SecondPractice) {
                sessioni.push({
                    nome: 'Prove Libere 2',
                    session_name: 'Practice 2',
                    inizio: `${gara.SecondPractice.date}T${gara.SecondPractice.time || '14:00:00Z'}`
                });
            }
            if (gara.ThirdPractice) {
                sessioni.push({
                    nome: 'Prove Libere 3',
                    session_name: 'Practice 3',
                    inizio: `${gara.ThirdPractice.date}T${gara.ThirdPractice.time || '11:30:00Z'}`
                });
            }
            if (gara.SprintQualifying) {
                sessioni.push({
                    nome: 'Qualifiche Sprint',
                    session_name: 'Sprint Qualifying',
                    inizio: `${gara.SprintQualifying.date}T${gara.SprintQualifying.time || '14:30:00Z'}`
                });
            }
            if (gara.Sprint) {
                sessioni.push({
                    nome: 'Gara Sprint',
                    session_name: 'Sprint',
                    inizio: `${gara.Sprint.date}T${gara.Sprint.time || '10:00:00Z'}`
                });
            }
            if (gara.Qualifying) {
                sessioni.push({
                    nome: 'Qualifiche',
                    session_name: 'Qualifying',
                    inizio: `${gara.Qualifying.date}T${gara.Qualifying.time || '14:00:00Z'}`
                });
            }
            if (gara.date) {
                sessioni.push({
                    nome: 'Gara',
                    session_name: 'Race',
                    inizio: `${gara.date}T${gara.time || '13:00:00Z'}`
                });
            }

            return this.costruisciDatiProssimoGP(gara, sessioni);
        } catch (errore) {
            console.warn('[HomeService] Impossibile recuperare da Jolpica API:', errore.message);
            return null;
        }
    },

    /**
     * Provider 3: Calendario Offline di Riserva
     * Garantisce che la schermata non rimanga mai vuota anche in totale assenza di connessione.
     */
    ottieniCalendarioOfflineDiRiserva() {
        const anno = new Date().getFullYear();
        const adesso = new Date();

        // Dataset di riferimento dei Gran Premi con orari realistici
        const granPremiCampionato = [
            {
                round: 12,
                meeting_name: "Gran Premio dei Paesi Bassi",
                country_name: "Netherlands",
                circuit_name: "Circuit Park Zandvoort",
                location: "Zandvoort",
                sessioni: [
                    { session_name: "Practice 1", inizio: `${anno}-08-21T10:30:00Z`, fine: `${anno}-08-21T11:30:00Z` },
                    { session_name: "Practice 2", inizio: `${anno}-08-21T14:00:00Z`, fine: `${anno}-08-21T15:00:00Z` },
                    { session_name: "Practice 3", inizio: `${anno}-08-22T09:30:00Z`, fine: `${anno}-08-22T10:30:00Z` },
                    { session_name: "Qualifying", inizio: `${anno}-08-22T13:00:00Z`, fine: `${anno}-08-22T14:00:00Z` },
                    { session_name: "Race", inizio: `${anno}-08-23T13:00:00Z`, fine: `${anno}-08-23T15:00:00Z` }
                ]
            },
            {
                round: 13,
                meeting_name: "Gran Premio d'Italia",
                country_name: "Italy",
                circuit_name: "Autodromo Nazionale Monza",
                location: "Monza",
                sessioni: [
                    { session_name: "Practice 1", inizio: `${anno}-09-04T11:30:00Z`, fine: `${anno}-09-04T12:30:00Z` },
                    { session_name: "Practice 2", inizio: `${anno}-09-04T15:00:00Z`, fine: `${anno}-09-04T16:00:00Z` },
                    { session_name: "Practice 3", inizio: `${anno}-09-05T10:30:00Z`, fine: `${anno}-09-05T11:30:00Z` },
                    { session_name: "Qualifying", inizio: `${anno}-09-05T14:00:00Z`, fine: `${anno}-09-05T15:00:00Z` },
                    { session_name: "Race", inizio: `${anno}-09-06T13:00:00Z`, fine: `${anno}-09-06T15:00:00Z` }
                ]
            },
            {
                round: 14,
                meeting_name: "Gran Premio dell'Azerbaigian",
                country_name: "Azerbaijan",
                circuit_name: "Baku City Circuit",
                location: "Baku",
                sessioni: [
                    { session_name: "Practice 1", inizio: `${anno}-09-18T09:30:00Z`, fine: `${anno}-09-18T10:30:00Z` },
                    { session_name: "Practice 2", inizio: `${anno}-09-18T13:00:00Z`, fine: `${anno}-09-18T14:00:00Z` },
                    { session_name: "Practice 3", inizio: `${anno}-09-19T08:30:00Z`, fine: `${anno}-09-19T09:30:00Z` },
                    { session_name: "Qualifying", inizio: `${anno}-09-19T12:00:00Z`, fine: `${anno}-09-19T13:00:00Z` },
                    { session_name: "Race", inizio: `${anno}-09-20T11:00:00Z`, fine: `${anno}-09-20T13:00:00Z` }
                ]
            }
        ];

        // Trova il GP corrente o il primo futuro
        for (const gp of granPremiCampionato) {
            const gara = gp.sessioni.find(s => s.session_name === 'Race');
            const dataFineGara = new Date(gara ? gara.fine : gp.sessioni[gp.sessioni.length - 1].fine);
            if (dataFineGara.getTime() >= adesso.getTime()) {
                return this.costruisciDatiProssimoGP(gp, gp.sessioni);
            }
        }

        // Se tutti sono passati, prendi l'ultimo
        const ultimoGP = granPremiCampionato[granPremiCampionato.length - 1];
        return this.costruisciDatiProssimoGP(ultimoGP, ultimoGP.sessioni);
    },

    /**
     * METODO PRINCIPALE (Orchestratore)
     * Recupera i dati del prossimo GP interrogando la catena di provider:
     * 1. OpenF1 API
     * 2. Jolpica/Ergast F1 API
     * 3. Fallback Locale
     * 
     * @returns {Promise<{prossimaGara: Object, sessioni: Array, sorgenteDati: string}>}
     */
    async recuperaDatiHome() {
        const annoCorrente = new Date().getFullYear();
        const adesso = new Date();
        let risultatoGP = null;
        let sorgente = 'OpenF1';

        // 1. TENTA OPENF1
        try {
            console.log(`[HomeService] Tentativo di recupero Gran Premi da OpenF1 (Anno ${annoCorrente})...`);
            let meetings = await recuperaGranPremiPerAnno(annoCorrente);

            // Se per l'anno corrente non ci sono dati, tenta con l'anno precedente o 'latest'
            if (!meetings || meetings.length === 0) {
                console.log(`[HomeService] Nessun meeting trovato per il ${annoCorrente}, provo con il ${annoCorrente - 1}...`);
                meetings = await recuperaGranPremiPerAnno(annoCorrente - 1);
            }

            if (meetings && Array.isArray(meetings) && meetings.length > 0) {
                // Ordina per data
                const meetingsOrdinati = meetings.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());
                
                // Trova il meeting in corso o il primo futuro
                let targetMeeting = meetingsOrdinati.find(m => {
                    const fine = new Date(m.date_end || m.date_start);
                    return fine.getTime() >= adesso.getTime();
                });

                if (!targetMeeting) {
                    targetMeeting = meetingsOrdinati[meetingsOrdinati.length - 1]; // Prendi l'ultimo se stagione conclusa
                }

                if (targetMeeting && targetMeeting.meeting_key) {
                    const sessioni = await recuperaSessioniPerGranPremio(targetMeeting.meeting_key);
                    if (sessioni && sessioni.length > 0) {
                        risultatoGP = this.costruisciDatiProssimoGP(targetMeeting, sessioni);
                        sorgente = 'OpenF1 API';
                    }
                }
            }
        } catch (errore) {
            console.warn('[HomeService] Errore durante la chiamata a OpenF1:', errore);
        }

        // 2. SE OPENF1 NON HA RESTITUITO DATI, TENTA JOLPICA / ERGAST
        if (!risultatoGP) {
            console.log('[HomeService] Utilizzo Provider Alternativo (Jolpica Ergast)...');
            risultatoGP = await this.recuperaDaJolpica();
            if (risultatoGP) {
                sorgente = 'Jolpica Ergast F1 API';
            }
        }

        // 3. SE ANCHE JOLPICA FALLISCE (es. offline), USA IL DATASET LOCALE
        if (!risultatoGP) {
            console.log('[HomeService] Utilizzo Dataset di Riserva Locale...');
            risultatoGP = this.ottieniCalendarioOfflineDiRiserva();
            sorgente = 'Dataset Locale Integrato';
        }

        return {
            prossimaGara: risultatoGP,
            sessioni: risultatoGP ? risultatoGP.sessioni : [],
            sorgenteDati: sorgente
        };
    }
};