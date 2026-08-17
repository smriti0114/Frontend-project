/**
 * Textorr - Language Translator Logic
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const sourceText = document.getElementById('sourceText');
    const targetText = document.getElementById('targetText');
    const sourceLang = document.getElementById('sourceLang');
    const targetLang = document.getElementById('targetLang');
    const sourceFlag = document.getElementById('sourceFlag');
    const targetFlag = document.getElementById('targetFlag');
    const charCount = document.getElementById('charCount');
    const translateBtn = document.getElementById('translateBtn');
    const swapBtn = document.getElementById('swapBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const detectedLang = document.getElementById('detectedLang');
    const detectedLangName = document.getElementById('detectedLangName');

    // Update flags
    function updateFlags() {
        const sourceOption = sourceLang.options[sourceLang.selectedIndex];
        const targetOption = targetLang.options[targetLang.selectedIndex];
        sourceFlag.textContent = sourceOption.dataset.flag;
        targetFlag.textContent = targetOption.dataset.flag;
    }

    sourceLang.addEventListener('change', updateFlags);
    targetLang.addEventListener('change', updateFlags);

    // Character counter
    sourceText.addEventListener('input', () => {
        charCount.textContent = sourceText.value.length;
        if (sourceText.value.trim()) {
            clearBtn.disabled = false;
        } else {
            clearBtn.disabled = true;
            targetText.value = '';
            copyBtn.disabled = true;
        }
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        sourceText.value = '';
        targetText.value = '';
        charCount.textContent = '0';
        clearBtn.disabled = true;
        copyBtn.disabled = true;
        detectedLang.style.display = 'none';
    });

    // Swap languages
    swapBtn.addEventListener('click', () => {
        swapBtn.classList.add('animating');
        setTimeout(() => swapBtn.classList.remove('animating'), 600);

        const tempLang = sourceLang.value;
        const tempText = sourceText.value;

        sourceLang.value = targetLang.value;
        targetLang.value = tempLang;
        sourceText.value = targetText.value;
        targetText.value = tempText;

        updateFlags();
        charCount.textContent = sourceText.value.length;

        if (sourceText.value.trim()) {
            clearBtn.disabled = false;
            copyBtn.disabled = false;
        }
    });

    // Get language name
    function getLangName(code) {
        const option = Array.from(sourceLang.options).find(opt => opt.value === code);
        return option ? option.textContent : code;
    }

    // Translate function
    async function translate() {
        // Enforce guest attempts limit check before doing anything
        if (typeof TextorrUsageLimit !== 'undefined' && !TextorrUsageLimit.canUseTool()) {
            TextorrUsageLimit.showLimitModal();
            return;
        }

        const text = sourceText.value.trim();

        if (!text) {
            sourceText.style.borderColor = '#ef4444';
            showTooltip('Please enter text to translate', 'error');
            setTimeout(() => sourceText.style.borderColor = '', 300);
            return;
        }

        if (sourceLang.value === targetLang.value) {
            showTooltip('Source and target languages are the same', 'error');
            return;
        }

        translateBtn.classList.add('loading');

        try {
            // Using MyMemory Translation API (free, no key required)
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang.value}|${targetLang.value}`
            );

            const data = await response.json();

            if (data.responseStatus === 200 && data.responseData) {
                targetText.value = data.responseData.translatedText;
                copyBtn.disabled = false;
                showTooltip('Translation successful!', 'success');

                if (typeof TextorrHistory !== 'undefined') {
                    TextorrHistory.addActivity('translation', {
                        sourceText: text,
                        targetText: data.responseData.translatedText,
                        sourceLang: sourceLang.value,
                        targetLang: targetLang.value,
                        sourceLangName: getLangName(sourceLang.value),
                        targetLangName: getLangName(targetLang.value)
                    });
                }

                // Record successful guest attempt
                if (typeof TextorrUsageLimit !== 'undefined') {
                    TextorrUsageLimit.recordAttempt();
                }

                // Show detected language if available
                if (data.responseData.match) {
                    detectedLang.style.display = 'inline-flex';
                    detectedLangName.textContent = getLangName(sourceLang.value);
                }
            } else {
                throw new Error('Translation failed');
            }
        } catch (error) {
            showTooltip('Translation failed. Please try again.', 'error');
            targetText.value = '';
        } finally {
            translateBtn.classList.remove('loading');
        }
    }

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(targetText.value);
            showTooltip('Copied to clipboard!', 'success');
        } catch (error) {
            showTooltip('Failed to copy', 'error');
        }
    });

    // Expose translate globally for HTML elements/triggers
    window.translate = translate;
    window.updateFlags = updateFlags;

    // Translate button trigger
    translateBtn.addEventListener('click', translate);

    // Enter key support (Ctrl+Enter)
    sourceText.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            translate();
        }
    });

    // Auto-translate on input (with debounce)
    let translateTimeout;
    sourceText.addEventListener('input', () => {
        clearTimeout(translateTimeout);
        translateTimeout = setTimeout(() => {
            if (sourceText.value.trim().length > 3) {
                translate();
            }
        }, 1000);
    });

    // Focus on load & check reuse query params
    const params = new URLSearchParams(window.location.search);
    const source = params.get('sourceText');
    const sLang = params.get('sourceLang');
    const tLang = params.get('targetLang');
    if (source) {
        sourceText.value = source;
        if (sLang) sourceLang.value = sLang;
        if (tLang) targetLang.value = tLang;
        updateFlags();
        charCount.textContent = sourceText.value.length;
        clearBtn.disabled = false;
        translate();
    } else {
        sourceText.focus();
    }
});
