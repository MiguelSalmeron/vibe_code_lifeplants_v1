// Main Application JavaScript

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  initHeroScroll();
  initSiteInfoModal();
  initEventsEmptyState();
  initVolunteerEmptyState();
  initCreditsEasterEgg();
  
  // Only render initiatives and involvement if on home page
  if (document.getElementById('initiativesGrid')) {
    renderInitiatives();
  }
  
  if (document.getElementById('involvementGrid')) {
    renderInvolvement();
  }
  
  // Initialize plant explorer if on explorar-plantas page
  if (document.getElementById('plantGrid')) {
    initPlantExplorer();
  }
});

// Mobile Menu Toggle
function initMobileMenu() {
  const toggle = document.querySelector('.header__mobile-toggle');
  const nav = document.querySelector('.header__nav');
  
  if (toggle && nav) {
    toggle.addEventListener('click', function() {
      nav.classList.toggle('header__nav--open');
      toggle.classList.toggle('header__mobile-toggle--open');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!toggle.contains(event.target) && !nav.contains(event.target)) {
        nav.classList.remove('header__nav--open');
        toggle.classList.remove('header__mobile-toggle--open');
      }
    });
  }
}

// Header scroll effect
function initHeroScroll() {
  const header = document.querySelector('.header');
  
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('header--scrolled');
      } else {
        header.classList.remove('header--scrolled');
      }
    });
  }
}

// Render Initiatives
function renderInitiatives() {
  const grid = document.getElementById('initiativesGrid');
  if (!grid || typeof initiatives === 'undefined') return;
  
  grid.innerHTML = initiatives.map(initiative => `
    <article class="initiative-card">
      <div class="initiative-card__image-wrapper">
        <img src="${initiative.imageUrl}" 
             alt="${initiative.title}" 
             class="initiative-card__image"
             loading="lazy">
      </div>
      <div class="initiative-card__content">
        <h3 class="initiative-card__title">${initiative.title}</h3>
        <p class="initiative-card__description">${initiative.description}</p>
      </div>
    </article>
  `).join('');
}

// Render Involvement Options
function renderInvolvement() {
  const grid = document.getElementById('involvementGrid');
  if (!grid || typeof involvementOptions === 'undefined' || typeof icons === 'undefined') return;
  
  grid.innerHTML = involvementOptions.map(option => `
    <article class="involvement-card ${option.isPrimary ? 'involvement-card--primary' : ''}">
      <div class="involvement-card__icon">
        ${icons[option.icon] || ''}
      </div>
      <h3 class="involvement-card__title">${option.title}</h3>
      <p class="involvement-card__description">${option.description}</p>
      <a href="${option.buttonUrl}" class="involvement-card__button">
        ${option.buttonText}
      </a>
    </article>
  `).join('');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && href !== '#donate' && href !== '#volunteer' && href !== '#partner' && href !== '#events' && href !== '#site-info' && href !== '#creditos') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// ========== Plant Explorer Functionality ==========

let filteredPlants = [];
let currentFilters = {
  search: '',
  use: 'all',
  region: 'all',
  type: 'all',
  sort: 'name-asc'
};

function initPlantExplorer() {
  if (typeof plants === 'undefined') return;
  
  // Initialize with all plants
  filteredPlants = [...plants];
  
  // Set up event listeners
  const searchInput = document.getElementById('plantSearch');
  const useFilter = document.getElementById('useFilter');
  const regionFilter = document.getElementById('regionFilter');
  const typeFilter = document.getElementById('typeFilter');
  const sortFilter = document.getElementById('sortFilter');
  const clearBtn = document.getElementById('clearFilters');
  
  if (searchInput) {
    searchInput.addEventListener('input', handleSearchChange);
  }
  
  if (useFilter) {
    useFilter.addEventListener('change', handleFilterChange);
  }
  
  if (regionFilter) {
    regionFilter.addEventListener('change', handleFilterChange);
  }
  
  if (typeFilter) {
    typeFilter.addEventListener('change', handleFilterChange);
  }
  
  if (sortFilter) {
    sortFilter.addEventListener('change', handleSortChange);
  }
  
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllFilters);
  }
  
  // Initial render
  applyFiltersAndRender();
}

