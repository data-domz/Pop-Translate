# Pop Translate

Pop Translate is a modern, multi-language phrase learning and pronunciation practice app. It helps users improve their speaking skills in Spanish, English, French, and German using real-time speech recognition, detailed feedback, and interactive scoring.

## Features
- **Practice speaking**: Listen to native-like phrases and record your own pronunciation.
- **Speech recognition**: Uses the Web Speech API to transcribe and analyze your speech.
- **Detailed scoring**: Get feedback on word accuracy, timing, and fluency, with an overall score and encouragement.
- **Multi-language support**: Switch between Spanish, English, French, and German.
- **Customizable experience**: Adjust voice speed, jump to any phrase, and choose your "My Language" for translations.
- **Login and feature gating**: Basic login/logout UI with premium feature placeholders (future Stripe integration).
- **Modern UI**: Responsive, accessible, and visually appealing.

## Screenshots

| Main App | Speech Analysis |
|---|---|
| ![Main Screen](screenshots/main.png) | ![Feedback Example](screenshots/feedback.png) |

## Getting Started

### Local Development
1. **Clone the repository:**
   ```sh
   git clone https://github.com/data-domz/Pop-Translate.git
   cd Pop-Translate
   ```
2. **Ensure the `data/` folder is in the project root** (contains `english.json`, `spanish.json`, etc.).
3. **Start a local server:**
   ```sh
   python -m http.server 8000
   ```
4. **Open your browser:**
   Go to [http://localhost:8000/](http://localhost:8000/)

### Deployment (Vercel)
1. **Move the `data/` folder into `public/` before deploying.**
2. **Push your changes to GitHub.**
3. **Import the repo into [Vercel](https://vercel.com/).**
4. **Vercel will serve files in `public/` at the root URL.**
5. **Set environment variables in the Vercel dashboard as needed (for future Stripe/Supabase integration).**

## Security
- No sensitive data is stored in the repo.
- Environment variables are used for future integrations (see `.env.example`).
- Security headers and CSP are configured for production.

## Future Plans
- **Supabase Auth**: Real user authentication and profile management.
- **Stripe**: Premium features and payment integration.
- **Cloud data**: Move phrase data to a managed backend.
- **More languages and features!**

## Contributing
Pull requests and suggestions are welcome! Please open an issue or PR to discuss improvements.

## License
MIT 
