/**
 * Textorr - Landing Page Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    // Sticky Header
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // Scroll Animations (Intersection Observer)
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0 && typeof IntersectionObserver !== 'undefined') {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1
        });

        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Update Hero Guest CTA message dynamically
    const ctaNote = document.querySelector('.cta-guest-note');
    if (ctaNote) {
        const isLoggedIn = localStorage.getItem('textorr_session') !== null;
        if (isLoggedIn) {
            ctaNote.textContent = 'Unlimited access unlocked.';
            ctaNote.style.color = '#10b981'; // Green success color
        } else {
            ctaNote.textContent = 'Try Textorr free — 3 uses, no account required.';
            ctaNote.style.color = '#94a3b8'; // Grey muted color
        }
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});
