
function recuperaSessioniAnnoCorrente() {
    sessioni_anno_corrente = recuperaTutteSessioniPerAnno(new Date().getFullYear());
    return sessioni_anno_corrente;
}

function recuperaPrimaFuturaSessione(){
    return recuperaTutteSessioniPerAnno(new Date().getFullYear()).then(sessioni => {
        const sessioniFuture = sessioni.filter(sessione => {
            const dataInizio = Date.parse(sessione.date_start || '');
            return dataInizio > Date.now();
        });
        return sessioniFuture[0];
    });
}

function recuperaGranPremiAnnoCorrente() {
    gran_premi_anno_corrente = recuperaGranPremiPerAnno(new Date().getFullYear());
    return gran_premi_anno_corrente;
}

function recuperaPrimoFuturoGranPremio(){
    return recuperaGranPremiPerAnno(new Date().getFullYear()).then(gran_premi => {
        const gran_premiFuturi = gran_premi.filter(sessione => {
            const dataInizio = Date.parse(sessione.date_start || '');
            return dataInizio > Date.now();
        });
        return gran_premiFuturi[0];
    });
}

function minutiDaOffsetGmt(gmtOffset) {
    if (!gmtOffset) {
        return null;
    }

    const corrispondenza = String(gmtOffset).match(/^([+-])(\d{2}):?(\d{2})(?::?(\d{2}))?$/);
    if (!corrispondenza) {
        return null;
    }

    const minuti = Number(corrispondenza[2]) * 60 + Number(corrispondenza[3]);
    return corrispondenza[1] === '-' ? -minuti : minuti;
}

function dataConOffsetGmt(dataIso, gmtOffset = null) {
    const data = new Date(dataIso);
    if (Number.isNaN(data.getTime())) {
        return null;
    }

    const minutiOffset = minutiDaOffsetGmt(gmtOffset);
    if (minutiOffset === null) {
        return data;
    }

    return new Date(data.getTime() + (minutiOffset * 60 * 1000));
}

function formattaDataLocale(dataIso, gmtOffset = null) {
    const data = dataConOffsetGmt(dataIso, gmtOffset);
    if (!data) {
        return 'Data non disponibile';
    }

    return new Intl.DateTimeFormat('it-IT', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
    }).format(data);
}

function formattaOraLocale(dataIso, gmtOffset = null) {
    const data = dataConOffsetGmt(dataIso, gmtOffset);
    if (!data) {
        return '--:--';
    }

    return new Intl.DateTimeFormat('it-IT', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    }).format(data);
}

function formattaSessionePerHome(sessione) {
    const nome = sessione.session_name || 'Sessione senza nome';
    const tipo = sessione.session_type || 'Sessione senza tipo';
    const inizio = formattaDataLocale(sessione.date_start, sessione.gmt_offset);
    const fine = formattaDataLocale(sessione.date_end, sessione.gmt_offset);
    return { nome, tipo, inizio, fine };
}

function formattaProssimaGaraPerHome(meeting, sessioni) {
    const nome = meeting.meeting_name || 'Gran Premio senza nome';
    const bandiera = meeting.country_flag || '🏁';
    const sessioniFormattate = sessioni.map(formattaSessionePerHome);
    return { nome, bandiera, sessioni: sessioniFormattate };
}

