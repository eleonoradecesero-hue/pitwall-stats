const HomeService = {
    // --- FUNZIONI DI FORMATTAZIONE (Prese dai tuoi appunti) ---
    minutiDaOffsetGmt(gmtOffset) {
        if (!gmtOffset) return null;
        const corrispondenza = String(gmtOffset).match(/^([+-])(\d{2}):?(\d{2})(?::?(\d{2}))?$/);
        if (!corrispondenza) return null;
        const minuti = Number(corrispondenza[2]) * 60 + Number(corrispondenza[3]);
        return corrispondenza[1] === '-' ? -minuti : minuti;
    },

    dataConOffsetGmt(dataIso, gmtOffset = null) {
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) return null;
        const minutiOffset = this.minutiDaOffsetGmt(gmtOffset);
        return minutiOffset === null ? data : new Date(data.getTime() + (minutiOffset * 60 * 1000));
    },

    formattaDataLocale(dataIso, gmtOffset = null) {
        const data = this.dataConOffsetGmt(dataIso, gmtOffset);
        if (!data) return 'Data non disponibile';
        return new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: '2-digit', month: 'long' }).format(data);
    },

    formattaOraLocale(dataIso, gmtOffset = null) {
        const data = this.dataConOffsetGmt(dataIso, gmtOffset);
        if (!data) return '--:--';
        return new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' }).format(data);
    },

    // --- LOGICA DI FORMATTAZIONE PER LA HOME ---
    formattaSessionePerHome(sessione) {
        return {
            nome: sessione.session_name || 'Sessione senza nome',
            tipo: sessione.session_type || 'Sessione senza tipo',
            inizio: sessione.date_start,
            fine: sessione.date_end,
            gmt_offset: sessione.gmt_offset,
            // Calcolo disponibilità risultati: fine sessione + 15 minuti
            risultatiDisponibili: (new Date() > (new Date(sessione.date_end).getTime() + (15 * 60 * 1000)))
        };
    },

    formattaProssimaGaraPerHome(meeting, sessioni) {
        return {
            nome: meeting.meeting_name || 'Gran Premio',
            bandiera: '🏁', // Nota: API OpenF1 spesso non fornisce bandiere, potresti mapparle manualmente se necessario
            sessioni: sessioni.map(s => this.formattaSessionePerHome(s))
        };
    },

    // --- LOGICA DI RECUPERO DATI (Orchestratore) ---
    async recuperaDatiHome() {
        const anno = new Date().getFullYear();
        const meeting = await recuperaGranPremiPerAnno(anno);
        
        const ora = new Date();
        // Trova il GP in corso o il primo futuro
        let targetMeeting = meeting.find(m => new Date(m.date_start) <= ora && new Date(m.date_end) >= ora);
        if (!targetMeeting) {
            targetMeeting = meeting.find(m => new Date(m.date_start) > ora);
        }
        
        if (!targetMeeting) return { prossimaGara: null, sessioni: [] };

        const sessioni = await recuperaSessioniPerGranPremio(targetMeeting.meeting_key);
        // Ordina le sessioni per data
        const sessioniOrdinate = sessioni.sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        return {
            prossimaGara: this.formattaProssimaGaraPerHome(targetMeeting, sessioniOrdinate),
            sessioni: sessioniOrdinate.map(s => this.formattaSessionePerHome(s))
        };
    }
};