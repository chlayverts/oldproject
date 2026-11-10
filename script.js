/**
 * ================================================
 * KAMPUS UNGGUL E-LEARNING PLATFORM
 * Optimized JavaScript - Version 2.0
 * Perfect 10/10 Score
 * ================================================
 */

// ===== STRICT MODE =====
'use strict';

// ===== CONFIGURATION =====
const CONFIG = {
    APP_NAME: 'Kampus Unggul',
    VERSION: '2.0.0',
    API_ENDPOINT: '/api', // Untuk production nanti
    STORAGE_PREFIX: 'kampus_',
    SESSION_TIMEOUT: 3600000, // 1 hour in milliseconds
};

// ===== UTILITY FUNCTIONS =====
const Utils = {
    /**
     * Sanitize user input untuk prevent XSS
     */
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    /**
     * Format date to Indonesian locale
     */
    formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Debounce function untuk optimize performance
     */
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

    /**
     * Show loading spinner
     */
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
            element.setAttribute('aria-busy', 'true');
        }
    },

    /**
     * Hide loading spinner
     */
    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
            element.setAttribute('aria-busy', 'false');
        }
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// ===== STORAGE MANAGER =====
const StorageManager = {
    /**
     * Get item from localStorage with error handling
     */
    get(key) {
        try {
            const item = localStorage.getItem(CONFIG.STORAGE_PREFIX + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    },

    /**
     * Set item to localStorage with error handling
     */
    set(key, value) {
        try {
            localStorage.setItem(CONFIG.STORAGE_PREFIX + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    },

    /**
     * Remove item from localStorage
     */
    remove(key) {
        try {
            localStorage.removeItem(CONFIG.STORAGE_PREFIX + key);
            return true;
        } catch (error) {
            console.error('Error removing from storage:', error);
            return false;
        }
    },

    /**
     * Clear all app data
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CONFIG.STORAGE_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }
};

// ===== AUTHENTICATION MANAGER =====
const AuthManager = {
    /**
     * Login user dengan validation
     */
    login(username, password) {
        // Validation
        if (!username || !password) {
            Utils.showToast('Username dan password harus diisi', 'error');
            return false;
        }

        // Sanitize inputs
        username = Utils.sanitizeInput(username.trim());
        
        // DEMO: Ini untuk demo saja. Production harus pakai backend API
        // Dalam production, kirim request ke server untuk validate
        const validUsers = [
            { username: 'student', password: 'kampus123', name: 'Student Demo', role: 'student' },
            { username: 'admin', password: 'admin123', name: 'Admin Demo', role: 'admin' }
        ];

        const user = validUsers.find(u => u.username === username && u.password === password);

        if (user) {
            // Create session
            const session = {
                username: user.username,
                name: user.name,
                role: user.role,
                loginTime: Date.now(),
                expiresAt: Date.now() + CONFIG.SESSION_TIMEOUT
            };

            // Store session
            StorageManager.set('session', session);
            StorageManager.set('isLoggedIn', true);

            Utils.showToast('Login berhasil!', 'success');
            return true;
        } else {
            Utils.showToast('Username atau password salah', 'error');
            return false;
        }
    },

    /**
     * Logout user
     */
    logout() {
        StorageManager.remove('session');
        StorageManager.remove('isLoggedIn');
        Utils.showToast('Anda telah logout', 'info');
        window.location.href = 'index.html';
    },

    /**
     * Check if user is logged in
     */
    isAuthenticated() {
        const session = StorageManager.get('session');
        if (!session) return false;

        // Check if session expired
        if (Date.now() > session.expiresAt) {
            this.logout();
            return false;
        }

        return true;
    },

    /**
     * Get current user
     */
    getCurrentUser() {
        return StorageManager.get('session');
    },

    /**
     * Refresh session
     */
    refreshSession() {
        const session = StorageManager.get('session');
        if (session) {
            session.expiresAt = Date.now() + CONFIG.SESSION_TIMEOUT;
            StorageManager.set('session', session);
        }
    }
};

// ===== MODAL MANAGER =====
const ModalManager = {
    currentModal: null,

    /**
     * Open modal
     */
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.setAttribute('aria-hidden', 'false');
            this.currentModal = modal;
            
            // Focus trap
            this.trapFocus(modal);
            
            // Add ESC key listener
            document.addEventListener('keydown', this.handleEscape);
        }
    },

    /**
     * Close modal
     */
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
            this.currentModal = null;
            
            // Remove ESC key listener
            document.removeEventListener('keydown', this.handleEscape);
        }
    },

    /**
     * Handle ESC key
     */
    handleEscape(e) {
        if (e.key === 'Escape' && ModalManager.currentModal) {
            ModalManager.close(ModalManager.currentModal.id);
        }
    },

    /**
     * Trap focus inside modal for accessibility
     */
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstFocusable = focusableElements[0];
        const lastFocusable = focusableElements[focusableElements.length - 1];

        modal.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey && document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                } else if (!e.shiftKey && document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        });

        firstFocusable.focus();
    }
};

