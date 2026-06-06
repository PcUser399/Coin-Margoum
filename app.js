/**
 * Coin Margoum Website JS Logic
 * Contains navigation effects, menu filtering, and photo gallery lightbox actions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollNavbar();
    
    // Check if on menu page
    if (document.getElementById('category-filters')) {
        initMenuFilters();
    }

    // Check if on about/gallery page
    if (document.getElementById('gallery-lightbox')) {
        initLightbox();
    }

    // Init custom hero dishes carousel
    initHeroCarousel();
});

/**
 * Mobile Navigation Drawer Toggle
 */
function initMobileNav() {
    const toggleBtn = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Swap icon between bars and xmark
        const icon = toggleBtn.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fa-solid fa-xmark';
        } else {
            icon.className = 'fa-solid fa-bars';
        }
    });

    // Close menu when clicking navigation links on mobile
    const links = navMenu.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            const icon = toggleBtn.querySelector('i');
            if (icon) icon.className = 'fa-solid fa-bars';
        });
    });
}

/**
 * Scroll effects for transparent-to-solid sticky header
 */
function initScrollNavbar() {
    const navbar = document.getElementById('main-navbar');
    const hero = document.getElementById('hero-section');
    if (!navbar) return;

    if (hero) {
        // Start transparent on pages with a hero section
        navbar.classList.add('navbar-transparent');

        const checkScroll = () => {
            const heroHeight = hero.offsetHeight - navbar.offsetHeight;
            const scrollY = window.scrollY;

            // Reset navbar classes
            navbar.classList.remove('navbar-transparent', 'navbar-dark-overlay', 'navbar-scrolled');

            if (scrollY > heroHeight) {
                navbar.classList.add('navbar-scrolled');
            } else if (scrollY > 75) {
                navbar.classList.add('navbar-dark-overlay');
            } else {
                navbar.classList.add('navbar-transparent');
            }
        };

        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Set correct state on load
    } else {
        // Solid header on pages without a hero section
        navbar.classList.add('navbar-scrolled');
    }
}

/**
 * Interactive Menu Filtering with transitions
 */
function initMenuFilters() {
    const filterContainer = document.getElementById('category-filters');
    const menuItems = document.querySelectorAll('.menu-item');
    const moreBox = document.getElementById('menu-more-placeholder');

    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.menu-filter-btn');
        if (!btn) return;

        // Active button styles
        filterContainer.querySelectorAll('.menu-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;

        // Smooth fade out
        menuItems.forEach(item => {
            item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            item.style.opacity = '0';
            item.style.transform = 'translateY(10px)';
        });
        if (moreBox) {
            moreBox.style.transition = 'opacity 0.25s ease';
            moreBox.style.opacity = '0';
        }

        // Apply filtering after fade out
        setTimeout(() => {
            menuItems.forEach(item => {
                const itemCategory = item.dataset.category;
                
                if (category === 'all' || itemCategory === category) {
                    item.style.display = 'flex';
                    // Trigger reflow to apply transition
                    void item.offsetWidth;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                } else {
                    item.style.display = 'none';
                }
            });

            // Show "and many more" box under all or main categories, but maybe hide in desserts
            if (moreBox) {
                if (category === 'all' || category === 'traditionnel') {
                    moreBox.style.display = 'block';
                    void moreBox.offsetWidth;
                    moreBox.style.opacity = '1';
                } else {
                    moreBox.style.display = 'none';
                }
            }
        }, 250);
    });
}

/**
 * Fullscreen Photo Lightbox for Gallery
 */
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close-btn');

    if (!lightbox || !lightboxImg) return;

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const imgAlt = item.querySelector('img').alt;
            
            lightboxImg.src = imgSrc;
            lightboxImg.alt = imgAlt;
            
            // Open lightbox with class
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Stop scrolling background
        });
    });

    // Close on button click
    closeBtn.addEventListener('click', closeLightbox);

    // Close on background click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-content')) {
            closeLightbox();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto'; // Re-enable scroll
        // Clear src after fade transition ends
        setTimeout(() => {
            lightboxImg.src = '';
        }, 300);
    }
}

/**
 * Swapping, floating, and interactive Tunisian dishes carousel inside the hero section
 */
