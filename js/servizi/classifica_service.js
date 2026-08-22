// js/servizi/classifica_service.js

/**
 * ======================================================================================
 * PITWALL STATS - SERVIZIO CLASSIFICA (ClassificaService)
 * ======================================================================================
 * Questo servizio recupera le classifiche mondiali Piloti e Costruttori
 * interrogando in tempo reale gli endpoint Jolpica F1 API:
 * - /driverStandings.json per i Piloti
 * - /constructorStandings.json per i Costruttori
 * 
 * I dati vengono normalizzati e arricchiti dinamicamente con foto reali,
 * codici colore ufficiali, loghi delle scuderie e bandiere nazionali.
 * ======================================================================================
 */

const ClassificaService = {

    /**
     * Recupera ed elabora la classifica Piloti per una data stagione.
     * @param {string|number} [anno='current'] - Stagione selezionata
     * @returns {Promise<Array>} - Array dei piloti in classifica
     */
    async recuperaClassificaPiloti(anno = 'current') {
        const queryAnno = (anno === 2026 || anno === new Date().getFullYear()) ? 'current' : anno;
        const rispostaApi = await recuperaClassificaPiloti(queryAnno);
        const pilotiStandings = rispostaApi?.piloti || [];

        if (pilotiStandings.length === 0) return [];

        const puntiPrimo = Number(pilotiStandings[0]?.points || 0);

        return pilotiStandings.map(item => {
            const nomeCompleto = `${item.Driver.givenName} ${item.Driver.familyName}`;
            const nomeTeam = item.Constructors?.[0]?.name || 'Team sconosciuto';
            const punti = Number(item.points || 0);
            const posizione = Number(item.position || 1);

            return {
                posizione: posizione,
                nome: nomeCompleto,
                nomeBreve: `${item.Driver.givenName[0]}. ${item.Driver.familyName}`,
                sigla: item.Driver.code || item.Driver.familyName.slice(0, 3).toUpperCase(),
                numero: item.Driver.permanentNumber || item.Driver.driverId,
                scuderia: nomeTeam,
                coloreTeam: UtilityF1.ottieniColoreScuderia(nomeTeam),
                nazionalita: item.Driver.nationality || 'N/D',
                bandieraNazionalita: UtilityF1.ottieniBandieraNazionalita(item.Driver.nationality),
                punti: punti,
                vittorie: Number(item.wins || 0),
                deltaDalPrimo: puntiPrimo - punti,
                foto: UtilityF1.ottieniFotoPilota(nomeCompleto),
                round: rispostaApi.round,
                stagione: rispostaApi.stagione
            };
        });
    },

    /**
     * Recupera ed elabora la classifica Costruttori per una data stagione.
     * @param {string|number} [anno='current'] - Stagione selezionata
     * @returns {Promise<Array>} - Array delle scuderie in classifica
     */
    async recuperaClassificaCostruttori(anno = 'current') {
        const queryAnno = (anno === 2026 || anno === new Date().getFullYear()) ? 'current' : anno;
        const rispostaApi = await recuperaClassificaCostruttori(queryAnno);
        const costruttoriStandings = rispostaApi?.costruttori || [];

        if (costruttoriStandings.length === 0) return [];

        const puntiPrima = Number(costruttoriStandings[0]?.points || 0);

        return costruttoriStandings.map(item => {
            const nomeTeam = item.Constructor.name || 'Team sconosciuto';
            const punti = Number(item.points || 0);
            const posizione = Number(item.position || 1);

            return {
                posizione: posizione,
                nome: nomeTeam,
                costruttoreId: item.Constructor.constructorId,
                scuderia: nomeTeam,
                coloreTeam: UtilityF1.ottieniColoreScuderia(nomeTeam),
                nazionalita: item.Constructor.nationality || 'N/D',
                bandieraNazionalita: UtilityF1.ottieniBandieraNazionalita(item.Constructor.nationality),
                punti: punti,
                vittorie: Number(item.wins || 0),
                deltaDallaPrima: puntiPrima - punti,
                logo: UtilityF1.ottieniLogoScuderia(nomeTeam),
                round: rispostaApi.round,
                stagione: rispostaApi.stagione
            };
        });
    },

    /**
     * METODO PRINCIPALE
     * Recupera entrambe le classifiche contemporaneamente tramite Promise.all.
     * @param {string|number} [anno=2026] - Anno selezionato
     * @returns {Promise<{piloti: Array, scuderie: Array, sorgenteDati: string}>}
     */
    async recuperaClassifiche(anno = 2026) {
        console.log(`[ClassificaService] 🏆 Recupero classifiche live per la stagione ${anno}...`);

        const [piloti, scuderie] = await Promise.all([
            this.recuperaClassificaPiloti(anno),
            this.recuperaClassificaCostruttori(anno)
        ]);

        return {
            piloti: piloti,
            scuderie: scuderie,
            sorgenteDati: `Jolpica Ergast F1 API (Stagione ${anno})`
        };
    }
};
