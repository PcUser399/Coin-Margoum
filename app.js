/**
 * Coin Margoum Website JS Logic
 * Contains navigation effects, menu filtering, and photo gallery lightbox actions.
 */

document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initScrollNavbar();
    
    // Check if on menu page
    if (document.getElementById('category-filters')) {
        initAdminMenu();
    } else {
        initNavbarAdminStatus();
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
    const moreBox = document.getElementById('menu-more-placeholder');

    if (!filterContainer) return;

    filterContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.menu-filter-btn');
        if (!btn) return;

        // Active button styles
        filterContainer.querySelectorAll('.menu-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const category = btn.dataset.category;

        // Query menu items dynamically so they are always current
        const menuItems = document.querySelectorAll('.menu-item, .menu-item-tr');

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
        0: { id: 'menu-item-65', menu: 'menu.html?dish=menu-item-65' }, // Couscous au Poisson
        1: { id: 'menu-item-64',         menu: 'menu.html?dish=menu-item-64'         }, // Couscous à l'Agneau
        2: { id: 'menu-item-67',             menu: 'menu.html?dish=menu-item-67'             }, // Ojja Merguez
        3: { id: 'menu-item-70',   menu: 'menu.html?dish=menu-item-70'   }, // Poisson Grillé
        4: { id: 'menu-item-63',       menu: 'menu.html?dish=menu-item-63'       }, // Chakchouka
        5: { id: 'menu-item-62',          menu: 'menu.html?dish=menu-item-62'          }  // Lablabi
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
                    // Preserve admin param if currently active
                    const currentParams = new URLSearchParams(window.location.search);
                    let dest = target.menu;
                    const ssdeVal = currentParams.get('ssde');
                    if (ssdeVal && ssdeVal.includes('ge84wf6s5g4625w.f')) {
                        dest += (dest.includes('?') ? '&' : '?') + 'ssde=' + encodeURIComponent(ssdeVal);
                    }
                    window.location.href = dest;
                }
            }
        }
    });
}

// Check URL query parameters or hash on page load to focus and glow targeted menu items
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Initialize admin elements
    initNavbarAdminStatus();

    let targetId = urlParams.get('dish');
    
    // Fallback to hash if query param not found
    if (!targetId && window.location.hash) {
        targetId = window.location.hash.substring(1);
    }
    if (targetId) {
        setTimeout( ()=>{
        const target = document.getElementById(targetId);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                target.classList.add('dish-glow');
                setTimeout(() => {
                    target.classList.remove('dish-glow');
                }, 2100);
            }, 100);
        }},1500)
    }
});

/**
 * Creates and displays a sleek password entry modal.
 * Uses the login function in backEnd.js to authenticate.
 */