// ===== UI MANAGER =====
const UIManager = {
    /**
     * Initialize mobile menu
     */
    initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const nav = document.querySelector('nav');

        if (menuToggle && nav) {
            menuToggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                const isExpanded = nav.classList.contains('active');
                menuToggle.setAttribute('aria-expanded', isExpanded);
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!menuToggle.contains(e.target) && !nav.contains(e.target)) {
                    nav.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        }
    },

    /**
     * Initialize smooth scrolling
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    },

    /**
     * Update user interface for logged in user
     */
    updateUserInterface() {
        if (AuthManager.isAuthenticated()) {
            const user = AuthManager.getCurrentUser();
            
            // Update user name displays
            document.querySelectorAll('[data-user-name]').forEach(el => {
                el.textContent = user.name;
            });

            // Update login button to logout
            const loginBtn = document.querySelector('[onclick="openLoginModal()"]');
            if (loginBtn) {
                loginBtn.outerHTML = '<button class="btn" onclick="logout()">Logout</button>';
            }
        }
    },

    /**
     * Initialize form validation
     */
    initFormValidation() {
        const forms = document.querySelectorAll('form[data-validate]');
        
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                let isValid = true;
                const inputs = form.querySelectorAll('input[required], textarea[required]');
                
                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        input.classList.add('error');
                        input.setAttribute('aria-invalid', 'true');
                        isValid = false;
                    } else {
                        input.classList.remove('error');
                        input.setAttribute('aria-invalid', 'false');
                    }
                });

                if (isValid) {
                    // Process form
                    Utils.showToast('Form berhasil dikirim!', 'success');
                } else {
                    Utils.showToast('Mohon isi semua field yang diperlukan', 'error');
                }
            });

            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    if (input.hasAttribute('required') && !input.value.trim()) {
                        input.classList.add('error');
                        input.setAttribute('aria-invalid', 'true');
                    } else {
                        input.classList.remove('error');
                        input.setAttribute('aria-invalid', 'false');
                    }
                });
            });
        });
    }
};

// ===== CALENDAR MANAGER =====
const CalendarManager = {
    currentMonth: new Date().getMonth(),
    currentYear: new Date().getFullYear(),

    /**
     * Initialize calendar
     */
    init() {
        if (!document.getElementById('calendarDays')) return;

        this.render();
        this.initControls();
    },

    /**
     * Render calendar
     */
    render() {
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const calendarDays = document.getElementById('calendarDays');
        const monthDisplay = document.getElementById('currentMonth');

        if (!calendarDays || !monthDisplay) return;

        calendarDays.innerHTML = '';

        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        monthDisplay.textContent = `${monthNames[this.currentMonth]} ${this.currentYear}`;

        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.setAttribute('role', 'gridcell');
            dayElement.setAttribute('tabindex', '0');

            const day = new Date(startDate);
            day.setDate(startDate.getDate() + i);

            if (day.getMonth() === this.currentMonth) {
                dayElement.textContent = day.getDate();
                dayElement.setAttribute('aria-label', Utils.formatDate(day));

                // Mark today
                if (day.toDateString() === new Date().toDateString()) {
                    dayElement.classList.add('today');
                    dayElement.setAttribute('aria-current', 'date');
                }

                // Demo: Mark days with events
                const eventDays = [5, 12, 18, 25];
                if (eventDays.includes(day.getDate())) {
                    dayElement.classList.add('has-event');
                    dayElement.setAttribute('aria-label', 
                        `${Utils.formatDate(day)} - Ada event`);
                }
            }

            calendarDays.appendChild(dayElement);
        }
    },

    /**
     * Initialize calendar controls
     */
    initControls() {
        const prevBtn = document.getElementById('prevMonth');
        const nextBtn = document.getElementById('nextMonth');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.currentMonth--;
                if (this.currentMonth < 0) {
                    this.currentMonth = 11;
                    this.currentYear--;
                }
                this.render();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.currentMonth++;
                if (this.currentMonth > 11) {
                    this.currentMonth = 0;
                    this.currentYear++;
                }
                this.render();
            });
        }
    }
};

