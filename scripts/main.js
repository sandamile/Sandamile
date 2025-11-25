// ===================================
// BESORAH YESHUA MINISTRY - MAIN JAVASCRIPT
// Complete Reorganized & Optimized Version
// Version: 5.0 - Production Ready
// ===================================

'use strict';

// ===================================
// GLOBAL STATE & CONFIGURATION
// ===================================
const BesorahYeshua = {
    // Application State
    isMobile: window.innerWidth <= 968,
    isMenuOpen: false,
    scrollPosition: 0,
    init: false,
    
    // Configuration
    config: {
        breakpoints: {
            mobile: 768,
            tablet: 968,
            desktop: 1200
        },
        animation: {
            duration: 300,
            scrollOffset: 80
        },
        storage: {
            prefix: 'besorah_'
        }
    }
};

// ===================================
// UTILITY FUNCTIONS
// ===================================
class Utils {
    // Performance optimization
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Validation
    static isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Formatting
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    // DOM helpers
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Storage
    static supportsLocalStorage() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Navigation helpers
    static getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page === '' ? 'index.html' : page;
    }

    static isHomePage() {
        const currentPage = this.getCurrentPage();
        return currentPage === 'index.html' || currentPage === '';
    }

    static getPageTitle(filename) {
        // Use navigation config if available
        if (typeof NAV_CONFIG !== 'undefined' && NAV_CONFIG.pageTitles[filename]) {
            return NAV_CONFIG.pageTitles[filename];
        }
        
        // Fallback conversion
        return filename
            .replace('.html', '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}

// ===================================
// ERROR HANDLER
// ===================================
class ErrorHandler {
    constructor() {
        this.errors = [];
        this.init();
    }
    
    init() {
        window.addEventListener('error', (e) => this.handleError(e));
        window.addEventListener('unhandledrejection', (e) => this.handleError(e));
    }
    
    handleError(error) {
        const errorData = {
            message: error.message || error.reason,
            stack: error.error?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };
        
        this.errors.push(errorData);
        console.error('Error logged:', errorData);
        
        // Show user-friendly message in production
        if (!window.location.hostname.includes('localhost')) {
            this.showErrorToUser();
        }
    }
    
    showErrorToUser() {
        if (document.querySelector('.error-notification')) return;
        
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.innerHTML = `
            <div style="position: fixed; top: 90px; right: 20px; background: #dc2626; 
                 color: white; padding: 1rem 1.5rem; border-radius: 8px; 
                 box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; max-width: 300px; 
                 animation: slideInRight 0.3s ease;">
                <strong>⚠️ Something went wrong</strong>
                <p style="margin: 0.5rem 0 0 0; font-size: 0.9rem;">Please refresh the page and try again.</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// ===================================
// LOGO HANDLER
// ===================================
class LogoLoader {
    constructor() {
        this.init();
    }
    
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.handleLogos();
            this.preloadLogo();
        });
    }
    
    handleLogos() {
        const logos = document.querySelectorAll('.logo, .footer-logo');
        
        logos.forEach(logo => {
            logo.addEventListener('error', () => this.createFallback(logo));
            
            if (!logo.src || logo.src.includes('undefined')) {
                logo.src = '/images/logo.png';
            }
            
            if (logo.complete && logo.naturalHeight === 0) {
                this.createFallback(logo);
            }
        });
    }
    
    createFallback(imgElement) {
        console.warn('Logo failed to load:', imgElement.src);
        
        const isFooter = imgElement.classList.contains('footer-logo');
        const size = isFooter ? 80 : 50;
        const fontSize = isFooter ? 2 : 1.2;
        
        const fallback = document.createElement('div');
        fallback.className = imgElement.className + ' logo-fallback';
        fallback.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: linear-gradient(135deg, #205782, #2d6fa0);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: ${fontSize}rem;
            box-shadow: 0 4px 15px rgba(242, 132, 47, 0.3);
            border: 2px solid rgba(255, 255, 255, 0.3);
        `;
        fallback.textContent = 'BY';
        fallback.setAttribute('role', 'img');
        fallback.setAttribute('aria-label', 'Besorah Yeshua Logo');
        
        imgElement.parentNode.replaceChild(fallback, imgElement);
    }
    
    preloadLogo() {
        const preloadImg = new Image();
        const paths = ['/images/logo.png', './images/logo.png', '../images/logo.png'];
        
        const tryLoad = (index) => {
            if (index >= paths.length) return;
            
            preloadImg.src = paths[index];
            preloadImg.onerror = () => tryLoad(index + 1);
            preloadImg.onload = () => {
                console.log('Logo preloaded from:', paths[index]);
            };
        };
        
        tryLoad(0);
    }
}

// ===================================
// ENHANCED FORM VALIDATOR
// ===================================

class FormValidator {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;
        
        this.rules = {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            phone: {
                pattern: /^(\+251|0)?[9][0-9]{8}$/,
                message: 'Enter a valid Ethiopian phone number (e.g., 0912345678)'
            },
            name: {
                pattern: /^[a-zA-Z\s]{2,50}$/,
                message: 'Name should be 2-50 characters, letters only'
            },
            message: {
                pattern: /^.{10,1000}$/,
                message: 'Message should be 10-1000 characters'
            }
        };
        
        this.init();
    }
    
    init() {
        // Enhanced submit handler
        this.form.addEventListener('submit', (e) => {
            if (!this.validateAll()) {
                e.preventDefault();
                this.showFirstError();
            }
            // If valid, allow natural form submission
        });
        
        // Real-time validation
        this.form.querySelectorAll('input, textarea, select').forEach(field => {
            // Validate on blur
            field.addEventListener('blur', () => {
                this.validateField(field);
            });
            
            // Clear error on input
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    this.clearError(field);
                }
            });
            
            // Enhanced paste handling
            if (field.type === 'email' || field.type === 'tel') {
                field.addEventListener('paste', (e) => {
                    setTimeout(() => this.validateField(field), 10);
                });
            }
        });
    }
    
    validateAll() {
        let isValid = true;
        const fields = this.form.querySelectorAll('[required], [data-validate]');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value.trim();
        const type = field.type || field.dataset.validate;
        const isRequired = field.hasAttribute('required');
        
        // Check if empty
        if (isRequired && !value) {
            this.showError(field, 'This field is required');
            return false;
        }
        
        // Skip validation if empty and not required
        if (!value && !isRequired) {
            this.clearError(field);
            return true;
        }
        
        // Validate based on field type
        if (value) {
            // Email validation
            if (type === 'email' && this.rules.email) {
                if (!this.rules.email.pattern.test(value)) {
                    this.showError(field, this.rules.email.message);
                    return false;
                }
            }
            
            // Phone validation
            if (type === 'tel' && this.rules.phone) {
                if (!this.rules.phone.pattern.test(value.replace(/\s/g, ''))) {
                    this.showError(field, this.rules.phone.message);
                    return false;
                }
            }
            
            // Name validation
            if ((field.name.includes('name') || field.dataset.validate === 'name') && this.rules.name) {
                if (!this.rules.name.pattern.test(value)) {
                    this.showError(field, this.rules.name.message);
                    return false;
                }
            }
            
            // Message validation
            if ((field.type === 'textarea' || field.dataset.validate === 'message') && this.rules.message) {
                if (!this.rules.message.pattern.test(value)) {
                    this.showError(field, this.rules.message.message);
                    return false;
                }
            }
        }
        
        this.clearError(field);
        return true;
    }
    
    showError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        
        // Remove old error message
        let errorElement = field.nextElementSibling;
        if (errorElement?.classList.contains('error-message')) {
            errorElement.remove();
        }
        
        // Create new error message
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc3545;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideDown 0.3s ease;
        `;
        
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        
        // Add shake animation to field
        field.style.animation = 'shake 0.5s';
        setTimeout(() => {
            field.style.animation = '';
        }, 500);
    }
    
    clearError(field) {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        
        const errorElement = field.nextElementSibling;
        if (errorElement?.classList.contains('error-message')) {
            errorElement.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => errorElement.remove(), 300);
        }
    }
    
    showFirstError() {
        const firstError = this.form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
            firstError.focus();
        }
    }
    
    // Optional: AJAX submission method
    async submitViaAjax() {
        const submitButton = this.form.querySelector('[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        
        const formData = new FormData(this.form);
        
        try {
            const response = await fetch(this.form.action || '/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams(formData)
            });
            
            if (response.ok) {
                this.showSuccess();
                this.form.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            this.showSubmitError();
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
    
    showSuccess() {
        const successMessage = document.createElement('div');
        successMessage.className = 'form-success-message';
        successMessage.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <strong>Success!</strong>
            <p>Your submission has been received.</p>
        `;
        successMessage.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #28a745, #20c997);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(40, 167, 69, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
            max-width: 350px;
        `;
        
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => successMessage.remove(), 500);
        }, 4000);
    }
    
    showSubmitError() {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-error-message';
        errorMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <strong>Error</strong>
            <p>Something went wrong. Please try again.</p>
        `;
        errorMessage.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #dc3545, #c82333);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(220, 53, 69, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease;
            max-width: 350px;
        `;
        
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.style.animation = 'slideOutRight 0.5s ease';
            setTimeout(() => errorMessage.remove(), 500);
        }, 4000);
    }
}

// ===================================
// FORM AUTO-SAVE
// ===================================
class FormAutoSave {
    constructor(formId, storageKey) {
        this.form = document.getElementById(formId);
        this.storageKey = storageKey || `form_draft_${formId}`;
        
        if (this.form && Utils.supportsLocalStorage()) {
            this.init();
        }
    }
    
    init() {
        this.loadDraft();
        
        const inputs = this.form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('input', Utils.debounce(() => {
                this.saveDraft();
            }, 1000));
        });
        
        this.form.addEventListener('submit', () => {
            this.clearDraft();
        });
    }
    
    saveDraft() {
        const formData = new FormData(this.form);
        const data = {};
        
        formData.forEach((value, key) => {
            if (key !== 'website' && key !== 'password') {
                data[key] = value;
            }
        });
        
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    
    loadDraft() {
        const savedData = localStorage.getItem(this.storageKey);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                Object.keys(data).forEach(key => {
                    const input = this.form.querySelector(`[name="${key}"]`);
                    if (input && !input.value) {
                        input.value = data[key];
                    }
                });
            } catch (e) {
                console.error('Error loading draft:', e);
            }
        }
    }
    
    clearDraft() {
        localStorage.removeItem(this.storageKey);
    }
}

// ===================================
// ANIMATION CONTROLLER
// ===================================
class AnimationController {
    static initScrollAnimations() {
        const elements = document.querySelectorAll(
            '.mission-card, .event-card, .partnership-card, ' +
            '.benefit-card, .impact-card, .testimonial-card, ' +
            '.zone-card, .area-card'
        );
        
        if (elements.length === 0) return;
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '0';
                        entry.target.style.transform = 'translateY(30px)';
                        
                        setTimeout(() => {
                            entry.target.style.transition = 'all 0.6s ease';
                            entry.target.style.opacity = '1';
                            entry.target.style.transform = 'translateY(0)';
                        }, 100);
                        
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            elements.forEach(el => observer.observe(el));
        }
    }

    static initCounters() {
        const counters = document.querySelectorAll('.stat-number, .impact-number, .number');
        
        if (counters.length === 0) return;
        
        const animateCounter = (counter) => {
            const text = counter.textContent;
            const target = parseInt(text.replace(/[^0-9]/g, ''));
            const hasPlus = text.includes('+');
            const duration = 2000;
            const increment = target / (duration / 16);
            let current = 0;
            
            const update = () => {
                current += increment;
                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString();
                    requestAnimationFrame(update);
                } else {
                    counter.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                }
            };
            
            update();
        };
        
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateCounter(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            counters.forEach(counter => observer.observe(counter));
        }
    }
}




// ===================================
// PAGE COMPONENTS
// ===================================
class PageComponents {
    // Active page detection
    static setActivePage() {
        const currentPage = Utils.getCurrentPage();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') ||
                (currentPage === 'index.html' && href === 'index.html')) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    // Smooth scrolling
    static initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#' || href === '') return;
                
                e.preventDefault();
                const target = document.querySelector(href);
                
                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                    
                    target.setAttribute('tabindex', '-1');
                    target.focus({ preventScroll: true });
                    setTimeout(() => target.removeAttribute('tabindex'), 1000);
                }
            });
        });
    }

    // Event filters
    static initEventFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const eventCards = document.querySelectorAll('.event-card');
        
        if (filterButtons.length === 0 || eventCards.length === 0) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                
                eventCards.forEach((card, index) => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.setAttribute('aria-hidden', 'false');
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 50);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        card.setAttribute('aria-hidden', 'true');
                        setTimeout(() => card.style.display = 'none', 300);
                    }
                });
            });
        });
    }

    // Donation form
    static initDonationForm() {
        const amountButtons = document.querySelectorAll('.amount-btn');
        const customInput = document.querySelector('.custom-amount-input');
        const customField = document.getElementById('customAmount');
        const displayAmount = document.getElementById('displayAmount');
        
        if (amountButtons.length === 0) return;
        
        amountButtons.forEach(button => {
            button.addEventListener('click', function() {
                const amount = this.getAttribute('data-amount');
                
                amountButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                
                if (amount === 'custom') {
                    if (customInput) {
                        customInput.style.display = 'block';
                        customField?.focus();
                    }
                    PageComponents.updateDisplay(customField?.value || 100);
                } else {
                    if (customInput) customInput.style.display = 'none';
                    PageComponents.updateDisplay(amount);
                }
            });
        });
        
        if (customField) {
            customField.addEventListener('input', function() {
                const value = parseFloat(this.value) || 0;
                if (value > 0) {
                    PageComponents.updateDisplay(value);
                }
            });
        }
    }

    static updateDisplay(amount) {
        const displayAmount = document.getElementById('displayAmount');
        if (displayAmount) {
            displayAmount.textContent = Utils.formatCurrency(amount);
        }
    }
}

// ===================================
// ACCESSIBILITY FEATURES
// ===================================
class Accessibility {
    static initSkipLink() {
        const skipLink = document.querySelector('.skip-to-content');
        if (!skipLink) return;
        
        skipLink.addEventListener('click', (e) => {
            e.preventDefault();
            const main = document.querySelector('main') || 
                         document.querySelector('#main-content') ||
                         document.querySelector('.hero');
            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus({ preventScroll: false });
                main.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    static announcePageChange(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        announcement.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border-width: 0;
        `;
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
}