function showPasswordPopup() {
    if (document.getElementById('admin-login-modal')) return;

    // Create modal element
    const modal = document.createElement('div');
    modal.id = 'admin-login-modal';
    modal.style.position = 'fixed';
    modal.style.inset = '0';
    modal.style.backgroundColor = 'rgba(15, 23, 43, 0.85)';
    modal.style.zIndex = '3000';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.backdropFilter = 'blur(4px)';
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.25s ease';

    // Create modal container
    const container = document.createElement('div');
    container.style.backgroundColor = '#FFFFFF';
    container.style.padding = '2.5rem';
    container.style.borderRadius = '12px';
    container.style.boxShadow = '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.05)';
    container.style.maxWidth = '400px';
    container.style.width = '90%';
    container.style.fontFamily = 'var(--font-body)';

    // Title
    const title = document.createElement('h3');
    title.textContent = 'Espace Administrateur';
    title.style.marginBottom = '1.5rem';
    title.style.color = 'var(--color-text-main)';
    title.style.fontFamily = 'var(--font-heading)';
    title.style.fontSize = '1.5rem';
    title.style.borderBottom = '2px solid var(--color-border)';
    title.style.paddingBottom = '0.5rem';

    // Label
    const label = document.createElement('label');
    label.textContent = 'Mot de passe :';
    label.style.display = 'block';
    label.style.marginBottom = '0.5rem';
    label.style.fontWeight = '500';
    label.style.color = 'var(--color-text-muted)';
    label.style.fontSize = '0.9rem';

    // Input field
    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Entrez le mot de passe';
    input.style.width = '100%';
    input.style.padding = '0.75rem 1rem';
    input.style.border = '1px solid var(--color-border)';
    input.style.borderRadius = '6px';
    input.style.marginBottom = '1rem';
    input.style.fontSize = '1rem';
    input.style.outline = 'none';
    input.style.transition = 'border-color 0.2s';
    input.addEventListener('focus', () => {
        input.style.borderColor = 'var(--color-primary-orange)';
    });
    input.addEventListener('blur', () => {
        input.style.borderColor = 'var(--color-border)';
    });

    // Error message container
    const errMsg = document.createElement('div');
    errMsg.style.color = '#C0392B';
    errMsg.style.fontSize = '0.85rem';
    errMsg.style.marginBottom = '1.5rem';
    errMsg.style.display = 'none';

    // Button container
    const btnContainer = document.createElement('div');
    btnContainer.style.display = 'flex';
    btnContainer.style.gap = '1rem';
    btnContainer.style.justifyContent = 'flex-end';

    // Cancel Button
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Annuler';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.style.padding = '0.6rem 1.2rem';
    cancelBtn.style.fontSize = '0.9rem';
    cancelBtn.addEventListener('click', closeModal);

    // Submit Button
    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Se connecter';
    submitBtn.className = 'btn btn-primary';
    submitBtn.style.padding = '0.6rem 1.2rem';
    submitBtn.style.fontSize = '0.9rem';

    const performLogin = async () => {
        if (submitBtn.disabled) return;
        const password = input.value;
        if (!password) {
            errMsg.textContent = 'Veuillez saisir un mot de passe.';
            errMsg.style.display = 'block';
            return;
        }
        submitBtn.disabled = true;
        submitBtn.textContent = 'Connexion...';
        errMsg.style.display = 'none';

        try {
            await login(password);
            alert('Connexion réussie !');
            closeModal();
            window.location.reload();
        }  catch (error) {
            errMsg.textContent = error.message || 'Échec de la connexion.';
            errMsg.style.display = 'block';
           }finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Se connecter';
            }
    };

    submitBtn.addEventListener('click', performLogin);

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performLogin();
        }
    });

    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 250);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Assemble and append
    btnContainer.appendChild(cancelBtn);
    btnContainer.appendChild(submitBtn);
    container.appendChild(title);
    container.appendChild(label);
    container.appendChild(input);
    container.appendChild(errMsg);
    container.appendChild(btnContainer);
    modal.appendChild(container);
    document.body.appendChild(modal);

    // Fade in animation
    requestAnimationFrame(() => {
        modal.style.opacity = '1';
    });

    setTimeout(() => {
        input.focus();
    }, 100);
}

/**
 * --- ADMIN MENUS AND DATABASE PERSISTENCE LOGIC ---
 */

let currentItems = [];
let defaultStaticItems = [];

/**
 * Checks and configures admin layout parameters for the header on any page.
 */
async function initNavbarAdminStatus() {
    let isAdmin = false;
    try {
        isAdmin = await checkAdmin();
    } catch (e) {
        console.error("Authentication check failed:", e);
    }
    
    const adminBtn = document.getElementById('admin-space-btn');
    if (!adminBtn) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const ssdeVal = urlParams.get('ssde');
    const hasAccessParam = ssdeVal && ssdeVal.includes('ge84wf6s5g4625w.f');
    
    if (isAdmin) {
        adminBtn.style.display = 'inline-flex';
        adminBtn.innerHTML = '<i class="fa-solid fa-lock-open" style="margin-right: 6px;"></i> Admin Connecté';
        adminBtn.classList.remove('btn-secondary');
        adminBtn.classList.add('btn-primary');
        
        // Remove previous listener by replacing the button clone
        const newAdminBtn = adminBtn.cloneNode(true);
        adminBtn.parentNode.replaceChild(newAdminBtn, adminBtn);
        
        newAdminBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm("Voulez-vous vous déconnecter de l'espace administrateur ?")) {
                try {
                    await logout();
                    alert("Déconnexion réussie.");
                    window.location.reload();
                } catch (err) {
                    alert("Erreur lors de la déconnexion : " + err.message);
                }
            }
        });
    } else if (hasAccessParam) {
        adminBtn.style.display = 'inline-flex';
        adminBtn.addEventListener('click', showPasswordPopup);
    }
    
    // Always propagate secret parameter if it is active (logged in or visiting with param)
    if (isAdmin || hasAccessParam) {
        const ADMIN_PARAM = 'ssde=' + encodeURIComponent(ssdeVal || 'ge84wf6s5g4625w.f?few');
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes('.html') && !href.startsWith('http') && !href.includes('ssde=')) {
                const separator = href.includes('?') ? '&' : '?';
                link.setAttribute('href', href + separator + ADMIN_PARAM);
            }
        });
    }
}

