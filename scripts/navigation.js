/**
 * ===================================
 * BESORAH YESHUA MINISTRY - NAVIGATION SYSTEM
 * Fixed Version - Deployment Ready
 * ===================================
 */

'use strict';

// ===================================
// CONFIGURATION
// ===================================

const NAV_CONFIG = {
    scrollThreshold: 50,
    hideOnScrollDown: false,
    breadcrumbEnabled: true,
    mobileBreakpoint: 768,
    animationDuration: 300,
    
    // Page titles mapping for breadcrumbs
    pageTitles: {
        'index.html': 'Home',
        'about.html': 'About Us',
        'events.html': 'Events',
        'partnership.html': 'Partnership',
        'contact.html': 'Contact',
        'donate.html': 'Donate',
        'resources.html': 'Resources',
        'sermons.html': 'Sermons',
        'books.html': 'Books',
        'prayer.html': 'Prayer Request',
        'bible-planner.html': 'Bible Study'
    },
    
    pageHierarchy: {
        'about.html': ['index.html'],
        'events.html': ['index.html'],
        'partnership.html': ['index.html'],
        'donate.html': ['index.html'],
        'contact.html': ['index.html'],
        'prayer.html': ['index.html'],
        'resources.html': ['index.html'],
        'sermons.html': ['index.html', 'resources.html'],
        'books.html': ['index.html', 'resources.html'],
        'bible-planner.html': ['index.html', 'resources.html']
    }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
}

function isHomePage() {
    const currentPage = getCurrentPage();
    return currentPage === 'index.html' || currentPage === '' || currentPage === '/';
}

function getPageTitle(filename) {
    if (NAV_CONFIG.pageTitles[filename]) {
        return NAV_CONFIG.pageTitles[filename];
    }
    
    return filename
        .replace('.html', '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// MOBILE NAVIGATION
// ===================================

class MobileNavigation {
    constructor() {
        this.hamburger = document.querySelector('[data-nav-toggle]') || 
                        document.querySelector('.hamburger');
        this.navMenu = document.getElementById('nav-menu') || 
                      document.querySelector('.nav-menu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.header = document.querySelector('header');
        this.isOpen = false;
        this.backdrop = null;
        
        if (!this.hamburger || !this.navMenu) {
            console.warn('Navigation elements not found');
            return;
        }
        
        this.init();
    }
    
    init() {
        // Hamburger click
        this.hamburger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggle();
        });
        
        // Close on link click (mobile)
        this.navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (this.isOpen && window.innerWidth <= NAV_CONFIG.mobileBreakpoint) {
                    this.close();
                }
            });
        });
        
        // Close on outside click
        document.addEventListener('click', (e) => {
            if (this.isOpen && 
                !this.navMenu.contains(e.target) && 
                !this.hamburger.contains(e.target)) {
                this.close();
            }
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
                this.hamburger.focus();
            }
        });
        
        // Handle resize
        window.addEventListener('resize', throttle(() => {
            if (window.innerWidth > NAV_CONFIG.mobileBreakpoint && this.isOpen) {
                this.close();
            }
        }, 250));
        
        // Set active page
        this.setActivePage();
        
        // Initialize ARIA
        this.updateARIA();
        
        console.log('✅ Mobile Navigation initialized');
    }
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    
    open() {
        this.isOpen = true;
        
        this.hamburger.classList.add('active');
        this.navMenu.classList.add('active');
        
        this.updateARIA();
        
        // Prevent body scroll
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        
        this.addBackdrop();
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
        
        this.updateARIA();
        
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        this.removeBackdrop();
    }
    
    updateARIA() {
        this.hamburger.setAttribute('aria-expanded', this.isOpen.toString());
        this.navMenu.setAttribute('aria-hidden', (!this.isOpen).toString());
    }
    
    addBackdrop() {
        if (document.querySelector('.nav-backdrop')) return;
        
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'nav-backdrop';
        this.backdrop.setAttribute('aria-hidden', 'true');
        
        document.body.appendChild(this.backdrop);
        
        requestAnimationFrame(() => {
            if (this.backdrop) {
                this.backdrop.classList.add('active');
            }
        });
        
        this.backdrop.addEventListener('click', () => this.close());
    }
    
    removeBackdrop() {
        if (!this.backdrop) return;
        
        this.backdrop.classList.remove('active');
        
        setTimeout(() => {
            if (this.backdrop && this.backdrop.parentNode) {
                this.backdrop.remove();
                this.backdrop = null;
            }
        }, NAV_CONFIG.animationDuration);
    }
    
    setActivePage() {
        const currentPage = getCurrentPage();
        
        this.navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const linkPage = href ? href.split('/').pop() : '';
            
            const isActive = 
                linkPage === currentPage ||
                (currentPage === 'index.html' && (linkPage === '' || linkPage === '/' || linkPage === 'index.html'));
            
            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    }
}

// ===================================
// HEADER SCROLL EFFECT
// ===================================

class HeaderScroll {
    constructor() {
        this.header = document.querySelector('header');
        this.lastScroll = 0;
        this.isScrolled = false;
        
        if (this.header) {
            this.init();
        }
    }
    
    init() {
        const handleScroll = () => {
            const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
            
            if (currentScroll > NAV_CONFIG.scrollThreshold) {
                if (!this.isScrolled) {
                    this.header.classList.add('scrolled');
                    this.isScrolled = true;
                }
            } else {
                if (this.isScrolled) {
                    this.header.classList.remove('scrolled');
                    this.isScrolled = false;
                }
            }
            
            this.lastScroll = currentScroll <= 0 ? 0 : currentScroll;
        };
        
        window.addEventListener('scroll', throttle(handleScroll, 100), { passive: true });
        
        handleScroll();
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.header.classList.add('loaded');
            }, 300);
        });
        
        console.log('✅ Header Scroll initialized');
    }
}

