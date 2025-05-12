
document.addEventListener('DOMContentLoaded', async () => {
   
    await displayBestMovie();
    await displayBestRatedMovies();
    await displayMoviesByGenre('Sci-fi');
    await displayMoviesByGenre('Sport');
    await populateCategorySelect();
});



async function displayBestMovie() {
    showLoader();
    const bestMovie = await getBestMovie();
    hideLoader();
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


async function displayBestRatedMovies() {
    showLoader();
    const movies = await getBestRatedMovies();
    hideLoader();
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
                <div class="text-center mt-2 mb-5 toggle-buttons">
                    <button id="see-more-btn-best-rated" class="info-btn see-more">Voir plus</button>
                </div>
            `;
            
            bestMovieCategorySection.innerHTML = best;
            
            // Initialize responsive display
            const movieItems = bestMovieCategorySection.querySelectorAll('.movie-item');
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
            const seeMoreBtn = document.getElementById('see-more-btn-best-rated');
            if (movieItems.length <= initialMoviesToShow) {
                seeMoreBtn.style.display = 'none';
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
            
            // Set up the "Voir plus" button
            if (seeMoreBtn) {
                
                function showMoreMovies() {
                    const movieItems = bestMovieCategorySection.querySelectorAll('.movie-item');
                    
                    // Show all movies
                    movieItems.forEach(movie => {
                        movie.classList.remove('d-none');
                    });
                    
                    // Change button text and functionality
                    this.textContent = 'Voir moins';
                    this.id = 'see-less-btn-best-rated';
                    
                    // Remove current listener and add the show less listener
                    this.removeEventListener('click', showMoreMovies);
                    this.addEventListener('click', showLessMovies);
                }
                
                function showLessMovies() {
                    const movieItems = bestMovieCategorySection.querySelectorAll('.movie-item');
                    
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
                        // Desktop: show 6
                        moviesToShow = 6;
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
                    this.id = 'see-more-btn-best-rated';
                    
                    // Remove current listener and add the show more listener
                    this.removeEventListener('click', showLessMovies);
                    this.addEventListener('click', showMoreMovies);
                }
                
                // Add initial event listener
                seeMoreBtn.addEventListener('click', showMoreMovies);
            }
            
            // Add window resize handler
            window.addEventListener('resize', function() {
                const seeBtn = document.getElementById('see-more-btn-best-rated') || 
                                document.getElementById('see-less-btn-best-rated');
                
                if (seeBtn) {
                    const windowWidth = window.innerWidth;
                    const movieItems = bestMovieCategorySection.querySelectorAll('.movie-item');
                    
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
                    
                    // If we're showing "Voir plus" button, update the display
                    if (seeBtn.id === 'see-more-btn-best-rated') {
                        // Hide movies beyond the initial count
                        movieItems.forEach((item, index) => {
                            if (index < initialMoviesToShow) {
                                item.classList.remove('d-none');
                            } else {
                                item.classList.add('d-none');
                            }
                        });
                    }
                    
                    // Hide button if all movies are shown
                    if (movieItems.length <= initialMoviesToShow) {
                        seeBtn.style.display = 'none';
                    } else {
                        seeBtn.style.display = 'inline-block';
                    }
                }
            });
        }
}

async function populateCategorySelect() {
    const genres = await fetchAllGenres();
    if (!genres) return;
    
    const categorySelect = document.getElementById('category-select');
    if (!categorySelect) return;
    
    // Clear existing options except the first one
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    
    // Check if genres is an array, if not, handle accordingly
    if (Array.isArray(genres)) {
        // Add genre options
        genres.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre.name;
            option.textContent = genre.name;
            categorySelect.appendChild(option);
        });
    } else if (typeof genres === 'object') {
        // If genres is an object, try to extract values
        const genreList = Object.values(genres);
        if (Array.isArray(genreList)) {
            genreList.forEach(genre => {
                if (typeof genre === 'string') {
                    const option = document.createElement('option');
                    option.value = genre;
                    option.textContent = genre;
                    categorySelect.appendChild(option);
                }
            });
        }
    }
    
    // Create custom dropdown after populating the select
    createCustomDropdown(categorySelect);
    
    // Add event listener for category change
    categorySelect.addEventListener('change', function() {
        const selectedGenre = this.value;
        if (selectedGenre) {
            displayMoviesByGenre(selectedGenre, 'categrories-section');
        }
    });
}


function createCustomDropdown(select) {
    if (!select) return;
    
    // Create container for custom dropdown
    const customDropdownContainer = document.createElement('div');
    customDropdownContainer.className = 'custom-dropdown-container';
    
    // Create selected display
    const selectedDisplay = document.createElement('div');
    selectedDisplay.className = 'selected-option';
    
    // Create dropdown list
    const dropdownList = document.createElement('div');
    dropdownList.className = 'dropdown-list';
    
    // Add dropdown items
    const dropdownItems = [];
    Array.from(select.options).forEach((option, index) => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        if (option.selected) item.classList.add('selected');
        
        const text = document.createElement('span');
        text.textContent = option.text;
        
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.innerHTML = '✓';
        
        item.appendChild(text);
        item.appendChild(checkmark);
        dropdownList.appendChild(item);
        dropdownItems.push(item);
        
        // Handle item click
        item.addEventListener('click', () => {
            // Update select value
            select.selectedIndex = index;
            
            // Update UI
            document.querySelectorAll('.dropdown-item').forEach(el => {
                el.classList.remove('selected');
            });
            item.classList.add('selected');
            selectedDisplay.textContent = option.text;
            
            // Hide dropdown
            dropdownList.classList.remove('show');
            
            // Trigger change event
            const event = new Event('change');
            select.dispatchEvent(event);
        });
    });
   
    
    const firstOptionIndex = Array.from(select.options).findIndex(option => !option.disabled);
    if (firstOptionIndex > 0) {
        // Set the select value
        select.selectedIndex = firstOptionIndex;
        
        // Update UI
        dropdownItems.forEach((item, index) => {
            item.classList.remove('selected');
            if (index === firstOptionIndex) {
                item.classList.add('selected');
                selectedDisplay.textContent = select.options[firstOptionIndex].text;
            }
        });
        
        // Trigger change event to load the first category
        const event = new Event('change');
        select.dispatchEvent(event);
        
        // Directly call the display function with the selected genre
        const selectedGenre = select.options[firstOptionIndex].value;
        if (selectedGenre) {
            displayMoviesByGenre(selectedGenre, 'categrories-section');
        }
    } else {
        // If no valid option found, use the placeholder text
        selectedDisplay.textContent = select.options[0].text;
    }
    
    // Toggle dropdown on click
    selectedDisplay.addEventListener('click', () => {
        dropdownList.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!customDropdownContainer.contains(e.target)) {
            dropdownList.classList.remove('show');
        }
    });
    
    // Add elements to DOM
    customDropdownContainer.appendChild(selectedDisplay);
    customDropdownContainer.appendChild(dropdownList);
    
    // Replace select with custom dropdown
    select.parentNode.insertBefore(customDropdownContainer, select);
    select.style.display = 'none';
}

async function displayMoviesByGenre(genre, sectionId = null) {
    showLoader();
    const movies = await getMoviesByGenre(genre);
    hideLoader();
    if (!movies) return;
    
  
    // Use provided sectionId or default to genre-section
        const targetSectionId = sectionId || `${genre.toLowerCase()}-section`;
        let genreSection = document.getElementById(targetSectionId);
        
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
                    <button id="see-less-btn-${targetSectionId}" class="info-btn see-less d-inline-block d-md-inline-block d-lg-none">Voir moins</button>
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
            const seeLessBtn = document.getElementById(`see-less-btn-${targetSectionId}`);
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
                    this.id = `see-more-btn-${targetSectionId}`;
                    
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
                    this.id = `see-less-btn-${targetSectionId}`;
                    
                    // Remove current listener and add the show less listener
                    this.removeEventListener('click', showMoreMovies);
                    this.addEventListener('click', showLessMovies);
                }
                
                // Add initial event listener
                seeLessBtn.addEventListener('click', showLessMovies);
            }
            
            // Add window resize handler to show/hide the button based on screen size
            window.addEventListener('resize', function() {
                const seeLessBtn = document.getElementById(`see-less-btn-${targetSectionId}`) || 
                                document.getElementById(`see-more-btn-${targetSectionId}`);
                
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


function showMovieModal(movie) {
    // Get the modal elements
    showLoader();
    const modal = document.getElementById('movieModal');
    const modalImage = document.getElementById('modal-movie-image');
    const modalDetails = document.getElementById('modal-movie-details');
    const modalDescription = document.getElementById('modal-movie-description');
    const modalTitle = document.getElementById('modal-movie-title');
    
    
    // Set the image source
    modalImage.src = movie.image_url;
    modalImage.alt = movie.title;
    
    modalTitle.textContent = movie.title;
    // Create the details HTML
    const detailsHTML = `
        <strong>${movie.year || 'Année non spécifié'} - ${movie.genres ? movie.genres.join(', ') : 'genre non spécifié'}<br/>
        ${movie.rated ? 'PG-'+ movie.rated : 'Classement non spécifié'} - ${movie.duration ? movie.duration + ' minutes' : 'Durée non spécifié'} (${movie.countries ? movie.countries.join(' / ') : 'Pays non spécifié'})</br>
        Score IMDb : ${movie.imdb_score ? movie.imdb_score +'/10' : 'Non spécifié'}<br/>
        Recette aux box-office : ${movie.worldwide_gross_income? '$'+ movie.worldwide_gross_income  : 'Recette non spécifiée'}
        </strong>
        <p class="mt-3 mb-0"><strong>Réalisé par:<br/></strong> ${movie.directors ? movie.directors.join(', ') : 'Réalisé par'}<br/></p>
    `;
    
    // Set the details HTML
    modalDetails.innerHTML = detailsHTML;
    const descriptionModal =  `
        <p>${movie.long_description || 'Résumé non spécifié'}  </p> 
        <img  src="${movie.image_url}" alt="Movie Poster" class="img-fluid m-auto mb-3 d-block d-lg-none">
        <p class="mt-5"><strong>Avec:<br/></strong> ${movie.actors ? movie.actors.join(', ') : 'Distribution non spécifiée'}<br/>
    `;
    modalDescription.innerHTML = descriptionModal;
    // Initialize the modal using Bootstrap
    const bootstrapModal = new bootstrap.Modal(modal);

    // Add event listener to set aria-hidden when modal is hidden
    modal.addEventListener('hidden.bs.modal', function () {
        modal.setAttribute('aria-hidden', 'true');
    }, { once: true });
    hideLoader();
    // Now show the modal
    bootstrapModal.show();
}

function showLoader() {
    document.getElementById('loader-container').classList.remove('d-none');
}

function hideLoader() {
    document.getElementById('loader-container').classList.add('d-none');
}