function handleSearchChange(e) {
  currentFilters.search = e.target.value.toLowerCase();
  applyFiltersAndRender();
}

function handleFilterChange() {
  currentFilters.use = document.getElementById('useFilter').value;
  currentFilters.region = document.getElementById('regionFilter').value;
  currentFilters.type = document.getElementById('typeFilter').value;
  applyFiltersAndRender();
}

function handleSortChange(e) {
  currentFilters.sort = e.target.value;
  applyFiltersAndRender();
}

function clearAllFilters() {
  // Reset all filters
  currentFilters = {
    search: '',
    use: 'all',
    region: 'all',
    type: 'all',
    sort: 'name-asc'
  };
  
  // Reset UI elements
  document.getElementById('plantSearch').value = '';
  document.getElementById('useFilter').value = 'all';
  document.getElementById('regionFilter').value = 'all';
  document.getElementById('typeFilter').value = 'all';
  document.getElementById('sortFilter').value = 'name-asc';
  
  // Re-render
  applyFiltersAndRender();
}

function applyFiltersAndRender() {
  if (typeof plants === 'undefined') return;
  
  // Start with all plants
  filteredPlants = [...plants];
  
  // Apply search filter
  if (currentFilters.search) {
    filteredPlants = filteredPlants.filter(plant => 
      plant.name.toLowerCase().includes(currentFilters.search) ||
      plant.scientificName.toLowerCase().includes(currentFilters.search) ||
      plant.description.toLowerCase().includes(currentFilters.search)
    );
  }
  
  // Apply use filter
  if (currentFilters.use !== 'all') {
    filteredPlants = filteredPlants.filter(plant => plant.use === currentFilters.use);
  }
  
  // Apply region filter
  if (currentFilters.region !== 'all') {
    filteredPlants = filteredPlants.filter(plant => plant.region === currentFilters.region);
  }
  
  // Apply type filter
  if (currentFilters.type !== 'all') {
    filteredPlants = filteredPlants.filter(plant => plant.type === currentFilters.type);
  }
  
  // Apply sorting
  filteredPlants = sortPlants(filteredPlants, currentFilters.sort);
  
  // Render results
  renderPlants();
}

function sortPlants(plantsArray, sortType) {
  const sorted = [...plantsArray];
  
  switch (sortType) {
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'name-desc':
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case 'popularity':
      sorted.sort((a, b) => b.popularity - a.popularity);
      break;
    case 'recent':
      sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
      break;
    default:
      break;
  }
  
  return sorted;
}

function renderPlants() {
  const grid = document.getElementById('plantGrid');
  const noResults = document.getElementById('noResults');
  const resultsNumber = document.getElementById('resultsNumber');
  
  if (!grid) return;
  
  // Update results count
  if (resultsNumber) {
    resultsNumber.textContent = filteredPlants.length;
  }
  
  // Show/hide no results message
  if (filteredPlants.length === 0) {
    grid.style.display = 'none';
    if (noResults) noResults.style.display = 'flex';
    return;
  } else {
    grid.style.display = 'grid';
    if (noResults) noResults.style.display = 'none';
  }
  
  // Render plant cards
  grid.innerHTML = filteredPlants.map(plant => `
    <article class="plant-card">
      <div class="plant-card__image-wrapper">
        <img src="${plant.imageUrl}" 
             alt="${plant.name}" 
             class="plant-card__image"
             loading="lazy">
        <div class="plant-card__badges">
          <span class="plant-card__badge plant-card__badge--${plant.use}">
            ${translateUse(plant.use)}
          </span>
        </div>
      </div>
      <div class="plant-card__content">
        <h3 class="plant-card__title">${plant.name}</h3>
        <p class="plant-card__scientific">${plant.scientificName}</p>
        <p class="plant-card__description">${plant.description}</p>
        <div class="plant-card__meta">
          <span class="plant-card__meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            ${translateRegion(plant.region)}
          </span>
          <span class="plant-card__meta-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
              <path d="M7.5 12.5a5 5 0 0 0 9 0"></path>
            </svg>
            ${translateType(plant.type)}
          </span>
        </div>
      </div>
    </article>
  `).join('');
}

