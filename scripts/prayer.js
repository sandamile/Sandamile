// ===================================
// ENHANCED PRAYER.JS
// Complete Prayer Request System
// ===================================

class PrayerRequestManager {
    constructor() {
        this.modal = document.getElementById('prayerModal');
        this.form = document.getElementById('prayerForm');
        this.closeBtn = this.modal?.querySelector('.close-btn');
        this.submitBtn = this.form?.querySelector('button[type="submit"]');
        this.currentPrayerType = '';
        
        // Form fields
        this.fields = {
            name: this.form?.querySelector('#name'),
            email: this.form?.querySelector('#email'),
            phone: this.form?.querySelector('#phone'),
            category: this.form?.querySelector('#category'),
            request: this.form?.querySelector('#request')
        };
        
        this.init();
    }
    
    init() {
        if (!this.modal || !this.form) {
            console.warn('Prayer form elements not found');
            return;
        }
        
        this.setupEventListeners();
        this.setupValidation();
        this.setupCharacterCounter();
    }
    
    setupEventListeners() {
        // Prayer card button clicks
        document.querySelectorAll('.btn-request').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Get prayer type from data attribute
                const type = button.getAttribute('data-prayer-type') || 'personal';
                this.open(type);
            });
        });
        
        // Also allow clicking the card itself (except on the button)
        document.querySelectorAll('.prayer-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking the button directly
                if (e.target.closest('.btn-request')) return;
                
                const button = card.querySelector('.btn-request');
                const type = button?.getAttribute('data-prayer-type') || 'personal';
                this.open(type);
            });
            
            // Keyboard accessibility for cards
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const button = card.querySelector('.btn-request');
                    const type = button?.getAttribute('data-prayer-type') || 'personal';
                    this.open(type);
                }
            });
        });
        
        // Close button
        this.closeBtn?.addEventListener('click', () => this.close());
        
        // Click outside modal
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.classList.contains('active')) {
                this.close();
            }
        });
        
        // Form submission - Enhanced validation before Netlify
        this.form.addEventListener('submit', (e) => {
            if (!this.validateFormComplete()) {
                e.preventDefault();
                this.showValidationSummary();
                return false;
            }
            
            // Show loading state
            this.showLoadingState();
            
            // Let Netlify handle the actual submission and redirect
            return true;
        });
    }
    
    setupValidation() {
        // Real-time validation for each field
        Object.entries(this.fields).forEach(([name, field]) => {
            if (!field) return;
            
            // Validate on blur
            field.addEventListener('blur', () => {
                if (field.value.trim() || field.hasAttribute('required')) {
                    this.validateField(name);
                }
            });
            
            // Clear errors on input
            field.addEventListener('input', () => {
                if (field.classList.contains('error')) {
                    this.clearFieldError(name);
                }
            });
        });
    }
    
    setupCharacterCounter() {
        const textarea = this.fields.request;
        if (!textarea) return;
        
        const maxLength = 1000;
        const counter = document.createElement('div');
        counter.className = 'char-counter';
        counter.setAttribute('aria-live', 'polite');
        
        textarea.parentElement.appendChild(counter);
        textarea.setAttribute('maxlength', maxLength);
        
        const updateCounter = () => {
            const remaining = maxLength - textarea.value.length;
            counter.textContent = `${remaining} characters remaining`;
            
            if (remaining < 100) {
                counter.classList.add('warning');
                counter.style.color = '#dc2626';
            } else {
                counter.classList.remove('warning');
                counter.style.color = '#64748b';
            }
        };
        
        textarea.addEventListener('input', updateCounter);
        updateCounter();
    }
    
    validateField(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return true;
        
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        switch(fieldName) {
            case 'name':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please enter your name';
                } else if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Name contains invalid characters';
                }
                break;
                
            case 'email':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please enter your email address';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
                
            case 'phone':
                // Phone is optional, but validate if provided
                if (value && !/^[\d\s\-\+\(\)]+$/.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
                
            case 'category':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please select a prayer category';
                }
                break;
                
            case 'request':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Please share your prayer request';
                } else if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Please provide at least 10 characters';
                } else if (value.length > 1000) {
                    isValid = false;
                    errorMessage = 'Prayer request is too long (max 1000 characters)';
                }
                break;
        }
        
        this.updateFieldUI(fieldName, isValid, errorMessage);
        return isValid;
    }
    
    validateFormComplete() {
        const requiredFields = ['name', 'email', 'category', 'request'];
        let isValid = true;
        let firstError = null;
        
        requiredFields.forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
                if (!firstError) {
                    firstError = this.fields[fieldName];
                }
            }
        });
        
        // Focus first error field
        if (firstError) {
            firstError.focus();
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        return isValid;
    }
    
    updateFieldUI(fieldName, isValid, errorMessage) {
        const field = this.fields[fieldName];
        if (!field) return;
        
        let errorElement = field.parentElement.querySelector('.field-error');
        
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'field-error';
            errorElement.id = `${fieldName}-error`;
            errorElement.setAttribute('role', 'alert');
            field.parentElement.appendChild(errorElement);
            field.setAttribute('aria-describedby', errorElement.id);
        }
        
        if (isValid) {
            field.classList.remove('error');
            field.classList.add('success');
            field.setAttribute('aria-invalid', 'false');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        } else {
            field.classList.remove('success');
            field.classList.add('error');
            field.setAttribute('aria-invalid', 'true');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'flex';
        }
    }
    
    clearFieldError(fieldName) {
        const field = this.fields[fieldName];
        if (!field) return;
        
        field.classList.remove('error', 'success');
        field.setAttribute('aria-invalid', 'false');
        
        const errorElement = field.parentElement.querySelector('.field-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    showValidationSummary() {
        // Get all error messages
        const errors = Array.from(this.form.querySelectorAll('.field-error'))
            .filter(el => el.textContent.trim())
            .map(el => el.textContent);
        
        if (errors.length === 0) return;
        
        // Create or update error summary
        let summary = this.form.querySelector('#form-errors');
        if (!summary) {
            summary = document.createElement('div');
            summary.id = 'form-errors';
            summary.className = 'form-message error';
            summary.setAttribute('role', 'alert');
            summary.setAttribute('aria-live', 'assertive');
            this.form.insertBefore(summary, this.form.firstChild);
        }
        
        summary.innerHTML = `
            <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
            <div>
                <p><strong>Please correct the following errors:</strong></p>
                <ul>${errors.map(err => `<li>${err}</li>`).join('')}</ul>
            </div>
        `;
        summary.style.display = 'flex';
        
        // Scroll to summary
        summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Hide after 5 seconds
        setTimeout(() => {
            summary.style.display = 'none';
        }, 5000);
    }
    
    showLoadingState() {
        if (!this.submitBtn) return;
        
        this.submitBtn.disabled = true;
        this.submitBtn.innerHTML = `
            <i class="fas fa-spinner fa-spin" aria-hidden="true"></i> 
            Submitting Prayer Request...
        `;
        
        // Disable all form inputs
        const inputs = this.form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => input.disabled = true);
        
        // Add loading class to form
        this.form.classList.add('form-loading');
    }
    
    open(type = 'personal') {
        this.currentPrayerType = type;
        
        // Update modal content based on type
        const titles = {
            'personal': 'Personal Prayer Request',
            'family': 'Family Prayer Request',
            'ministry': 'Ministry Prayer Request'
        };
        
        const descriptions = {
            'personal': 'Share your personal needs, challenges, or thanksgiving.',
            'family': 'Request prayer for your loved ones and family unity.',
            'ministry': 'Pray for our mission and evangelism across Ethiopia.'
        };
        
        const modalTitle = this.modal.querySelector('#modal-title');
        const modalDesc = this.modal.querySelector('.modal-header p');
        
        if (modalTitle) {
            modalTitle.textContent = titles[type] || 'Submit Prayer Request';
        }
        
        if (modalDesc) {
            modalDesc.textContent = descriptions[type] || 'We believe in the power of prayer.';
        }
        
        // Set hidden prayer type field
        const typeField = document.getElementById('prayerType');
        if (typeField) {
            typeField.value = type;
        }
        
        // Reset and clear form
        this.resetForm();
        
        // Open modal
        this.modal.classList.add('active');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus first field
        setTimeout(() => {
            this.fields.name?.focus();
        }, 150);
        
        // Announce to screen readers
        this.announce(`${titles[type]} form opened`);
    }
    
    close() {
        this.modal.classList.remove('active');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        
        // Reset form after animation
        setTimeout(() => {
            this.resetForm();
        }, 300);
        
        this.announce('Prayer request form closed');
    }
    
    resetForm() {
        // Reset all fields
        this.form.reset();
        
        // Clear all validation states
        Object.keys(this.fields).forEach(fieldName => {
            this.clearFieldError(fieldName);
        });
        
        // Clear error summary
        const summary = this.form.querySelector('#form-errors');
        if (summary) {
            summary.style.display = 'none';
        }
        
        // Reset submit button
        if (this.submitBtn) {
            this.submitBtn.disabled = false;
            this.submitBtn.innerHTML = `
                <i class="fas fa-paper-plane" aria-hidden="true"></i> 
                Submit Prayer Request
            `;
        }
        
        // Re-enable all inputs
        const inputs = this.form.querySelectorAll('input, select, textarea, button');
        inputs.forEach(input => input.disabled = false);
        
        // Remove loading class
        this.form.classList.remove('form-loading');
        
        // Reset character counter
        const counter = this.form.querySelector('.char-counter');
        if (counter) {
            counter.textContent = '1000 characters remaining';
            counter.style.color = '#64748b';
        }
    }
    
    announce(message) {
        let announcer = document.getElementById('sr-announcer');
        
        if (!announcer) {
            announcer = document.createElement('div');
            announcer.id = 'sr-announcer';
            announcer.className = 'sr-only';
            announcer.setAttribute('role', 'status');
            announcer.setAttribute('aria-live', 'polite');
            announcer.setAttribute('aria-atomic', 'true');
            document.body.appendChild(announcer);
        }
        
        announcer.textContent = message;
        
        setTimeout(() => {
            announcer.textContent = '';
        }, 1000);
    }
}

// Global functions for backward compatibility
function openModal(type) {
    window.prayerManager?.open(type);
}

function closeModal() {
    window.prayerManager?.close();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.prayerManager = new PrayerRequestManager();
    });
} else {
    window.prayerManager = new PrayerRequestManager();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PrayerRequestManager;
}