/**
 * Parses default static menu elements from the DOM before clearing them.
 */
function parseStaticItems() {
    const items = [];
    const container = document.getElementById('menu-items-container');
    if (!container) return items;
    
    const menuElms = container.querySelectorAll('.menu-item, .menu-item-tr');
    menuElms.forEach(elm => {
        const category = elm.dataset.category || 'all';
        const isTr = elm.classList.contains('menu-item-tr');
        
        const imgElm = elm.querySelector('.menu-item-img img, .menu-item-img-tr img');
        const image = imgElm ? imgElm.getAttribute('src') : '';
        
        const titleElm = elm.querySelector('.menu-item-title');
        const name = titleElm ? titleElm.textContent.trim() : '';
        
        const priceElm = elm.querySelector('.menu-item-price');
        let price = 0;
        if (priceElm) {
            const priceText = priceElm.textContent;
            price = parseFloat(priceText.replace(/[^0-9.]/g, '')) || 0;
        }
        
        const descElm = elm.querySelector('.menu-item-desc');
        const description = descElm ? descElm.textContent.trim() : '';
        
        const footerSpan = elm.querySelectorAll('.menu-item-footer span');
        let footerIcon = '';
        let footerTextLeft = '';
        let footerTextRight = '';
        
        if (footerSpan.length > 0) {
            const iconElm = footerSpan[0].querySelector('i');
            if (iconElm) {
                footerIcon = iconElm.className;
            }
            footerTextLeft = footerSpan[0].textContent.trim();
        }
        if (footerSpan.length > 1) {
            footerTextRight = footerSpan[1].textContent.trim();
        }
        
        items.push({
            name,
            description,
            price,
            category,
            image,
            trstyle: isTr,
            footerIcon,
            footerTextLeft,
            footerTextRight,
            idStr: elm.id || ''
        });
    });
    return items;
}

/**
 * Renders the menu items in the #menu-items-container.
 */