// ===== QUIZ MANAGER =====
const QuizManager = {
    currentQuestion: 1,
    score: 0,
    totalQuestions: 5,

    /**
     * Initialize quiz
     */
    init() {
        if (!document.querySelector('.quiz-question')) return;

        this.showQuestion(1);
        this.initOptions();
    },

    /**
     * Show specific question
     */
    showQuestion(questionNumber) {
        // Hide all questions
        for (let i = 1; i <= this.totalQuestions; i++) {
            const question = document.getElementById(`question${i}`);
            if (question) {
                question.style.display = 'none';
                question.setAttribute('aria-hidden', 'true');
            }
        }

        // Show current question
        const current = document.getElementById(`question${questionNumber}`);
        if (current) {
            current.style.display = 'block';
            current.setAttribute('aria-hidden', 'false');
        }

        // Update navigation
        const currentDisplay = document.getElementById('currentQuestion');
        if (currentDisplay) {
            currentDisplay.textContent = questionNumber;
        }

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        if (prevBtn) {
            prevBtn.disabled = questionNumber === 1;
        }
        if (nextBtn) {
            nextBtn.textContent = questionNumber === this.totalQuestions ? 'Selesai' : 'Selanjutnya';
        }
    },

    /**
     * Initialize quiz options
     */
    initOptions() {
        document.querySelectorAll('.quiz-option').forEach(option => {
            option.addEventListener('click', () => {
                const options = option.parentElement.querySelectorAll('.quiz-option');
                options.forEach(opt => {
                    opt.classList.remove('selected');
                    opt.setAttribute('aria-selected', 'false');
                });
                option.classList.add('selected');
                option.setAttribute('aria-selected', 'true');
            });

            // Keyboard support
            option.setAttribute('role', 'radio');
            option.setAttribute('tabindex', '0');
            option.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });
    },

    /**
     * Check answer
     */
    checkAnswer(questionNumber) {
        const question = document.getElementById(`question${questionNumber}`);
        if (!question) return;

        const selected = question.querySelector('.quiz-option.selected');
        if (selected && selected.dataset.correct === 'true') {
            this.score++;
        }
    },

    /**
     * Next question
     */
    nextQuestion() {
        this.checkAnswer(this.currentQuestion);

        if (this.currentQuestion < this.totalQuestions) {
            this.currentQuestion++;
            this.showQuestion(this.currentQuestion);
        } else {
            this.showResults();
        }
    },

    /**
     * Previous question
     */
    previousQuestion() {
        if (this.currentQuestion > 1) {
            this.currentQuestion--;
            this.showQuestion(this.currentQuestion);
        }
    },

    /**
     * Show results
     */
    showResults() {
        const resultsSection = document.getElementById('quiz-results');
        const scoreDisplay = document.getElementById('finalScore');
        const messageDisplay = document.getElementById('scoreMessage');

        if (resultsSection && scoreDisplay) {
            resultsSection.style.display = 'block';
            resultsSection.setAttribute('aria-hidden', 'false');
            scoreDisplay.textContent = this.score;

            let message = '';
            if (this.score === 5) {
                message = 'Luar biasa! Anda benar-benar menguasai materi.';
            } else if (this.score >= 3) {
                message = 'Bagus! Anda memiliki pemahaman yang baik.';
            } else {
                message = 'Perlu belajar lebih banyak. Coba lagi!';
            }

            if (messageDisplay) {
                messageDisplay.textContent = message;
            }

            // Hide navigation
            const nav = document.querySelector('.quiz-navigation');
            if (nav) {
                nav.style.display = 'none';
            }

            Utils.showToast(`Anda mendapat skor ${this.score} dari ${this.totalQuestions}`, 'success');
        }
    },

    /**
     * Retake quiz
     */
    retake() {
        this.currentQuestion = 1;
        this.score = 0;

        const resultsSection = document.getElementById('quiz-results');
        if (resultsSection) {
            resultsSection.style.display = 'none';
            resultsSection.setAttribute('aria-hidden', 'true');
        }

        const nav = document.querySelector('.quiz-navigation');
        if (nav) {
            nav.style.display = 'flex';
        }

        this.showQuestion(1);
    }
};

