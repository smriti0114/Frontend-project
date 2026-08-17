/**
 * Textorr - Authentication & Dynamic Navigation
 * (Frontend Mock/Demo Authentication - Client-Side Only)
 */

// Helper to hash passwords using SHA-256 via SubtleCrypto (async)
async function hashPassword(password) {
    try {
        const msgBuffer = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        // Fallback simple obfuscation in case crypto is not available in non-secure local contexts
        console.warn('SubtleCrypto not available, using fallback encoding');
        return btoa(password);
    }
}

const TextorrAuth = {
    USERS_KEY: 'textorr_users',
    SESSION_KEY: 'textorr_session',

    // Register a new demo user
    async register(name, email, password) {
        try {
            const users = this.getUsers();
            const normalizedEmail = email.trim().toLowerCase();
            
            // Check if user already exists
            if (users.some(u => u.email === normalizedEmail)) {
                return { success: false, message: 'An account with this email already exists.' };
            }
            
            const hashedPassword = await hashPassword(password);
            
            const newUser = {
                name: name.trim(),
                email: normalizedEmail,
                password: hashedPassword,
                createdAt: Date.now()
            };
            
            users.push(newUser);
            localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
            
            // Auto login after registration
            return this.login(normalizedEmail, password);
        } catch (e) {
            console.error('Registration failed:', e);
            return { success: false, message: 'Registration failed due to a system error.' };
        }
    },

    // Login a user
    async login(email, password) {
        try {
            const users = this.getUsers();
            const normalizedEmail = email.trim().toLowerCase();
            const hashedPassword = await hashPassword(password);
            
            const user = users.find(u => u.email === normalizedEmail && u.password === hashedPassword);
            
            if (!user) {
                return { success: false, message: 'Invalid email or password.' };
            }
            
            // Create a session
            const session = {
                name: user.name,
                email: user.email,
                loginTime: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours session
            };
            
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
            return { success: true, user: { name: user.name, email: user.email } };
        } catch (e) {
            console.error('Login failed:', e);
            return { success: false, message: 'Login failed due to a system error.' };
        }
    },

    // Logout the current user
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        showTooltip('Logged out successfully', 'success');
        
        // Redirect to index or login page
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 800);
    },

    // Get current session
    getSession() {
        try {
            const sessionData = localStorage.getItem(this.SESSION_KEY);
            if (!sessionData) return null;
            
            const session = JSON.parse(sessionData);
            
            // Check if session has expired
            if (Date.now() > session.expiresAt) {
                this.logout();
                return null;
            }
            
            return session;
        } catch (e) {
            console.error('Error reading session:', e);
            return null;
        }
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getSession() !== null;
    },

    // Get current logged-in user profile
    getCurrentUser() {
        return this.getSession();
    },

    // Get list of registered demo users
    getUsers() {
        try {
            const usersData = localStorage.getItem(this.USERS_KEY);
            return usersData ? JSON.parse(usersData) : [];
        } catch (e) {
            console.error('Error reading users list:', e);
            return [];
        }
    },

    // Route Protection: redirects unauthenticated users
    protectRoute() {
        const path = window.location.pathname;
        const pageName = path.substring(path.lastIndexOf('/') + 1);
        
        if (pageName === 'dashboard.html' && !this.isLoggedIn()) {
            window.location.href = 'login.html';
        }
    },

    // Dynamic Navigation Header Renderer
    renderHeader() {
        const headerElement = document.getElementById('header');
        if (!headerElement) return;

        const user = this.getCurrentUser();
        const path = window.location.pathname;
        const pageName = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

        let navLinksHTML = '';
        let userActionHTML = '';

        if (user) {
            // Logged-in navigation
            navLinksHTML = `
                <li><a href="index.html" class="${pageName === 'index.html' ? 'active' : ''}">Home</a></li>
                <li><a href="dashboard.html" class="${pageName === 'dashboard.html' ? 'active' : ''}">Dashboard</a></li>
                <li><a href="qr.html" class="${pageName === 'qr.html' ? 'active' : ''}">QR Generator</a></li>
                <li><a href="voice.html" class="${pageName === 'voice.html' ? 'active' : ''}">Voice Generator</a></li>
                <li><a href="language.html" class="${pageName === 'language.html' ? 'active' : ''}">Language Converter</a></li>
            `;

            userActionHTML = `
                <div class="user-profile" id="userProfileDropdown">
                    <div class="avatar">${user.name.charAt(0).toUpperCase()}</div>
                    <div class="dropdown-menu" id="dropdownMenu">
                        <div style="padding: 0.8rem 1.2rem; border-bottom: 1px solid var(--border-glass); font-size: 0.85rem;">
                            <div style="font-weight: 600; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; color: var(--text-primary);">${user.name}</div>
                            <div style="color: var(--text-secondary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap; margin-top: 2px;">${user.email}</div>
                        </div>
                        <a href="dashboard.html" class="dropdown-item">Dashboard</a>
                        <button class="dropdown-item" id="logoutBtn">Logout</button>
                    </div>
                </div>
            `;
        } else {
            // Logged-out navigation
            navLinksHTML = `
                <li><a href="index.html#home" class="${pageName === 'index.html' ? 'active' : ''}">Home</a></li>
                <li><a href="index.html#services">Tools</a></li>
                <li><a href="index.html#about">About</a></li>
                <li><a href="index.html#contact">Contact</a></li>
            `;

            userActionHTML = `
                <a href="login.html?login=true" class="btn btn-secondary" style="padding: 0.5rem 1.2rem; font-size: 0.9rem; border-radius: var(--radius-md); margin-right: 0.5rem;">Login</a>
                <a href="login.html?register=true" class="btn btn-primary" style="padding: 0.5rem 1.2rem; font-size: 0.9rem; border-radius: var(--radius-md);">Get Started</a>
            `;
        }

        // Complete header content
        headerElement.innerHTML = `
            <nav class="navbar">
                <div class="navbar-inner">
                    <a href="index.html" class="logo-container logo">
                        <span class="logo-text">Textorr</span>
                    </a>
                    <ul class="nav-links" id="navLinks">
                        ${navLinksHTML}
                    </ul>
                    <div class="nav-actions user-menu">
                        <button class="theme-toggle-btn" id="themeToggleBtn" aria-label="Toggle Theme">
                            <svg class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                            <svg class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        </button>
                        ${userActionHTML}
                        <div class="mobile-menu-toggle" id="mobileMenuBtn">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        this.setupHeaderEvents();
    },

    // Setup interactive events on header elements
    setupHeaderEvents() {
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                if (typeof TextorrTheme !== 'undefined') {
                    TextorrTheme.toggle();
                }
            });
        }

        const profileDropdown = document.getElementById('userProfileDropdown');
        const dropdownMenu = document.getElementById('dropdownMenu');
        if (profileDropdown && dropdownMenu) {
            profileDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('show');
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                dropdownMenu.classList.remove('show');
            });
        }

        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Mobile Hamburger Toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const navLinks = document.getElementById('navLinks');
        if (mobileMenuBtn && navLinks) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                mobileMenuBtn.classList.toggle('active');
                navLinks.classList.toggle('active');
            });

            // Close mobile menu when clicking outside
            document.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navLinks.classList.remove('active');
            });
        }
    }
};

// Auto-run checks and navigation render
(function() {
    TextorrAuth.protectRoute();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            TextorrAuth.renderHeader();
        });
    } else {
        TextorrAuth.renderHeader();
    }
})();
