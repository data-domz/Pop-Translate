// Spanish Learning App - Main JavaScript File

class SpanishLearningApp {
    constructor() {
        // App state
        this.phrases = [];
        this.currentPhraseIndex = 0;
        this.isRecording = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        
        // DOM elements
        this.spanishPhraseEl = document.getElementById('spanish-phrase');
        this.englishTranslationEl = document.getElementById('english-translation');
        this.currentPhraseEl = document.getElementById('current-phrase');
        this.totalPhrasesEl = document.getElementById('total-phrases');
        this.playBtn = document.getElementById('play-btn');
        this.recordBtn = document.getElementById('record-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.feedbackSection = document.getElementById('feedback-section');
        this.userTranscriptionEl = document.getElementById('user-transcription');
        this.scorePercentageEl = document.getElementById('score-percentage');
        this.scoreFillEl = document.getElementById('score-fill');
        this.errorMessageEl = document.getElementById('error-message');
        
        // Initialize the app
        this.init();
    }
    
    async init() {
        try {
            // Load Spanish phrases from JSON file
            await this.loadPhrases();
            
            // Check browser compatibility
            this.checkBrowserSupport();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Display first phrase
            this.displayCurrentPhrase();
            
            // Update UI
            this.updateUI();
            
        } catch (error) {
            this.showError('Failed to initialize the app: ' + error.message);
        }
    }
    
    async loadPhrases() {
        try {
            const response = await fetch('data/spanish.json');
            if (!response.ok) {
                throw new Error('Failed to load phrases data');
            }
            const data = await response.json();
            this.phrases = data.phrases;
            this.totalPhrasesEl.textContent = this.phrases.length;
        } catch (error) {
            throw new Error('Could not load Spanish phrases: ' + error.message);
        }
    }
    
    checkBrowserSupport() {
        // Check Speech Synthesis support
        if (!this.synthesis) {
            throw new Error('Speech Synthesis is not supported in this browser');
        }
        
        // Check Speech Recognition support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            throw new Error('Speech Recognition is not supported in this browser');
        }
        
        // Initialize Speech Recognition
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'es-ES'; // Spanish (Spain)
        
        // Set up recognition event handlers
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.handleSpeechResult(transcript);
        };
        
        this.recognition.onerror = (event) => {
            this.handleSpeechError(event.error);
        };
        
