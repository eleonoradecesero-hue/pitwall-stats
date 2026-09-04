# Pitwall Stats

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)](https://developer.mozilla.org/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=111111)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Vue 3](https://img.shields.io/badge/Vue%203-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vuetify](https://img.shields.io/badge/Vuetify-1867C0?logo=vuetify&logoColor=white)](https://vuetifyjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=111111)](https://firebase.google.com/)
[![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-222222?logo=github)](https://pages.github.com/)

Applicazione web front-end dedicata alla Formula 1. **Pitwall Stats** raccoglie in un unico spazio calendario, risultati, classifiche, panoramica di piloti e scuderie, analisi delle sessioni e pronostici personali.

Il progetto è stato realizzato come applicazione single-page in HTML5, CSS e JavaScript, utilizzando Vue 3 e Vuetify tramite CDN. I dati sportivi vengono recuperati da API esterne, mentre autenticazione, profili personali, preferiti e pronostici sono gestiti con Firebase Authentication e Cloud Firestore.

## Indice

- [Obiettivo](#obiettivo)
- [Funzionalità](#funzionalità)
- [Dimostrazione dei requisiti](#dimostrazione-dei-requisiti)
- [Architettura](#architettura)
- [Struttura del progetto](#struttura-del-progetto)
- [Tecnologie e servizi](#tecnologie-e-servizi)
- [Installazione locale](#installazione-locale)
- [Configurazione Firebase](#configurazione-firebase)
- [Pubblicazione online](#pubblicazione-online)
- [Accessibilità e responsive design](#accessibilità-e-responsive-design)
- [Gestione degli errori e dati mancanti](#gestione-degli-errori-e-dati-mancanti)
- [Sviluppi futuri](#sviluppi-futuri)

## Obiettivo

L’obiettivo è fornire un pannello informativo e interattivo per seguire una stagione di Formula 1. L’applicazione non si limita a mostrare pagine statiche: ogni sezione recupera, trasforma e presenta dati reali, mentre l’utente autenticato può modificare e salvare le proprie informazioni.

L’esperienza è organizzata attorno alla navigazione laterale. Dalla stessa applicazione si può passare dalla situazione del prossimo Gran Premio al calendario storico, consultare le classifiche, esplorare piloti e scuderie, analizzare i dati di una sessione e compilare pronostici.

## Funzionalità

### Home

- Mostra il prossimo Gran Premio e il circuito.
- Visualizza il countdown verso l’inizio del weekend o verso la gara.
- Indica se una sessione è in programma, in corso o conclusa.
- Elenca le sessioni del weekend: prove libere, qualifiche, Sprint e gara.
- Disabilita il pulsante dei risultati quando i dati non sono ancora disponibili.

### Calendario

- Permette di scegliere la stagione.
- Divide le gare future da quelle concluse.
- Mostra round, data, orario, circuito e sigla del paese.
- Apre una finestra con l’ordine d’arrivo ufficiale.
- Esclude dall’archivio le gare passate annullate o prive di risultati ufficiali.

### Classifiche

- Mostra il campionato piloti e il campionato costruttori.
- Permette di selezionare l’anno e il tipo di classifica.
- Presenta il podio con foto, scuderia, punti e vittorie.
- Offre una tabella completa con ricerca, nazionalità, distacco e punti.
- Apre il dettaglio del pilota o della scuderia selezionata.

### Piloti e Scuderie

- Mostra una panoramica dei piloti e delle scuderie ufficiali.
- Presenta foto, loghi, posizione, punti, vittorie e statistiche.
- Permette di aprire una vista dettagliata dell’elemento scelto.
- Usa un selettore distinto e visibile per passare da Piloti a Scuderie.

### Profilo e preferiti

- Permette di creare un account con email e password.
- Mantiene anche l’accesso tramite Google.
- Salva nome, cognome, email e dati del profilo in Firestore.
- Permette di selezionare fino a due piloti preferiti e una scuderia preferita.
- Salva le preferenze personali nell’account Firebase.
- Mostra i preferiti in un layout ordinato con i due piloti ai lati e la scuderia al centro.

### Pronostici

- Richiede l’autenticazione per partecipare.
- Permette di selezionare il poleman e i tre piloti del podio.
- Impedisce di selezionare lo stesso pilota in più posizioni del podio.
- Chiude il pronostico all’inizio delle qualifiche.
- Gestisce separatamente il pronostico della gara e quello della Sprint quando previsto.
- Salva ogni pronostico nello spazio personale dell’utente.
- Mostra lo storico e i punti assegnati.

Il sistema assegna 10 punti per il poleman corretto e somma i punti ufficiali ottenuti dai piloti indicati sul podio. Se i risultati non sono ancora pubblicati, il pronostico resta in attesa di valutazione.

### Analisi sessioni

- Recupera meeting e sessioni da OpenF1.
- Analizza prove libere, qualifiche, Sprint e gara.
- Visualizza tempi, settori, giri, distacchi, gomme, pit stop e telemetria quando disponibile.
- Evidenzia i valori migliori nelle tabelle.
- Utilizza una cache locale e, quando configurato, una cache Firestore.

## Dimostrazione dei requisiti

### Almeno cinque schermate raggiungibili tramite navigazione

Il router Vue definito in `js/main.js` registra sei sezioni principali:

1. Home (`/`)
2. Calendario (`/calendario`)
3. Classifica (`/classifica`)
4. Piloti e Scuderie (`/panoramica`)
5. Profilo e Preferiti (`/profilo`)
6. Pronostici (`/pronostici`)
7. Analisi sessioni (`/analisi`)

La navigazione è accessibile dal menu laterale presente in `index.html`.

### Massimo una schermata statica

Le schermate non sono pagine testuali statiche. Home, Calendario, Classifiche, Panoramica, Pronostici e Analisi eseguono richieste API, applicano filtri, cambiano stato, mostrano dialoghi o permettono interazioni con i dati. Anche Profilo contiene form, stato di autenticazione e preferenze modificabili.

### Login utente

L’autenticazione è implementata in `js/firebase_service.js` tramite Firebase Authentication. Sono disponibili:

- registrazione con email e password;
- accesso con email e password;
- accesso con account Google;
- osservazione dello stato tramite `onAuthStateChanged`;
- logout.

Al momento della registrazione viene creato anche il documento personale Firestore `utenti/{uid}`.

### Due interazioni che modificano i dati dell’utente

Il progetto ne implementa più di due:

- selezione e salvataggio di due piloti preferiti e di una scuderia;
- compilazione e salvataggio di un pronostico tramite form Vue con `v-model`;
- aggiornamento dei punti del pronostico dopo la pubblicazione dei risultati;
- aggiornamento dei dati del profilo personale.

### Database con lettura e scrittura

Cloud Firestore viene usato per:

- leggere e salvare il documento del profilo;
- salvare e leggere i preferiti;
- salvare e leggere la sottocollezione `pronostici` dell’utente;
- memorizzare i risultati di analisi nella collezione `analisi` quando disponibile.

Le regole in `firestore.rules` vincolano la lettura e la scrittura del profilo e dei pronostici all’utente proprietario, verificando `request.auth.uid`.

### API o database popolato

L’applicazione utilizza dati reali da due servizi esterni:

- **Jolpica F1 API**, compatibile con Ergast, per calendario, classifiche, risultati, piloti e scuderie;
- **OpenF1**, per meeting, sessioni, tempi, meteo, gomme, pit stop e telemetria.

Le richieste Jolpica sono centralizzate in `js/api.js`, normalizzate dai service e arricchite con colori, foto, loghi e sigle nazionali.

### Responsiveness

Il layout utilizza le griglie responsive di Vuetify (`v-row`, `v-col`) e classi con breakpoint per adattarsi a computer, tablet e telefono. Le card del podio, le tabelle, i form e i selettori hanno dimensioni e disposizione dedicate per evitare sovrapposizioni sui viewport più stretti.

### Accessibilità

Sono stati utilizzati componenti semantici e controlli Vuetify con:

- etichette nei campi form;
- icone Material Design accompagnate da testo quando il comando lo richiede;
- testo alternativo per le immagini dei piloti e dei loghi;
- stati visivi distinti per sessioni live, future e concluse;
- contrasto elevato nelle intestazioni e negli stati importanti;
- pulsanti di chiusura con `aria-label` nei dialoghi;
- navigazione organizzata e coerente tramite menu laterale.

### Tecnologie del corso

Il progetto è scritto in HTML5, CSS3 e JavaScript moderno. Vue 3 gestisce stato, componenti, template e routing; Vuetify fornisce i componenti dell’interfaccia e il sistema responsive. Non è richiesto un server Node tradizionale per eseguire il front-end.

### Solo front-end

L’applicazione è pubblicabile come sito statico. Firebase fornisce i servizi remoti di autenticazione e database, mentre le API esterne forniscono i dati sportivi. Non è presente un backend custom da avviare.

## Architettura

Il flusso dei dati è organizzato in tre livelli:

```text
index.html
	 |
	 +-- Vue 3 + Vue Router + Vuetify
	 |
	 +-- schermate/       Template e interazioni delle pagine
	 |
	 +-- servizi/         Normalizzazione e logica applicativa
	 |
	 +-- api.js           Chiamate Jolpica F1
	 |
	 +-- firebase_service.js
				|
				+-- Firebase Authentication
				+-- Cloud Firestore
```

Le schermate non chiamano direttamente ogni endpoint: delegano il recupero e la trasformazione ai service. Questo mantiene separati interfaccia, dati e logica di dominio.

## Struttura del progetto

```text
pitwall-stats/
├── index.html
├── firestore.rules
├── README.md
├── test_api.html
├── css/
│   ├── style.css
│   └── test_api.css
└── js/
	 ├── api.js
	 ├── firebase_config.js
	 ├── firebase_service.js
	 ├── main.js
	 ├── utility.js
	 ├── schermate/
	 │   ├── schermata_analisi.js
	 │   ├── schermata_calendario.js
	 │   ├── schermata_classifica.js
	 │   ├── schermata_home.js
	 │   ├── schermata_panoramica.js
	 │   ├── schermata_profilo.js
	 │   └── schermata_pronostici.js
	 └── servizi/
		  ├── analisi_service.js
		  ├── calendario_service.js
		  ├── classifica_service.js
		  ├── home_service.js
		  ├── panoramica_service.js
		  ├── profilo_service.js
		  └── pronostici_service.js
```

## Tecnologie e servizi

| Tecnologia | Utilizzo |
| --- | --- |
| HTML5 | Struttura della pagina e caricamento degli asset |
| CSS3 | Stili personalizzati, responsive design e stati visivi |
| JavaScript | Logica applicativa e integrazione API |
| Vue 3 | Stato reattivo, template e schermate |
| Vue Router | Navigazione tra le sezioni |
| Vuetify 3 | Componenti UI, griglia responsive e Material Design |
| Firebase Authentication | Account email/password e Google |
| Cloud Firestore | Profili, preferiti, pronostici e cache analisi |
| Jolpica F1 API | Calendario, risultati e classifiche |
| OpenF1 API | Sessioni, telemetria e dati analitici |

## Installazione locale

Non sono necessari `npm install` o una build Node per il progetto base.

1. Clonare il repository:

	```bash
	git clone https://github.com/eleonoradecesero-hue/pitwall-stats.git
	cd pitwall-stats
	```

2. Avviare un server statico locale. Per esempio, con l’estensione **Live Server** di VS Code, aprire `index.html` tramite **Open with Live Server**.

	In alternativa, con Python installato:

	```bash
	python -m http.server 8000
	```

3. Aprire `http://localhost:8000`.

L’uso di un server locale è consigliato perché alcune funzionalità del browser, Firebase e le richieste remote possono comportarsi diversamente se il file viene aperto direttamente con `file://`.

## Configurazione Firebase

La configurazione web si trova in `js/firebase_config.js`. I valori web Firebase possono essere presenti nel front-end; la sicurezza non dipende dal nascondere la configurazione, ma dalle regole Firestore e dai domini autorizzati.

Per abilitare completamente gli account:

1. Aprire il progetto Firebase `pitwall-stats`.
2. In **Authentication > Sign-in method**, abilitare **Email/Password**.
3. Abilitare **Google** se si vuole mantenere anche l’accesso Google.
4. In **Firestore Database > Rules**, pubblicare le regole contenute in `firestore.rules`.
5. In **Authentication > Settings > Authorized domains**, aggiungere il dominio usato dal sito, per esempio `eleonoradecesero-hue.github.io`.

Le regole previste sono:

- ogni utente può leggere e modificare soltanto il proprio documento `utenti/{userId}`;
- ogni utente può leggere e modificare soltanto i propri `pronostici`;
- la cache `analisi` è leggibile pubblicamente;
- la scrittura della cache analisi richiede autenticazione.

## Pubblicazione online

Il progetto è compatibile con GitHub Pages perché contiene un front-end statico con `index.html` nella root.

1. Eseguire il push del branch `main` su GitHub.
2. Aprire **Settings > Pages** del repository.
3. Selezionare **Deploy from a branch**.
4. Scegliere branch `main` e cartella `/ (root)`.
5. Salvare e attendere il completamento del deploy.
6. Autorizzare il dominio GitHub Pages in Firebase Authentication.

URL di pubblicazione attuale:

<https://eleonoradecesero-hue.github.io/pitwall-stats/>

Per la produzione `index.html` carica i bundle `vue.global.prod.js` e `vue-router.global.prod.js`, così il sito utilizza le build production delle librerie principali.

## Gestione degli errori e dati mancanti

L’applicazione distingue tra dati non ancora pubblicati e problemi tecnici:

- se una sessione è in corso, tempi e telemetria possono non essere ancora disponibili; la schermata Analisi mostra un’informazione dedicata e invita a riprovare più tardi;
- se una gara passata non ha risultati, non viene mostrata nell’archivio delle gare concluse;
- una gara annullata non apre una scheda di risultati vuota;
- gli errori di rete vengono gestiti dai service senza interrompere inutilmente le altre sezioni;
- le richieste Jolpica possono essere mantenute in cache durante la sessione del browser;
- i dati opzionali di OpenF1, come meteo e telemetria, possono mancare senza impedire la visualizzazione dei dati principali.

Le sigle dei paesi sono normalizzate in `utility.js`. Per i Gran Premi viene usato un resolver dedicato che considera paese, nome della gara e circuito, così varianti come Mexico City e Bahrain vengono rappresentate rispettivamente come `MEX` e `BHR`.

## Sviluppi futuri

Possibili evoluzioni del progetto:

- aggiungere recupero password e verifica email;
- permettere all’utente di modificare tutti i dati anagrafici dal Profilo;
- introdurre paginazione e ordinamento avanzato nelle tabelle;
- aggiungere grafici interattivi all’Analisi sessioni;
- mostrare uno storico più ricco dei punteggi dei pronostici;
- aggiungere test automatici per i normalizzatori e il calcolo dei punti;
- gestire notifiche per l’apertura e la chiusura dei pronostici.

## Licenza e fonti dati

Il progetto è sviluppato a scopo didattico. I dati sportivi sono forniti da servizi esterni e possono dipendere dalla loro disponibilità e dalle loro politiche di utilizzo:

- [Jolpica F1 API](https://api.jolpi.ca/ergast/f1/)
- [OpenF1](https://openf1.org/)
- [Firebase](https://firebase.google.com/)
- [Vuetify](https://vuetifyjs.com/)