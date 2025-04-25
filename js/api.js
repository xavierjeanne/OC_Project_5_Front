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
// Add this function to check if an image URL is valid
async function isImageValid(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Modify your getMovieDetails function to handle image validation
async function getMovieDetails(movieId) {
    const movie = await fetchFromAPI(`/titles/${movieId}`);
    
    if (movie) {
        // Check if the image URL is valid, if not, use a placeholder
        if (movie.image_url) {
            const isValid = await isImageValid(movie.image_url);
            if (!isValid) {
                movie.image_url = 'img/logo.png'; // Path to your placeholder image
            }
        } else {
            movie.image_url = 'img/logo.png';
        }
    }
    
    return movie;
}

// Update getBestRatedMovies to handle image validation
async function getBestRatedMovies(limit = 6) {
    const data = await fetchFromAPI('/titles/', {
        sort_by: '-imdb_score,-votes',
        offset: 6,
        page_size: limit
    });
    
    if (data && data.results) {
        // Check each movie's image URL
        for (const movie of data.results) {
            if (movie.image_url) {
                const isValid = await isImageValid(movie.image_url);
                if (!isValid) {
                    movie.image_url = 'img/logo.png';
                }
            } else {
                movie.image_url = 'img/logo.png';
            }
        }
        return data.results;
    }
    
    return [];
}

// Update getMoviesByGenre to handle image validation
async function getMoviesByGenre(genre, limit = 6) {
    const data = await fetchFromAPI('/titles/', {
        genre: genre,
        sort_by: '-imdb_score,-votes',
        page_size: limit
    });
    
    if (data && data.results) {
        // Check each movie's image URL
        for (const movie of data.results) {
            if (movie.image_url) {
                const isValid = await isImageValid(movie.image_url);
                if (!isValid) {
                    movie.image_url = 'img/logo.png';
                }
            } else {
                movie.image_url = 'img/logo.png';
            }
        }
        return data.results;
    }
    
    return [];
}

// Fonction pour récupérer tous les genres
async function fetchAllGenres() {
    try {
        // First, get the initial page to determine how many pages there are
        const firstPage = await fetchFromAPI('/genres/');
        if (!firstPage) return [];
        
        // Extract the genres from the first page
        let allGenres = firstPage.results || [];
        
        // If there are more pages, fetch them
        if (firstPage.next) {
            // Continue fetching pages until there are no more
            let nextPageUrl = firstPage.next;
            while (nextPageUrl) {
                // Parse the next URL to get the page parameter
                const url = new URL(nextPageUrl);
                const page = url.searchParams.get('page');
                
                // Fetch the next page using our fetchFromAPI function
                const nextPage = await fetchFromAPI('/genres/', { page });
                if (!nextPage || !nextPage.results) break;
                
                // Add the results to our collection
                allGenres = [...allGenres, ...nextPage.results];
                
                // Update the next page URL
                nextPageUrl = nextPage.next;
            }
        }
        
        // Return all collected genres
        return allGenres;
    } catch (error) {
        console.error('Error fetching all genres:', error);
        return [];
    }
}