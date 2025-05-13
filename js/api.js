// Base URL for the API endpoints
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Generic function to fetch data from the API with error handling
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

// Function to fetch the highest rated movie based on IMDB score and votes
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

// Utility function to validate if an image URL is accessible and loads correctly
async function isImageValid(url) {
    return new Promise((resolve) => {
        // Create a new image object
        const img = new Image();
        
        // Prevent error from appearing in console
        img.addEventListener('error', function(e) {
            e.preventDefault();
            e.stopPropagation();
        }, true);
        
        // Set up event handlers before setting src
        img.onload = () => resolve(true);
        img.onerror = () => {
            // Image failed to load (404, CORS, etc.)
            // Remove console.error to prevent any console output
            resolve(false);
        };
        
        // Set timeout in case image takes too long
        setTimeout(() => resolve(false), 2000);
        
        // Set the source last
        img.src = url;
    });
}

// Function to fetch detailed information about a specific movie
// Includes image URL validation and fallback to placeholder
async function getMovieDetails(movieId) {
    const movie = await fetchFromAPI(`/titles/${movieId}`);
    
    if (movie) {
        // Check if the image URL is valid, if not, use a default image
        if (movie.image_url) {
            const isValid = await isImageValid(movie.image_url);
            if (!isValid) {
                movie.image_url = 'img/logo.png'; 
            }
        } else {
            movie.image_url = 'img/logo.png';
        }
    }
    
    return movie;
}

// Function to get a list of best rated movies, excluding the top movie
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

// Function to fetch movies by specific genre
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