// ===================================
// PERFORMANCE OPTIMIZATION BUNDLE
// ===================================

class Performance {
    constructor() {
        this.observers = new Map();
        this.init();
    }
    
    static init() {
        // Create instance for non-static methods
        if (!window.besorahPerformance) {
            window.besorahPerformance = new Performance();
        }
    }
    
    init() {
        this.optimizeImages();
        this.lazyLoadComponents();
        this.optimizeScrolling();
        this.prefetchCriticalResources();
        this.setupServiceWorker();
        this.preventLayoutShifts();
        this.initVideoOptimization();
    }
    
    // ===================================
    // IMAGE OPTIMIZATION
    // ===================================
    optimizeImages() {
        if (!('IntersectionObserver' in window)) {
            this.fallbackImageLoading();
            return;
        }

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        // Observe all lazy images
        document.querySelectorAll('img[data-src], img[loading="lazy"]').forEach(img => {
            imageObserver.observe(img);
        });
        
        this.observers.set('images', imageObserver);
    }
    
    loadImage(img) {
        // Load the actual image
        if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        }
        
        // Load srcset if available
        if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
            img.removeAttribute('data-srcset');
        }
        
        img.classList.add('loaded');
        
        // Handle load completion
        img.addEventListener('load', () => {
            img.style.opacity = '1';
        });
    }
    
    fallbackImageLoading() {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            if (Utils.isInViewport(img)) {
                this.loadImage(img);
            }
        });
    }
    
    // ===================================
    // LAZY LOAD COMPONENTS
    // ===================================
    lazyLoadComponents() {
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const component = entry.target;
                    const componentType = component.dataset.component;
                    
                    switch(componentType) {
                        case 'carousel':
                            this.initializeCarousel(component);
                            break;
                        case 'counter':
                            this.animateCounter(component);
                            break;
                        case 'video':
                            this.loadVideo(component);
                            break;
                        case 'map':
                            this.loadMap(component);
                            break;
                    }
                    
                    componentObserver.unobserve(component);
                }
            });
        }, {
            rootMargin: '100px 0px',
            threshold: 0.1
        });
        
        document.querySelectorAll('[data-component]').forEach(component => {
            componentObserver.observe(component);
        });
        
        this.observers.set('components', componentObserver);
    }
    
    // ===================================
    // OPTIMIZE SCROLLING
    // ===================================
    optimizeScrolling() {
        let ticking = false;
        let lastScrollY = window.scrollY;
        
        const handleScroll = Utils.throttle(() => {
            const currentScrollY = window.scrollY;
            const scrollDiff = Math.abs(currentScrollY - lastScrollY);
            
            // Only process if scroll difference is significant
            if (scrollDiff > 5) {
                this.processScroll(currentScrollY, lastScrollY);
                lastScrollY = currentScrollY;
            }
        }, 16); // ~60fps
        
        window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    processScroll(current, previous) {
        const header = document.querySelector('header');
        const scrollTop = document.getElementById('scrollTopBtn');
        
        // Update header state
        if (header) {
            if (current > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
        
        // Update scroll to top button via existing class
        if (scrollTop && window.ScrollToTopInstance) {
            if (current > 300) {
                window.ScrollToTopInstance.show();
            } else {
                window.ScrollToTopInstance.hide();
            }
        }
    }
    
    // ===================================
    // PREFETCH CRITICAL RESOURCES
    // ===================================
    prefetchCriticalResources() {
        // Prefetch links on hover
        const prefetchLinks = new Set();
        
        document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                
                if (!prefetchLinks.has(href) && this.shouldPrefetch(href)) {
                    this.prefetchResource(href);
                    prefetchLinks.add(href);
                }
            }, { once: true, passive: true });
            
            // Touch devices - prefetch on touch start
            link.addEventListener('touchstart', () => {
                const href = link.getAttribute('href');
                if (!prefetchLinks.has(href) && this.shouldPrefetch(href)) {
                    this.prefetchResource(href);
                    prefetchLinks.add(href);
                }
            }, { once: true, passive: true });
        });
        
        // Preconnect to external domains
        this.preconnectDomains();
    }
    
    shouldPrefetch(href) {
        // Don't prefetch external links, mailto, tel, or current page
        return !href.startsWith('http') && 
               !href.startsWith('#') && 
               !href.startsWith('mailto:') && 
               !href.startsWith('tel:') &&
               href !== window.location.pathname;
    }
    
    prefetchResource(href) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = href;
        prefetchLink.as = 'document';
        document.head.appendChild(prefetchLink);
    }
    
    preconnectDomains() {
        const externalDomains = [
            'https://cdnjs.cloudflare.com',
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ];
        
        externalDomains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'preconnect';
            link.href = domain;
            link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    // ===================================
    // COMPONENT INITIALIZATIONS
    // ===================================
    initializeCarousel(carousel) {
        const scrollContainer = carousel.querySelector('.resources-carousel, .carousel-container');
        if (!scrollContainer) return;
        
        // Use event delegation for better performance
        carousel.addEventListener('click', (e) => {
            const btn = e.target.closest('.carousel-btn');
            if (!btn) return;
            
            const direction = btn.classList.contains('prev') ? -1 : 1;
            const card = scrollContainer.querySelector('.resource-card, .carousel-item');
            const scrollAmount = (card?.offsetWidth || 360) + 30;
            
            scrollContainer.scrollBy({
                left: direction * scrollAmount,
                behavior: 'smooth'
            });
        });
        
        // Update button states
        const updateButtons = () => {
            const prevBtn = carousel.querySelector('.carousel-btn.prev');
            const nextBtn = carousel.querySelector('.carousel-btn.next');
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainer;
            
            if (prevBtn) {
                const isDisabled = scrollLeft <= 10;
                prevBtn.disabled = isDisabled;
                prevBtn.style.opacity = isDisabled ? '0.3' : '1';
                prevBtn.setAttribute('aria-hidden', isDisabled);
            }
            
            if (nextBtn) {
                const maxScroll = scrollWidth - clientWidth;
                const isDisabled = scrollLeft >= maxScroll - 10;
                nextBtn.disabled = isDisabled;
                nextBtn.style.opacity = isDisabled ? '0.3' : '1';
                nextBtn.setAttribute('aria-hidden', isDisabled);
            }
        };
        
        scrollContainer.addEventListener('scroll', Utils.throttle(updateButtons, 100), { 
            passive: true 
        });
        
        updateButtons();
    }
    
    animateCounter(element) {
        const text = element.textContent;
        const target = parseInt(text.replace(/[^0-9]/g, ''));
        const hasPlus = text.includes('+');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const update = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                element.classList.add('animated');
            }
        };
        
        requestAnimationFrame(update);
    }
    
    loadVideo(videoContainer) {
        const video = videoContainer.querySelector('video');
        if (!video) return;
        
        // Only load video on larger screens
        if (window.innerWidth >= 768) {
            const source = video.querySelector('source');
            if (source && source.dataset.src) {
                source.src = source.dataset.src;
                video.load();
                
                video.play().catch(err => {
                    console.log('Video autoplay prevented:', err);
                    // Add play button for user interaction
                    this.addVideoPlayButton(videoContainer, video);
                });
            }
        } else {
            // On mobile, show poster image only
            video.style.display = 'none';
            const poster = video.poster;
            if (poster) {
                const img = document.createElement('img');
                img.src = poster;
                img.alt = 'Video thumbnail';
                img.style.width = '100%';
                videoContainer.appendChild(img);
            }
        }
    }
    
    addVideoPlayButton(container, video) {
        const playBtn = document.createElement('button');
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        playBtn.className = 'video-play-btn';
        playBtn.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(32, 87, 130, 0.8);
            color: white;
            border: none;
            border-radius: 50%;
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
            cursor: pointer;
            z-index: 10;
        `;
        
        playBtn.addEventListener('click', () => {
            video.play();
            playBtn.style.display = 'none';
        });
        
        container.style.position = 'relative';
        container.appendChild(playBtn);
    }
    
    loadMap(mapContainer) {
        // Initialize maps only when in viewport
        if (typeof window.initMap === 'function') {
            window.initMap();
        }
    }
    
    // ===================================
    // SERVICE WORKER SETUP
    // ===================================
    setupServiceWorker() {
        if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost')) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered:', registration);
                        
                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing;
                            console.log('SW update found');
                            
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    this.showUpdateNotification();
                                }
                            });
                        });
                    })
                    .catch(err => {
                        console.log('SW registration failed:', err);
                    });
            });
        }
    }
    
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <p>New version available!</p>
            <button onclick="window.location.reload()">Update</button>
        `;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #205782;
            color: white;
            padding: 1rem;
            border-radius: 8px;
            z-index: 10000;
        `;
        document.body.appendChild(notification);
    }
    
    // ===================================
    // EXISTING METHODS (for compatibility)
    // ===================================
    static initVideoOptimization() {
        // This is now handled by lazyLoadComponents
        if (window.besorahPerformance) {
            const videos = document.querySelectorAll('[data-component="video"]');
            videos.forEach(video => window.besorahPerformance.loadVideo(video));
        }
    }
    
    static initLazyLoading() {
        // This is now handled by optimizeImages
        if (window.besorahPerformance) {
            window.besorahPerformance.optimizeImages();
        }
    }
    
    preventLayoutShifts() {
        // Set aspect ratios for images
        document.querySelectorAll('img:not([width]):not([height])').forEach(img => {
            if (img.naturalWidth && img.naturalHeight) {
                img.style.aspectRatio = `${img.naturalWidth} / ${img.naturalHeight}`;
            }
        });
        
        // Reserve space for dynamic content
        document.querySelectorAll('[data-height]').forEach(el => {
            const height = el.dataset.height;
            el.style.minHeight = height + 'px';
        });
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
}

// ===================================
// RESOURCE HINTS (Static Class)
// ===================================
class ResourceHints {
    static addDNSPrefetch(domains) {
        domains.forEach(domain => {
            const link = document.createElement('link');
            link.rel = 'dns-prefetch';
            link.href = domain;
            document.head.appendChild(link);
        });
    }
    
    static addPreload(resources) {
        resources.forEach(({ href, as, type }) => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = href;
            link.as = as;
            if (type) link.type = type;
            document.head.appendChild(link);
        });
    }
    
    static addPreloadCritical() {
        const criticalResources = [
            { href: '/css/main.css', as: 'style' },
            { href: '/images/logo.png', as: 'image' },
            { href: '/fonts/custom.woff2', as: 'font', type: 'font/woff2' }
        ];
        
        this.addPreload(criticalResources);
    }
}

// ===================================
// OFFLINE & SERVICE WORKER
// ===================================
class OfflineManager {
    static init() {
        window.addEventListener('online', () => {
            console.log('Connection restored');
            const notification = document.getElementById('offlineNotification');
            if (notification) notification.remove();
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost');
            if (!document.getElementById('offlineNotification')) {
                const notice = document.createElement('div');
                notice.id = 'offlineNotification';
                notice.innerHTML = `
                    <div style="position: fixed; bottom: 20px; left: 20px; background: #f59e0b; 
                         color: white; padding: 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
                         z-index: 9999; max-width: 300px;">
                        <strong>⚠️ You're offline</strong>
                        <p style="margin: 0.5rem 0 0; font-size: 0.9rem;">Some features may not work.</p>
                    </div>
                `;
                document.body.appendChild(notice);
            }
        });

    }
}

// ===================================
// PRAYER MODAL SYSTEM
// ===================================
class PrayerModal {
    static openModal(type) {
        const modal = document.getElementById('prayerModal');
        const prayerTypeInput = document.getElementById('prayerType');
        
        if (modal && prayerTypeInput) {
            prayerTypeInput.value = type;
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            const focusableElements = modal.querySelectorAll('button, input, textarea, select, a[href]');
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    static closeModal() {
        const modal = document.getElementById('prayerModal');
        
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            const prayerForm = document.getElementById('prayerForm');
            if (prayerForm) {
                prayerForm.reset();
                const errors = prayerForm.querySelectorAll('.field-error');
                errors.forEach(error => error.remove());
            }
        }
    }

    static init() {
        const prayerModal = document.getElementById('prayerModal');
        if (!prayerModal) return;
        
        prayerModal.addEventListener('click', function(e) {
            if (e.target === this) {
                PrayerModal.closeModal();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && prayerModal.classList.contains('active')) {
                PrayerModal.closeModal();
            }
        });
        
        // Swipe to close for mobile
        let touchStartY = 0;
        let touchStartX = 0;
        
        prayerModal.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }, { passive: true });
        
        prayerModal.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const diffY = touchStartY - touchEndY;
            const diffX = Math.abs(touchStartX - touchEndX);
            
            if (diffY < -100 && diffX < 50) {
                PrayerModal.closeModal();
            }
        }, { passive: true });
    }
}

// ===================================
// TOUCH FEEDBACK SYSTEM
// ===================================
class TouchFeedback {
    static init() {
        const touchElements = document.querySelectorAll('.nav-link, .btn-donate, .hamburger, .nav-logo a');
        
        touchElements.forEach(element => {
            // Touch start
            element.addEventListener('touchstart', function(e) {
                this.classList.add('touched');
                
                // Create ripple effect for nav links
                if (this.classList.contains('nav-link')) {
                    const ripple = document.createElement('span');
                    ripple.classList.add('touch-ripple');
                    const rect = this.getBoundingClientRect();
                    const size = Math.max(rect.width, rect.height);
                    ripple.style.width = ripple.style.height = size + 'px';
                    ripple.style.left = (e.touches[0].clientX - rect.left - size/2) + 'px';
                    ripple.style.top = (e.touches[0].clientY - rect.top - size/2) + 'px';
                    this.appendChild(ripple);
                    
                    // Remove ripple after animation
                    setTimeout(() => {
                        if (ripple.parentNode === this) {
                            this.removeChild(ripple);
                        }
                    }, 600);
                }
            }, { passive: true });
            
            // Touch end
            element.addEventListener('touchend', function() {
                setTimeout(() => {
                    this.classList.remove('touched');
                }, 150);
            }, { passive: true });
            
            // Prevent sticky hover states on touch devices
            element.addEventListener('touchcancel', function() {
                this.classList.remove('touched');
            }, { passive: true });
        });
    }
}

// ===================================
// RESOURCES PAGE FUNCTIONALITY
// ===================================

class ResourcesPage {
    constructor() {
        this.carousels = [];
        this.currentFilter = 'all';
        this.init();
    }
    
    init() {
        this.initializeCarousels();
        this.initializeFilters();
        this.initializeEmailGate();
        this.initializeTouchEnhancements();
        this.initializeFreeDownloads();
    }
    
    // ===================================
    // CAROUSEL FUNCTIONALITY
    // ===================================
    initializeCarousels() {
        const categories = document.querySelectorAll('.category-section');
        
        categories.forEach((category) => {
            const carousel = category.querySelector('.resources-carousel');
            const prevBtn = category.querySelector('.carousel-btn.prev');
            const nextBtn = category.querySelector('.carousel-btn.next');
            
            if (!carousel) return;
            
            const carouselInstance = {
                element: carousel,
                prevBtn,
                nextBtn,
                isScrolling: false,
                scrollAmount: 0
            };
            
            // Calculate scroll amount
            const card = carousel.querySelector('.resource-card');
            if (card) {
                carouselInstance.scrollAmount = card.offsetWidth + 30; // card width + gap
            }
            
            // Navigation buttons
            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollCarousel(carouselInstance, -1);
                });
            }
            
            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.scrollCarousel(carouselInstance, 1);
                });
            }
            
            // Update button states on scroll
            carousel.addEventListener('scroll', Utils.throttle(() => {
                this.updateNavigationButtons(carouselInstance);
            }, 100), { passive: true });
            
            // Touch/mouse drag support
            this.enableDragScroll(carousel);
            
            // Initial button state
            this.updateNavigationButtons(carouselInstance);
            
            this.carousels.push(carouselInstance);
        });
    }
    
    scrollCarousel(carouselInstance, direction) {
        const { element, scrollAmount } = carouselInstance;
        
        if (carouselInstance.isScrolling) return;
        carouselInstance.isScrolling = true;
        
        element.scrollBy({
            left: direction * scrollAmount,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            carouselInstance.isScrolling = false;
            this.updateNavigationButtons(carouselInstance);
        }, 300);
    }
    
    updateNavigationButtons(carouselInstance) {
        const { element, prevBtn, nextBtn } = carouselInstance;
        
        const scrollLeft = element.scrollLeft;
        const maxScroll = element.scrollWidth - element.clientWidth;
        
        // Update prev button
        if (prevBtn) {
            const isDisabled = scrollLeft <= 10;
            prevBtn.disabled = isDisabled;
            prevBtn.style.opacity = isDisabled ? '0.3' : '1';
            prevBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
            prevBtn.setAttribute('aria-hidden', isDisabled);
        }
        
        // Update next button
        if (nextBtn) {
            const isDisabled = scrollLeft >= maxScroll - 10;
            nextBtn.disabled = isDisabled;
            nextBtn.style.opacity = isDisabled ? '0.3' : '1';
            nextBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
            nextBtn.setAttribute('aria-hidden', isDisabled);
        }
    }
    
    enableDragScroll(carousel) {
        let isDown = false;
        let startX;
        let scrollLeft;
        
        const handleStart = (pageX) => {
            isDown = true;
            carousel.style.cursor = 'grabbing';
            startX = pageX - carousel.offsetLeft;
            scrollLeft = carousel.scrollLeft;
            carousel.style.scrollSnapType = 'none';
        };
        
        const handleMove = (pageX) => {
            if (!isDown) return;
            const x = pageX - carousel.offsetLeft;
            const walk = (x - startX) * 2;
            carousel.scrollLeft = scrollLeft - walk;
        };
        
        const handleEnd = () => {
            isDown = false;
            carousel.style.cursor = 'grab';
            carousel.style.scrollSnapType = 'x mandatory';
            
            // Snap to nearest card
            const card = carousel.querySelector('.resource-card');
            if (card) {
                const cardWidth = card.offsetWidth + 30;
                const currentScroll = carousel.scrollLeft;
                const nearestCard = Math.round(currentScroll / cardWidth);
                carousel.scrollTo({
                    left: nearestCard * cardWidth,
                    behavior: 'smooth'
                });
            }
        };
        
        // Mouse events
        carousel.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleStart(e.pageX);
        });
        
        carousel.addEventListener('mouseleave', handleEnd);
        carousel.addEventListener('mouseup', handleEnd);
        
        carousel.addEventListener('mousemove', (e) => {
            if (isDown) {
                e.preventDefault();
                handleMove(e.pageX);
            }
        });
        
        // Touch events
        carousel.addEventListener('touchstart', (e) => {
            handleStart(e.touches[0].pageX);
        }, { passive: true });
        
        carousel.addEventListener('touchend', handleEnd, { passive: true });
        carousel.addEventListener('touchcancel', handleEnd, { passive: true });
        
        carousel.addEventListener('touchmove', (e) => {
            if (isDown) {
                handleMove(e.touches[0].pageX);
            }
        }, { passive: true });
        
        carousel.style.cursor = 'grab';
    }
    
    // ===================================
    // FILTER FUNCTIONALITY
    // ===================================
    initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const categorySections = document.querySelectorAll('.category-section');
        
        if (filterButtons.length === 0) return;
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Prevent multiple clicks during animation
                if (button.disabled) return;
                
                const category = button.dataset.category;
                if (this.currentFilter === category) return;
                
                // Disable all buttons temporarily
                filterButtons.forEach(btn => btn.disabled = true);
                
                // Update active state
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                
                this.currentFilter = category;
                
                // Filter sections
                this.filterSections(categorySections, category);
                
                // Re-enable buttons after animation
                setTimeout(() => {
                    filterButtons.forEach(btn => btn.disabled = false);
                }, 400);
                
                // Announce change for screen readers
                Accessibility.announcePageChange(`Showing ${category === 'all' ? 'all' : category} resources`);
            });
        });
    }
    
    filterSections(sections, category) {
        sections.forEach((section, index) => {
            const sectionCategory = section.dataset.category;
            
            if (category === 'all' || sectionCategory === category) {
                // Show section
                section.style.display = 'block';
                setTimeout(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 50);
                section.setAttribute('aria-hidden', 'false');
            } else {
                // Hide section
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                section.setAttribute('aria-hidden', 'true');
                setTimeout(() => {
                    if (section.style.opacity === '0') {
                        section.style.display = 'none';
                    }
                }, 300);
            }
        });
        
        // Scroll to resources section
        setTimeout(() => {
            const resourcesSection = document.querySelector('.resources-section');
            if (resourcesSection) {
                const headerOffset = 140;
                const elementPosition = resourcesSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }, 100);
    }
    
    // ===================================
    // EMAIL GATE MODAL
    // ===================================
    initializeEmailGate() {
        const modal = document.getElementById('emailGateModal');
        if (!modal) return;
        
        // Global functions for opening/closing
        window.openEmailGate = (resourceName, fileName) => {
            document.getElementById('gateResourceTitle').textContent = 
                `Get Access to ${resourceName}`;
            document.getElementById('resourceName').value = resourceName;
            document.getElementById('resourceFile').value = fileName;
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first input
            setTimeout(() => {
                modal.querySelector('input')?.focus();
            }, 100);
        };
        
        window.closeEmailGate = () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            
            // Reset form
            setTimeout(() => {
                const form = modal.querySelector('.email-gate-form');
                if (form) {
                    form.style.display = 'block';
                    form.reset();
                    
                    // Clear any validation errors
                    const errors = form.querySelectorAll('.error-message');
                    errors.forEach(error => error.remove());
                    
                    const errorFields = form.querySelectorAll('.error');
                    errorFields.forEach(field => field.classList.remove('error'));
                }
                const successMsg = modal.querySelector('.download-success');
                if (successMsg) {
                    successMsg.classList.remove('show');
                }
            }, 300);
        };
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                window.closeEmailGate();
            }
        });
        
        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                window.closeEmailGate();
            }
        });
        
        // Form submission
        const form = modal.querySelector('.email-gate-form');
        if (form) {
            // Initialize form validation
            new FormValidator(form.id);
            
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailGateSubmit(form);
            });
        }
    }
    
    async handleEmailGateSubmit(form) {
        const submitButton = form.querySelector('.email-gate-submit');
        const originalText = submitButton.innerHTML;
        
        // Validate form first
        const validator = new FormValidator(form.id);
        if (!validator.validateAll()) {
            validator.showFirstError();
            return;
        }
        
        // Show loading
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
        submitButton.disabled = true;
        
        try {
            const formData = new FormData(form);
            
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Hide form, show success
            form.style.display = 'none';
            document.getElementById('downloadSuccess').classList.add('show');
            
            // Get download URL from form data
            const fileName = document.getElementById('resourceFile').value;
            if (fileName && fileName !== '#') {
                // Trigger download
                const link = document.createElement('a');
                link.href = fileName;
                link.download = document.getElementById('resourceName').value;
                link.click();
            }
            
            // Auto-close after 3 seconds
            setTimeout(() => {
                window.closeEmailGate();
            }, 3000);
            
        } catch (error) {
            this.showEmailGateError('Something went wrong. Please try again.');
            console.error('Submission error:', error);
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }
    
    showEmailGateError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'email-gate-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 0.75rem;
            border-radius: 4px;
            margin-top: 1rem;
            border: 1px solid #f5c6cb;
        `;
        
        const form = document.querySelector('.email-gate-form');
        form?.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    // ===================================
    // FREE DOWNLOAD HANDLER
    // ===================================
    initializeFreeDownloads() {
        window.downloadFree = (event, resourceName, fileUrl = '#') => {
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            const button = event?.currentTarget;
            if (!button) return;
            
            const originalHTML = button.innerHTML;
            const originalBackground = button.style.background;
            
            // Show success state
            button.innerHTML = '<i class="fas fa-check"></i><span>Downloaded!</span>';
            button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            button.disabled = true;
            
            // Trigger download if URL provided
            if (fileUrl && fileUrl !== '#') {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = resourceName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            
            // Track download in analytics
            this.trackDownload(resourceName, 'free');
            
            // Reset button
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = originalBackground;
                button.disabled = false;
            }, 2500);
        };
    }
    
    trackDownload(resourceName, type) {
        // Integrate with analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'resource',
                'event_label': resourceName,
                'value': type === 'free' ? 0 : 1
            });
        }
        
        console.log(`Download tracked: ${resourceName} (${type})`);
    }
    
    // ===================================
    // TOUCH ENHANCEMENTS
    // ===================================
    initializeTouchEnhancements() {
        // Add touch feedback to all interactive elements
        const touchElements = document.querySelectorAll(
            '.filter-btn, .btn-download, .carousel-btn, .resource-card'
        );
        
        touchElements.forEach(element => {
            element.addEventListener('touchstart', function() {
                this.style.transform = 'scale(0.98)';
                this.style.transition = 'transform 0.1s ease';
            }, { passive: true });
            
            element.addEventListener('touchend', function() {
                this.style.transform = '';
            }, { passive: true });
            
            element.addEventListener('touchcancel', function() {
                this.style.transform = '';
            }, { passive: true });
        });
    }
    
    // ===================================
    // WINDOW RESIZE HANDLER
    // ===================================
    handleResize() {
        // Recalculate carousel scroll amounts
        this.carousels.forEach(carouselInstance => {
            const card = carouselInstance.element.querySelector('.resource-card');
            if (card) {
                carouselInstance.scrollAmount = card.offsetWidth + 30;
            }
            this.updateNavigationButtons(carouselInstance);
        });
    }
    
    // ===================================
    // CLEANUP
    // ===================================
    destroy() {
        this.carousels.forEach(carousel => {
            carousel.element.removeEventListener('scroll', this.updateNavigationButtons);
        });
        this.carousels = [];
    }
}