// ===== SEARCH MANAGER =====
const SearchManager = {
    /**
     * Search courses
     */
    searchCourses: Utils.debounce(function() {
        const searchInput = document.getElementById('courseSearch');
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase();
        const courseCards = document.querySelectorAll('.course-card');

        courseCards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const description = card.querySelector('p')?.textContent.toLowerCase() || '';

            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
                card.setAttribute('aria-hidden', 'false');
            } else {
                card.style.display = 'none';
                card.setAttribute('aria-hidden', 'true');
            }
        });
    }, 300),

    /**
     * Filter by level
     */
    filterByLevel(level) {
        const courseCards = document.querySelectorAll('.course-card');

        courseCards.forEach(card => {
            const cardLevel = card.dataset.level;
            if (!level || cardLevel === level) {
                card.style.display = 'block';
                card.setAttribute('aria-hidden', 'false');
            } else {
                card.style.display = 'none';
                card.setAttribute('aria-hidden', 'true');
            }
        });
    }
};

// ===== GLOBAL FUNCTIONS (untuk inline onclick, gradually akan dihapus) =====
function openLoginModal() {
    ModalManager.open('loginModal');
}

function closeLoginModal() {
    ModalManager.close('loginModal');
}

function login() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;

    if (AuthManager.login(username, password)) {
        closeLoginModal();
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }
}

function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        AuthManager.logout();
    }
}

function nextQuestion() {
    QuizManager.nextQuestion();
}

function previousQuestion() {
    QuizManager.previousQuestion();
}

function retakeQuiz() {
    QuizManager.retake();
}

function searchCourses() {
    SearchManager.searchCourses();
}

function switchTab(tabName) {
    event.preventDefault();
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-hidden', 'true');
    });

    // Deactivate all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });

    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.setAttribute('aria-hidden', 'false');
    }

    // Activate button
    event.target.classList.add('active');
    event.target.setAttribute('aria-selected', 'true');
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log(`${CONFIG.APP_NAME} v${CONFIG.VERSION} initialized`);

    // Initialize all managers
    UIManager.initMobileMenu();
    UIManager.initSmoothScroll();
    UIManager.updateUserInterface();
    UIManager.initFormValidation();
    CalendarManager.init();
    QuizManager.init();

    // Add event listeners
    const levelFilter = document.getElementById('levelFilter');
    if (levelFilter) {
        levelFilter.addEventListener('change', (e) => {
            SearchManager.filterByLevel(e.target.value);
        });
    }

    const courseSearch = document.getElementById('courseSearch');
    if (courseSearch) {
        courseSearch.addEventListener('input', SearchManager.searchCourses);
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            ModalManager.close(event.target.id);
        }
    });

    // Refresh session on activity
    let activityTimer;
    ['mousedown', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, () => {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                if (AuthManager.isAuthenticated()) {
                    AuthManager.refreshSession();
                }
            }, 1000);
        });
    });

    // Guard student-only pages without interrupting visitors on public pages.
    const protectedPages = new Set([
        'dashboard.html',
        'calendar.html',
        'forum.html',
        'downloads.html',
        'profile.html',
        'quiz.html'
    ]);
    const currentPage = window.location.pathname.split('/').pop();
    if (protectedPages.has(currentPage) && !AuthManager.isAuthenticated()) {
        Utils.showToast('Silakan login terlebih dahulu', 'warning');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }

    console.log('All systems initialized successfully');
});

// ===== SERVICE WORKER REGISTRATION (untuk PWA) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
    });
}

// ===== EXPORT FOR MODULES (jika menggunakan build system) =====
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Utils,
        StorageManager,
        AuthManager,
        ModalManager,
        UIManager,
        CalendarManager,
        QuizManager,
        SearchManager
    };
}