// ===================================
// BREADCRUMB NAVIGATION
// ===================================

class BreadcrumbNavigation {
    constructor() {
        this.wrapper = null;
        this.init();
    }
    
    init() {
        if (!NAV_CONFIG.breadcrumbEnabled || isHomePage()) {
            document.body.classList.add('home-page');
            return;
        }
        
        this.createBreadcrumb();
    }
    
    createBreadcrumb() {
        const currentPage = getCurrentPage();
        const breadcrumbItems = this.buildBreadcrumbPath(currentPage);
        
        this.wrapper = document.createElement('nav');
        this.wrapper.className = 'breadcrumb-wrapper';
        this.wrapper.setAttribute('aria-label', 'Breadcrumb');
        
        const container = document.createElement('div');
        container.className = 'breadcrumb-container';
        
        const breadcrumbList = document.createElement('ol');
        breadcrumbList.className = 'breadcrumb';
        
        breadcrumbItems.forEach((item, index) => {
            const listItem = this.createBreadcrumbItem(item, index, breadcrumbItems.length);
            breadcrumbList.appendChild(listItem);
        });
        
        container.appendChild(breadcrumbList);
        this.wrapper.appendChild(container);
        
        const header = document.querySelector('header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(this.wrapper, header.nextSibling);
        }
        
        requestAnimationFrame(() => {
            this.wrapper.style.opacity = '1';
        });
        
        console.log('✅ Breadcrumb initialized');
    }
    
    buildBreadcrumbPath(currentPage) {
        const path = [{
            title: 'Home',
            url: 'index.html',
            isHome: true
        }];
        
        if (NAV_CONFIG.pageHierarchy[currentPage]) {
            NAV_CONFIG.pageHierarchy[currentPage].forEach(parentPage => {
                if (parentPage !== 'index.html') {
                    path.push({
                        title: getPageTitle(parentPage),
                        url: parentPage,
                        isHome: false
                    });
                }
            });
        }
        
        path.push({
            title: getPageTitle(currentPage),
            url: currentPage,
            isHome: false,
            isCurrent: true
        });
        
        return path;
    }
    
    createBreadcrumbItem(item, index, totalItems) {
        const listItem = document.createElement('li');
        listItem.className = 'breadcrumb-item';
        
        if (item.isCurrent) {
            const span = document.createElement('span');
            span.textContent = sanitizeText(item.title);
            span.setAttribute('aria-current', 'page');
            listItem.appendChild(span);
        } else {
            const link = document.createElement('a');
            link.href = item.url;
            
            if (item.isHome) {
                const icon = document.createElement('i');
                icon.className = 'fas fa-home breadcrumb-home';
                icon.setAttribute('aria-hidden', 'true');
                link.appendChild(icon);
                
                const span = document.createElement('span');
                span.className = 'sr-only';
                span.textContent = sanitizeText(item.title);
                link.appendChild(span);
            } else {
                link.textContent = sanitizeText(item.title);
            }
            
            listItem.appendChild(link);
        }
        
        if (index < totalItems - 1) {
            const separator = document.createElement('span');
            separator.className = 'breadcrumb-separator';
            separator.textContent = '/';
            separator.setAttribute('aria-hidden', 'true');
            listItem.appendChild(separator);
        }
        
        return listItem;
    }
}

// ===================================
// SCROLL TO TOP
// ===================================

class ScrollToTop {
    constructor() {
        this.button = this.createButton();
        this.isVisible = false;
        
        if (this.button) {
            this.init();
        }
    }
    
    createButton() {
        let btn = document.getElementById('scrollTopBtn');
        
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'scrollTopBtn';
            btn.className = 'scroll-to-top';
            btn.type = 'button';
            btn.setAttribute('aria-label', 'Scroll to top');
            btn.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
            document.body.appendChild(btn);
        }
        
        return btn;
    }
    
    init() {
        const handleScroll = () => {
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollY > 300) {
                this.show();
            } else {
                this.hide();
            }
        };
        
        window.addEventListener('scroll', throttle(handleScroll, 200), { passive: true });
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        handleScroll();
        
        console.log('✅ Scroll to Top initialized');
    }
    
    show() {
        if (!this.isVisible) {
            this.button.style.display = 'flex';
            requestAnimationFrame(() => {
                this.button.style.opacity = '1';
                this.button.style.transform = 'translateY(0)';
            });
            this.isVisible = true;
        }
    }
    
    hide() {
        if (this.isVisible) {
            this.button.style.opacity = '0';
            this.button.style.transform = 'translateY(10px)';
            setTimeout(() => {
                this.button.style.display = 'none';
            }, NAV_CONFIG.animationDuration);
            this.isVisible = false;
        }
    }
}

// ===================================
// PAGE LOADER
// ===================================

class PageLoader {
    constructor() {
        this.loader = document.querySelector('.page-loader');
        this.init();
    }
    
    init() {
        if (!this.loader) return;
        
        const hideLoader = () => {
            this.loader.style.opacity = '0';
            setTimeout(() => {
                this.loader.style.display = 'none';
                document.body.classList.add('loaded');
            }, NAV_CONFIG.animationDuration);
        };
        
        if (document.readyState === 'complete') {
            hideLoader();
        } else {
            window.addEventListener('load', hideLoader);
        }
        
        setTimeout(hideLoader, 3000);
    }
}

// ===================================
// INITIALIZATION
// ===================================

function initNavigation() {
    new MobileNavigation();
    new HeaderScroll();
    new BreadcrumbNavigation();
    new ScrollToTop();
    new PageLoader();
    
    console.log('🙏 Besorah Yeshua - Navigation Ready');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}