// ===================================
// INITIALIZATION CONTROLLER
// ===================================
class AppInitializer {
    static init() {
        console.log('Besorah Yeshua Ministry - Initializing Complete System...');
        
        try {
            // Core systems
            new ErrorHandler();
            new LogoLoader();
            
            // Initialize Performance Optimizer
            Performance.init();
            
            // Add resource hints early
            ResourceHints.addDNSPrefetch([
                '//cdnjs.cloudflare.com',
                '//fonts.googleapis.com', 
                '//fonts.gstatic.com'
            ]);
            
            // Page setup
            PageComponents.setActivePage();
            PageComponents.initSmoothScroll();
            Accessibility.initSkipLink();
            
            // Animations
            AnimationController.initScrollAnimations();
            
            // Page-specific components  
            PageComponents.initEventFilters();
            PageComponents.initDonationForm();
            PrayerModal.init();
            
            // Resources page (if applicable)
            this.initResourcesPage();
            
            // Touch feedback
            TouchFeedback.init();
            
            // Offline & service worker
            OfflineManager.init();
            
            // Form validators
            const formIds = ['contactForm', 'prayerForm', 'registrationForm', 'newsletterForm', 'emailGateForm'];
            formIds.forEach(id => {
                if (document.getElementById(id)) {
                    new FormValidator(id);
                }
            });
            
            // Form auto-save
            if (document.getElementById('contactForm')) {
                new FormAutoSave('contactForm');
            }
            
            // Final setup
            this.hidePageLoader();
            this.updateCopyrightYear();
            BesorahYeshua.init = true;
            
            console.log('✅ Complete System Initialized Successfully');
            
        } catch (error) {
            console.error('Initialization error:', error);
        }
    }
    