function renderMenu(items, isAdmin) {
    const container = document.getElementById('menu-items-container');
    if (!container) return;
    
    const moreBox = document.getElementById('menu-more-placeholder');
    container.innerHTML = '';
    
    if (isAdmin && items.length === 0) {
        const seedBanner = document.createElement('div');
        seedBanner.className = 'admin-seed-banner';
        seedBanner.innerHTML = `
            <h3><i class="fa-solid fa-database" style="color: var(--color-primary-orange); margin-right: 8px;"></i>Base de données vide</h3>
            <p>La base de données en ligne ne contient aucun plat. Vous pouvez l'initialiser automatiquement avec les 10 plats par défaut de Coin Margoum définis dans le code HTML d'origine.</p>
            <button class="btn btn-primary" onclick="seedDefaultMenu()"><i class="fa-solid fa-cloud-arrow-up" style="margin-right: 6px;"></i> Initialiser la base de données</button>
        `;
        container.appendChild(seedBanner);
    }
    
    items.forEach(item => {
        const itemEl = document.createElement('div');
        const itemClass = item.trstyle ? 'menu-item-tr' : 'menu-item';
        itemEl.className = itemClass;
        itemEl.dataset.category = item.category;
        
        // Save identifier and set ID for scroll targeting
        itemEl.dataset.id = item._id || item.id;
        itemEl.id = item.idStr || `menu-item-${item._id || item.id}`;
        let imgHtml = '';
        const imgClass = item.trstyle ? 'menu-item-img-tr' : 'menu-item-img';
        
        if (item.image_url) {
            imgHtml = `<div class="${imgClass}"><img src="${item.image_url}" alt="${item.name}"></div>`;
        } else {
            const placeholderIcon = item.category === 'desserts' ? 'fa-cookie' : 
                                    (item.category === 'grillades' ? 'fa-fire' : 'fa-bowl-food');
            imgHtml = `
                <div class="${imgClass}">
                    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#FAF6EE; color:var(--color-red-primary); font-size:3rem;">
                        <i class="fa-solid ${placeholderIcon}"></i>
                    </div>
                </div>
            `;
        }
        
        let adminButtonsHtml = '';
        if (isAdmin) {
            adminButtonsHtml = `
                <div class="menu-item-admin-actions">
                    <button class="admin-action-btn edit-btn" title="Modifier" onclick="event.stopPropagation(); editItem('${item._id || item.id}')">
                        <i class="fa-solid fa-pencil"></i>
                    </button>
                    <button class="admin-action-btn delete-btn" title="Supprimer" onclick="event.stopPropagation(); deleteItemClick('${item._id || item.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            `;
        }
        
        let footerHtml = '';
        if (item.footerTextLeft || item.footerTextRight) {
            const iconHtml = item.footerIcon ? `<i class="${item.footerIcon}"></i> ` : '';
            footerHtml = `
                <div class="menu-item-footer">
                    <span>${iconHtml}${item.footerTextLeft || ''}</span>
                    <span>${item.footerTextRight || ''}</span>
                </div>
            `;
        }
        
        itemEl.innerHTML = `
            ${adminButtonsHtml}
            ${imgHtml}
            <div class="menu-item-content">
                <div class="menu-item-header">
                    <span class="menu-item-title">${item.name}</span>
                    <span class="menu-item-price">${item.price} DT</span>
                </div>
                <p class="menu-item-desc">${item.description || ''}</p>
                ${footerHtml}
            </div>
        `;
        
        container.appendChild(itemEl);
    });
    
    if (moreBox) {
        container.appendChild(moreBox);
    }
}

/**
 * Seeds backend database with default menu items when empty.
 */
async function seedDefaultMenu() {
    const bannerBtn = document.querySelector('.admin-seed-banner button');
    if (bannerBtn) {
        bannerBtn.disabled = true;
        bannerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Initialisation en cours...';
    }
    
    try {
        if (!defaultStaticItems || defaultStaticItems.length === 0) {
            throw new Error("Aucun plat par défaut trouvé à initialiser.");
        }
        
        for (const item of defaultStaticItems) {
            await addMenuItem(item);
        }
        alert("La base de données a été initialisée avec succès !");
        window.location.reload();
    } catch (err) {
        alert("Erreur lors de l'initialisation : " + err.message);
        if (bannerBtn) {
            bannerBtn.disabled = false;
            bannerBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up" style="margin-right: 6px;"></i> Initialiser la base de données';
        }
    }
}

/**
 * Initializes menu loading, rendering, and admin state configuration.
 */
async function initAdminMenu() {
    const isMenuPage = !!document.getElementById('category-filters');
    if (!isMenuPage) return;
    
    // Save static markup items in memory first before overwriting
    defaultStaticItems = parseStaticItems();
    
    let isAdmin = false;
    try {
        isAdmin = await checkAdmin();
    } catch (e) {
        console.error("Admin verification failed:", e);
    }
    
    // Call unified header admin configure
    await initNavbarAdminStatus();
    
    try {
        let items ;
        if(!isAdmin){
            items = await getMenu();
        }else{
            items = await getAdminMenu();
        }
        currentItems = items;
        console.log(items);
        if (items && items.length > 0) {
            renderMenu(items, isAdmin);
        } else {
            // Keep default layout, but attach actions overlay if admin is connected
            if (isAdmin) {
                renderMenu([], true);
            }
        }
    } catch (err) {
        console.error("Failed to fetch menu items from backend:", err);
        // Fail-safe: leave static elements, but if admin, overlay disabled CRUD alerts
        if (isAdmin) {
            const container = document.getElementById('menu-items-container');
            const staticElms = container.querySelectorAll('.menu-item, .menu-item-tr');
            staticElms.forEach(elm => {
                if (!elm.querySelector('.menu-item-admin-actions')) {
                    const actions = document.createElement('div');
                    actions.className = 'menu-item-admin-actions';
                    actions.innerHTML = `
                        <button class="admin-action-btn edit-btn" style="opacity: 0.6; cursor: not-allowed;" title="Veuillez d'abord initialiser la base de données" onclick="event.stopPropagation(); alert('Veuillez d\\'abord initialiser la base de données en haut de la page.')">
                            <i class="fa-solid fa-pencil"></i>
                        </button>
                        <button class="admin-action-btn delete-btn" style="opacity: 0.6; cursor: not-allowed;" title="Veuillez d'abord initialiser la base de données" onclick="event.stopPropagation(); alert('Veuillez d\\'abord initialiser la base de données en haut de la page.')">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    `;
                    elm.appendChild(actions);
                }
            });
        }
    }
    
    // Attach floating Add item button
    if (isAdmin) {
        const addBtn = document.createElement('button');
        addBtn.className = 'admin-add-btn';
        addBtn.title = "Ajouter un plat";
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        addBtn.addEventListener('click', () => showAdminItemModal(null));
        document.body.appendChild(addBtn);
    }
    
    // Initialize transitions/filters exactly once menu content is loaded
    initMenuFilters();
}

