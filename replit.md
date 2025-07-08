# Spanish Learning App

## Overview

This is a browser-based Spanish pronunciation learning application that helps users practice Spanish phrases through interactive speech recognition and synthesis. The app presents Spanish phrases with English translations, allows users to hear the correct pronunciation, record their own pronunciation attempts, and provides feedback on their performance.

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

### 1. Spanish Learning App Class (`SpanishLearningApp`)
- **Purpose**: Main application controller managing all functionality
- **Responsibilities**: 
  - State management (phrases, current index, recording status)
  - DOM manipulation and event handling
  - Speech recognition and synthesis coordination
  - User feedback and scoring

### 2. Speech Integration
- **Speech Recognition**: Uses browser's `webkitSpeechRecognition` or `SpeechRecognition`
- **Speech Synthesis**: Uses `window.speechSynthesis` for pronunciation playback
- **Language Support**: Configured for Spanish (es-ES) recognition and synthesis

### 3. Data Management
- **Static JSON**: Phrases stored in `data/spanish.json`
- **In-memory storage**: No persistent user data or progress tracking
- **Data structure**: Simple array of phrase objects with Spanish and English properties

### 4. User Interface Components
- **Phrase Display**: Shows current Spanish phrase with English translation
- **Control Buttons**: Play audio, record speech, navigate to next phrase
- **Feedback System**: Displays transcription results and pronunciation scoring
- **Progress Indicator**: Shows current phrase position in sequence

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

- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.