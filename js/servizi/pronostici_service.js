// js/servizi/pronostici_service.js

const PronosticiService = {
    pilotaId(pilota) {
        return String(pilota?.sigla || pilota?.numero || pilota?.driverId || pilota?.nome || '').toUpperCase();
    },

    sessioneQualifica(gara, sprint = false) {
        const nome = sprint ? 'Qualifiche Sprint' : 'Qualifiche';
        return gara?.sessioni?.find(sessione => sessione.nome === nome) || null;
    },

    costruisciEventi(gara) {
        if (!gara) return [];
        const eventi = [];
        if (gara.sessioni?.some(sessione => sessione.nome === 'Gara Sprint')) {
            eventi.push({
                id: `${gara.stagione}-${gara.round}-sprint`, tipo: 'sprint', titolo: 'Gara Sprint', gara,
                sessioneQualifica: this.sessioneQualifica(gara, true),
                sessioneGara: gara.sessioni.find(sessione => sessione.nome === 'Gara Sprint')
            });
        }
        eventi.push({
            id: `${gara.stagione}-${gara.round}-gara`, tipo: 'gara', titolo: gara.nome || 'Gara principale', gara,
            sessioneQualifica: this.sessioneQualifica(gara),
            sessioneGara: gara.sessioneGara || gara.sessioni?.find(sessione => sessione.nome === 'Gara')
        });
        return eventi.filter(evento => evento.sessioneGara && evento.sessioneQualifica);
    },

    scadenza(evento) {
        return evento?.sessioneQualifica?.dataInizio || new Date(evento?.sessioneQualifica?.inizioIso);
    },

    scaduto(evento, adesso = new Date()) {
        const scadenza = this.scadenza(evento);
        return !scadenza || Number.isNaN(scadenza.getTime()) || adesso.getTime() >= scadenza.getTime();
    },

    creaPronosticoVuoto(evento) {
        return { eventoId: evento.id, tipo: evento.tipo, poleman: '', podio: ['', '', ''] };
    },

    validaPronostico(pronostico, evento, adesso = new Date()) {
        if (!evento) return 'Evento non disponibile.';
        if (this.scaduto(evento, adesso)) return 'Le qualifiche sono già iniziate: il pronostico è chiuso.';
        if (!pronostico?.poleman || !Array.isArray(pronostico.podio) || pronostico.podio.length !== 3 || pronostico.podio.some(pilota => !pilota)) {
            return 'Seleziona il poleman e tutti i tre piloti del podio.';
        }
        const piloti = pronostico.podio.map(String);
        if (new Set(piloti).size !== piloti.length) return 'Ogni posizione deve avere un pilota diverso.';
        return '';
    },

    calcolaPunti(pronostico, risultatiGara = [], risultatiQualifica = []) {
        // Il poleman vale 10 punti; il podio usa i punti ufficiali assegnati in gara o Sprint.
        const risultatoPerPilota = new Map(risultatiGara.map(risultato => [this.pilotaId({ sigla: risultato.Driver?.code, numero: risultato.number, driverId: risultato.Driver?.driverId }), risultato]));
        const qualificaPole = risultatiQualifica.find(risultato => Number(risultato.position) === 1);
        const poleId = this.pilotaId({ sigla: qualificaPole?.Driver?.code, numero: qualificaPole?.number, driverId: qualificaPole?.Driver?.driverId });
        const puntiPodio = (pronostico?.podio || []).reduce((totale, pilotaId) => totale + Number(risultatoPerPilota.get(String(pilotaId).toUpperCase())?.points || 0), 0);
        const puntiPole = pronostico?.poleman === poleId ? 10 : 0;
        return { poleman: puntiPole, podio: puntiPodio, totale: puntiPole + puntiPodio };
    },

    async salva(uid, evento, pronostico) {
        if (!FirebaseService.database) FirebaseService.inizializza();
        if (!FirebaseService.database || !uid) throw new Error('Accedi al tuo account per salvare il pronostico.');
        const errore = this.validaPronostico(pronostico, evento);
        if (errore) throw new Error(errore);
        const dati = {
            eventoId: evento.id, stagione: Number(evento.gara.stagione), round: String(evento.gara.round),
            granPremio: evento.gara.nome, tipo: evento.tipo, poleman: String(pronostico.poleman),
            podio: pronostico.podio.map(String), scadenzaIso: this.scadenza(evento).toISOString(), punti: null,
            aggiornatoIl: firebase.firestore.FieldValue.serverTimestamp()
        };
        await FirebaseService.database.collection('utenti').doc(uid).collection('pronostici').doc(evento.id).set(dati, { merge: true });
        return dati;
    },

    async caricaStorico(uid) {
        if (!FirebaseService.database || !uid) return [];
        const snapshot = await FirebaseService.database.collection('utenti').doc(uid).collection('pronostici').get();
        return snapshot.docs.map(documento => ({ id: documento.id, ...documento.data() }))
            .sort((primo, secondo) => String(secondo.scadenzaIso || '').localeCompare(String(primo.scadenzaIso || '')));
    },

    async calcolaERegistraPunti(uid, pronostico) {
        if (pronostico.punti !== null && pronostico.punti !== undefined) return pronostico;
        const risultatiGara = pronostico.tipo === 'sprint' ? await recuperaRisultatiSprint(pronostico.stagione, pronostico.round) : await recuperaRisultatiGara(pronostico.stagione, pronostico.round);
        const risultatiQualifica = pronostico.tipo === 'sprint' ? await recuperaRisultatiQualificheSprint(pronostico.stagione, pronostico.round) : await recuperaRisultatiQualifiche(pronostico.stagione, pronostico.round);
        if (!risultatiGara.length || !risultatiQualifica.length) return pronostico;
        const punti = this.calcolaPunti(pronostico, risultatiGara, risultatiQualifica);
        await FirebaseService.database.collection('utenti').doc(uid).collection('pronostici').doc(pronostico.id).update({ punti: punti.totale, dettaglioPunti: punti, valutatoIl: firebase.firestore.FieldValue.serverTimestamp() });
        return { ...pronostico, punti: punti.totale, dettaglioPunti: punti };
    }
};