/**
 * Creates and displays an Admin Modal for creating or updating a menu item.
 */
function showAdminItemModal(item = null) {
    console.log(item);
    const existing = document.getElementById('admin-item-modal');
    if (existing) existing.remove();
    
    const isEdit = !!item;
    
    const overlay = document.createElement('div');
    overlay.id = 'admin-item-modal';
    overlay.className = 'admin-modal-overlay';
    
    const card = document.createElement('div');
    card.className = 'admin-modal-card';
    
    const header = document.createElement('div');
    header.className = 'admin-modal-header';
    header.innerHTML = `
        <h3 class="admin-modal-title">${isEdit ? 'Modifier le plat' : 'Ajouter un nouveau plat'}</h3>
        <button class="admin-modal-close" onclick="closeAdminModal()"><i class="fa-solid fa-xmark"></i></button>
    `;
    
    const body = document.createElement('div');
    body.className = 'admin-modal-body';
    body.innerHTML = `
        <div class="admin-form-group">
            <label for="modal-item-name">Nom du plat *</label>
            <input type="text" id="modal-item-name" class="admin-form-control" placeholder="Ex: Couscous Tunisien" required value="${isEdit ? item.name : ''}">
        </div>
        <div class="admin-form-group">
            <label for="modal-item-price">Prix (DT) *</label>
            <input type="number" id="modal-item-price" class="admin-form-control" placeholder="Ex: 28" required min="0" step="0.5" value="${isEdit ? item.price : ''}">
        </div>
        <div class="admin-form-group">
            <label for="modal-item-category">Catégorie *</label>
            <select id="modal-item-category" class="admin-form-control" required>
                <option value="starters" ${isEdit && item.category === 'starters' ? 'selected' : ''}>Entrées & Salades</option>
                <option value="traditionnel" ${isEdit && item.category === 'traditionnel' ? 'selected' : ''}>Plats Traditionnels</option>
                <option value="grillades" ${isEdit && item.category === 'grillades' ? 'selected' : ''}>Grillades</option>
                <option value="desserts" ${isEdit && item.category === 'desserts' ? 'selected' : ''}>Desserts & Thé</option>
            </select>
        </div>
        <div class="admin-form-group">
            <label for="modal-item-desc">Description</label>
            <textarea id="modal-item-desc" class="admin-form-control admin-form-textarea" placeholder="Entrez la description du plat...">${isEdit ? item.description || '' : ''}</textarea>
        </div>
        <div class="admin-form-group" style="display: flex; align-items: center; gap: 10px; margin-top: 1.5rem; margin-bottom: 1.5rem;">
            <input type="checkbox" id="modal-item-tr" class="admin-form-control" style="width: auto; cursor: pointer;" ${isEdit && item.trstyle ? 'checked' : ''}>
            <label for="modal-item-tr" style="margin: 0; cursor: pointer;">Style d'assiette détourée (trstyle)</label>
        </div>
        <div class="admin-form-group" style="display: flex; align-items: center; gap: 10px; margin-top: .75rem; margin-bottom: 1.5rem;">
            <input type="checkbox" id="modal-item-available" class="admin-form-control" style="width: auto; cursor: pointer;" ${isEdit? (item.available ? 'checked' : '') : 'checked' }>
            <label for="modal-item-tr" style="margin: 0; cursor: pointer;">item available</label>
        </div>
        <div class="admin-form-group">
            <label>Image du plat</label>
            <div class="admin-file-upload" onclick="document.getElementById('modal-item-file').click()">
                <i class="fa-solid fa-cloud-arrow-up"></i>
                <p>Cliquez pour choisir une image</p>
                <input type="file" id="modal-item-file" accept="image/*" onchange="handleModalFileChange(this)">
                <div id="modal-file-preview" class="admin-file-upload-preview">${isEdit && item.image_url ? 'Image actuelle : ' + item.image_url.split('/').pop() : ''}</div>
            </div>
        </div>

    `;
    
    const footer = document.createElement('div');
    footer.className = 'admin-modal-footer';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Annuler';
    cancelBtn.addEventListener('click', closeAdminModal);
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = isEdit ? 'Enregistrer' : 'Ajouter';
    submitBtn.addEventListener('click', () => handleModalSubmit(item));
    
    footer.appendChild(cancelBtn);
    footer.appendChild(submitBtn);
    
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAdminModal();
    });
    
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });
}