    static initResourcesPage() {
        // Check if we're on a resources page
        const resourcesSection = document.querySelector('.resources-section, .category-section');
        if (!resourcesSection) return;
        
        window.resourcesPageInstance = new ResourcesPage();
        console.log('✅ Resources page functionality initialized');
        
        // Handle resize
        window.addEventListener('resize', Utils.debounce(() => {
            window.resourcesPageInstance.handleResize();
        }, 250));
    }
    
    static hidePageLoader() {
        const loader = document.querySelector('.page-loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => loader.remove(), 500);
            }, 300);
        }
        document.body.classList.add('loaded');
    }

    static updateCopyrightYear() {
        const year = new Date().getFullYear();
        const yearElements = document.querySelectorAll('#year, .copyright-year');
        yearElements.forEach(el => el.textContent = year);
    }
}

// ===================================
// GLOBAL EXPORTS & INITIALIZATION
// ===================================
window.BesorahYeshua = BesorahYeshua;
window.openModal = PrayerModal.openModal;
window.closeModal = PrayerModal.closeModal;

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`Page loaded in ${loadTime}ms`);
        }, 0);
    });
}

// Initialize application
document.addEventListener('DOMContentLoaded', AppInitializer.init);

// ===================================
// ADD REQUIRED CSS ANIMATIONS
// ===================================
const mainStyles = document.createElement('style');
mainStyles.textContent = `
    /* Enhanced Form Validator Animations */
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    @keyframes slideDown {
        from { 
            opacity: 0; 
            transform: translateY(-10px); 
        }
        to { 
            opacity: 1; 
            transform: translateY(0); 
        }
    }
    
    @keyframes slideUp {
        from { 
            opacity: 1; 
            transform: translateY(0); 
        }
        to { 
            opacity: 0; 
            transform: translateY(-10px); 
        }
    }
    
    /* Form Validation Styles */
    input.error, textarea.error, select.error {
        border-color: #dc3545 !important;
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1) !important;
    }
    
    .error-message {
        color: #dc3545;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        animation: slideDown 0.3s ease;
    }
    
    .form-success-message, .form-error-message {
        position: fixed;
        top: 100px;
        right: 20px;
        color: white;
        padding: 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease;
        max-width: 350px;
    }
    
    .form-success-message {
        background: linear-gradient(135deg, #28a745, #20c997);
    }
    
    .form-error-message {
        background: linear-gradient(135deg, #dc3545, #c82333);
    }
    
    /* Loading state for submit buttons */
    [type="submit"]:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .fa-spinner {
        margin-right: 0.5rem;
    }
    
    /* Performance Optimizations */
    img[data-src] {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    img.loaded {
        opacity: 1;
    }
    
    /* Reduce animations for users who prefer reduced motion */
    @media (prefers-reduced-motion: reduce) {
        * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
    }
    
    /* Resources Page Styles */
    .resources-carousel {
        scroll-behavior: smooth;
        scroll-snap-type: x mandatory;
        -webkit-overflow-scrolling: touch;
    }
    
    .resource-card {
        scroll-snap-align: start;
        flex: 0 0 auto;
    }
    
    /* Filter Animations */
    .category-section {
        transition: all 0.3s ease;
    }
    
    .filter-btn {
        transition: all 0.2s ease;
    }
    
    .filter-btn.active {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(32, 87, 130, 0.3);
    }
    
    /* Email Gate Modal */
    .email-gate-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .email-gate-modal.active {
        opacity: 1;
        visibility: visible;
    }
    
    .email-gate-content {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
    }
    
    .email-gate-modal.active .email-gate-content {
        transform: scale(1);
    }
    
    /* Download Success */
    .download-success {
        display: none;
        text-align: center;
        padding: 2rem;
    }
    
    .download-success.show {
        display: block;
        animation: fadeIn 0.5s ease;
    }
    
    /* Touch Improvements */
    .touch-ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(2.5);
            opacity: 0;
        }
    }
    
    @media (hover: none) {
        .carousel-btn:not(:disabled):active {
            transform: scale(0.95);
        }
        
        .filter-btn:active {
            transform: scale(0.98);
        }
    }
`;
document.head.appendChild(mainStyles);

