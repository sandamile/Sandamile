/**
 * ===================================
 * BESORAH YESHUA MINISTRY - RESOURCES PAGE
 * Complete Resources Functionality
 * Version: 2.0 - Production Ready
 * ===================================
 */

'use strict';

// ===================================
// UTILITY FUNCTIONS
// ===================================
const ResourceUtils = {
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }
};

// ===================================
// EMAIL GATE FORM VALIDATOR
// ===================================
class EmailGateValidator {
    constructor(form) {
        this.form = form;
        this.rules = {
            email: {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Please enter a valid email address'
            },
            name: {
                pattern: /^[a-zA-Z\s]{2,50}$/,
                message: 'Name should be 2-50 characters, letters only'
            }
        };
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

        // Email validation
        if (type === 'email' && this.rules.email) {
            if (!this.rules.email.pattern.test(value)) {
                this.showError(field, this.rules.email.message);
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

        this.clearError(field);
        return true;
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

    showError(field, message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');

        // Remove old error
        let errorElement = field.nextElementSibling;
        if (errorElement?.classList.contains('field-error')) {
            errorElement.remove();
        }

        // Create new error
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        errorElement.style.cssText = `
            color: #dc2626;
            font-size: 0.875rem;
            margin-top: 0.25rem;
            animation: slideDown 0.3s ease;
        `;

        field.parentNode.insertBefore(errorElement, field.nextSibling);

        // Shake animation
        field.style.animation = 'shake 0.5s';
        setTimeout(() => field.style.animation = '', 500);
    }

    clearError(field) {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');

        const errorElement = field.nextElementSibling;
        if (errorElement?.classList.contains('field-error')) {
            errorElement.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => errorElement.remove(), 300);
        }
    }

    showFirstError() {
        const firstError = this.form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
}

// ===================================
// CAROUSEL MANAGER
// ===================================
class CarouselManager {
    constructor(categorySection) {
        this.section = categorySection;
        this.carousel = categorySection.querySelector('.resources-carousel');
        this.prevBtn = categorySection.querySelector('.carousel-btn.prev');
        this.nextBtn = categorySection.querySelector('.carousel-btn.next');
        this.isScrolling = false;
        this.scrollAmount = 0;

        if (this.carousel) {
            this.init();
        }
    }

    init() {
        // Calculate scroll amount
        const card = this.carousel.querySelector('.resource-card');
        if (card) {
            this.scrollAmount = card.offsetWidth + 30; // card width + gap
        }

        // Navigation buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.scroll(-1);
            });
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.scroll(1);
            });
        }

        // Update buttons on scroll
        this.carousel.addEventListener('scroll', ResourceUtils.throttle(() => {
            this.updateButtons();
        }, 100), { passive: true });

        // Enable drag scrolling
        this.enableDragScroll();

        // Initial button state
        this.updateButtons();
    }

    scroll(direction) {
        if (this.isScrolling) return;
        this.isScrolling = true;

        this.carousel.scrollBy({
            left: direction * this.scrollAmount,
            behavior: 'smooth'
        });

        setTimeout(() => {
            this.isScrolling = false;
            this.updateButtons();
        }, 300);
    }

    updateButtons() {
        const scrollLeft = this.carousel.scrollLeft;
        const maxScroll = this.carousel.scrollWidth - this.carousel.clientWidth;

        // Update prev button
        if (this.prevBtn) {
            const isDisabled = scrollLeft <= 10;
            this.prevBtn.disabled = isDisabled;
            this.prevBtn.style.opacity = isDisabled ? '0.3' : '1';
            this.prevBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
            this.prevBtn.setAttribute('aria-hidden', isDisabled);
        }

        // Update next button
        if (this.nextBtn) {
            const isDisabled = scrollLeft >= maxScroll - 10;
            this.nextBtn.disabled = isDisabled;
            this.nextBtn.style.opacity = isDisabled ? '0.3' : '1';
            this.nextBtn.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
            this.nextBtn.setAttribute('aria-hidden', isDisabled);
        }
    }

    enableDragScroll() {
        let isDown = false;
        let startX;
        let scrollLeft;

        const handleStart = (pageX) => {
            isDown = true;
            this.carousel.style.cursor = 'grabbing';
            startX = pageX - this.carousel.offsetLeft;
            scrollLeft = this.carousel.scrollLeft;
            this.carousel.style.scrollSnapType = 'none';
        };

        const handleMove = (pageX) => {
            if (!isDown) return;
            const x = pageX - this.carousel.offsetLeft;
            const walk = (x - startX) * 2;
            this.carousel.scrollLeft = scrollLeft - walk;
        };

        const handleEnd = () => {
            isDown = false;
            this.carousel.style.cursor = 'grab';
            this.carousel.style.scrollSnapType = 'x proximity';
        };

        // Mouse events
        this.carousel.addEventListener('mousedown', (e) => {
            e.preventDefault();
            handleStart(e.pageX);
        });

        this.carousel.addEventListener('mouseleave', handleEnd);
        this.carousel.addEventListener('mouseup', handleEnd);

        this.carousel.addEventListener('mousemove', (e) => {
            if (isDown) {
                e.preventDefault();
                handleMove(e.pageX);
            }
        });

        // Touch events
        this.carousel.addEventListener('touchstart', (e) => {
            handleStart(e.touches[0].pageX);
        }, { passive: true });

        this.carousel.addEventListener('touchend', handleEnd, { passive: true });
        this.carousel.addEventListener('touchcancel', handleEnd, { passive: true });

        this.carousel.addEventListener('touchmove', (e) => {
            if (isDown) {
                handleMove(e.touches[0].pageX);
            }
        }, { passive: true });

        this.carousel.style.cursor = 'grab';
    }

    handleResize() {
        const card = this.carousel.querySelector('.resource-card');
        if (card) {
            this.scrollAmount = card.offsetWidth + 30;
        }
        this.updateButtons();
    }
}