function closeAdminModal() {
    const modal = document.getElementById('admin-item-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 250);
    }
}

function handleModalFileChange(input) {
    const preview = document.getElementById('modal-file-preview');
    if (input.files && input.files[0]) {
        preview.textContent = "Fichier sélectionné : " + input.files[0].name;
        preview.style.color = 'var(--color-green-accent)';
    } else {
        preview.textContent = "";
    }
}

async function handleModalSubmit(existingItem = null) {
    const isEdit = !!existingItem;
    
    const name = document.getElementById('modal-item-name').value.trim();
    const priceVal = document.getElementById('modal-item-price').value;
    const category = document.getElementById('modal-item-category').value;
    const description = document.getElementById('modal-item-desc').value.trim();
    const trstyle = document.getElementById('modal-item-tr').checked;
    const available = document.getElementById('modal-item-available').checked;

    
    const fileInput = document.getElementById('modal-item-file');

    if (!name || !priceVal) {
        alert("Veuillez remplir les champs obligatoires (*).");
        return;
    }
    
    const price = parseFloat(priceVal);
    const submitBtn = document.querySelector('.admin-modal-footer .btn-primary');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 6px;"></i> Enregistrement...';
    
    const itemData = {
        name,
        price,
        category,
        description,
        available,
        trstyle
    };
    // In case no new image file is chosen during edit, preserve old database image
    if (isEdit && (!fileInput.files || fileInput.files.length === 0)) {
        itemData.image_url = existingItem.image_url;
    }
    
    try {
        let savedItem;
        if (isEdit) {
            savedItem = await updateMenuItem(existingItem._id || existingItem.id, itemData);
        } else {
            savedItem = await addMenuItem(itemData);
        }
        
        // Handle food image upload if selected
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const targetId = savedItem._id || savedItem.id;
            await uploadFoodImage(targetId, file);
        }
        
        closeAdminModal();
        window.location.reload();
    } catch (err) {
        alert("Erreur lors de l'enregistrement : " + err.message);
        submitBtn.disabled = false;
        submitBtn.textContent = isEdit ? 'Enregistrer' : 'Ajouter';
    }
}

/**
 * Handles confirmation and API call to delete a menu item.
 */
async function deleteItemClick(id) {
    if (confirm("Voulez-vous vraiment supprimer ce plat ? Cette action est irréversible.")) {
        try {
            await deleteMenuItem(id);
            window.location.reload();
        } catch (err) {
            alert("Erreur lors de la suppression : " + err.message);
        }
    }
}

/**
 * Triggers modal form configuration in edit mode.
 */
function editItem(id) {
    const item = currentItems.find(i => Number(i.id) === Number(id));
    if (item) {
        showAdminItemModal(item);
    } else {
        alert("Impossible de trouver le plat ciblé.");
    }
}

// Bind admin routines to global window scope so HTML elements can trigger them
window.seedDefaultMenu = seedDefaultMenu;
window.editItem = editItem;
window.deleteItemClick = deleteItemClick;
window.closeAdminModal = closeAdminModal;
window.handleModalFileChange = handleModalFileChange;
window.handleModalSubmit = handleModalSubmit;