console.log('🙏 Besorah Yeshua Ministry - Main.js loaded successfully');






// ===================================
// ENHANCED COUNTER ANIMATION SYSTEM
// Add this to your main.js file or use as standalone
// ===================================

class CounterAnimationSystem {
    constructor() {
        this.counters = new Set();
        this.observer = null;
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupCounters());
        } else {
            this.setupCounters();
        }
    }
    
    setupCounters() {
        // Find all counter elements
        const counterSelectors = [
            '.stat-number',
            '.impact-number',
            '.stat-compact .number',
            '.event-stats .number',
            '.partnership-stats .number'
        ];
        
        const allCounters = document.querySelectorAll(counterSelectors.join(','));
        
        if (allCounters.length === 0) {
            console.log('No counter elements found');
            return;
        }
        
        console.log(`Found ${allCounters.length} counter elements`);
        
        // Use Intersection Observer for better performance
        if ('IntersectionObserver' in window) {
            this.setupIntersectionObserver(allCounters);
        } else {
            // Fallback for older browsers
            this.animateAllCounters(allCounters);
        }
    }
    
    setupIntersectionObserver(counters) {
        const options = {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.counters.has(entry.target)) {
                    // Add a small delay for staggered effect
                    const index = Array.from(counters).indexOf(entry.target);
                    setTimeout(() => {
                        this.animateCounter(entry.target);
                        this.counters.add(entry.target);
                        this.observer.unobserve(entry.target);
                    }, index * 100);
                }
            });
        }, options);
        
        counters.forEach(counter => this.observer.observe(counter));
    }
    
    animateCounter(element) {
        // Skip if already animated
        if (element.classList.contains('counted')) {
            return;
        }
        
        const text = element.textContent.trim();
        const hasPlus = text.includes('+');
        const targetValue = parseInt(text.replace(/[^0-9]/g, ''));
        
        // Validate target value
        if (isNaN(targetValue) || targetValue === 0) {
            console.warn('Invalid counter value:', text);
            return;
        }
        
        // Animation parameters
        const duration = 2000; // 2 seconds
        const frameRate = 1000 / 60; // 60fps
        const totalFrames = Math.round(duration / frameRate);
        const increment = targetValue / totalFrames;
        
        let currentValue = 0;
        let frame = 0;
        
        // Clear existing content
        element.textContent = '0';
        
        const animate = () => {
            frame++;
            currentValue += increment;
            
            if (frame < totalFrames && currentValue < targetValue) {
                element.textContent = Math.floor(currentValue).toLocaleString();
                requestAnimationFrame(animate);
            } else {
                // Final value
                element.textContent = targetValue.toLocaleString() + (hasPlus ? '+' : '');
                element.classList.add('counted');
                
                // Add pop animation
                element.style.animation = 'popIn 0.3s ease-out';
                setTimeout(() => {
                    element.style.animation = '';
                }, 300);
            }
        };
        
        // Start animation
        requestAnimationFrame(animate);
    }
    
    animateAllCounters(counters) {
        // Fallback: animate all counters immediately
        counters.forEach((counter, index) => {
            setTimeout(() => {
                this.animateCounter(counter);
            }, index * 100);
        });
    }
    
    // Public method to manually trigger animation
    triggerAnimation(element) {
        if (element && !this.counters.has(element)) {
            this.animateCounter(element);
            this.counters.add(element);
        }
    }
    
    // Reset all counters (useful for testing)
    reset() {
        this.counters.clear();
        const allCounters = document.querySelectorAll(
            '.stat-number, .impact-number, .stat-compact .number'
        );
        allCounters.forEach(counter => {
            counter.classList.remove('counted');
            counter.style.animation = '';
        });
    }
    
    // Cleanup
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.counters.clear();
    }
}

