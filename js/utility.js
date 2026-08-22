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
        'antonelli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2024_FIA_F2_Silverstone_Antonelli_%28cropped%29.jpg/640px-2024_FIA_F2_Silverstone_Antonelli_%28cropped%29.jpg',
        'andrea kimi antonelli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/2024_FIA_F2_Silverstone_Antonelli_%28cropped%29.jpg/640px-2024_FIA_F2_Silverstone_Antonelli_%28cropped%29.jpg',
        'hamilton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg/640px-Lewis_Hamilton_2016_Malaysia_2.jpg',
        'lewis hamilton': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Lewis_Hamilton_2016_Malaysia_2.jpg/640px-Lewis_Hamilton_2016_Malaysia_2.jpg',
        'russell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/George_Russell_2022.jpg/640px-George_Russell_2022.jpg',
        'george russell': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/George_Russell_2022.jpg/640px-George_Russell_2022.jpg',
        'leclerc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Charles_Leclerc_2019.jpg/640px-Charles_Leclerc_2019.jpg',
        'charles leclerc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Charles_Leclerc_2019.jpg/640px-Charles_Leclerc_2019.jpg',
        'norris': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Lando_Norris_2024.jpg/640px-Lando_Norris_2024.jpg',
        'lando norris': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Lando_Norris_2024.jpg/640px-Lando_Norris_2024.jpg',
        'piastri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Oscar_Piastri_2023.jpg/640px-Oscar_Piastri_2023.jpg',
        'oscar piastri': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Oscar_Piastri_2023.jpg/640px-Oscar_Piastri_2023.jpg',
        'verstappen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Max_Verstappen_2017.jpg/640px-Max_Verstappen_2017.jpg',
        'max verstappen': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Max_Verstappen_2017.jpg/640px-Max_Verstappen_2017.jpg',
        'sainz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Carlos_Sainz_Jr_2019.jpg/640px-Carlos_Sainz_Jr_2019.jpg',
        'carlos sainz': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Carlos_Sainz_Jr_2019.jpg/640px-Carlos_Sainz_Jr_2019.jpg',
        'alonso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Fernando_Alonso_2023.jpg/640px-Fernando_Alonso_2023.jpg',
        'fernando alonso': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Fernando_Alonso_2023.jpg/640px-Fernando_Alonso_2023.jpg',
        'stroll': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lance_Stroll_2019.jpg/640px-Lance_Stroll_2019.jpg',
        'lance stroll': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lance_Stroll_2019.jpg/640px-Lance_Stroll_2019.jpg',
        'gasly': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Pierre_Gasly_2022.jpg/640px-Pierre_Gasly_2022.jpg',
        'pierre gasly': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Pierre_Gasly_2022.jpg/640px-Pierre_Gasly_2022.jpg',
        'tsunoda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Yuki_Tsunoda_2022.jpg/640px-Yuki_Tsunoda_2022.jpg',
        'yuki tsunoda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Yuki_Tsunoda_2022.jpg/640px-Yuki_Tsunoda_2022.jpg',
        'albon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Alexander_Albon_2022.jpg/640px-Alexander_Albon_2022.jpg',
        'alexander albon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Alexander_Albon_2022.jpg/640px-Alexander_Albon_2022.jpg',
        'hulkenberg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nico_H%C3%BClkenberg_2019.jpg/640px-Nico_H%C3%BClkenberg_2019.jpg',
        'nico hulkenberg': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Nico_H%C3%BClkenberg_2019.jpg/640px-Nico_H%C3%BClkenberg_2019.jpg',
        'ocon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Esteban_Ocon_2022.jpg/640px-Esteban_Ocon_2022.jpg',
        'esteban ocon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Esteban_Ocon_2022.jpg/640px-Esteban_Ocon_2022.jpg',
        'bearman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Oliver_Bearman_2024_Saudi_Arabia_GP.jpg/640px-Oliver_Bearman_2024_Saudi_Arabia_GP.jpg',
        'oliver bearman': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Oliver_Bearman_2024_Saudi_Arabia_GP.jpg/640px-Oliver_Bearman_2024_Saudi_Arabia_GP.jpg',
        'lawson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/2023_FIA_F2_Silverstone_Liam_Lawson.jpg/640px-2023_FIA_F2_Silverstone_Liam_Lawson.jpg',
        'liam lawson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/2023_FIA_F2_Silverstone_Liam_Lawson.jpg/640px-2023_FIA_F2_Silverstone_Liam_Lawson.jpg',
        'doohan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Jack_Doohan_2023.jpg/640px-Jack_Doohan_2023.jpg',
        'jack doohan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Jack_Doohan_2023.jpg/640px-Jack_Doohan_2023.jpg',
        'bortoleto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Gabriel_Bortoleto_2024.jpg/640px-Gabriel_Bortoleto_2024.jpg',
        'gabriel bortoleto': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Gabriel_Bortoleto_2024.jpg/640px-Gabriel_Bortoleto_2024.jpg',
        'hadjar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Isack_Hadjar_2024.jpg/640px-Isack_Hadjar_2024.jpg',
        'isack hadjar': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Isack_Hadjar_2024.jpg/640px-Isack_Hadjar_2024.jpg',
        'perez': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Sergio_Perez_2019.jpg/640px-Sergio_Perez_2019.jpg',
        'sergio perez': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Sergio_Perez_2019.jpg/640px-Sergio_Perez_2019.jpg'
    },

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
     * Ottiene l'emoji della bandiera della nazionalità del pilota o team.
     */
    ottieniBandieraNazionalita(nazionalita) {
        if (!nazionalita) return '🏁';
        const n = String(nazionalita).toLowerCase().trim();
        const mappa = {
            'italian': '🇮🇹', 'ita': '🇮🇹', 'italy': '🇮🇹',
            'british': '🇬🇧', 'gbr': '🇬🇧', 'uk': '🇬🇧',
            'monégasque': '🇲🇨', 'monegasque': '🇲🇨', 'mco': '🇲🇨', 'monaco': '🇲🇨',
            'dutch': '🇳🇱', 'nld': '🇳🇱', 'netherlands': '🇳🇱',
            'australian': '🇦🇺', 'aus': '🇦🇺', 'australia': '🇦🇺',
            'spanish': '🇪🇸', 'esp': '🇪🇸', 'spain': '🇪🇸',
            'german': '🇩🇪', 'ger': '🇩🇪', 'germany': '🇩🇪',
            'french': '🇫🇷', 'fra': '🇫🇷', 'france': '🇫🇷',
            'japanese': '🇯🇵', 'jpn': '🇯🇵', 'japan': '🇯🇵',
            'canadian': '🇨🇦', 'can': '🇨🇦', 'canada': '🇨🇦',
            'mexican': '🇲🇽', 'mex': '🇲🇽', 'mexico': '🇲🇽',
            'brazilian': '🇧🇷', 'bra': '🇧🇷', 'brazil': '🇧🇷',
            'new zealander': '🇳🇿', 'nzl': '🇳🇿', 'new zealand': '🇳🇿',
            'thai': '🇹🇭', 'tha': '🇹🇭', 'thailand': '🇹🇭',
            'danish': '🇩🇰', 'den': '🇩🇰', 'denmark': '🇩🇰',
            'finnish': '🇫🇮', 'fin': '🇫🇮', 'finland': '🇫🇮',
            'american': '🇺🇸', 'usa': '🇺🇸',
            'chinese': '🇨🇳', 'china': '🇨🇳',
            'austrian': '🇦🇹', 'swiss': '🇨🇭'
        };
        for (const [k, v] of Object.entries(mappa)) {
            if (n.includes(k)) return v;
        }
        return '🏁';
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
        const n = String(nomePilota).toLowerCase().trim();
        for (const [chiave, url] of Object.entries(this.fotoPiloti)) {
            if (n.includes(chiave)) return url;
        }
        return 'https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/placeholder.png';
    }
};
