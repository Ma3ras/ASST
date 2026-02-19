# 🦖 ARK Config AI

**Intelligent Server Configuration Engine for ARK: Survival Evolved & Ascended**

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=netlify)](https://ark-server-settings-tool.netlify.app/)

Generating valid, balanced `Game.ini` and `GameUserSettings.ini` files is complex. **ARK Config AI** simplifies this by asking you questions about your playstyle and generating mathematically consistent settings for you.

## 🚀 Features

- **🧠 Intelligent Questionnaire**: Adjusts settings based on your answers (e.g., "I play with 2 friends" → adjusts Tribe limits).
- **⚖️ Balanced Presets**:
  - **PvE Beginner + Instant Breeding**: Relaxed gameplay with instant feedback loops.
  - **PvE Standard + Quick Breeding**: Vanilla-like challenge but respectful of your time (~2.5h Giga maturation).
  - **Veteran PvP**: Hardcore competitive settings.
- **🔢 Deep Configuration Interface**: Fine-tune every multiplier with sliders and real-time feedback.
- **🦕 Breeding Calculator**: Automatic calculation of `BabyMatureSpeed` and `CuddleInterval` to ensure 100% imprint is possible.

## 🛠️ How to Use

1. Go to the [Live App](https://ark-server-settings-tool.netlify.app/).
2. Choose a **Quick Start Preset** or start the **Deep Configuration** mode.
3. Answer the questions or adjust the sliders.
4. Copy the generated `Game.ini` and `GameUserSettings.ini` content.
5. Paste it into your server's configuration files.

## 📦 Installation (Local)

If you want to run this locally or contribute:

1. Clone the repository:
   ```bash
   git clone https://github.com/Ma3ras/ASST.git
   ```
2. Open `index.html` in your browser.
   *(No build step required — it's pure Vanilla JS + CSS!)*

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

[MIT](https://choosealicense.com/licenses/mit/)