// Initialize the counter system
let counterSystem;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        counterSystem = new CounterAnimationSystem();
        window.counterSystem = counterSystem; // Make it globally accessible
    });
} else {
    counterSystem = new CounterAnimationSystem();
    window.counterSystem = counterSystem;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CounterAnimationSystem;
}

// ===================================
// USAGE EXAMPLES
// ===================================

/*
// Manual initialization
const counters = new CounterAnimationSystem();

// Trigger specific counter
const myCounter = document.querySelector('.my-counter');
counters.triggerAnimation(myCounter);

// Reset all counters
counters.reset();

// Cleanup
counters.destroy();
*/

// ===================================
// ALTERNATIVE: Simple Implementation
// If you prefer a simpler approach, use this:
// ===================================

function simpleCounterAnimation() {
    const counters = document.querySelectorAll(
        '.stat-number, .impact-number, .stat-compact .number'
    );
    
    counters.forEach(counter => {
        // Skip if already counted
        if (counter.classList.contains('counted')) return;
        
        const text = counter.textContent;
        const target = parseInt(text.replace(/[^0-9]/g, ''));
        const hasPlus = text.includes('+');
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target.toLocaleString() + (hasPlus ? '+' : '');
                counter.classList.add('counted');
            }
        };
        
        // Check if element is in viewport
        const rect = counter.getBoundingClientRect();
        const isVisible = (
            rect.top >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
        );
        
        if (isVisible) {
            counter.textContent = '0';
            updateCounter();
        }
    });
}