// ===================================
// RESOURCES PAGE CONTROLLER
// ===================================
class ResourcesPage {
    constructor() {
        this.carousels = [];
        this.currentFilter = 'all';
        this.modal = null;
        this.validator = null;

        this.init();
    }

    init() {
        console.log('🎯 Initializing Resources Page...');

        this.initializeCarousels();
        this.initializeFilters();
        this.initializeEmailGate();
        this.initializeFreeDownloads();
        this.initializeTouchEnhancements();

        console.log('✅ Resources Page Ready');
    }

    // ===================================
    // CAROUSELS
    // ===================================
    initializeCarousels() {
        const categories = document.querySelectorAll('.category-section');

        categories.forEach((category) => {
            const carousel = new CarouselManager(category);
            this.carousels.push(carousel);
        });

        console.log(`✅ Initialized ${this.carousels.length} carousels`);
    }

    // ===================================
    // FILTERS
    // ===================================
    initializeFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        const categorySections = document.querySelectorAll('.category-section');

        if (filterButtons.length === 0) return;

        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();

                if (button.disabled) return;

                const category = button.dataset.category;
                if (this.currentFilter === category) return;

                // Disable buttons temporarily
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

                // Re-enable buttons
                setTimeout(() => {
                    filterButtons.forEach(btn => btn.disabled = false);
                }, 400);
            });
        });

        console.log('✅ Filters initialized');
    }

    filterSections(sections, category) {
        sections.forEach((section, index) => {
            const sectionCategory = section.dataset.category;

            if (category === 'all' || sectionCategory === category) {
                section.style.display = 'block';
                setTimeout(() => {
                    section.style.opacity = '1';
                    section.style.transform = 'translateY(0)';
                }, index * 50);
                section.setAttribute('aria-hidden', 'false');
            } else {
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
        this.modal = document.getElementById('emailGateModal');
        if (!this.modal) return;

        // Global functions
        window.openEmailGate = (resourceName, fileName) => {
            document.getElementById('gateResourceTitle').textContent = 
                `Get Access to ${resourceName}`;
            document.getElementById('resourceName').value = resourceName;
            document.getElementById('resourceFile').value = fileName;

            this.modal.classList.add('active');
            document.body.style.overflow = 'hidden';

            setTimeout(() => {
                this.modal.querySelector('input')?.focus();
            }, 100);
        };

        window.closeEmailGate = () => {
            this.modal.classList.remove('active');
            document.body.style.overflow = '';

            setTimeout(() => {
                const form = this.modal.querySelector('.email-gate-form');
                if (form) {
                    form.style.display = 'block';
                    form.reset();

                    const errors = form.querySelectorAll('.field-error');
                    errors.forEach(error => error.remove());

                    const errorFields = form.querySelectorAll('.error');
                    errorFields.forEach(field => field.classList.remove('error'));
                }
                const successMsg = this.modal.querySelector('.download-success');
                if (successMsg) {
                    successMsg.classList.remove('show');
                }
            }, 300);
        };

        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                window.closeEmailGate();
            }
        });

        // Close on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                window.closeEmailGate();
            }
        });

        // Form submission
        const form = this.modal.querySelector('.email-gate-form');
        if (form) {
            this.validator = new EmailGateValidator(form);

            // Real-time validation
            form.querySelectorAll('input').forEach(field => {
                field.addEventListener('blur', () => {
                    this.validator.validateField(field);
                });

                field.addEventListener('input', () => {
                    if (field.classList.contains('error')) {
                        this.validator.clearError(field);
                    }
                });
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEmailGateSubmit(form);
            });
        }

        console.log('✅ Email gate initialized');
    }

    async handleEmailGateSubmit(form) {
        // Validate
        if (!this.validator.validateAll()) {
            this.validator.showFirstError();
            return;
        }

        const submitButton = form.querySelector('.email-gate-submit');
        const originalText = submitButton.innerHTML;

        // Show loading
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Processing...</span>';
        submitButton.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Hide form, show success
            form.style.display = 'none';
            document.getElementById('downloadSuccess').classList.add('show');

            // Trigger download
            const fileName = document.getElementById('resourceFile').value;
            if (fileName && fileName !== '#') {
                const link = document.createElement('a');
                link.href = fileName;
                link.download = document.getElementById('resourceName').value;
                link.click();
            }

            // Track download
            this.trackDownload(document.getElementById('resourceName').value, 'email-gate');

            // Auto-close
            setTimeout(() => {
                window.closeEmailGate();
            }, 3000);

        } catch (error) {
            this.showError('Something went wrong. Please try again.');
            console.error('Submission error:', error);
        } finally {
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'email-gate-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            background: #fee2e2;
            color: #991b1b;
            padding: 0.75rem;
            border-radius: 8px;
            margin-top: 1rem;
            border: 1px solid #fecaca;
        `;

        const form = this.modal.querySelector('.email-gate-form');
        form?.appendChild(errorDiv);

        setTimeout(() => errorDiv.remove(), 5000);
    }

    // ===================================
    // FREE DOWNLOADS
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

            // Show success
            button.innerHTML = '<i class="fas fa-check"></i><span>Downloaded!</span>';
            button.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
            button.disabled = true;

            // Trigger download
            if (fileUrl && fileUrl !== '#') {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = resourceName;
                link.style.display = 'none';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            // Track
            this.trackDownload(resourceName, 'free');

            // Reset button
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.style.background = originalBackground;
                button.disabled = false;
            }, 2500);
        };

        console.log('✅ Free downloads initialized');
    }

    trackDownload(resourceName, type) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'download', {
                'event_category': 'resource',
                'event_label': resourceName,
                'value': type === 'free' ? 0 : 1
            });
        }
        console.log(`📥 Download: ${resourceName} (${type})`);
    }

    // ===================================
    // TOUCH ENHANCEMENTS
    // ===================================
    initializeTouchEnhancements() {
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
    // RESIZE HANDLER
    // ===================================
    handleResize() {
        this.carousels.forEach(carousel => carousel.handleResize());
    }
}

// ===================================
// INITIALIZE
// ===================================
function initResourcesPage() {
    // Check if we're on a resources page
    const resourcesSection = document.querySelector('.resources-section, .category-section');
    if (!resourcesSection) {
        console.log('ℹ️  Not a resources page, skipping initialization');
        return;
    }

    window.resourcesPageInstance = new ResourcesPage();

    // Handle resize
    window.addEventListener('resize', ResourceUtils.debounce(() => {
        window.resourcesPageInstance.handleResize();
    }, 250));
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initResourcesPage);
} else {
    initResourcesPage();
}

console.log('📦 Resources.js loaded');