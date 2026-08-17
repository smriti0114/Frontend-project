/**
 * Textorr - QR Code Generator Logic
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const qrtext = document.getElementById('qrtext');
    const qrimage = document.getElementById('qrimage');
    const qrDisplay = document.getElementById('qrDisplay');
    const actionButtons = document.getElementById('actionButtons');
    const generateBtn = document.getElementById('generateBtn');
    const sizeOptions = document.querySelectorAll('.size-option');

    // State
    let selectedSize = 200;
    let currentQRUrl = '';

    // Size selection
    sizeOptions.forEach(option => {
        option.addEventListener('click', () => {
            sizeOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedSize = option.dataset.size;
            
            // Regenerate if QR code exists
            if (qrDisplay.classList.contains('show')) {
                generateQR(true);
            }
        });
    });

    // Generate QR Code
    function generateQR(silent = false) {
        // Enforce guest attempts limit check before doing anything
        if (!silent && typeof TextorrUsageLimit !== 'undefined' && !TextorrUsageLimit.canUseTool()) {
            TextorrUsageLimit.showLimitModal();
            return;
        }

        const text = qrtext.value.trim();

        // Validation
        if (!text) {
            qrtext.classList.add('error');
            showTooltip('Please enter text or URL', 'error');
            setTimeout(() => qrtext.classList.remove('error'), 400);
            return;
        }

        // Loading state
        if (!silent) {
            generateBtn.classList.add('loading');
            generateBtn.textContent = '';
        }

        // Generate QR code
        setTimeout(() => {
            currentQRUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${selectedSize}x${selectedSize}&data=${encodeURIComponent(text)}`;
            qrimage.src = currentQRUrl;

            // Show QR code with animation
            qrDisplay.classList.add('show');
            actionButtons.classList.add('show');

            // Reset button
            if (!silent) {
                generateBtn.classList.remove('loading');
                generateBtn.textContent = 'Generate QR Code';
                showTooltip('QR Code generated!', 'success');
                
                if (typeof TextorrHistory !== 'undefined') {
                    TextorrHistory.addActivity('qr', {
                        text: text,
                        size: selectedSize,
                        url: currentQRUrl
                    });
                }

                // Record successful guest attempt
                if (typeof TextorrUsageLimit !== 'undefined') {
                    TextorrUsageLimit.recordAttempt();
                }
            }
        }, silent ? 0 : 800);
    }

    // Download QR Code
    async function downloadQR() {
        if (!qrimage.src || qrimage.src === window.location.href) {
            showTooltip('Please generate a QR code first', 'error');
            return;
        }

        try {
            const response = await fetch(qrimage.src);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `qrcode-${Date.now()}.png`;
            link.click();
            URL.revokeObjectURL(url);
            showTooltip('QR Code downloaded!', 'success');
        } catch (error) {
            showTooltip('Download failed. Please try again.', 'error');
        }
    }

    // Copy QR Link
    function copyQRLink() {
        if (!currentQRUrl) {
            showTooltip('Please generate a QR code first', 'error');
            return;
        }

        navigator.clipboard.writeText(currentQRUrl).then(() => {
            showTooltip('Link copied to clipboard!', 'success');
        }).catch(() => {
            showTooltip('Failed to copy link', 'error');
        });
    }

    // Expose functions globally for HTML inline buttons
    window.generateQR = generateQR;
    window.downloadQR = downloadQR;
    window.copyQRLink = copyQRLink;

    // Enter key support
    qrtext.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            generateQR();
        }
    });

    // Clear error state on input
    qrtext.addEventListener('input', () => {
        qrtext.classList.remove('error');
    });

    // Focus input on load & check reuse
    const params = new URLSearchParams(window.location.search);
    const reuseText = params.get('reuse');
    if (reuseText) {
        qrtext.value = reuseText;
        generateQR();
    }
    qrtext.focus();
});