// Run on scroll (with throttle)
let scrollTimeout;
window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = setTimeout(() => {
        simpleCounterAnimation();
        scrollTimeout = null;
    }, 100);
}, { passive: true });

// Run on load
window.addEventListener('load', simpleCounterAnimation);



// Event filters - ENHANCED VERSION
    static initEventFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const eventCards = document.querySelectorAll('.event-card');
        
        console.log('Filter buttons found:', filterButtons.length);
        console.log('Event cards found:', eventCards.length);
        
        if (filterButtons.length === 0) {
            console.warn('No filter buttons found');
            return;
        }
        
        if (eventCards.length === 0) {
            console.warn('No event cards found');
            return;
        }
        
        // Ensure all cards have proper initial styles
        eventCards.forEach(card => {
            card.style.transition = 'all 0.3s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const filter = this.getAttribute('data-filter');
                console.log('Filter clicked:', filter);
                
                // Update active button state
                filterButtons.forEach(btn => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                
                // Filter cards with improved animation
                eventCards.forEach((card, index) => {
                    const category = card.getAttribute('data-category');
                    
                    if (filter === 'all' || category === filter) {
                        // Show card
                        card.style.display = 'block';
                        card.setAttribute('aria-hidden', 'false');
                        
                        // Force reflow for animation
                        void card.offsetWidth;
                        
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 50);
                    } else {
                        // Hide card
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(20px)';
                        card.setAttribute('aria-hidden', 'true');
                        
                        setTimeout(() => {
                            if (card.style.opacity === '0') {
                                card.style.display = 'none';
                            }
                        }, 300);
                    }
                });
                
                // Announce change for accessibility
                const activeCount = filter === 'all' 
                    ? eventCards.length 
                    : Array.from(eventCards).filter(c => c.getAttribute('data-category') === filter).length;
                
                console.log(`Showing ${activeCount} ${filter} events`);
            });
        });
        
        console.log('Event filters initialized successfully');
    }

