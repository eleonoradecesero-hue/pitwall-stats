// js/servizi/analisi_service.js

const AnalisiService = {
    baseApi: 'https://api.openf1.org/v1',
    cacheLocale: new Map(),
    codaRichieste: Promise.resolve(),
    ultimaRichiesta: 0,
    intervalloApi: 1200,

    async richiesta(percorso, parametri = {}, tentativo = 0) {
        const esegui = async () => {
            const attesa = Math.max(0, this.intervalloApi - (Date.now() - this.ultimaRichiesta));
            if (attesa) await new Promise(risolvi => setTimeout(risolvi, attesa));

            const query = new URLSearchParams(parametri).toString();
            const risposta = await fetch(`${this.baseApi}${percorso}?${query}`);
            this.ultimaRichiesta = Date.now();

            if (risposta.status === 429) {
                const retryAfter = Number(risposta.headers.get('Retry-After'));
                const attesaRetry = Number.isFinite(retryAfter) ? retryAfter * 1000 : 5000;
                await new Promise(risolvi => setTimeout(risolvi, Math.max(attesaRetry, this.intervalloApi)));
                throw new Error(`OpenF1 429: ${percorso}`);
            }
            if (!risposta.ok) throw new Error(`OpenF1 ${risposta.status}: ${percorso}`);
            return risposta.json();
        };

        const richiestaInCoda = this.codaRichieste.then(esegui, esegui);
        this.codaRichieste = richiestaInCoda.catch(() => undefined);
        return richiestaInCoda.catch(async errore => {
            if (String(errore.message).includes('OpenF1 429') && tentativo < 2) {
                const attesa = this.intervalloApi * 2;
                await new Promise(risolvi => setTimeout(risolvi, attesa));
                return this.richiesta(percorso, parametri, tentativo + 1);
            }
            throw errore;
        });
    },

    async richiestaOpzionale(percorso, parametri = [], valorePredefinito = []) {
        try {
            return await this.richiesta(percorso, parametri);
        } catch (errore) {
            console.warn(`[AnalisiService] Dato opzionale non disponibile (${percorso}):`, errore.message || errore);
            return valorePredefinito;
        }
    },

    async daCache(chiave, caricatore) {
        if (this.cacheLocale.has(chiave)) return this.cacheLocale.get(chiave);

        try {
            if (FirebaseService.configurato() && FirebaseService.database) {
                const documento = await FirebaseService.database.collection('analisi').doc(chiave).get();
                if (documento.exists) {
                    const dati = documento.data().dati;
                    this.cacheLocale.set(chiave, dati);
                    return dati;
                }
            }
        } catch (errore) {
            console.warn('[AnalisiService] Cache Firebase non disponibile:', errore.message || errore);
        }

        const dati = await caricatore();
        this.cacheLocale.set(chiave, dati);

        // La lettura e' pubblica; la scrittura e' consentita solo a utenti autenticati.
        try {
            if (FirebaseService.configurato() && FirebaseService.database) {
                if (!FirebaseService.autenticazione.currentUser) {
                    try {
                        await FirebaseService.autenticazione.signInAnonymously();
                    } catch (errore) {
                        console.warn('[AnalisiService] Accesso anonimo Firebase non disponibile:', errore.message || errore);
                    }
                }
            }
            if (FirebaseService.database && FirebaseService.autenticazione.currentUser) {
                await FirebaseService.database.collection('analisi').doc(chiave).set({
                    dati,
                    aggiornatoIl: firebase.firestore.FieldValue.serverTimestamp(),
                    versione: 1
                });
            }
        } catch (errore) {
            console.warn('[AnalisiService] Impossibile salvare in Firebase:', errore.message || errore);
        }
        return dati;
    },

    async recuperaMeeting(anno) {
        return this.richiesta('/meetings', { year: anno });
    },

    async recuperaSessioni(meetingKey) {
        return this.richiesta('/sessions', { meeting_key: meetingKey });
    },

    async recuperaDatiSessione(sessionKey, tipo, onProgress = () => {}) {
        const [piloti, giri, stint, soste, meteo] = await Promise.all([
            this.richiesta('/drivers', { session_key: sessionKey }),
            this.richiesta('/laps', { session_key: sessionKey }),
            this.richiestaOpzionale('/stints', { session_key: sessionKey }),
            tipo === 'Gara' ? this.richiestaOpzionale('/pit', { session_key: sessionKey }) : Promise.resolve([]),
            this.richiestaOpzionale('/weather', { session_key: sessionKey })
        ]);

        let telemetria = {};
        if (tipo === 'Qualifiche') {
            const qualificati = piloti.filter(p => giri.some(g => g.driver_number === p.driver_number && g.lap_duration));
            const datiTelemetria = [];
            for (let indice = 0; indice < qualificati.length; indice++) {
                const pilota = qualificati[indice];
                const carData = await this.richiestaOpzionale('/car_data', {
                    session_key: sessionKey,
                    driver_number: pilota.driver_number
                });
                datiTelemetria.push([pilota.driver_number, carData.filter((elemento, indiceCampione) => indiceCampione % 4 === 0)
                    .map(({ meeting_key, session_key, drs, ...resto }) => resto)]);
                onProgress(40 + Math.round(((indice + 1) / qualificati.length) * 45), `Telemetria ${pilota.name_acronym || pilota.driver_number}...`);
            }
            telemetria = Object.fromEntries(datiTelemetria);
        }

        return { piloti, giri, stint, soste, meteo, telemetria };
    },

    calcolaMeteo(dati) {
        if (!dati || dati.length === 0) return null;
        const statistiche = chiave => {
            const valori = dati.map(m => m[chiave]).filter(v => v !== null && v !== undefined);
            if (valori.length === 0) return { min: '-', med: '-', max: '-' };
            return {
                min: Math.min(...valori).toFixed(1),
                med: (valori.reduce((a, b) => a + b, 0) / valori.length).toFixed(1),
                max: Math.max(...valori).toFixed(1)
            };
        };
        return { aria: statistiche('air_temperature'), pista: statistiche('track_temperature'), umidita: statistiche('humidity'), vento: statistiche('wind_speed') };
    },

    calcolaDevStandard(valori) {
        if (valori.length < 2) return 0;
        const media = valori.reduce((a, b) => a + b, 0) / valori.length;
        return Math.sqrt(valori.reduce((somma, valore) => somma + Math.pow(valore - media, 2), 0) / valori.length);
    },

    calcolaDegrado(valori) {
        if (valori.length < 2) return 0;
        const n = valori.length;
        let sommaX = 0, sommaY = 0, sommaXY = 0, sommaXX = 0;
        for (let i = 0; i < n; i++) {
            sommaX += i;
            sommaY += valori[i];
            sommaXY += i * valori[i];
            sommaXX += i * i;
        }
        return (n * sommaXY - sommaX * sommaY) / (n * sommaXX - sommaX * sommaX);
    },

    analizzaProve(piloti, giri) {
        const stats = {};
        piloti.forEach(p => { stats[p.driver_number] = { acronimo: p.name_acronym || '???', team: p.team_name || 'N/D', colore: p.team_colour || 'FFFFFF', miglior: Infinity, s1: Infinity, s2: Infinity, s3: Infinity, giri: 0 }; });
        giri.forEach(g => {
            const s = stats[g.driver_number];
            if (!s) return;
            if (g.lap_duration !== null && g.lap_duration > 0) s.giri++;
            if (g.lap_duration !== null && g.lap_duration < s.miglior) s.miglior = g.lap_duration;
            if (g.duration_sector_1 !== null && g.duration_sector_1 < s.s1) s.s1 = g.duration_sector_1;
            if (g.duration_sector_2 !== null && g.duration_sector_2 < s.s2) s.s2 = g.duration_sector_2;
            if (g.duration_sector_3 !== null && g.duration_sector_3 < s.s3) s.s3 = g.duration_sector_3;
        });
        return Object.values(stats).filter(p => p.giri > 0).sort((a, b) => a.miglior - b.miglior);
    },

    analizzaQualifiche(sessionKey, piloti, giri, stint, telemetria) {
        const stats = {};
        let bestS1 = Infinity, bestS2 = Infinity, bestS3 = Infinity;
        piloti.forEach(p => { stats[p.driver_number] = { numero: p.driver_number, acronimo: p.name_acronym || '???', team: p.team_name || 'N/D', colore: p.team_colour || 'FFFFFF', miglior: Infinity, giro: null, s1: Infinity, s2: Infinity, s3: Infinity, gomme: '-', ideal: Infinity, deltaIdeal: Infinity, deltaLeader: '-', deltaPrecede: '-', deltaTeam: '-', telemetria: { vmax: null, vmedia: null, pieno: null, freno: null, rilascio: null, clipping: null } }; });
        giri.forEach(g => {
            const s = stats[g.driver_number]; if (!s) return;
            if (g.duration_sector_1 && g.duration_sector_1 < s.s1) s.s1 = g.duration_sector_1;
            if (g.duration_sector_2 && g.duration_sector_2 < s.s2) s.s2 = g.duration_sector_2;
            if (g.duration_sector_3 && g.duration_sector_3 < s.s3) s.s3 = g.duration_sector_3;
            if (g.duration_sector_1 && g.duration_sector_1 < bestS1) bestS1 = g.duration_sector_1;
            if (g.duration_sector_2 && g.duration_sector_2 < bestS2) bestS2 = g.duration_sector_2;
            if (g.duration_sector_3 && g.duration_sector_3 < bestS3) bestS3 = g.duration_sector_3;
            if (g.lap_duration && g.lap_duration < s.miglior) {
                s.miglior = g.lap_duration; s.giro = g;
                const trovato = stint.find(st => st.driver_number === g.driver_number && g.lap_number >= st.lap_start && g.lap_number <= st.lap_end);
                if (trovato) s.gomme = trovato.compound || '-';
            }
        });
        Object.values(stats).forEach(s => {
            if (s.s1 !== Infinity && s.s2 !== Infinity && s.s3 !== Infinity) { s.ideal = s.s1 + s.s2 + s.s3; s.deltaIdeal = s.miglior - s.ideal; }
        });
        const classifica = Object.values(stats).filter(p => p.miglior !== Infinity).sort((a, b) => a.miglior - b.miglior);
        const teamBest = {}; classifica.forEach(p => { if (!teamBest[p.team] || p.miglior < teamBest[p.team]) teamBest[p.team] = p.miglior; });
        if (classifica.length) classifica.forEach((p, i) => { p.deltaLeader = i ? p.miglior - classifica[0].miglior : '-'; p.deltaPrecede = i ? p.miglior - classifica[i - 1].miglior : '-'; p.deltaTeam = p.miglior === teamBest[p.team] ? '-' : p.miglior - teamBest[p.team]; });
        classifica.forEach(p => {
            const giro = p.giro, campioni = telemetria[p.numero] || [];
            if (!giro?.date_start || !giro.lap_duration || !campioni.length) return;
            const inizio = new Date(giro.date_start.replace('Z', '+00:00')), fine = new Date(inizio.getTime() + giro.lap_duration * 1000);
            const validi = campioni.filter(d => d.date && d.throttle !== null && d.brake !== null && d.speed !== null && new Date(d.date.replace('Z', '+00:00')) >= inizio && new Date(d.date.replace('Z', '+00:00')) <= fine);
            if (!validi.length) return;
            const pieno = validi.filter(d => d.throttle >= 99).length, freno = validi.filter(d => d.brake > 0).length, rilascio = validi.filter(d => d.throttle === 0 && d.brake === 0).length;
            let clipping = 0; for (let i = 1; i < validi.length; i++) if (validi[i].throttle >= 99 && validi[i].brake === 0 && validi[i].speed < validi[i - 1].speed) clipping++;
            p.telemetria = { vmax: Math.max(...validi.map(d => d.speed)), vmedia: validi.reduce((a, d) => a + d.speed, 0) / validi.length, pieno: pieno / validi.length * 100, freno: freno / validi.length * 100, rilascio: rilascio / validi.length * 100, clipping: clipping / validi.length * 100 };
        });
        return { classifica, bestS1, bestS2, bestS3 };
    },

    analizzaGara(piloti, giri, stint, soste) {
        const stats = {}, timestamp = [];
        giri.forEach(g => { if (g.date_start && g.lap_duration) timestamp.push({ num: g.driver_number, ts: new Date(g.date_start.replace('Z', '+00:00')).getTime() / 1000 }); });
        piloti.forEach(p => { stats[p.driver_number] = { numero: p.driver_number, acronimo: p.name_acronym || '???', team: p.team_name || 'N/D', colore: p.team_colour || 'FFFFFF', miglior: Infinity, s1: Infinity, s2: Infinity, s3: Infinity, giri: [], totale: 0, mediano: 0, deviazione: 0, aria: 0, gomme: [], pits: 0, pitMedio: 0, gapLeader: '-', deltaLeaderGiro: '-', gapPrecedente: '-', deltaPrecedenteGiro: '-', gapTeam: '-', deltaTeamGiro: '-', ideale: Infinity }; });
        giri.forEach(g => { const s = stats[g.driver_number]; if (!s) return; if (g.lap_duration) { s.giri.push({ durata: g.lap_duration, ts: g.date_start ? new Date(g.date_start.replace('Z', '+00:00')).getTime() / 1000 : null }); s.totale += g.lap_duration; } if (g.duration_sector_1 && g.duration_sector_1 < s.s1) s.s1 = g.duration_sector_1; if (g.duration_sector_2 && g.duration_sector_2 < s.s2) s.s2 = g.duration_sector_2; if (g.duration_sector_3 && g.duration_sector_3 < s.s3) s.s3 = g.duration_sector_3; if (g.lap_duration && g.lap_duration < s.miglior) s.miglior = g.lap_duration; });
        Object.values(stats).forEach(s => { if (!s.giri.length || s.miglior === Infinity) return; const puliti = s.giri.map(g => g.durata).filter(t => t <= s.miglior * 1.07), ordinati = [...puliti].sort((a, b) => a - b), meta = Math.floor(ordinati.length / 2); s.mediano = ordinati.length % 2 ? ordinati[meta] : (ordinati[meta - 1] + ordinati[meta]) / 2; s.deviazione = this.calcolaDevStandard(puliti); let aria = 0; s.giri.forEach(g => { if (g.durata <= s.miglior * 1.07 && g.ts && !timestamp.some(a => a.num !== s.numero && g.ts - a.ts > 0 && g.ts - a.ts <= 1.5)) aria++; }); s.aria = Math.round(aria / s.giri.length * 100); s.gomme = stint.filter(st => st.driver_number === s.numero).sort((a, b) => (a.stint_number || 0) - (b.stint_number || 0)).map(st => st.compound).filter(Boolean); const box = soste.filter(p => p.driver_number === s.numero); s.pits = box.length; s.pitMedio = s.pits ? box.reduce((a, p) => a + (p.stop_duration || p.pit_duration || 0), 0) / s.pits : 0; });
        const classifica = Object.values(stats).filter(p => p.giri.length).sort((a, b) => b.giri.length - a.giri.length || a.totale - b.totale), team = {}; classifica.forEach(p => { if (!team[p.team]) team[p.team] = { laps: p.giri.length, time: p.totale }; });
        if (classifica.length) {
            const leader = classifica[0];
            classifica.forEach((pilota, indice) => {
                pilota.ideale = pilota.s1 !== Infinity && pilota.s2 !== Infinity && pilota.s3 !== Infinity ? pilota.s1 + pilota.s2 + pilota.s3 : Infinity;
                const precedente = classifica[indice - 1];
                if (pilota.giri.length === leader.giri.length) {
                    const differenzaLeader = pilota.totale - leader.totale;
                    pilota.gapLeader = indice ? `+${differenzaLeader.toFixed(3)}s` : '-';
                    pilota.deltaLeaderGiro = indice ? `+${(differenzaLeader / pilota.giri.length).toFixed(3)}s/giro` : '-';
                } else pilota.gapLeader = `+${leader.giri.length - pilota.giri.length} Giri`;
                if (precedente) {
                    if (pilota.giri.length === precedente.giri.length) {
                        const differenzaPrecedente = pilota.totale - precedente.totale;
                        pilota.gapPrecedente = `+${differenzaPrecedente.toFixed(3)}s`;
                        pilota.deltaPrecedenteGiro = `+${(differenzaPrecedente / pilota.giri.length).toFixed(3)}s/giro`;
                    } else pilota.gapPrecedente = `+${precedente.giri.length - pilota.giri.length} Giri`;
                }
                const migliorTeam = team[pilota.team];
                if (migliorTeam && (pilota.giri.length !== migliorTeam.laps || pilota.totale !== migliorTeam.time)) {
                    if (pilota.giri.length === migliorTeam.laps) {
                        const differenzaTeam = pilota.totale - migliorTeam.time;
                        if (differenzaTeam > 0) { pilota.gapTeam = `+${differenzaTeam.toFixed(3)}s`; pilota.deltaTeamGiro = `+${(differenzaTeam / pilota.giri.length).toFixed(3)}s/giro`; }
                    } else if (migliorTeam.laps < pilota.giri.length) pilota.gapTeam = `+${migliorTeam.laps - pilota.giri.length} Giri`;
                }
            });
        }
        return { classifica, team };
    },

    async carica(anno, meetingKey, onProgress = () => {}) {
        const sessioni = await this.recuperaSessioni(meetingKey);
        const disponibili = sessioni.filter(s => ['Practice 1', 'Practice 2', 'Practice 3', 'Qualifying', 'Sprint Qualifying', 'Sprint Shootout', 'Race', 'Sprint'].includes(s.session_name));
        const risultati = [];
        for (let indice = 0; indice < disponibili.length; indice++) {
            const sessione = disponibili[indice];
            const tipo = sessione.session_name === 'Race' ? 'Gara' : ['Qualifying', 'Sprint Qualifying', 'Sprint Shootout'].includes(sessione.session_name) ? 'Qualifiche' : sessione.session_name === 'Sprint' ? 'Sprint' : sessione.session_name;
            const chiave = `v2_${anno}_${meetingKey}_${sessione.session_key}`;
            try {
                const risultato = await this.daCache(chiave, async () => {
                    onProgress(5 + Math.round((indice / disponibili.length) * 90), `Dati ${tipo}: avvio richieste...`);
                    const dati = await this.recuperaDatiSessione(sessione.session_key, tipo, onProgress);
                    onProgress(95, `Calcolo ${tipo}...`);
                    return {
                        meteo: this.calcolaMeteo(dati.meteo),
                        analisi: tipo === 'Qualifiche' ? this.analizzaQualifiche(sessione.session_key, dati.piloti, dati.giri, dati.stint, dati.telemetria) : tipo === 'Gara' || tipo === 'Sprint' ? this.analizzaGara(dati.piloti, dati.giri, dati.stint, dati.soste) : { classifica: this.analizzaProve(dati.piloti, dati.giri) }
                    };
                });
                risultati.push({ ...sessione, tipo, ...risultato });
                onProgress(5 + Math.round(((indice + 1) / disponibili.length) * 95), `${tipo} completata`);
            } catch (errore) {
                console.warn(`[AnalisiService] Sessione ${sessione.session_name} non elaborabile:`, errore.message || errore);
            }
        }
        return risultati;
    }
};