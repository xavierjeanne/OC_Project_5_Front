const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function fetchFromAPI(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Erreur API: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return null;
    }
}

// Fonction pour récupérer le meilleur film
async function getBestMovie() {
    const data = await fetchFromAPI('/titles/', {
        sort_by: '-imdb_score,-votes',
        page_size: 1
    });
    
    if (data && data.results && data.results.length > 0) {
        const movieId = data.results[0].id;
        return await getMovieDetails(movieId);
    }
    
    return null;
}

// Fonction pour récupérer les détails d'un film
async function getMovieDetails(movieId) {
    return await fetchFromAPI(`/titles/${movieId}`);
}

// Fonction pour récupérer les films les mieux notés
async function getBestRatedMovies(limit = 6) {
    const data = await fetchFromAPI('/titles/', {
        sort_by: '-imdb_score,-votes',
        offset: 6,
        page_size: limit
    });
    
    return data && data.results ? data.results : [];
}

// Fonction pour récupérer les films par genre
async function getMoviesByGenre(genre, limit = 6) {
    const data = await fetchFromAPI('/titles/', {
        genre: genre,
        sort_by: '-imdb_score,-votes',
        page_size: limit
    });
    
    return data && data.results ? data.results : [];
}