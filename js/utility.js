// js/utility.js

/**
 * ======================================================================================
 * PITWALL STATS - FUNZIONI DI UTILITÀ E FORMATTAZIONE CONDIVISE (Utility)
 * ======================================================================================
 * Questo modulo contiene tutte le funzioni di supporto comuni all'applicazione:
 * - Formattazione date e orari con fuso orario italiano
 * - Mappatura automatica delle bandiere nazionali dei Gran Premi e delle nazionalità dei piloti
 * - Codici colore ufficiali e loghi SVG per le scuderie di Formula 1
 * - Mappatura delle foto dei piloti
 * - Traduzione dei nomi delle sessioni in italiano chiaro
 * ======================================================================================
 */

const UtilityF1 = {

    /**
     * Mappa dei colori istituzionali per ciascuna scuderia di Formula 1
     */
    coloriScuderie: {
        'ferrari': '#E8002D',
        'scuderia ferrari': '#E8002D',
        'scuderia ferrari hp': '#E8002D',
        'mercedes': '#27F4D2',
        'mercedes-amg petronas': '#27F4D2',
        'mercedes-amg petronas f1 team': '#27F4D2',
        'mclaren': '#FF8000',
        'mclaren f1 team': '#FF8000',
        'mclaren mastercard f1 team': '#FF8000',
        'red bull': '#3671C6',
        'red bull racing': '#3671C6',
        'aston martin': '#229971',
        'aston martin aramco f1 team': '#229971',
        'alpine': '#0093CC',
        'alpine f1 team': '#0093CC',
        'williams': '#64C4FF',
        'williams racing': '#64C4FF',
        'haas': '#B6BABD',
        'moneygram haas f1 team': '#B6BABD',
        'haas f1 team': '#B6BABD',
        'sauber': '#52E252',
        'kick sauber': '#52E252',
        'stake f1 team kick sauber': '#52E252',
        'audi': '#E30613',
        'rb': '#6692FF',
        'racing bulls': '#6692FF',
        'visa cash app rb f1 team': '#6692FF',
        'cadillac': '#909090',
        'toro rosso': '#469BFF',
        'alphatauri': '#5E8FAA'
    },

    /**
     * Mappa dei loghi SVG vettoriali delle scuderie
     */
    loghiScuderie: {
        'mercedes': 'https://cdn.worldvectorlogo.com/logos/mercedes-amg-petronas-f1.svg',
        'ferrari': 'https://cdn.worldvectorlogo.com/logos/scuderia-ferrari-1.svg',
        'mclaren': 'https://cdn.worldvectorlogo.com/logos/mclaren-f1-2.svg',
        'red bull': 'https://cdn.worldvectorlogo.com/logos/red-bull-racing.svg',
        'aston martin': 'https://cdn.worldvectorlogo.com/logos/aston-martin-f1-team.svg',
        'alpine': 'https://cdn.worldvectorlogo.com/logos/alpine-f1-team.svg',
        'williams': 'https://cdn.worldvectorlogo.com/logos/williams-grand-prix-engineering.svg',
        'haas': 'https://cdn.worldvectorlogo.com/logos/haas-f1-team-1.svg',
        'sauber': 'https://cdn.worldvectorlogo.com/logos/sauber-f1-team.svg',
        'rb': 'https://cdn.worldvectorlogo.com/logos/scuderia-alphatauri.svg'
    },

    /**
     * Mappa delle foto dei piloti
     */
    fotoPiloti: {
        'antonelli': 'https://media.formula1.com/content/dam/fom-website/drivers/A/ANDANT01_Andrea%20Kimi_Antonelli/andant01.png.transform/1col/image.png',
        'hamilton': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png.transform/1col/image.png',
        'russell': 'https://www.formula1.com/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png.transform/1col/image.png',
        'leclerc': 'https://www.formula1.com/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png.transform/1col/image.png',
        'norris': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png.transform/1col/image.png',
        'piastri': 'https://www.formula1.com/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png.transform/1col/image.png',
        'verstappen': 'https://www.formula1.com/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png.transform/1col/image.png',
        'sainz': 'https://www.formula1.com/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png.transform/1col/image.png',
        'alonso': 'https://www.formula1.com/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png.transform/1col/image.png',
        'stroll': 'https://www.formula1.com/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png.transform/1col/image.png',
        'gasly': 'https://www.formula1.com/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png.transform/1col/image.png',
        'tsunoda': 'https://www.formula1.com/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png.transform/1col/image.png',
        'albon': 'https://www.formula1.com/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png.transform/1col/image.png',
        'hülkenberg': 'https://www.formula1.com/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png.transform/1col/image.png',
        'ocon': 'https://www.formula1.com/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png.transform/1col/image.png',
        'bearman': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png.transform/1col/image.png',
        'lawson': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png.transform/1col/image.pngg',
        'doohan': 'https://www.formula1.com/content/dam/fom-website/drivers/J/JACKDOO01_Jack_Doohan/jackdoo01.png.transform/1col/image.png',
        'bortoleto': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png.transform/1col/image.png',
        'lindblad': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/A/ARVLIN01_Arvid_Lindblad/arvlin01.png.transform/1col/image.png',
        'colapinto': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/F/FRACOL01_Franco_Colapinto/fracol01.png.transform/1col/image.png',
        'bottas': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/V/VALBOT01_Valtteri_Bottas/valbot01.png.transform/1col/image.png',
        'hadjar': 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png.transform/1col/image.png',
        'pérez': 'https://www.formula1.com/content/dam/fom-website/drivers/S/SERPER01_Sergio_Perez/serper01.png.transform/1col/image.png',
    },



    informazioni_piloti: [
        { driver_number: 1, name_acronym: 'NOR', first_name: 'Lando', last_name: 'Norris', team_name: 'McLaren' },
        { driver_number: 3, name_acronym: 'VER', first_name: 'Max', last_name: 'Verstappen', team_name: 'Red Bull Racing' },
        { driver_number: 5, name_acronym: 'BOR', first_name: 'Gabriel', last_name: 'Bortoleto', team_name: 'Audi' },
        { driver_number: 10, name_acronym: 'GAS', first_name: 'Pierre', last_name: 'Gasly', team_name: 'Alpine' },
        { driver_number: 11, name_acronym: 'PER', first_name: 'Sergio', last_name: 'Perez', team_name: 'Cadillac' },
        { driver_number: 12, name_acronym: 'ANT', first_name: 'Kimi', last_name: 'Antonelli', team_name: 'Mercedes' },
        { driver_number: 14, name_acronym: 'ALO', first_name: 'Fernando', last_name: 'Alonso', team_name: 'Aston Martin' },
        { driver_number: 16, name_acronym: 'LEC', first_name: 'Charles', last_name: 'Leclerc', team_name: 'Ferrari' },
        { driver_number: 18, name_acronym: 'STR', first_name: 'Lance', last_name: 'Stroll', team_name: 'Aston Martin' },
        { driver_number: 22, name_acronym: 'TSU', first_name: 'Yuki', last_name: 'Tsunoda', team_name: 'Racing Bulls' },
        { driver_number: 23, name_acronym: 'ALB', first_name: 'Alexander', last_name: 'Albon', team_name: 'Williams' },
        { driver_number: 27, name_acronym: 'HUL', first_name: 'Nico', last_name: 'Hulkenberg', team_name: 'Audi' },
        { driver_number: 30, name_acronym: 'LAW', first_name: 'Liam', last_name: 'Lawson', team_name: 'Red Bull Racing' },
        { driver_number: 31, name_acronym: 'OCO', first_name: 'Esteban', last_name: 'Ocon', team_name: 'Haas F1 Team' },
        { driver_number: 41, name_acronym: 'LIN', first_name: 'Arvid', last_name: 'Lindblad', team_name: 'Racing Bulls' },
        { driver_number: 43, name_acronym: 'COL', first_name: 'Franco', last_name: 'Colapinto', team_name: 'Alpine' },
        { driver_number: 44, name_acronym: 'HAM', first_name: 'Lewis', last_name: 'Hamilton', team_name: 'Ferrari' },
        { driver_number: 55, name_acronym: 'SAI', first_name: 'Carlos', last_name: 'Sainz', team_name: 'Williams' },
        { driver_number: 63, name_acronym: 'RUS', first_name: 'George', last_name: 'Russell', team_name: 'Mercedes' },
        { driver_number: 77, name_acronym: 'BOT', first_name: 'Valtteri', last_name: 'Bottas', team_name: 'Cadillac' },
        { driver_number: 81, name_acronym: 'PIA', first_name: 'Oscar', last_name: 'Piastri', team_name: 'McLaren' },
        { driver_number: 87, name_acronym: 'BEA', first_name: 'Oliver', last_name: 'Bearman', team_name: 'Haas F1 Team' }
    ],

    /**
     * Formatta una data ISO nel formato esteso italiano (es. "Domenica 23 Agosto 2026").
     * @param {string|Date} dataIso - Data in formato ISO o stringa YYYY-MM-DD
     * @returns {string} - Data formattata
     */
    formattaDataLocale(dataIso) {
        if (!dataIso) return 'Data non disponibile';
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) return 'Data non disponibile';

        return new Intl.DateTimeFormat('it-IT', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(data);
    },

    /**
     * Formatta una data ISO nel formato breve italiano (es. "23 Ago 2026").
     */
    formattaDataBreve(dataIso) {
        if (!dataIso) return 'Data N/D';
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) return 'Data N/D';

        return new Intl.DateTimeFormat('it-IT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(data);
    },

    /**
     * Formatta un orario ISO in ora locale italiana (es. "15:00").
     */
    formattaOraLocale(dataIso) {
        if (!dataIso) return '--:--';
        const data = new Date(dataIso);
        if (Number.isNaN(data.getTime())) return '--:--';

        return new Intl.DateTimeFormat('it-IT', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(data);
    },

    /**
     * Converte i nomi inglesi delle sessioni in italiano.
     */
    traduciNomeSessione(nomeOriginale) {
        if (!nomeOriginale) return 'Sessione';
        const n = String(nomeOriginale).toLowerCase().trim();

        if (n.includes('practice 1') || n === 'fp1' || n === 'prove libere 1') return 'Prove Libere 1';
        if (n.includes('practice 2') || n === 'fp2' || n === 'prove libere 2') return 'Prove Libere 2';
        if (n.includes('practice 3') || n === 'fp3' || n === 'prove libere 3') return 'Prove Libere 3';
        if (n.includes('sprint shootout') || n.includes('sprint qualifying') || n.includes('qualifiche sprint')) return 'Qualifiche Sprint';
        if (n.includes('sprint') && !n.includes('qualifying') && !n.includes('shootout')) return 'Gara Sprint';
        if (n.includes('qualifying') || n.includes('qualifica') || n.includes('qualifiche')) return 'Qualifiche';
        if (n.includes('race') || n.includes('gara')) return 'Gara';

        return nomeOriginale;
    },

    /**
     * Ottiene l'emoji della bandiera del paese del Gran Premio.
     */
    ottieniBandieraPaese(paese) {
        if (!paese) return '🏁';
        const p = String(paese).toLowerCase().trim();

        const mappa = {
            'italy': '🇮🇹', 'italia': '🇮🇹', 'ita': '🇮🇹', 'monza': '🇮🇹', 'imola': '🇮🇹',
            'netherlands': '🇳🇱', 'paesi bassi': '🇳🇱', 'nld': '🇳🇱', 'zandvoort': '🇳🇱', 'dutch': '🇳🇱',
            'monaco': '🇲🇨', 'monte carlo': '🇲🇨', 'mco': '🇲🇨',
            'great britain': '🇬🇧', 'united kingdom': '🇬🇧', 'uk': '🇬🇧', 'gbr': '🇬🇧', 'silverstone': '🇬🇧',
            'belgium': '🇧🇪', 'belgio': '🇧🇪', 'bel': '🇧🇪', 'spa': '🇧🇪',
            'spain': '🇪🇸', 'spagna': '🇪🇸', 'esp': '🇪🇸', 'barcelona': '🇪🇸', 'madrid': '🇪🇸',
            'austria': '🇦🇹', 'aut': '🇦🇹', 'spielberg': '🇦🇹', 'red bull ring': '🇦🇹',
            'hungary': '🇭🇺', 'ungheria': '🇭🇺', 'hun': '🇭🇺', 'hungaroring': '🇭🇺',
            'australia': '🇦🇺', 'aus': '🇦🇺', 'melbourne': '🇦🇺',
            'japan': '🇯🇵', 'giappone': '🇯🇵', 'jpn': '🇯🇵', 'suzuka': '🇯🇵',
            'china': '🇨🇳', 'cina': '🇨🇳', 'chn': '🇨🇳', 'shanghai': '🇨🇳',
            'bahrain': '🇧🇭', 'bhr': '🇧🇭', 'sakhir': '🇧🇭',
            'saudi arabia': '🇸🇦', 'arabia saudita': '🇸🇦', 'sau': '🇸🇦', 'jeddah': '🇸🇦',
            'miami': '🇺🇸', 'united states': '🇺🇸', 'usa': '🇺🇸', 'austin': '🇺🇸', 'las vegas': '🇺🇸',
            'canada': '🇨🇦', 'can': '🇨🇦', 'montreal': '🇨🇦',
            'mexico': '🇲🇽', 'messico': '🇲🇽', 'mex': '🇲🇽', 'mexico city': '🇲🇽',
            'brazil': '🇧🇷', 'brasile': '🇧🇷', 'bra': '🇧🇷', 'interlagos': '🇧🇷', 'sao paulo': '🇧🇷',
            'singapore': '🇸🇬', 'sgp': '🇸🇬', 'marina bay': '🇸🇬',
            'azerbaijan': '🇦🇿', 'azerbaigian': '🇦🇿', 'aze': '🇦🇿', 'baku': '🇦🇿',
            'qatar': '🇶🇦', 'qat': '🇶🇦', 'losail': '🇶🇦',
            'abu dhabi': '🇦🇪', 'uae': '🇦🇪', 'yas marina': '🇦🇪'
        };

        for (const [k, v] of Object.entries(mappa)) {
            if (p.includes(k)) return v;
        }
        return '🏁';
    },

    /**
     * Restituisce la sigla ISO alpha-3 della nazionalità del pilota o team.
     */
    ottieniSiglaNazionalita(nazionalita) {
        if (!nazionalita) return 'N/D';
        const n = String(nazionalita).toLowerCase().trim();
        const mappa = {
            italian: 'ITA', italy: 'ITA', ita: 'ITA',
            british: 'GBR', 'great britain': 'GBR', 'united kingdom': 'GBR', gbr: 'GBR', uk: 'GBR',
            monégasque: 'MCO', monegasque: 'MCO', monaco: 'MCO', mco: 'MCO',
            dutch: 'NLD', netherlands: 'NLD', nld: 'NLD',
            australian: 'AUS', australia: 'AUS', aus: 'AUS',
            spanish: 'ESP', spain: 'ESP', esp: 'ESP',
            german: 'DEU', germany: 'DEU', ger: 'DEU', deu: 'DEU',
            french: 'FRA', france: 'FRA', fra: 'FRA',
            japanese: 'JPN', japan: 'JPN', jpn: 'JPN',
            canadian: 'CAN', canada: 'CAN', can: 'CAN',
            mexican: 'MEX', mexico: 'MEX', mex: 'MEX',
            brazilian: 'BRA', brazil: 'BRA', bra: 'BRA',
            'new zealander': 'NZL', 'new zealand': 'NZL', nzl: 'NZL',
            thai: 'THA', thailand: 'THA', tha: 'THA',
            danish: 'DNK', denmark: 'DNK', den: 'DNK', dnk: 'DNK',
            finnish: 'FIN', finland: 'FIN', fin: 'FIN',
            american: 'USA', 'united states': 'USA', usa: 'USA',
            chinese: 'CHN', china: 'CHN', chn: 'CHN',
            austrian: 'AUT', austria: 'AUT', aut: 'AUT',
            swiss: 'CHE', switzerland: 'CHE', che: 'CHE',
            belgian: 'BEL', belgium: 'BEL', bel: 'BEL',
            austrian: 'AUT', austria: 'AUT', aut: 'AUT',
            hungarian: 'HUN', hungary: 'HUN', hun: 'HUN',
            bahrain: 'BHR', bhr: 'BHR',
            'saudi arabia': 'SAU', sau: 'SAU',
            singapore: 'SGP', sgp: 'SGP',
            azerbaijan: 'AZE', aze: 'AZE',
            qatar: 'QAT', qat: 'QAT',
            'abu dhabi': 'ARE', uae: 'ARE', are: 'ARE',
            portuguese: 'PRT', portugal: 'PRT', prt: 'PRT',
            turkish: 'TUR', turkey: 'TUR', tur: 'TUR',
            russian: 'RUS', russia: 'RUS', rus: 'RUS'
        };
        for (const [chiave, sigla] of Object.entries(mappa)) {
            if (n.includes(chiave)) return sigla;
        }
        return n.length === 3 ? n.toUpperCase() : 'N/D';
    },

    /**
     * Ottiene il colore istituzionale di una scuderia
     */
    ottieniColoreScuderia(nomeScuderia) {
        if (!nomeScuderia) return '#D50000';
        const n = String(nomeScuderia).toLowerCase().trim();
        for (const [chiave, colore] of Object.entries(this.coloriScuderie)) {
            if (n.includes(chiave)) return colore;
        }
        return '#D50000';
    },

    /**
     * Ottiene il logo della scuderia
     */
    ottieniLogoScuderia(nomeScuderia) {
        if (!nomeScuderia) return '';
        const n = String(nomeScuderia).toLowerCase().trim();
        for (const [chiave, logo] of Object.entries(this.loghiScuderie)) {
            if (n.includes(chiave)) return logo;
        }
        return '';
    },

    /**
     * Ottiene la foto del pilota
     */
    ottieniFotoPilota(nomePilota, headshotApi = null) {
        if (headshotApi && typeof headshotApi === 'string' && headshotApi.startsWith('http')) {
            return headshotApi;
        }
        if (!nomePilota) return 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/placeholder.png';
        const n = String(nomePilota).toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (const [chiave, url] of Object.entries(this.fotoPiloti)) {
            const chiaveNormalizzata = chiave.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            if (n.includes(chiaveNormalizzata)) return url;
        }
        return 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/placeholder.png';
    }
};

UtilityF1.informazioni_piloti = UtilityF1.informazioni_piloti.map(pilota => {
    const nome = `${pilota.first_name} ${pilota.last_name}`;
    const foto = UtilityF1.ottieniFotoPilota(nome);

    return {
        ...pilota,
        nome,
        sigla: pilota.name_acronym,
        numero: pilota.driver_number,
        teamNome: pilota.team_name,
        scuderia: pilota.team_name,
        coloreTeam: UtilityF1.ottieniColoreScuderia(pilota.team_name),
        headshot_url: foto,
        foto
    };
});
