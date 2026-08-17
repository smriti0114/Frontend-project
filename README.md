# Textorr - Modern Text Conversion Utility Suite

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech](https://img.shields.io/badge/Tech-HTML%20|%20CSS%20|%20JS-orange)

**Textorr** is a modern, comprehensive SaaS-style web application offering a suite of intelligent text conversion tools. Built with a unified Glassmorphism UI, it provides users with seamless utilities for generating QR codes, synthesizing speech from text, and translating languages instantly.

---

## 🌟 Features

### 1. 🏠 SaaS Dashboard & Activity History
* **Personalized Dashboard:** Centrally tracks statistics (QR Codes Generated, Voices Synthesized, Translations Completed).
* **Activity Logs:** View your recent activity history log with options to copy raw text output, delete records, or reuse parameters.
* **User Isolation:** Secure account isolation ensures that data logs and counts are private to each user session.

### 2. ⚡ Guest 3-Attempt Trial Quota
* **Try Before Login:** Guests get exactly **3 free attempts** collectively across the utility suite.
* **Conversion Modal Dialog:** Spawns a premium glassmorphic overlay block prompt upon exceeding 3 tries, guiding users to Log In or Register.
* **Dynamic Counter Badges**: Displays a color-coded remaining attempts badge next to tool headers.

### 3. 🔑 Redesigned Split-Screen Authentication
* **Product Showcase:** Mesh gradient product benefits card on the left panel.
* **Validation Cards:** Input validations, password match warnings, and floating labels on the login/register forms on the right panel.
* **SubtleCrypto Protection**: Encrypts and hashes user credentials client-side with SHA-256 before saving to storage.

### 4. 📱 QR Code Generator
* **Instant Generation:** Converts text/URLs into scannable QR codes using the `goqr.me` API.
* **Customization:** Select from Small (200px), Medium (300px), or Large (400px) sizes.
* **Actions:** One-click PNG downloads and clipboard copy helper.

### 5. 🎙️ Voice Generator (Text-to-Speech)
* **Dual Engine:** Select between browser native SpeechSynthesis (Fast) and VoiceRSS API (Premium, high quality, and downloadable).
* **Web Audio Analyser Visualizer:** Premium audio playback routes through a real `AnalyserNode` to drive visualizer bars dynamically based on actual vocal frequencies.
* **Optimized CPU**: Drawing animations automatically pause and decay when audio stops, using 0% CPU when idle.

### 6. 🌐 Language Converter
* **Multi-Language Support:** Translates between 12 major languages powered by the MyMemory Translation API.
* **Smart UI**: Debounced automatic translations (1s delay), detected language flags, and source-to-target language swapping.

---

## 🛠️ Tech Stack
* **Frontend:** HTML5 (Semantic Structure), CSS3 (CSS Variables, Flexbox/Grid, Glassmorphic Backdrop Filters), JavaScript (ES6 Modules)
* **Design System:** Custom HSL variables, Inter Typography, Poppins Headings, Inline SVGs.

---

## 🚀 Running Locally

Since this is a static web project, it runs directly in standard web browsers.

1. **Clone the repository**
   ```bash
   git clone https://github.com/smriti0114/frontend-project.git
   cd frontend-project
   ```

2. **Run an HTTP Server** (Recommended to prevent cross-origin issues with Web Audio analysis)
   ```bash
   python3 -m http.server 8000
   ```
   Open `http://localhost:8000` in your web browser.

---

## 📂 Project Structure

```text
Frontend-project/
├── index.html                 # Main Landing Page (Hero, Features, CTAs)
├── login.html                 # Dynamic Login/Registration Portal
├── dashboard.html             # Premium Workspace User Dashboard
├── qr.html                    # QR Code Generator Page
├── voice.html                 # Voice Synthesizer Page
├── language.html              # Multi-Language Translation Page
├── css/
│   ├── global.css             # Shared UI design tokens & variables
│   ├── index.css              # Landing page animation modules
│   ├── login.css              # Auth slide-transition rules
│   ├── dashboard.css          # SaaS grid statistics layout
│   ├── qr.css                 # QR card styles
│   ├── voice.css              # Synthesizer audio visualizer bars
│   └── language.css           # Translation panel grid styles
└── js/
    ├── utils.js               # Common helper toasts & history controls
    ├── auth.js                # Session controllers & route guards
    ├── usage-limit.js         # Guest limit attempts & warning modals
    ├── landing.js             # Landing page smooth scrolls & animators
    ├── login-manager.js       # Auth panel validation listeners
    ├── dashboard-manager.js   # Workspace counters & copy triggers
    ├── qr-generator.js        # QR triggers & download bindings
    ├── translator.js          # API debouncers & swapping flags
    └── voice-engine.js        # Web Audio API real frequency visualizer
```
