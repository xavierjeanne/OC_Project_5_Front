// Attendre que le DOM soit complètement chargé
document.addEventListener('DOMContentLoaded', async () => {
    // Afficher le meilleur film
    await displayBestMovie();
    
    // Afficher les films les mieux notés
    await displayBestRatedMovies();
    
    // Afficher les films par genre (exemples de genres)
    await displayMoviesByGenre('Sci-fi');
    await displayMoviesByGenre('Action');
    
});

// Fonction pour afficher le meilleur film
async function displayBestMovie() {
    const bestMovie = await getBestMovie();
    if (!bestMovie) return;
    
    const bestMovieSection = document.getElementById('best-rated-section');
    if (bestMovieSection) {
        bestMovieSection.innerHTML = `
            <div class="best-movie">

                <div class="row">
                    <div class="col-12 col-md-3">
                        <div class="best-movie--image" style="background-image: url('${bestMovie.image_url}')">
                        </div>
                    </div>
                    <div class="col-12 col-md-9 best-movie__description">
                        <h3>${bestMovie.title}</h3>
                        <p class="best-movie__description--p">${bestMovie.description || ''}</p>
                        <div class="d-flex justify-content-center justify-content-md-end">
                            <button class="info-btn " data-movie-id="${bestMovie.id}">Détails</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter des écouteurs d'événements pour les boutons
        setupMovieButtons(bestMovieSection);
    }
}

// Fonction pour afficher les films les mieux notés
async function displayBestRatedMovies() {
    const movies = await getBestRatedMovies();
    if (!movies) return;
    
    const bestMovieCategorySection = document.getElementById('best-rated-categories-section');
    if (bestMovieCategorySection) {
        let best = '<div class="best-movies row pt-lg-5">';
        
        // We'll handle visibility with JavaScript based on screen size
        movies.forEach((movie) => {
            best += `
                <div class="col-12 col-md-6 col-lg-4 pb-4 movie-item" data-movie-id="${movie.id}" >
                    <div class="best-movies__card position-relative overflow-hidden" style="background-image: url('${movie.image_url}')">
                        <div class="best-movies__card--description w-100">
                            <h3>${movie.title}</h3>
                            <div class="d-flex justify-content-end mt-3">
                                <button class="detail-btn" data-movie-id="${movie.id}">Détails</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        best += '</div>';
        best += `
            <div class="text-center mt-2 mb-5">
                <button id="see-more-btn" class="info-btn see-more">Voir plus</button>
            </div>
        `;
        
        bestMovieCategorySection.innerHTML = best;
        handleResponsiveDisplay();
        
        // Add event listener for window resize
        window.addEventListener('resize', handleResponsiveDisplay);
        
        // Add event listener for the "Voir plus" button
        const seeMoreBtn = document.getElementById('see-more-btn');
        if (seeMoreBtn) {
            seeMoreBtn.addEventListener('click', function() {
                const movieItems = bestMovieCategorySection.querySelectorAll('.movie-item');
                
                // Show all hidden movies
                movieItems.forEach(movie => {
                    movie.classList.remove('d-none');
                });
                
                // Hide the "Voir plus" button after showing all movies
                this.style.display = 'none';
            });
        }
        
        // Add event listeners for detail buttons
        const detailButtons = bestMovieCategorySection.querySelectorAll('.detail-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const movieId = button.getAttribute('data-movie-id');
                const movieDetails = await getMovieDetails(movieId);
                showMovieModal(movieDetails);
            });
        });
    }
}

