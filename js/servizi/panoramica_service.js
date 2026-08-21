/* Servizi e formule condivise dalla schermata Panoramica. */

const PanoramicaService = (() => {
    const valoreNumero = (valore, valorePredefinito = 0) => {
        const numero = Number(valore);
        return Number.isFinite(numero) ? numero : valorePredefinito;
    };

    const primoValore = (oggetto, chiavi, valorePredefinito = null) => {
        for (const chiave of chiavi) {
            if (oggetto && oggetto[chiave] !== undefined && oggetto[chiave] !== null) {
                return oggetto[chiave];
            }
        }
        return valorePredefinito;
    };

    const ordinaPerData = (elementi) => [...elementi].sort((primo, secondo) => {
        const dataPrimo = Date.parse(primo.date_start || primo.date_end || '') || 0;
        const dataSecondo = Date.parse(secondo.date_start || secondo.date_end || '') || 0;
        return dataPrimo - dataSecondo;
    });

    const ultimaGaraConclusa = async (anno) => {
        const meetings = await recuperaGranPremiPerAnno(anno);
        const meetingsConclusi = meetings.filter(meeting => {
            const dataFine = Date.parse(meeting.date_end || meeting.date_start || '');
            return dataFine > 0 && dataFine <= Date.now();
        });
        const meetingsDaUsare = meetingsConclusi.length > 0 ? meetingsConclusi : meetings;
        const meetingsOrdinati = ordinaPerData(meetingsDaUsare);
        const meeting = meetingsOrdinati[meetingsOrdinati.length - 1];

        if (!meeting) {
            throw new Error(`Nessun Gran Premio disponibile per ${anno}`);
        }

        const sessioni = ordinaPerData(await recuperaSessioniPerGranPremio(meeting.meeting_key));
        const gara = sessioni.find(sessione => sessione.session_name === 'Race') || sessioni[sessioni.length - 1];

        if (!gara) {
            throw new Error('Nessuna sessione disponibile per l\'ultimo Gran Premio');
        }

        return { meeting, gara };
    };

    const valoreStatistica = (record, chiavi) => valoreNumero(primoValore(record, chiavi));

    const creaStatistiche = (record) => ({
        podi: valoreStatistica(record, ['podiums', 'podium_count', 'podium'] ),
        giriVeloci: valoreStatistica(record, ['fastest_laps', 'fastest_lap_count']),
        poles: valoreStatistica(record, ['poles', 'pole_positions', 'pole_count']),
        vittorie: valoreStatistica(record, ['wins', 'victories', 'win_count']),
        dnf: valoreStatistica(record, ['dnf', 'dnfs', 'did_not_finish'])
    });

    const carica = async (anno = new Date().getFullYear()) => {
        let annoUsato = anno;
        let datiGara;

        try {
            datiGara = await ultimaGaraConclusa(annoUsato);
        } catch (errore) {
            if (annoUsato === new Date().getFullYear()) {
                annoUsato -= 1;
                datiGara = await ultimaGaraConclusa(annoUsato);
            } else {
                throw errore;
            }
        }

        const [piloti, classificaPiloti, classificaScuderie] = await Promise.all([
            recuperaPiloti(datiGara.gara.session_key),
            recuperaClassificaPilotiMeeting(datiGara.meeting.meeting_key),
            recuperaClassificaCostruttoriMeeting(datiGara.meeting.meeting_key)
        ]);

        const pilotiPerNumero = new Map(piloti.map(pilota => [String(pilota.driver_number), pilota]));
        const classificaPilotiEffettiva = classificaPiloti.length > 0
            ? classificaPiloti
            : piloti.map((pilota, indice) => ({
                driver_number: pilota.driver_number,
                position: indice + 1,
                points: 0,
                team_name: pilota.team_name
            }));
        const pilotiNormalizzati = classificaPilotiEffettiva.map((record, indice) => {
            const pilota = pilotiPerNumero.get(String(record.driver_number)) || {};
            return {
                driver_number: record.driver_number,
                nome: pilota.full_name || record.full_name || pilota.name_acronym || `Pilota #${record.driver_number}`,
                posizione: valoreNumero(record.position, indice + 1),
                punti: valoreNumero(record.points),
                numero: record.driver_number,
                teamNome: pilota.team_name || record.team_name || 'Team sconosciuto',
                nazionalita: pilota.country_code || 'N/D',
                foto: pilota.headshot_url || '',
                ...creaStatistiche(record)
            };
        });

        const scuderieNormalizzate = classificaScuderie.map((record, indice) => ({
            nome: record.team_name || record.name || `Team ${indice + 1}`,
            posizione: valoreNumero(record.position, indice + 1),
            punti: valoreNumero(record.points),
            coloreTeam: String(primoValore(record, ['team_colour', 'team_color'], 'D50000')).replace('#', ''),
            ...creaStatistiche(record),
            stagioni: valoreNumero(record.seasons, null)
        }));

        return {
            anno: annoUsato,
            meeting: datiGara.meeting,
            sessione: datiGara.gara,
            piloti: pilotiNormalizzati,
            scuderie: scuderieNormalizzate.length > 0
                ? scuderieNormalizzate
                : aggregaScuderieDaPiloti(pilotiNormalizzati)
        };
    };

    const aggregaScuderieDaPiloti = (piloti) => {
        const gruppi = new Map();
        piloti.forEach(pilota => {
            const precedente = gruppi.get(pilota.teamNome) || {
                nome: pilota.teamNome, punti: 0, podi: 0, giriVeloci: 0,
                poles: 0, vittorie: 0, dnf: 0, stagioni: null, coloreTeam: 'D50000'
            };
            precedente.punti += pilota.punti;
            precedente.podi += pilota.podi;
            precedente.giriVeloci += pilota.giriVeloci;
            precedente.poles += pilota.poles;
            precedente.vittorie += pilota.vittorie;
            precedente.dnf += pilota.dnf;
            gruppi.set(pilota.teamNome, precedente);
        });
        return [...gruppi.values()].sort((primo, secondo) => secondo.punti - primo.punti)
            .map((scuderia, indice) => ({ ...scuderia, posizione: indice + 1 }));
    };

    return { carica };
})();