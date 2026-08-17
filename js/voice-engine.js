/**
 * Textorr - Voice Generator Engine
 * (Web Audio API Real Audio Frequency Visualizer)
 */

// Global Audio States
let audioCtx = null;
let analyser = null;
let source = null;
let animationFrameId = null;
let audioUrl = null;
let isPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const textInput = document.getElementById('text-input');
    const charCount = document.getElementById('char-count');
    const generateBtn = document.getElementById('generateBtn');
    const audioSection = document.getElementById('audioSection');
    const audioPlayer = document.getElementById('audio-player');
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const visualizer = document.getElementById('visualizer');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const languageSelect = document.getElementById('language');
    const speedSelect = document.getElementById('speed');
    const voiceMode = document.getElementById('voiceMode');

    // Focus input on load
    textInput.focus();

    // Character counter
    textInput.addEventListener('input', () => {
        charCount.textContent = textInput.value.length;
        textInput.classList.remove('error');
    });

    // Create 40 visualizer bars
    function createVisualizer() {
        visualizer.innerHTML = '';
        for (let i = 0; i < 40; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = '20px';
            visualizer.appendChild(bar);
        }
    }
    createVisualizer();

    // Web Audio Context Setup (Safe initialization on user click)
    function initWebAudio() {
        if (audioCtx) return;

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContextClass();
            
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64; // 32 frequency bins
            
            // Route HTML5 Audio player through AnalyserNode
            source = audioCtx.createMediaElementSource(audioPlayer);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            
            // Start the visualizer draw loop
            startVisualizerLoop();
        } catch (e) {
            console.error('Failed to initialize Web Audio API Analyser:', e);
        }
    }

    // Animation Draw Loop
    function startVisualizerLoop() {
        if (!analyser) return;
        if (animationFrameId) return; // Prevent creating multiple animation loops

        const bufferLength = analyser.frequencyBinCount; // 32
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationFrameId = requestAnimationFrame(draw);

            if (!isPlaying) {
                // Smoothly ease visualizer bars back to idle height (20px)
                const bars = visualizer.querySelectorAll('.bar');
                let allIdle = true;
                bars.forEach(bar => {
                    const currentHeight = parseFloat(bar.style.height) || 20;
                    if (currentHeight > 20.1) {
                        bar.style.height = (currentHeight - (currentHeight - 20) * 0.15) + 'px';
                        allIdle = false;
                    } else {
                        bar.style.height = '20px';
                    }
                });
                
                // If all bars are back to 20px, cancel animation frame to save CPU
                if (allIdle) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                return;
            }

            // Get live frequency data
            analyser.getByteFrequencyData(dataArray);

            const bars = visualizer.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                // Map the 40 bars to the 32 frequency bins
                const dataIndex = Math.floor(index * bufferLength / 40);
                const val = dataArray[dataIndex] || 0;
                
                // Map amplitude (0-255) to height (20px - 100px)
                const percent = val / 255;
                const targetHeight = 20 + (percent * 80);
                
                // Easing logic for silky smooth transitions
                const currentHeight = parseFloat(bar.style.height) || 20;
                const nextHeight = currentHeight + (targetHeight - currentHeight) * 0.25;
                
                bar.style.height = nextHeight + 'px';
            });
        };

        draw();
    }

    // Generate Speech (Unified Playback Manager)
    async function generateSpeech() {
        // Enforce guest attempts limit check before doing anything
        if (typeof TextorrUsageLimit !== 'undefined' && !TextorrUsageLimit.canUseTool()) {
            TextorrUsageLimit.showLimitModal();
            return;
        }

        const text = textInput.value.trim();

        if (!text) {
            textInput.classList.add('error');
            showTooltip('Please enter some text to convert', 'error');
            return;
        }

        generateBtn.classList.add('loading');

        // Stop current audio if playing
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            pauseBtn.style.display = 'none';
            playBtn.style.display = 'flex';
        }

        const mode = voiceMode ? voiceMode.value : 'premium';

        try {
            if (mode === 'instant') {
                // Browser native SpeechSynthesis (Instant Playback)
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = languageSelect.value;
                utterance.rate = parseFloat(speedSelect.value);
                
                // Track start/end events to toggle visualizer fake pulse for instant voice if desired, 
                // but keep visualizer idle as it has no frequency source.
                window.speechSynthesis.speak(utterance);
                
                audioSection.classList.remove('show');
                generateBtn.classList.remove('loading');
                showTooltip('Speech started instantly!', 'success');

                // Save to activity history
                logVoiceActivity(text);

                // Record successful guest attempt
                if (typeof TextorrUsageLimit !== 'undefined') {
                    TextorrUsageLimit.recordAttempt();
                }

            } else {
                // Premium Voice (VoiceRSS API via downloadable same-origin Blob URL)
                const response = await fetch('https://api.voicerss.org/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        key: 'c22920a7fd514db2bb4c28bc43085d93',
                        src: text,
                        hl: languageSelect.value,
                        r: speedSelect.value === '1' ? '0' : speedSelect.value === '0.75' ? '-5' : '5',
                        c: 'mp3',
                        f: '44khz_16bit_stereo',
                    }),
                });

                if (!response.ok) throw new Error('API request failed');

                const audioBlob = await response.blob();
                
                // Clean up previous blob URL
                if (audioUrl) {
                    URL.revokeObjectURL(audioUrl);
                }

                // Create same-origin Blob URL to bypass CORS block on MediaElementAudioSourceNode
                audioUrl = URL.createObjectURL(audioBlob);
                audioPlayer.src = audioUrl;

                audioSection.classList.add('show');
                generateBtn.classList.remove('loading');
                showTooltip('Voice generated successfully!', 'success');

                // Auto-init Web Audio Context
                initWebAudio();

                // Save to activity history
                logVoiceActivity(text);

                // Record successful guest attempt
                if (typeof TextorrUsageLimit !== 'undefined') {
                    TextorrUsageLimit.recordAttempt();
                }
            }
        } catch (error) {
            generateBtn.classList.remove('loading');
            showTooltip('Failed to generate voice. Please try again.', 'error');
            console.error('Speech generation failed:', error);
        }
    }

    // Helper: Log to TextorrHistory
    function logVoiceActivity(text) {
        if (typeof TextorrHistory !== 'undefined') {
            TextorrHistory.addActivity('voice', {
                text: text,
                language: languageSelect.value,
                languageName: languageSelect.options[languageSelect.selectedIndex].textContent,
                speed: speedSelect.value,
                speedName: speedSelect.options[speedSelect.selectedIndex].textContent
            });
        }
    }

    // Play/Pause Controls
    playBtn.addEventListener('click', () => {
        initWebAudio(); // fallback init
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        audioPlayer.play();
        isPlaying = true;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        startVisualizerLoop();
    });

    pauseBtn.addEventListener('click', () => {
        audioPlayer.pause();
        isPlaying = false;
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'flex';
    });

    // Audio Player Event Listeners
    audioPlayer.addEventListener('ended', () => {
        isPlaying = false;
        pauseBtn.style.display = 'none';
        playBtn.style.display = 'flex';
    });

    audioPlayer.addEventListener('timeupdate', () => {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        progressFill.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    });

    audioPlayer.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audioPlayer.duration);
    });

    progressBar.addEventListener('click', (e) => {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    });

    // Download Speech File
    downloadBtn.addEventListener('click', () => {
        if (!audioUrl) {
            showTooltip('Please generate audio first', 'error');
            return;
        }
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = `voice-${Date.now()}.mp3`;
        a.click();
        showTooltip('Audio downloaded!', 'success');
    });

    // Utility: Format seconds to M:SS
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Generate speech buttons & key triggers
    generateBtn.addEventListener('click', generateSpeech);

    textInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            generateSpeech();
        }
    });

    // Check query params for re-run / reuse links
    const params = new URLSearchParams(window.location.search);
    const text = params.get('text');
    const lang = params.get('language');
    const speed = params.get('speed');
    if (text) {
        textInput.value = text;
        charCount.textContent = textInput.value.length;
        if (lang) languageSelect.value = lang;
        if (speed) speedSelect.value = speed;
        // Small delay to ensure scripts are fully loaded
        setTimeout(generateSpeech, 300);
    }
});
