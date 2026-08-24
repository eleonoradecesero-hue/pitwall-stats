// js/servizi/profilo_service.js

const ProfiloService = {
    datiUtentePredefiniti: {
        nome: '',
        cognome: '',
        email: '',
        cellulare: '',
        nomeUtente: '',
        avatar: '',
        puntiAccumulati: 0
    },

    async caricaListe() {
        const dati = await PanoramicaService.carica();
        return {
            piloti: dati.piloti.map(pilota => ({
                ...pilota,
                id: String(pilota.numero || pilota.nome)
            })),
            scuderie: dati.scuderie.map(scuderia => ({
                ...scuderia,
                id: String(scuderia.nome).toLowerCase()
            }))
        };
    },

    estraiNomeGoogle(utente, profilo = {}) {
        const partiNome = (utente?.displayName || '').trim().split(/\s+/).filter(Boolean);
        return {
            nome: partiNome.shift() || profilo.nome || '',
            cognome: partiNome.join(' ') || profilo.cognome || ''
        };
    },

    costruisciDatiUtente(utente, profilo = {}) {
        const nomeGoogle = this.estraiNomeGoogle(utente, profilo);
        return {
            ...this.datiUtentePredefiniti,
            ...profilo,
            ...nomeGoogle,
            email: utente?.email || profilo.email || ''
        };
    },

    costruisciPreferiti(profilo = {}) {
        return {
            piloti: Array.isArray(profilo.preferitiPiloti) ? profilo.preferitiPiloti.slice(0, 2) : [],
            scuderia: profilo.preferitaScuderia || null
        };
    },

    async caricaProfilo(utente) {
        const profilo = await FirebaseService.caricaProfilo(utente.uid);
        return {
            datiUtente: this.costruisciDatiUtente(utente, profilo),
            preferiti: this.costruisciPreferiti(profilo)
        };
    },

    async salvaDatiUtente(utente, datiUtente) {
        await FirebaseService.salvaProfilo(utente.uid, datiUtente);
    },

    async salvaPreferiti(utente, preferiti) {
        const datiPreferiti = {
            piloti: (preferiti.piloti || []).slice(0, 2),
            scuderia: preferiti.scuderia || null
        };
        await FirebaseService.salvaProfilo(utente.uid, {
            preferitiPiloti: datiPreferiti.piloti,
            preferitaScuderia: datiPreferiti.scuderia
        });
        return datiPreferiti;
    },

    configurato() {
        return FirebaseService.configurato();
    },

    accediConGoogle() {
        return FirebaseService.accediConGoogle();
    },

    esci() {
        return FirebaseService.esci();
    },

    osservaAutenticazione(callback) {
        return FirebaseService.osservaAutenticazione(callback);
    }
};