// Fonction pour afficher les films par genre
async function displayMoviesByGenre(genre) {
    const movies = await getMoviesByGenre(genre);
    if (!movies) return;
    let genreSection = document.getElementById(`${genre.toLowerCase()}-section`);
    if(genreSection){
        let best = '<div class="best-movies row pt-lg-5">';
        
        // Always show all movies initially
        movies.forEach((movie) => {
            best += `
                <div class="col-12 col-md-6 col-lg-4 pb-4 movie-item" data-movie-id="${movie.id}" >
                    <div class="best-movies__card position-relative overflow-hidden" style="background-image: url('${movie.image_url}')">
                        <div class="best-movies__card--description w-100">
                            <h3>${movie.title}</h3>
                            <div class="d-flex justify-content-end mt-3">
                                <button class="detail-btn" data-movie-id="${movie.id}">Détails</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        best += '</div>';
        best += `
            <div class="text-center mt-2 mb-5 toggle-buttons">
                <button id="see-less-btn-${genre.toLowerCase()}" class="info-btn see-less d-inline-block d-md-inline-block d-lg-none">Voir moins</button>
            </div>
        `;
        
        genreSection.innerHTML = best;
        
        // Add event listeners for detail buttons
        const detailButtons = genreSection.querySelectorAll('.detail-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const movieId = button.getAttribute('data-movie-id');
                const movieDetails = await getMovieDetails(movieId);
                showMovieModal(movieDetails);
            });
        });
        
        // Set up the "Voir moins" button
        const seeLessBtn = document.getElementById(`see-less-btn-${genre.toLowerCase()}`);
        if (seeLessBtn) {
            // Define the functions outside to avoid reference issues
            function showLessMovies() {
                const movieItems = genreSection.querySelectorAll('.movie-item');
                
                // Get window width
                const windowWidth = window.innerWidth;
                
                // Set movies to show based on screen size
                let moviesToShow;
                if (windowWidth < 768) {
                    // Mobile: show 2
                    moviesToShow = 2;
                } else if (windowWidth < 992) {
                    // Tablet: show 4
                    moviesToShow = 4;
                } else {
                    // Desktop: show all (no button needed)
                    return;
                }
                
                // Hide movies beyond the count
                movieItems.forEach((item, index) => {
                    if (index < moviesToShow) {
                        item.classList.remove('d-none');
                    } else {
                        item.classList.add('d-none');
                    }
                });
                
                // Change button text and functionality
                this.textContent = 'Voir plus';
                this.id = `see-more-btn-${genre.toLowerCase()}`;
                
                // Remove current listener and add the show more listener
                this.removeEventListener('click', showLessMovies);
                this.addEventListener('click', showMoreMovies);
            }
            
            function showMoreMovies() {
                const movieItems = genreSection.querySelectorAll('.movie-item');
                
                // Show all movies
                movieItems.forEach(movie => {
                    movie.classList.remove('d-none');
                });
                
                // Change button text and functionality back
                this.textContent = 'Voir moins';
                this.id = `see-less-btn-${genre.toLowerCase()}`;
                
                // Remove current listener and add the show less listener
                this.removeEventListener('click', showMoreMovies);
                this.addEventListener('click', showLessMovies);
            }
            
            // Add initial event listener
            seeLessBtn.addEventListener('click', showLessMovies);
        }
        
        // Add window resize handler to show/hide the button based on screen size
        window.addEventListener('resize', function() {
            const seeLessBtn = document.getElementById(`see-less-btn-${genre.toLowerCase()}`) || 
                              document.getElementById(`see-more-btn-${genre.toLowerCase()}`);
            
            if (seeLessBtn) {
                const windowWidth = window.innerWidth;
                
                if (windowWidth >= 992) {
                    // Desktop: hide button
                    seeLessBtn.classList.add('d-none');
                    seeLessBtn.classList.remove('d-inline-block');
                    
                    // Show all movies
                    const movieItems = genreSection.querySelectorAll('.movie-item');
                    movieItems.forEach(movie => {
                        movie.classList.remove('d-none');
                    });
                } else {
                    // Mobile/Tablet: show button
                    seeLessBtn.classList.remove('d-none');
                    seeLessBtn.classList.add('d-inline-block');
                }
            }
        });
    }
}

// Fonction pour configurer les écouteurs d'événements des boutons de film
function setupMovieButtons(container) {
    const infoButtons = container.querySelectorAll('.info-btn');
    
    infoButtons.forEach(button => {
        button.addEventListener('click', async () => {
            const movieId = button.getAttribute('data-movie-id');
            const movieDetails = await getMovieDetails(movieId);
            showMovieModal(movieDetails);
        });
    });
}

function handleResponsiveDisplay() {
    const bestMovieCategorySection = document.getElementById('best-rated-categories-section');
    if (!bestMovieCategorySection) return;
    
    const movieItems = bestMovieCategorySection.querySelectorAll('.movie-item');
    const seeMoreBtn = document.getElementById('see-more-btn');
    if (!seeMoreBtn) return;
    
    // Get window width
    const windowWidth = window.innerWidth;
    
    // Set initial movies to show based on screen size
    let initialMoviesToShow;
    if (windowWidth < 768) {
        // Mobile: show 2
        initialMoviesToShow = 2;
    } else if (windowWidth < 992) {
        // Tablet: show 4
        initialMoviesToShow = 4;
    } else {
        // Desktop: show 6
        initialMoviesToShow = 6;
    }
    
    // Hide movies beyond the initial count
    movieItems.forEach((item, index) => {
        if (index < initialMoviesToShow) {
            item.classList.remove('d-none');
        } else {
            item.classList.add('d-none');
        }
    });
    
    // Hide "Voir plus" button if all movies are shown
    if (movieItems.length <= initialMoviesToShow) {
        seeMoreBtn.style.display = 'none';
    } else {
        seeMoreBtn.style.display = 'inline-block';
    }
    
    // Add event listener for the "Voir plus" button if not already added
    if (!seeMoreBtn.hasClickListener) {
        seeMoreBtn.addEventListener('click', function() {
            const movieItems = bestMovieCategorySection.querySelectorAll('.movie-item');
            
            // Show all hidden movies
            movieItems.forEach(movie => {
                movie.classList.remove('d-none');
            });
            
            // Hide the "Voir plus" button after showing all movies
            this.style.display = 'none';
        });
        seeMoreBtn.hasClickListener = true;
    }
}

function handleGenreResponsiveDisplay(section, genreId) {
    if (!section) return;
    
    const movieItems = section.querySelectorAll('.movie-item');
    const seeMoreBtn = document.getElementById(`see-more-btn-${genreId}`);
    const seeLessBtn = document.getElementById(`see-less-btn-${genreId}`);
    
    if (!seeMoreBtn || !seeLessBtn) return;
    
    // Get window width
    const windowWidth = window.innerWidth;
    
    // Set initial movies to show based on screen size
    let initialMoviesToShow;
    if (windowWidth < 768) {
        // Mobile: show 2
        initialMoviesToShow = 2;
    } else if (windowWidth < 992) {
        // Tablet: show 4
        initialMoviesToShow = 4;
    } else {
        // Desktop: show 6
        initialMoviesToShow = 6;
    }
    
    // Function to show initial movies
    const showInitialMovies = () => {
        movieItems.forEach((item, index) => {
            if (index < initialMoviesToShow) {
                item.classList.remove('d-none');
            } else {
                item.classList.add('d-none');
            }
        });
        
        // Show "See More" button if there are more movies to show
        if (movieItems.length <= initialMoviesToShow) {
            seeMoreBtn.classList.add('d-none');
            seeLessBtn.classList.add('d-none');
        } else {
            seeMoreBtn.classList.remove('d-none');
            seeLessBtn.classList.add('d-none');
        }
    };
    
    // Initial setup
    showInitialMovies();
    
    // Add event listener for the "See More" button
    seeMoreBtn.addEventListener('click', function() {
        // Show all movies
        movieItems.forEach(movie => {
            movie.classList.remove('d-none');
        });
        
        // Hide "See More" button
        seeMoreBtn.classList.add('d-none');
        
        // Show "See Less" button
        seeLessBtn.classList.remove('d-none');
    });
    
    // Add event listener for the "See Less" button
    seeLessBtn.addEventListener('click', function() {
        // Reset to initial state
        showInitialMovies();
    });
}
// Fonction pour configurer les écouteurs d'événements des cartes de films
function setupMovieCards(container) {
    const movieCards = container.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        card.addEventListener('click', async () => {
            const movieId = card.getAttribute('data-movie-id');
            const movieDetails = await getMovieDetails(movieId);
            showMovieModal(movieDetails);
        });
    });
}

// Fonction pour afficher une modal avec les détails du film
function showMovieModal(movie) {
    // Créer ou réutiliser une modal existante
    let modal = document.getElementById('movie-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'movie-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Remplir la modal avec les détails du film
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <div class="modal-header">
                <h2>${movie.title}</h2>
            </div>
            <div class="modal-body">
                <div class="modal-image">
                    <img src="${movie.image_url}" alt="${movie.title}">
                </div>
                <div class="modal-details">
                    <p><strong>Genre:</strong> ${movie.genres.join(', ')}</p>
                    <p><strong>Date de sortie:</strong> ${movie.year}</p>
                    <p><strong>Rated:</strong> ${movie.rated || 'Non spécifié'}</p>
                    <p><strong>Score IMDb:</strong> ${movie.imdb_score}</p>
                    <p><strong>Réalisateur:</strong> ${movie.directors.join(', ')}</p>
                    <p><strong>Acteurs:</strong> ${movie.actors.join(', ')}</p>
                    <p><strong>Durée:</strong> ${movie.duration} min</p>
                    <p><strong>Pays:</strong> ${movie.countries.join(', ')}</p>
                    <p><strong>Box Office:</strong> ${movie.worldwide_gross_income || 'Non spécifié'}</p>
                    <p><strong>Description:</strong> ${movie.description || 'Aucune description disponible.'}</p>
                </div>
            </div>
        </div>
    `;
    
    // Afficher la modal
    modal.style.display = 'block';
    
    // Configurer le bouton de fermeture
    const closeButton = modal.querySelector('.close-modal');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Fermer la modal si l'utilisateur clique en dehors
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}