function translateUse(use) {
  const translations = {
    'medicinal': 'Medicinal',
    'ornamental': 'Ornamental',
    'alimenticio': 'Alimenticio',
    'industrial': 'Industrial'
  };
  return translations[use] || use;
}

function translateRegion(region) {
  const translations = {
    'sudamerica': 'Sudamérica',
    'centroamerica': 'Centroamérica',
    'caribe': 'Caribe',
    'europa': 'Europa',
    'asia': 'Asia',
    'africa': 'África'
  };
  return translations[region] || region;
}

function translateType(type) {
  const translations = {
    'arbol': 'Árbol',
    'arbusto': 'Arbusto',
    'hierba': 'Hierba',
    'trepadora': 'Trepadora',
    'suculenta': 'Suculenta'
  };
  return translations[type] || type;
}

// Site info modal from footer link
function initSiteInfoModal() {
  const siteInfoLinks = document.querySelectorAll('a[href="#site-info"]');
  if (!siteInfoLinks.length) return;

  const modal = createSiteInfoModal();
  const closeButton = modal.querySelector('[data-site-info-close]');
  const dialog = modal.querySelector('.site-info-modal__dialog');

  function openModal() {
    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });
    document.body.classList.add('site-info-modal-open');
    if (closeButton) closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    document.body.classList.remove('site-info-modal-open');
    window.setTimeout(() => {
      modal.hidden = true;
    }, 200);
  }

  siteInfoLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      openModal();
    });
  });

  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  // Prevent clicks inside dialog from bubbling to overlay close
  if (dialog) {
    dialog.addEventListener('click', function(event) {
      event.stopPropagation();
    });
  }
}

