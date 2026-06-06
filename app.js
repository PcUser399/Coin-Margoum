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
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = 'var(--shadow-md)';
            navbar.style.backgroundColor = 'rgba(253, 251, 247, 0.98)';
        } else {
            navbar.style.boxShadow = 'none';
            navbar.style.backgroundColor = 'rgba(253, 251, 247, 0.95)';
        }
    });
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
