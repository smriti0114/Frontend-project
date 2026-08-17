/**
 * Textorr - Login and Registration Form Manager (Revamped split-screen edition)
 */
document.addEventListener('DOMContentLoaded', () => {
    // Form toggle elements
    const toggleBtns = document.querySelectorAll('.toggle-btn');
    const authLinkSwitches = document.querySelectorAll('.auth-link-switch');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    // Real-time validation inputs
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');

    // Form Toggle Function
    function switchForm(formType) {
        // Find toggles
        const toggleLoginBtn = document.getElementById('toggleLoginBtn');
        const toggleRegisterBtn = document.getElementById('toggleRegisterBtn');

        if (formType === 'login') {
            if (toggleLoginBtn) {
                toggleBtns.forEach(b => b.classList.remove('active'));
                toggleLoginBtn.classList.add('active');
            }
            
            registerForm.classList.remove('active');
            loginForm.classList.add('active');
            
            authTitle.textContent = 'Welcome Back';
            authSubtitle.textContent = 'Login to access your workspace';
        } else {
            if (toggleRegisterBtn) {
                toggleBtns.forEach(b => b.classList.remove('active'));
                toggleRegisterBtn.classList.add('active');
            }
            
            loginForm.classList.remove('active');
            registerForm.classList.add('active');
            
            authTitle.textContent = 'Create Account';
            authSubtitle.textContent = 'Unlock unlimited access to all tools';
        }
    }

    // Toggle button triggers
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            switchForm(btn.dataset.form);
        });
    });

    // Anchor text link switches ("Create one" / "Log in")
    authLinkSwitches.forEach(link => {
        link.addEventListener('click', () => {
            switchForm(link.dataset.form);
        });
    });

    // Password field visibility toggle (Show/Hide text)
    document.querySelectorAll('.password-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.target;
            const input = document.getElementById(targetId);
            
            if (input.type === 'password') {
                input.type = 'text';
                btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>';
            } else {
                input.type = 'password';
                btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>';
            }
        });
    });

    // Validation patterns
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePassword(password) {
        return password.length >= 6;
    }

    function validateName(name) {
        return name.trim().length >= 2;
    }

    // Input state visual indicators
    function checkInputStatus(input, validationFn, wrapperId) {
        const wrapper = document.getElementById(wrapperId);
        if (input.value.length > 0) {
            if (validationFn(input.value)) {
                wrapper.classList.remove('error');
                wrapper.classList.add('success');
            } else {
                wrapper.classList.remove('success');
                wrapper.classList.add('error');
            }
        } else {
            wrapper.classList.remove('error', 'success');
        }
    }

    loginEmail.addEventListener('input', () => checkInputStatus(loginEmail, validateEmail, 'loginEmailWrapper'));
    loginPassword.addEventListener('input', () => checkInputStatus(loginPassword, validatePassword, 'loginPasswordWrapper'));
    registerName.addEventListener('input', () => checkInputStatus(registerName, validateName, 'registerNameWrapper'));
    registerEmail.addEventListener('input', () => checkInputStatus(registerEmail, validateEmail, 'registerEmailWrapper'));
    registerPassword.addEventListener('input', () => checkInputStatus(registerPassword, validatePassword, 'registerPasswordWrapper'));

    // Confirm Password Match Check
    registerConfirmPassword.addEventListener('input', () => {
        const wrapper = document.getElementById('registerConfirmPasswordWrapper');
        if (registerConfirmPassword.value.length > 0) {
            if (registerConfirmPassword.value === registerPassword.value) {
                wrapper.classList.remove('error');
                wrapper.classList.add('success');
            } else {
                wrapper.classList.remove('success');
                wrapper.classList.add('error');
            }
        } else {
            wrapper.classList.remove('error', 'success');
        }
    });

    // Login Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        if (!validateEmail(loginEmail.value)) {
            document.getElementById('loginEmailWrapper').classList.add('error');
            isValid = false;
        }
        
        if (!validatePassword(loginPassword.value)) {
            document.getElementById('loginPasswordWrapper').classList.add('error');
            isValid = false;
        }
        
        if (isValid) {
            const submitBtn = loginForm.querySelector('.submit-btn');
            const origText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            const res = await TextorrAuth.login(loginEmail.value, loginPassword.value);
            
            if (res.success) {
                showTooltip('Login successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                showTooltip(res.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        }
    });

    // Registration Form Submission
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        if (!validateName(registerName.value)) {
            document.getElementById('registerNameWrapper').classList.add('error');
            isValid = false;
        }
        
        if (!validateEmail(registerEmail.value)) {
            document.getElementById('registerEmailWrapper').classList.add('error');
            isValid = false;
        }
        
        if (!validatePassword(registerPassword.value)) {
            document.getElementById('registerPasswordWrapper').classList.add('error');
            isValid = false;
        }

        if (registerPassword.value !== registerConfirmPassword.value) {
            document.getElementById('registerConfirmPasswordWrapper').classList.add('error');
            showTooltip('Passwords do not match!', 'error');
            isValid = false;
        }
        
        const agreeTerms = document.getElementById('agreeTerms');
        if (!agreeTerms.checked) {
            showTooltip('Please agree to the Terms & Conditions', 'error');
            isValid = false;
        }
        
        if (isValid) {
            const submitBtn = registerForm.querySelector('.submit-btn');
            const origText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';
            
            const res = await TextorrAuth.register(registerName.value, registerEmail.value, registerPassword.value);
            
            if (res.success) {
                showTooltip('Registration successful!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 800);
            } else {
                showTooltip(res.message, 'error');
                submitBtn.disabled = false;
                submitBtn.textContent = origText;
            }
        }
    });

    // Floating labels creation
    document.querySelectorAll('.input-wrapper input').forEach(input => {
        // Prevent creating duplicate labels if already rendered
        if (input.parentElement.querySelector('.floating-label')) return;

        const label = document.createElement('label');
        label.className = 'floating-label';
        
        if (input.id.includes('Email')) {
            label.textContent = 'Email Address';
        } else if (input.id.includes('ConfirmPassword')) {
            label.textContent = 'Confirm Password';
        } else if (input.id.includes('Password')) {
            label.textContent = 'Password';
        } else if (input.id.includes('Name')) {
            label.textContent = 'Full Name';
        }
        
        input.placeholder = ' ';
        input.parentElement.appendChild(label);
    });

    // Check URL parameters for starting tab state
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === 'true') {
        switchForm('register');
    } else {
        switchForm('login');
    }

    // Check guest attempts status to display contextual showcase alert
    const guestAlert = document.getElementById('guestLimitAlert');
    if (guestAlert) {
        const isGuest = localStorage.getItem('textorr_session') === null;
        const guestData = localStorage.getItem('textorr_guest_usage');
        if (isGuest && guestData) {
            const parsed = JSON.parse(guestData);
            if (parsed.count >= 3) {
                guestAlert.style.display = 'flex';
            }
        }
    }

    // Auto-focus first input box
    loginEmail.focus();
});