function createSiteInfoModal() {
  const modal = document.createElement('div');
  modal.className = 'site-info-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'siteInfoTitle');

  modal.innerHTML = `
    <div class="site-info-modal__dialog">
      <button type="button" class="site-info-modal__close" data-site-info-close aria-label="Cerrar ventana">
        ×
      </button>
      <h2 id="siteInfoTitle" class="site-info-modal__title">Informacion del sitio</h2>
      <div class="site-info-modal__content">
        <p><strong>Version:</strong> V4.0</p>
        <p><strong>Fecha:</strong> 25 de marzo de 2026</p>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

function initEventsEmptyState() {
  setRandomPhraseById('eventsDynamicMessage');
}

function initVolunteerEmptyState() {
  setRandomPhraseById('volunteerDynamicMessage');
}

function setRandomPhraseById(elementId) {
  const messageNode = document.getElementById(elementId);
  if (!messageNode) return;

  const phrases = [
    'Terreno en preparación. El próximo brote tecnológico está por emerger.',
    'Área en mantenimiento biológico. Volveremos con más oxígeno y menos bugs.',
    'Silencio en el invernadero... por ahora. El despliegue estratégico está en proceso.',
    'Espacio reservado para el crecimiento exponencial. Vuelva en el próximo ciclo.',
    'No solo enseñamos: realizamos. Únase a la próxima ejecución de LifePlants.',
    'Donde la sintaxis se encuentra con la fotosíntesis. Próximo taller en breve.',
    'Sin presupuesto, pero con alta agencia. Esté atento a nuestra próxima misión.',
    'Compilando naturaleza, ejecutando futuro. Nuestra base de datos biológica se está expandiendo.',
    'Cero rastro de actividad... la calma perfecta antes de la tormenta de innovación.',
    'Optimizando recursos naturales. Si ve este mensaje, es que estamos recolectando datos (o agua).'
  ];

  const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
  messageNode.textContent = randomPhrase;
}

function initCreditsEasterEgg() {
  const creditsLinks = document.querySelectorAll('a[href="#creditos"]');
  if (!creditsLinks.length) return;

  let clickCount = 0;
  let rotationIntervalId = null;
  let gifRotationIntervalId = null;
  let easterEggModal = null;

  const phrases = [
    'El presupuesto es una limitación física; la inventiva es una propiedad cuántica. No tienen el mismo límite.',
    'Un sistema que no se prueba hasta el fallo, no es un sistema confiable. Falle rápido, aprenda más rápido.',
    'El hardware es reemplazable. El código es efímero. La capacidad de resolver lo imposible es su único activo real.',
    'La escasez de recursos es el entorno de pruebas definitivo para la Alta Agencia. Si puede hacerlo aquí, puede hacerlo en cualquier lugar.',
    'Deje que los demás hablen de lo que harán. Usted simplemente muéstreles lo que ya está ejecutándose.',
    'La elegancia técnica no reside en lo que se añade, sino en lo que ya no se puede quitar sin romper la lógica.',
    'Si el camino hacia la soberanía técnica fuera fácil, el mundo estaría lleno de ingenieros. Mantenga la presión sobre el sistema.',
    'No espere a que las condiciones sean perfectas. El despliegue en condiciones adversas es lo que separa a un usuario de un creador.',
    'Su mayor ventaja competitiva no es lo que tiene en el banco, sino lo que tiene entre los dos hemisferios cerebrales.',
    'Cero excusas. Cero rodeos. Ejecución pura. El ruido es para los aficionados; el silencio es para los arquitectos.'
  ];

  const gifs = [
    {
      imageSrc: 'https://media.giphy.com/media/sWf6O1VTBQq9VQAVSA/giphy.gif',
      creditHref: 'https://giphy.com/gifs/meme-instagram-naaayj-sWf6O1VTBQq9VQAVSA',
    },
    {
      imageSrc: 'https://media.giphy.com/media/vapBjVJDwKOvt8YQpg/giphy.gif',
      creditHref: 'https://giphy.com/gifs/tuff-kraladam11-this-is-vapBjVJDwKOvt8YQpg',
    },
    {
      imageSrc: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHNoeXI3eG8ydGpmdXZyMmlrNDdyNGR2dXVyYTE4aWZxcjM1dTFqdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xtwyefP9CfKL9urbEV/giphy.gif',
      creditHref: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaHNoeXI3eG8ydGpmdXZyMmlrNDdyNGR2dXVyYTE4aWZxcjM1dTFqdiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xtwyefP9CfKL9urbEV/giphy.gif',
    }
  ];

  function randomPhrase() {
    return phrases[Math.floor(Math.random() * phrases.length)];
  }

  function ensureModal() {
    if (easterEggModal) return easterEggModal;

    easterEggModal = document.createElement('div');
    easterEggModal.className = 'credits-easter-egg';
    easterEggModal.hidden = true;
    easterEggModal.setAttribute('role', 'dialog');
    easterEggModal.setAttribute('aria-modal', 'true');
    easterEggModal.setAttribute('aria-labelledby', 'creditsEggTitle');

    easterEggModal.innerHTML = `
      <div class="credits-easter-egg__dialog">
        <button type="button" class="credits-easter-egg__close" data-egg-close aria-label="Cerrar easter egg">×</button>
        <h2 id="creditsEggTitle" class="credits-easter-egg__title">Modo Arquitecto Activado</h2>
        <p class="credits-easter-egg__phrase" data-egg-phrase></p>
        <button type="button" class="credits-easter-egg__next" data-egg-next>Otra frase</button>
        <div class="credits-easter-egg__gif-wrap">
          <div class="credits-easter-egg__gif-media">
            <img data-egg-gif-image src="https://media.giphy.com/media/sWf6O1VTBQq9VQAVSA/giphy.gif" alt="GIF motivacional LifePlants" loading="lazy" />
          </div>
          <p><a data-egg-gif-link href="https://giphy.com/gifs/meme-instagram-naaayj-sWf6O1VTBQq9VQAVSA" target="_blank" rel="noopener noreferrer">via GIPHY</a></p>
        </div>
      </div>
    `;

    document.body.appendChild(easterEggModal);
    return easterEggModal;
  }

  function rotatePhrase(phraseNode) {
    phraseNode.textContent = randomPhrase();
  }

  function startRotation(phraseNode) {
    if (rotationIntervalId) {
      window.clearInterval(rotationIntervalId);
    }
    rotationIntervalId = window.setInterval(() => {
      rotatePhrase(phraseNode);
    }, 4500);
  }

  function stopRotation() {
    if (rotationIntervalId) {
      window.clearInterval(rotationIntervalId);
      rotationIntervalId = null;
    }
  }

  function rotateGif(gifImageNode, gifLinkNode) {
    const gif = gifs[Math.floor(Math.random() * gifs.length)];
    if (!gif) return;

    gifImageNode.src = gif.imageSrc;
    gifLinkNode.href = gif.creditHref;
  }

  function startGifRotation(gifImageNode, gifLinkNode) {
    if (gifRotationIntervalId) {
      window.clearInterval(gifRotationIntervalId);
    }
    gifRotationIntervalId = window.setInterval(() => {
      rotateGif(gifImageNode, gifLinkNode);
    }, 5000);
  }

  function stopGifRotation() {
    if (gifRotationIntervalId) {
      window.clearInterval(gifRotationIntervalId);
      gifRotationIntervalId = null;
    }
  }

  function launchConfetti() {
    const container = document.createElement('div');
    container.className = 'credits-confetti';
    container.setAttribute('aria-hidden', 'true');

    const colors = ['#16a34a', '#22c55e', '#84cc16', '#f97316', '#10b981', '#ffffff'];
    const pieces = 220;

    for (let i = 0; i < pieces; i += 1) {
      const piece = document.createElement('span');
      const left = Math.random() * 100;
      const duration = 2.8 + Math.random() * 2.2;
      const delay = Math.random() * 0.7;
      const drift = -120 + Math.random() * 240;
      const color = colors[Math.floor(Math.random() * colors.length)];

      piece.className = 'credits-confetti__piece';
      piece.style.left = `${left}vw`;
      piece.style.backgroundColor = color;
      piece.style.animationDuration = `${duration}s`;
      piece.style.animationDelay = `${delay}s`;
      piece.style.setProperty('--drift', `${drift}px`);
      container.appendChild(piece);
    }

    document.body.appendChild(container);
    window.setTimeout(() => {
      container.remove();
    }, 6200);
  }

  function openEasterEgg() {
    const modal = ensureModal();
    const phraseNode = modal.querySelector('[data-egg-phrase]');
    const closeBtn = modal.querySelector('[data-egg-close]');
    const nextBtn = modal.querySelector('[data-egg-next]');
    const gifImageNode = modal.querySelector('[data-egg-gif-image]');
    const gifLinkNode = modal.querySelector('[data-egg-gif-link]');

    if (!phraseNode || !closeBtn || !nextBtn || !gifImageNode || !gifLinkNode) return;

    rotatePhrase(phraseNode);
    startRotation(phraseNode);
    rotateGif(gifImageNode, gifLinkNode);
    startGifRotation(gifImageNode, gifLinkNode);

    modal.hidden = false;
    requestAnimationFrame(() => {
      modal.classList.add('is-open');
    });

    const closeModal = function() {
      modal.classList.remove('is-open');
      stopRotation();
      stopGifRotation();
      window.setTimeout(() => {
        modal.hidden = true;
      }, 180);
      document.removeEventListener('keydown', onEscape);
    };

    const onEscape = function(event) {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    closeBtn.onclick = closeModal;
    nextBtn.onclick = function() {
      rotatePhrase(phraseNode);
    };

    modal.onclick = function(event) {
      if (event.target === modal) {
        closeModal();
      }
    };

    document.addEventListener('keydown', onEscape);
  }

  creditsLinks.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      clickCount += 1;

      if (clickCount >= 10) {
        clickCount = 0;
        launchConfetti();
        openEasterEgg();
      }
    });
  });
}