function initHeroCarousel() {
    const container = document.getElementById('hero-dishes-carousel');
    if (!container) return;

    // Defer loading of remaining dish images until page loads completely
    const lazyLoadRemainingDishes = () => {
        const lazyImages = container.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    };

    if (document.readyState === 'complete') {
        lazyLoadRemainingDishes();
    } else {
        window.addEventListener('load', lazyLoadRemainingDishes);
    }

    const dishes = container.querySelectorAll('.hero-dish-wrapper');
    if (dishes.length < 2) return;

    let currentIndex = 0; // index of the active centered dish
    let carouselInterval;
    let isHovered = false;

    // Center index update handler
    const updateCarousel = (centerIdx) => {
        dishes.forEach((dish, idx) => {
            dish.classList.remove('dish-active', 'dish-next', 'dish-prev', 'dish-hidden');
            if (idx === centerIdx) {
                // Centered active floating dish
                dish.classList.add('dish-active');
            } else if (idx === (centerIdx + 1) % dishes.length) {
                // Bottom-right preview dish (next)
                dish.classList.add('dish-next');
            } else if (idx === (centerIdx - 1 + dishes.length) % dishes.length) {
                // Top-right preview dish (prev)
                dish.classList.add('dish-prev');
            } else {
                // Hidden queue dish
                dish.classList.add('dish-hidden');
            }
        });
    };

    // Initialize layout positions
    updateCarousel(currentIndex);

    const rotateCarousel = () => {
        if (isHovered) return; // Freeze animation on hover
        currentIndex = (currentIndex + 1) % dishes.length;
        updateCarousel(currentIndex);
    };

    const startInterval = () => {
        clearInterval(carouselInterval);
        carouselInterval = setInterval(rotateCarousel, 3500);
    };

    startInterval();

    // 1. Mouse Hover freeze
    container.addEventListener('mouseenter', () => {
        isHovered = true;
        clearInterval(carouselInterval);
    });

    container.addEventListener('mouseleave', () => {
        isHovered = false;
        startInterval();
    });

    // 2. Click/Drag navigation & interaction mapping
    const dishLinks = {
        0: { id: 'menu-couscous-poisson', menu: 'menu.html#menu-couscous-poisson' }, // Couscous au Poisson
        1: { id: 'menu-couscous',         menu: 'menu.html#menu-couscous'         }, // Couscous à l'Agneau
        2: { id: 'menu-ojja',             menu: 'menu.html#menu-ojja'             }, // Ojja Merguez
        3: { id: 'menu-poisson-grille',   menu: 'menu.html#menu-poisson-grille'   }, // Poisson Grillé
        4: { id: 'menu-chakchouka',       menu: 'menu.html#menu-chakchouka'       }, // Chakchouka
        5: { id: 'menu-lablabi',          menu: 'menu.html#menu-lablabi'          }  // Lablabi
    };

    let startX = 0;
    let startY = 0;
    let isMouseDown = false;
    let wasDragging = false;

    // Mouse events on container
    container.addEventListener('mousedown', (e) => {
        // Prevent default text selection and browser image dragging actions
        e.preventDefault();
        isMouseDown = true;
        wasDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        
        // Break interval on interaction start
        clearInterval(carouselInterval);
    });

    window.addEventListener('mousemove', (e) => {
        if (!isMouseDown) return;
        const diffX = e.clientX - startX;
        const diffY = e.clientY - startY;

        if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
            wasDragging = true;
        }
    });

    window.addEventListener('mouseup', (e) => {
        if (!isMouseDown) return;
        isMouseDown = false;

        const diffY = e.clientY - startY;

        if (wasDragging) {
            // Dragged down -> next dish
            if (diffY > 50) {
                currentIndex = (currentIndex + 1) % dishes.length;
                updateCarousel(currentIndex);
            } 
            // Dragged up -> prev dish
            else if (diffY < -50) {
                currentIndex = (currentIndex - 1 + dishes.length) % dishes.length;
                updateCarousel(currentIndex);
            }
            // Reset interval to 0
            startInterval();
        }

        setTimeout(() => {
            wasDragging = false;
        }, 50);
    });

    // Touch events for mobile swiping
    let isTouching = false;

    container.addEventListener('touchstart', (e) => {
        isTouching = true;
        wasDragging = false;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        clearInterval(carouselInterval);
    });

    container.addEventListener('touchmove', (e) => {
        if (!isTouching) return;
        const diffX = e.touches[0].clientX - startX;
        const diffY = e.touches[0].clientY - startY;
        if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
            wasDragging = true;
        }
    });

    container.addEventListener('touchend', (e) => {
        if (!isTouching) return;
        isTouching = false;

        const diffY = e.changedTouches[0].clientY - startY;

        if (wasDragging) {
            if (diffY > 50) {
                currentIndex = (currentIndex + 1) % dishes.length;
                updateCarousel(currentIndex);
            } else if (diffY < -50) {
                currentIndex = (currentIndex - 1 + dishes.length) % dishes.length;
                updateCarousel(currentIndex);
            }
            startInterval();
        }

        setTimeout(() => {
            wasDragging = false;
        }, 50);
    });

    // Click handler for navigation
    container.addEventListener('click', (e) => {
        if (wasDragging) return;

        // A. Clicking next preview platter shifts it to active
        const nextDish = e.target.closest('.dish-next');
        if (nextDish) {
            const nextIdx = parseInt(nextDish.dataset.index);
            if (!isNaN(nextIdx)) {
                currentIndex = nextIdx;
                updateCarousel(currentIndex);
                startInterval();
            }
            return;
        }

        // B. Clicking prev preview platter shifts it to active
        const prevDish = e.target.closest('.dish-prev');
        if (prevDish) {
            const prevIdx = parseInt(prevDish.dataset.index);
            if (!isNaN(prevIdx)) {
                currentIndex = prevIdx;
                updateCarousel(currentIndex);
                startInterval();
            }
            return;
        }

        // C. Clicking active platter scrolls/navigates to details with glow
        const activeDish = e.target.closest('.dish-active');
        if (activeDish) {
            const activeIdx = parseInt(activeDish.dataset.index);
            if (!isNaN(activeIdx) && dishLinks[activeIdx]) {
                const target = dishLinks[activeIdx];
                const localEl = document.getElementById(target.id);
                if (localEl) {
                    localEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    localEl.classList.add('dish-glow');
                    setTimeout(() => localEl.classList.remove('dish-glow'), 2100);
                } else {
                    window.location.href = target.menu;
                }
            }
        }
    });
}

// Check URL hash on page load to focus and glow targeted menu items
window.addEventListener('load', () => {
    const hash = window.location.hash;
    if (hash) {
        const target = document.querySelector(hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('dish-glow');
                setTimeout(() => {
                    target.classList.remove('dish-glow');
                }, 2100);
            }, 400);
        }
    }
});
