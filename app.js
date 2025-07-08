// Multi-Language Learning App - Main JavaScript File

class LanguageLearningApp {
    constructor() {
        // App state
        this.phrases = [];
        this.currentPhraseIndex = 0;
        this.isRecording = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = 'spanish';
        
        // Language configurations
        this.languages = {
            spanish: {
                name: 'Spanish',
                flag: '🇪🇸',
                dataFile: 'data/spanish.json',
                phraseKey: 'spanish',
                ttsLang: 'es-MX', // Mexican Spanish preferred
                recognitionLang: 'es-MX',
                fallbackTts: 'es-ES'
            },
            french: {
                name: 'French',
                flag: '🇫🇷',
                dataFile: 'data/french.json',
                phraseKey: 'french',
                ttsLang: 'fr-FR',
                recognitionLang: 'fr-FR',
                fallbackTts: 'fr-FR'
            },
            german: {
                name: 'German',
                flag: '🇩🇪',
                dataFile: 'data/german.json',
                phraseKey: 'german',
                ttsLang: 'de-DE',
                recognitionLang: 'de-DE',
                fallbackTts: 'de-DE'
            }
        };
        
        // DOM elements
        this.languageSelect = document.getElementById('language-select');
        this.appTitle = document.getElementById('app-title');
        this.appDescription = document.getElementById('app-description');
        this.phraseEl = document.getElementById('spanish-phrase');
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
            // Set up event listeners first
            this.setupEventListeners();
            
            // Load phrases for default language
            await this.loadLanguage(this.currentLanguage);
            
            // Check browser compatibility
            this.checkBrowserSupport();
            
        } catch (error) {
            this.showError('Failed to initialize the app: ' + error.message);
        }
    }
    
    async loadLanguage(languageKey) {
        try {
            this.currentLanguage = languageKey;
            const config = this.languages[languageKey];
            
            // Load phrases from JSON file
            await this.loadPhrases(config.dataFile);
            
            // Update UI for new language
            this.updateLanguageUI(config);
            
            // Reset phrase index
            this.currentPhraseIndex = 0;
            
            // Display first phrase
            this.displayCurrentPhrase();
            
            // Update UI
            this.updateUI();
            
            // Update speech recognition language
            this.updateSpeechRecognition();
            
        } catch (error) {
            this.showError('Failed to load language: ' + error.message);
        }
    }
    
    updateLanguageUI(config) {
        this.appTitle.textContent = `${config.flag} ${config.name} Learning App`;
        this.appDescription.textContent = `Practice your ${config.name} pronunciation`;
        document.title = `${config.name} Language Learning App`;
    }
    
    async loadPhrases(dataFile) {
        try {
            const response = await fetch(dataFile);
            if (!response.ok) {
                throw new Error('Failed to load phrases data');
            }
            const data = await response.json();
            this.phrases = data.phrases;
            this.totalPhrasesEl.textContent = this.phrases.length;
        } catch (error) {
            throw new Error('Could not load phrases: ' + error.message);
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
    
    updateSpeechRecognition() {
        if (this.recognition) {
            const config = this.languages[this.currentLanguage];
            this.recognition.lang = config.recognitionLang;
        }
    }
    
    setupEventListeners() {
        this.playBtn.addEventListener('click', () => this.playCurrentPhrase());
        this.recordBtn.addEventListener('click', () => this.toggleRecording());
        this.nextBtn.addEventListener('click', () => this.nextPhrase());
        this.languageSelect.addEventListener('change', (e) => this.handleLanguageChange(e.target.value));
    }
    
    async handleLanguageChange(languageKey) {
        try {
            // Hide feedback and error messages
            this.feedbackSection.style.display = 'none';
            this.hideError();
            
            // Stop any ongoing recording
            if (this.isRecording) {
                this.stopRecording();
            }
            
            // Cancel any ongoing speech
            this.synthesis.cancel();
            
            // Load new language
            await this.loadLanguage(languageKey);
            
        } catch (error) {
            this.showError('Failed to switch language: ' + error.message);
        }
    }
    
    displayCurrentPhrase() {
        if (this.phrases.length === 0) return;
        
        const phrase = this.phrases[this.currentPhraseIndex];
        const config = this.languages[this.currentLanguage];
        
        this.phraseEl.textContent = phrase[config.phraseKey];
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
        const config = this.languages[this.currentLanguage];
        const text = phrase[config.phraseKey];
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Find appropriate voice for the language
        const voice = this.findBestVoice(config);
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.lang = config.ttsLang;
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
    
    findBestVoice(config) {
        const voices = this.synthesis.getVoices();
        
        // For Spanish, prefer Mexican Spanish (es-MX)
        if (config.ttsLang === 'es-MX') {
            // First try to find exact es-MX voice
            let voice = voices.find(v => v.lang === 'es-MX');
            if (voice) return voice;
            
            // Try to find voice with Mexico or Latin American in name
            voice = voices.find(v => 
                v.name.toLowerCase().includes('mexico') || 
                v.name.toLowerCase().includes('mexican') ||
                v.name.toLowerCase().includes('latin')
            );
            if (voice) return voice;
            
            // Fallback to any Spanish voice
            voice = voices.find(v => v.lang.startsWith('es-'));
            if (voice) return voice;
        }
        
        // For other languages, find exact match first
        let voice = voices.find(v => v.lang === config.ttsLang);
        if (voice) return voice;
        
        // Fallback to language code match
        const langCode = config.ttsLang.split('-')[0];
        voice = voices.find(v => v.lang.startsWith(langCode));
        if (voice) return voice;
        
        // Final fallback
        return voices.find(v => v.lang === config.fallbackTts);
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
        const phrase = this.phrases[this.currentPhraseIndex];
        const config = this.languages[this.currentLanguage];
        const originalPhrase = phrase[config.phraseKey];
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
        // Very forgiving accuracy calculation optimized for natural speech patterns
        const normalizedOriginal = this.normalizeText(original);
        const normalizedSpoken = this.normalizeText(spoken);
        
        if (normalizedOriginal === normalizedSpoken) return 100;
        
        // Split into words for word-based comparison
        const originalWords = normalizedOriginal.split(' ').filter(w => w.length > 0);
        const spokenWords = normalizedSpoken.split(' ').filter(w => w.length > 0);
        
        if (originalWords.length === 0) return 100;
        
        // Check for key content words (ignore small function words that are often misheard)
        const keyWords = originalWords.filter(word => word.length > 2 || this.isImportantShortWord(word));
        const wordsToScore = keyWords.length > 0 ? keyWords : originalWords;
        
        // Calculate word-level accuracy with very generous scoring
        let correctWords = 0;
        let partialMatches = 0;
        
        for (const originalWord of wordsToScore) {
            let bestMatch = 0;
            
            // Check for exact or close matches in spoken words
            for (const spokenWord of spokenWords) {
                if (originalWord === spokenWord) {
                    bestMatch = 1; // Perfect match
                    break;
                } else {
                    // Calculate similarity for partial credit
                    const similarity = this.calculateWordSimilarity(originalWord, spokenWord);
                    bestMatch = Math.max(bestMatch, similarity);
                }
            }
            
            // Much more generous thresholds for natural speech
            if (bestMatch >= 0.8) {
                correctWords += 1;
            } else if (bestMatch >= 0.5) {
                partialMatches += 0.8; // High partial credit for reasonable attempts
            } else if (bestMatch >= 0.3) {
                partialMatches += 0.5; // Some credit for recognizable attempts
            }
        }
        
        // Calculate base score
        const rawScore = (correctWords + partialMatches) / wordsToScore.length;
        let finalScore = Math.round(rawScore * 100);
        
        // Additional bonuses for speech recognition challenges
        const lengthBonus = this.calculateLengthBonus(originalWords.length);
        const speechPatternBonus = this.calculateSpeechPatternBonus(normalizedOriginal, normalizedSpoken);
        
        finalScore += lengthBonus + speechPatternBonus;
        
        // Apply generous learning-friendly adjustments
        if (finalScore >= 80) finalScore = Math.min(100, finalScore + 8); // Big boost for good attempts
        if (finalScore >= 65) finalScore = Math.min(100, finalScore + 10); // Major encouragement
        if (finalScore >= 45) finalScore = Math.min(100, finalScore + 8); // Support learning efforts
        if (finalScore >= 30) finalScore = Math.min(100, finalScore + 5); // Encourage any attempt
        
        // Very generous minimum score for any reasonable attempt
        if (finalScore > 0 && finalScore < 40) finalScore = 40;
        
        return Math.max(0, Math.min(100, finalScore));
    }
    
    isImportantShortWord(word) {
        // Short words that are crucial for meaning in the supported languages
        const importantShortWords = [
            'el', 'la', 'es', 'un', 'en', 'de', 'se', // Spanish
            'le', 'la', 'de', 'du', 'un', 'se', 'je', // French  
            'der', 'die', 'das', 'ein', 'ist', 'ich', 'zu' // German
        ];
        return importantShortWords.includes(word);
    }
    
    calculateLengthBonus(wordCount) {
        // Longer phrases are harder to get perfect with speech recognition
        if (wordCount >= 5) return 10;
        if (wordCount >= 4) return 5;
        if (wordCount >= 3) return 3;
        return 0;
    }
    
    calculateSpeechPatternBonus(original, spoken) {
        // Bonus for attempting the right structure even if words are misheard
        const originalStructure = original.replace(/[aeiouáéíóúàèìòù]/gi, 'v').replace(/[bcdfghjklmnpqrstvwxyzñç]/gi, 'c');
        const spokenStructure = spoken.replace(/[aeiouáéíóúàèìòù]/gi, 'v').replace(/[bcdfghjklmnpqrstvwxyzñç]/gi, 'c');
        
        const similarity = this.calculateWordSimilarity(originalStructure, spokenStructure);
        
        if (similarity >= 0.7) return 8;
        if (similarity >= 0.5) return 5;
        if (similarity >= 0.3) return 3;
        return 0;
    }
    
    calculateWordSimilarity(word1, word2) {
        // Extremely forgiving word similarity for natural speech recognition
        if (word1 === word2) return 1;
        
        const maxLength = Math.max(word1.length, word2.length);
        if (maxLength === 0) return 1;
        
        // Handle common pronunciation variations
        const normalized1 = this.normalizeForPronunciation(word1);
        const normalized2 = this.normalizeForPronunciation(word2);
        
        if (normalized1 === normalized2) return 1;
        
        // Check if one word contains the other (common in fast speech)
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
            return 0.9;
        }
        
        // Check for common speech recognition substitutions
        const similarity1 = this.checkCommonSubstitutions(normalized1, normalized2);
        if (similarity1 > 0.8) return similarity1;
        
        // Calculate edit distance with very generous interpretation
        const distance = this.levenshteinDistance(normalized1, normalized2);
        let similarity = (maxLength - distance) / maxLength;
        
        // Major boosts for common speech patterns
        if (maxLength <= 3 && similarity >= 0.3) {
            similarity = Math.min(1, similarity + 0.4); // Very forgiving for short words
        } else if (maxLength <= 5 && similarity >= 0.4) {
            similarity = Math.min(1, similarity + 0.3); // Forgiving for medium words
        } else if (similarity >= 0.5) {
            similarity = Math.min(1, similarity + 0.2); // Boost for any reasonable attempt
        }
        
        // Check for phonetic similarity (sounds similar even if spelled differently)
        const phoneticSimilarity = this.calculatePhoneticSimilarity(normalized1, normalized2);
        similarity = Math.max(similarity, phoneticSimilarity);
        
        return similarity;
    }
    
    checkCommonSubstitutions(word1, word2) {
        // Common speech recognition errors and natural variations
        const substitutions = [
            // Spanish specific
            ['bano', 'vano'], ['bano', 'baho'], ['bano', 'pano'], ['bano', 'albano'], ['bano', 'abano'],
            ['esta', 'esta'], ['donde', 'onde'], ['donde', 'don'],
            ['el', 'al'], ['el', 'el'], ['baño', 'bano'],
            // Common confusions
            ['al', 'el'], ['la', 'ya'], ['de', 'del'], ['en', 'an'],
            // Fast speech contractions
            ['para', 'pa'], ['porque', 'por'], ['esta', 'ta']
        ];
        
        for (const [a, b] of substitutions) {
            if ((word1 === a && word2 === b) || (word1 === b && word2 === a)) {
                return 0.95;
            }
        }
        
        return 0;
    }
    
    calculatePhoneticSimilarity(word1, word2) {
        // Simple phonetic similarity for common sounds
        const phonetic1 = this.toPhoneticPattern(word1);
        const phonetic2 = this.toPhoneticPattern(word2);
        
        if (phonetic1 === phonetic2) return 0.9;
        
        const maxLen = Math.max(phonetic1.length, phonetic2.length);
        if (maxLen === 0) return 0;
        
        const distance = this.levenshteinDistance(phonetic1, phonetic2);
        return Math.max(0, (maxLen - distance) / maxLen * 0.8);
    }
    
    toPhoneticPattern(word) {
        // Convert to a phonetic pattern for similarity matching
        return word.toLowerCase()
            // Consonant clusters that sound similar
            .replace(/[bp]/g, 'p')
            .replace(/[dt]/g, 't')
            .replace(/[kg]/g, 'k')
            .replace(/[sz]/g, 's')
            .replace(/[lr]/g, 'r')
            .replace(/[mn]/g, 'n')
            // Vowel simplification
            .replace(/[aáà]/g, 'a')
            .replace(/[eéè]/g, 'e')
            .replace(/[iíì]/g, 'i')
            .replace(/[oóò]/g, 'o')
            .replace(/[uúù]/g, 'u')
            // Remove doubled letters
            .replace(/(.)\1+/g, '$1');
    }
    
    normalizeForPronunciation(word) {
        return word.toLowerCase()
            // Common Spanish pronunciation variations
            .replace(/[áà]/g, 'a')
            .replace(/[éè]/g, 'e')
            .replace(/[íì]/g, 'i')
            .replace(/[óò]/g, 'o')
            .replace(/[úù]/g, 'u')
            .replace(/ñ/g, 'n')
            // Common speech recognition errors
            .replace(/[bv]/g, 'b') // b/v confusion in Spanish
            .replace(/ll/g, 'y')   // ll/y confusion
            .replace(/rr/g, 'r')   // double r simplification
            // Remove silent letters that might be missed
            .replace(/h/g, '')     // Silent h in Spanish
            // French common variations
            .replace(/[çc]/g, 'c')
            .replace(/[àâä]/g, 'a')
            .replace(/[èêë]/g, 'e')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ûü]/g, 'u')
            // German common variations
            .replace(/ß/g, 'ss')
            .replace(/ä/g, 'ae')
            .replace(/ö/g, 'oe')
            .replace(/ü/g, 'ue');
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
        
        // Add encouraging feedback message
        let message = '';
        if (accuracy >= 90) {
            message = ' - Excellent pronunciation! 🌟';
        } else if (accuracy >= 80) {
            message = ' - Great job! 👍';
        } else if (accuracy >= 70) {
            message = ' - Good effort! Keep practicing! 👏';
        } else if (accuracy >= 60) {
            message = ' - Nice try! You\'re improving! 💪';
        } else if (accuracy >= 40) {
            message = ' - Keep practicing, you\'re getting there! 📈';
        } else {
            message = ' - Don\'t give up! Practice makes perfect! 🎯';
        }
        
        this.scorePercentageEl.textContent = accuracy + '%' + message;
        
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
    new LanguageLearningApp();
});

// Handle voices loading for better browser compatibility
window.speechSynthesis.onvoiceschanged = () => {
    // Voices are now loaded and available
    console.log('Speech synthesis voices loaded');
};
