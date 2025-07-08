# Multi-Language Learning App

## Overview

This is a browser-based multi-language pronunciation learning application that helps users practice phrases in Spanish, French, and German through interactive speech recognition and synthesis. The app features a modern, professional design with a language selector dropdown, presents phrases with English translations, allows users to hear the correct pronunciation, record their own pronunciation attempts, and provides feedback on their performance.

## System Architecture

### Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla HTML, CSS, and JavaScript
- **Client-side only**: No backend server required - runs entirely in the browser
- **Responsive design**: Mobile-friendly interface with gradient styling
- **Component-based structure**: Organized as a single JavaScript class with modular methods

### Core Technologies
- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Modern styling with gradients, flexbox, and responsive design
- **Vanilla JavaScript**: ES6+ features including classes, async/await, and modules
- **Web Speech API**: Browser-native speech recognition and synthesis
- **JSON**: Static data storage for Spanish phrases

## Key Components

### 1. Language Learning App Class (`LanguageLearningApp`)
- **Purpose**: Main application controller managing all functionality for multiple languages
- **Responsibilities**: 
  - Multi-language state management (phrases, current index, recording status, language selection)
  - DOM manipulation and event handling
  - Speech recognition and synthesis coordination with language-specific configurations
  - User feedback and scoring
  - Language switching and configuration management

### 2. Speech Integration
- **Speech Recognition**: Uses browser's `webkitSpeechRecognition` or `SpeechRecognition`
- **Speech Synthesis**: Uses `window.speechSynthesis` for pronunciation playback
- **Language Support**: Configured for multiple languages:
  - Spanish: es-MX (Mexican Spanish preferred) with es-ES fallback
  - French: fr-FR
  - German: de-DE
- **Voice Selection**: Intelligent voice selection with preferences for regional variants

### 3. Data Management
- **Static JSON**: Phrases stored in language-specific files:
  - `data/spanish.json` - Spanish phrases with English translations
  - `data/french.json` - French phrases with English translations
  - `data/german.json` - German phrases with English translations
- **In-memory storage**: No persistent user data or progress tracking
- **Data structure**: Simple array of phrase objects with target language and English properties

### 4. User Interface Components
- **Language Selector**: Dropdown to choose between Spanish, French, and German
- **Phrase Display**: Shows current phrase in selected language with English translation
- **Control Buttons**: Play audio, record speech, navigate to next phrase
- **Feedback System**: Displays transcription results and pronunciation scoring
- **Progress Indicator**: Shows current phrase position in sequence
- **Modern Design**: Clean, professional interface with gradient backgrounds, soft shadows, and smooth animations

## Data Flow

1. **Initialization**: Load phrases from JSON file and check browser compatibility
2. **Phrase Display**: Present current Spanish phrase with English translation
3. **Audio Playback**: User clicks play button to hear correct pronunciation
4. **Recording**: User records their pronunciation attempt
5. **Recognition**: Browser speech recognition transcribes user's speech
6. **Feedback**: App compares transcription with original phrase and provides score
7. **Navigation**: User proceeds to next phrase or repeats current one

## External Dependencies

### Browser APIs
- **Web Speech API**: Required for speech recognition and synthesis
- **Fetch API**: Used for loading JSON data files
- **DOM APIs**: Standard browser APIs for UI manipulation

### Browser Compatibility Requirements
- Modern browsers with Web Speech API support
- Chrome, Edge, Safari (with varying levels of speech recognition support)
- HTTPS required for speech recognition in production

### Data Dependencies
- `data/spanish.json`: Contains the phrase database
- No external API calls or third-party services

## Deployment Strategy

### Static Hosting
- **Architecture**: Client-side only application
- **Hosting options**: Any static web hosting service (GitHub Pages, Netlify, Vercel)
- **Requirements**: HTTPS for speech recognition functionality
- **Build process**: No build step required - direct file serving

### File Structure
```
/
├── index.html          # Main HTML file
├── app.js             # JavaScript application logic
├── style.css          # CSS styling
└── data/
    └── spanish.json   # Phrase data
```

### Security Considerations
- No user data storage or transmission
- Microphone permission required for speech recognition
- HTTPS required for secure microphone access

## Changelog

- July 08, 2025. Initial Spanish learning app setup
- July 08, 2025. Enhanced visual design with modern CSS:
  - Improved typography with Inter font stack
  - Enhanced shadows and gradients
  - Better responsive design for mobile devices
  - Animated button effects and transitions
- July 08, 2025. Added multi-language support:
  - Language selector dropdown for Spanish, French, and German
  - Dynamic phrase loading from language-specific JSON files
  - Intelligent voice selection with Mexican Spanish preference
  - Language-specific speech recognition configuration
  - Updated UI to dynamically change based on selected language
- July 08, 2025. Improved accuracy scoring algorithm:
  - More forgiving word-based accuracy calculation instead of strict character matching
  - Handles common pronunciation variations and speech recognition errors
  - Provides partial credit for close attempts
  - Learning-friendly score adjustments and encouraging feedback messages
  - Minimum score thresholds to maintain student motivation
- July 08, 2025. Enhanced scoring for natural speech patterns:
  - Optimized for fast/natural speech vs slow/deliberate speech
  - Focuses on key content words, ignores function word errors
  - Adds length and speech pattern bonuses for complex phrases
  - Includes phonetic similarity matching for common mispronunciations
  - Handles specific speech recognition errors like "bano"/"albano"
  - Very generous minimum scores (40%+) to encourage continued practice

## User Preferences

Preferred communication style: Simple, everyday language.