        this.recognition.onend = () => {
            this.stopRecording();
        };
    }
    
    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.playCurrentPhrase());
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.nextBtn.addEventListener('click', () => this.nextPhrase());
    }
    
    displayCurrentPhrase() {
        if (this.phrases.length === 0) return;
        
        const phrase = this.phrases[this.currentPhraseIndex];
        this.spanishPhraseEl.textContent = phrase.spanish;
        this.englishTranslationEl.textContent = phrase.english;
        this.currentPhraseEl.textContent = this.currentPhraseIndex + 1;
        
        // Hide feedback section when displaying new phrase
        this.feedbackSection.style.display = 'none';
    }
    
    playCurrentPhrase() {
        if (this.phrases.length === 0) return;
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const phrase = this.phrases[this.currentPhraseIndex];
        const utterance = new SpeechSynthesisUtterance(phrase.spanish);
        
        // Set Spanish voice if available
        const voices = this.synthesis.getVoices();
        const spanishVoice = voices.find(voice => 
            voice.lang.startsWith('es') || voice.lang.includes('Spanish')
        );
        
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }
        
        utterance.lang = 'es-ES';
        utterance.rate = 0.8; // Slightly slower for learning
        utterance.pitch = 1.0;
        
        // Provide visual feedback
        this.playBtn.disabled = true;
        this.playBtn.innerHTML = '<span class="btn-icon">🔊</span>Playing...';
        
        utterance.onend = () => {
            this.playBtn.disabled = false;
            this.playBtn.innerHTML = '<span class="btn-icon">🔊</span>Play Phrase';
        };
        
        utterance.onerror = () => {
            this.playBtn.disabled = false;
            this.playBtn.innerHTML = '<span class="btn-icon">🔊</span>Play Phrase';
            this.showError('Failed to play audio. Please try again.');
        };
        
        this.synthesis.speak(utterance);
    }
    
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }
    
    startRecording() {
        try {
            this.isRecording = true;
            this.recordBtn.classList.add('recording');
            this.recordBtn.innerHTML = '<span class="btn-icon">🛑</span><span class="btn-text">Stop</span>';
            
            // Hide previous feedback
            this.feedbackSection.style.display = 'none';
            this.hideError();
            
            // Start speech recognition
            this.recognition.start();
            
        } catch (error) {
            this.handleSpeechError('Failed to start recording: ' + error.message);
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        this.recordBtn.classList.remove('recording');
        this.recordBtn.innerHTML = '<span class="btn-icon">🎤</span><span class="btn-text">Record</span>';
        
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    handleSpeechResult(transcript) {
        const originalPhrase = this.phrases[this.currentPhraseIndex].spanish;
        const accuracy = this.calculateAccuracy(originalPhrase, transcript);
        
        // Display results
        this.showFeedback(transcript, accuracy);
        
        // Stop recording
        this.stopRecording();
    }
    
    handleSpeechError(error) {
        this.stopRecording();
        
        let errorMessage = 'Speech recognition error: ';
        switch (error) {
            case 'no-speech':
                errorMessage += 'No speech detected. Please try speaking clearly.';
                break;
            case 'audio-capture':
                errorMessage += 'Microphone access denied or not available.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone permission denied. Please enable microphone access.';
                break;
            case 'network':
                errorMessage += 'Network error. Please check your connection.';
                break;
            default:
                errorMessage += error || 'Unknown error occurred.';
        }
        
        this.showError(errorMessage);
    }
    
    calculateAccuracy(original, spoken) {
        // Simple similarity calculation using Levenshtein distance
        const normalizedOriginal = this.normalizeText(original);
        const normalizedSpoken = this.normalizeText(spoken);
        
        const maxLength = Math.max(normalizedOriginal.length, normalizedSpoken.length);
        if (maxLength === 0) return 100;
        
        const distance = this.levenshteinDistance(normalizedOriginal, normalizedSpoken);
        const accuracy = Math.max(0, Math.round(((maxLength - distance) / maxLength) * 100));
        
        return accuracy;
    }
    
    normalizeText(text) {
        return text.toLowerCase()
            .replace(/[¿¡]/g, '') // Remove Spanish punctuation
            .replace(/[.,!?;:]/g, '') // Remove punctuation
            .replace(/\s+/g, ' ') // Normalize whitespace
            .trim();
    }
    
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1, // substitution
                        matrix[i][j - 1] + 1,     // insertion
                        matrix[i - 1][j] + 1      // deletion
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    showFeedback(transcript, accuracy) {
        this.userTranscriptionEl.textContent = transcript;
        this.scorePercentageEl.textContent = accuracy + '%';
        
        // Animate score bar
        setTimeout(() => {
            this.scoreFillEl.style.width = accuracy + '%';
        }, 100);
        
        // Show feedback section
        this.feedbackSection.style.display = 'block';
    }
    
    nextPhrase() {
        this.currentPhraseIndex = (this.currentPhraseIndex + 1) % this.phrases.length;
        this.displayCurrentPhrase();
        this.updateUI();
    }
    
    updateUI() {
        // Update next button text if on last phrase
        if (this.currentPhraseIndex === this.phrases.length - 1) {
            this.nextBtn.innerHTML = '<span class="btn-icon">🔄</span>Start Over';
        } else {
            this.nextBtn.innerHTML = '<span class="btn-icon">⏭️</span>Next Phrase';
        }
    }
    
    showError(message) {
        this.errorMessageEl.textContent = message;
        this.errorMessageEl.style.display = 'block';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }
    
    hideError() {
        this.errorMessageEl.style.display = 'none';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SpanishLearningApp();
});

// Handle voices loading for better browser compatibility
window.speechSynthesis.onvoiceschanged = () => {
    // Voices are now loaded and available
    console.log('Speech synthesis voices loaded');
};
