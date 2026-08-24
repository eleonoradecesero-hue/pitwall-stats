// js/firebase_service.js

const FirebaseService = {
    inizializzato: false,
    autenticazione: null,
    database: null,

    inizializza() {
        if (this.inizializzato) return true;
        if (typeof firebase === 'undefined' || typeof CONFIGURAZIONE_FIREBASE === 'undefined') return false;
        if (CONFIGURAZIONE_FIREBASE.apiKey.startsWith('INSERISCI_')) return false;

        firebase.initializeApp(CONFIGURAZIONE_FIREBASE);
        this.autenticazione = firebase.auth();
        this.database = firebase.firestore();
        this.inizializzato = true;
        return true;
    },

    configurato() {
        return this.inizializza();
    },

    async accediConGoogle() {
        if (!this.inizializza()) throw new Error('Configura Firebase in js/firebase_config.js prima di accedere.');
        const provider = new firebase.auth.GoogleAuthProvider();
        const risultato = await this.autenticazione.signInWithPopup(provider);
        return risultato.user;
    },

    async esci() {
        if (this.autenticazione) await this.autenticazione.signOut();
    },

    osservaAutenticazione(callback) {
        if (!this.inizializza()) return () => {};
        return this.autenticazione.onAuthStateChanged(callback);
    },

    async caricaProfilo(uid) {
        if (!this.database || !uid) return {};
        const documento = await this.database.collection('utenti').doc(uid).get();
        return documento.exists ? documento.data() : {};
    },

    async salvaProfilo(uid, dati) {
        if (!this.database || !uid) return;
        await this.database.collection('utenti').doc(uid).set({
            ...dati,
            aggiornatoIl: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }
};