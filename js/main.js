const { createApp, ref } = Vue;
const { createVuetify } = Vuetify;
const { createRouter, createWebHashHistory } = VueRouter;

/**
 * CONFIGURAZIONE DEL ROUTER
 * Associa i link del menu (es. "/profilo") ai componenti creati sopra.
 */
const rotteApplicazione = [
    { path: '/', component: SchermataIniziale },
    { path: '/calendario', component: SchermataCalendario },
    { path: '/classifica', component: SchermataClassifica },
    { path: '/panoramica', component: SchermataPanoramica },
    { path: '/profilo', component: SchermataProfilo },
    { path: '/pronostici', component: SchermataPronostici }
];

const gestoreDiRotte = createRouter({
    history: createWebHashHistory(),
    routes: rotteApplicazione
});

/**
 * INIZIALIZZAZIONE DELL'APPLICAZIONE VUE
 */
const applicazioneF1 = createApp({
    setup() {
        // Variabile per controllare se il menu laterale è aperto o chiuso
        const menuLateraleAperto = ref(false);
        
        return {
            menuLateraleAperto
        };
    }
});

// Aggiungiamo Vuetify e il Router all'applicazione
const vuetify = createVuetify();
applicazioneF1.use(vuetify);
applicazioneF1.use(gestoreDiRotte);

// Montiamo l'app nel div con id="app" dell'index.html
applicazioneF1.mount('#app');