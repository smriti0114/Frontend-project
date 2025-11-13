# Textorr - Modern Text Conversion Utility Suite

![Project Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Tech](https://img.shields.io/badge/Tech-HTML%20|%20CSS%20|%20JS-orange)

**Textorr** is a modern, comprehensive web application offering a suite of intelligent text conversion tools. Built with a "Glassmorphism" UI design, it provides users with seamless tools for generating QR codes, synthesizing speech from text, and translating languages instantly.

## 🌟 Features

### 1. 🏠 Modern Dashboard & UI
* **Glassmorphism Design:** Features frosted glass effects, animated mesh gradients, and smooth transitions.
* **Responsive:** Fully optimized for desktops, tablets, and mobile devices.
* **Authentication UI:** Beautiful login and registration forms with sliding panel animations and input validation.

### 2. 📱 QR Code Generator
* **Instant Generation:** Converts text or URLs into scannable QR codes using the `goqr.me` API.
* **Customization:** Select from Small (200px), Medium (300px), or Large (400px) sizes.
* **Actions:** One-click download (PNG) and "Copy Link" functionality.

### 3. 🎙️ Voice Generator (Text-to-Speech)
* **Dual Engine:** Uses the browser's native **Web Speech API** for instant playback and **VoiceRSS API** for high-quality audio downloads.
* **Customization:** Adjust playback speed (0.75x to 1.5x) and select from multiple languages/accents.
* **Audio Visualizer:** Real-time animated frequency bars during playback.
* **Download:** Save generated speech as MP3 files.

### 4. 🌐 Language Converter
* **Multi-Language Support:** Translates between 12+ major languages (English, Spanish, French, Hindi, Japanese, etc.).
* **Smart Features:** Auto-detects input language, character counter, and "Swap Languages" button.
* **Powered by:** Utilizes the **MyMemory Translation API**.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript (ES6+)
* **Styling:** Custom CSS variables, CSS Grid/Flexbox, Keyframe Animations, Backdrop-filters.
* **Icons:** Inline SVGs and Simple Icons CDN.
* **Fonts:** 'Inter' and 'Poppins' via Google Fonts.

## 🔌 APIs Used

This project relies on the following free public APIs:
* **QR Code:** [QRServer API](https://goqr.me/api/)
* **Translation:** [MyMemory Translation API](https://mymemory.translated.net/doc/spec.php)
* **Text-to-Speech:** [VoiceRSS API](https://www.voicerss.org/)

---

## 🚀 Installation & Setup

Since this is a static web project, no backend installation is required.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/smriti0114/frontend-project.git](https://github.com/smriti0114/frontend-project.git)
    ```

2.  **Navigate to the project directory**
    ```bash
    cd frontend-project
    ```

3.  **Run the project**
    * Simply open `home.html` in your web browser.
    * **Recommended:** Use the "Live Server" extension in VS Code for the best experience.

## 📂 Project Structure

```text
/
├── home.html       # Landing page / Main Dashboard
├── home.css        # Styles for the landing page
├── login.html      # Authentication (Login/Register) UI
├── qr.html         # QR Code Generator Tool
├── qr.css          # Styles for QR tool
├── voice.html      # Voice/Speech Generator Tool
├── voice.css       # Styles for Voice tool
├── language.html   # Language Translator Tool
├── language.css    # Styles for Translator tool
└── README.md       # Project Documentation
