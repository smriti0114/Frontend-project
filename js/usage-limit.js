/**
 * Textorr - Guest Usage Limit Controller
 * Manages guest attempts, shows authentication modal blocks, and counters.
 */

const TextorrUsageLimit = {
    LIMIT_MAX: 3,
    STORAGE_KEY: 'textorr_guest_usage',

    // Helper: checks if the current visitor is a guest (not authenticated)
    isGuest() {
        return localStorage.getItem('textorr_session') === null;
    },

    // Gets the current successful guest attempts count
    getGuestUsageCount() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            if (data) {
                const parsed = JSON.parse(data);
                return typeof parsed.count === 'number' ? parsed.count : 0;
            }
        } catch (e) {
            console.error('Error reading guest usage counts:', e);
        }
        return 0;
    },

    // Gets the remaining guest tries count
    getRemainingAttempts() {
        return Math.max(0, this.LIMIT_MAX - this.getGuestUsageCount());
    },

    // Checks if the user is authorized to execute a tool action
    canUseTool() {
        return !this.isGuest() || this.getRemainingAttempts() > 0;
    },

    // Records a guest attempt upon explicit successful operation completion
    recordAttempt() {
        if (!this.isGuest()) return;
        
        try {
            const count = this.getGuestUsageCount() + 1;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ count }));
            this.updateUsageUI();
        } catch (e) {
            console.error('Error saving guest attempt details:', e);
        }
    },

    // Updates badge indicators across tool screens immediately
    updateUsageUI() {
        const badges = document.querySelectorAll('.usage-counter-badge');
        if (badges.length === 0) return;

        const isGuestUser = this.isGuest();
        const remaining = this.getRemainingAttempts();

        badges.forEach(badge => {
            if (!isGuestUser) {
                badge.textContent = 'Unlimited access unlocked';
                badge.className = 'usage-counter-badge badge-unlimited';
                badge.style.display = 'inline-block';
                return;
            }

            if (remaining > 1) {
                badge.textContent = `${remaining} free uses remaining`;
                badge.className = 'usage-counter-badge badge-warning';
            } else if (remaining === 1) {
                badge.textContent = '1 free use remaining';
                badge.className = 'usage-counter-badge badge-critical';
            } else {
                badge.textContent = 'Free trial completed';
                badge.className = 'usage-counter-badge badge-completed';
            }
            badge.style.display = 'inline-block';
        });
    },

    // Displays the modal to register/login when limits are exceeded
    showLimitModal() {
        // Prevent duplicate overlays
        if (document.getElementById('textorrLimitModal')) return;

        const modalHtml = `
            <div id="textorrLimitModal" class="modal-overlay">
                <div class="modal-card">
                    <div class="modal-header">
                        <span class="modal-icon">✨</span>
                        <h2>You're enjoying Textorr!</h2>
                    </div>
                    <div class="modal-body">
                        <p>You've used all 3 of your free tries. Create a free account or log in to continue using all Textorr tools with unlimited access and history logs.</p>
                    </div>
                    <div class="modal-actions">
                        <a href="login.html?register=true" class="btn btn-primary">Create Free Account</a>
                        <a href="login.html?login=true" class="btn btn-secondary">Log In</a>
                        <button class="btn btn-tertiary" id="closeLimitModalBtn">Maybe Later</button>
                    </div>
                </div>
            </div>
        `;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = modalHtml.trim();
        const modalElement = tempDiv.firstChild;
        document.body.appendChild(modalElement);

        // Inject limit styles if missing
        if (!document.getElementById('limitModalStyles')) {
            const style = document.createElement('style');
            style.id = 'limitModalStyles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(8px);
                    -webkit-backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 99999;
                    animation: fadeInLimit 0.3s ease;
                }
                .modal-card {
                    background: var(--bg-dark);
                    border: 1px solid var(--border-glass);
                    border-radius: var(--radius-xl);
                    padding: 2.5rem;
                    max-width: 480px;
                    width: 90%;
                    text-align: center;
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
                    animation: scaleUpLimit 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                .modal-icon {
                    font-size: 3rem;
                    display: block;
                    margin-bottom: 1rem;
                }
                .modal-card h2 {
                    font-family: var(--font-heading);
                    color: var(--text-primary);
                    font-size: 1.6rem;
                    margin-bottom: 1rem;
                    font-weight: 700;
                }
                .modal-body p {
                    color: var(--text-secondary);
                    font-size: 0.95rem;
                    line-height: 1.6;
                    margin-bottom: 2rem;
                }
                .modal-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 0.8rem;
                }
                .modal-actions .btn {
                    width: 100%;
                    padding: 0.85rem;
                    border-radius: var(--radius-md);
                    font-weight: 600;
                    text-align: center;
                    text-decoration: none;
                    font-size: 0.95rem;
                    cursor: pointer;
                    display: inline-block;
                    transition: all var(--transition-fast);
                }
                .btn-tertiary {
                    background: transparent;
                    border: none;
                    color: var(--text-muted);
                }
                .btn-tertiary:hover {
                    color: var(--text-primary);
                }
                @keyframes fadeInLimit {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUpLimit {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Close bindings
        document.getElementById('closeLimitModalBtn').addEventListener('click', () => {
            modalElement.remove();
        });
    }
};

// Initialize UI update on script load
document.addEventListener('DOMContentLoaded', () => {
    TextorrUsageLimit.updateUsageUI();
});
