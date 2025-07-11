// Multi-Language Learning App - Main JavaScript File

class LanguageLearningApp {
    constructor() {
        // App state
        this.phrases = [];
        this.currentPhraseIndex = 0;
        this.isRecording = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.currentLanguage = 'english';
        this.myLanguage = 'english'; // New state for My Language
        this.voiceSpeed = 1.00; // New state for voice speed
        
        // Speech analysis tracking
        this.speechStartTime = null;
        this.speechEndTime = null;
        this.interimResults = [];
        this.expectedDuration = null;
        
        // Language configurations
        this.languages = {
            english: {
                name: 'English',
                flag: '🇺🇸',
                dataFile: '/data/english.json',
                phraseKey: 'english',
                ttsLang: 'en-US',
                recognitionLang: 'en-US',
                fallbackTts: 'en-GB'
            },
            spanish: {
                name: 'Spanish',
                flag: '🇪🇸',
                dataFile: '/data/spanish.json',
                phraseKey: 'spanish',
                ttsLang: 'es-MX', // Mexican Spanish preferred
                recognitionLang: 'es-MX',
                fallbackTts: 'es-ES'
            },
            french: {
                name: 'French',
                flag: '🇫🇷',
                dataFile: '/data/french.json',
                phraseKey: 'french',
                ttsLang: 'fr-FR',
                recognitionLang: 'fr-FR',
                fallbackTts: 'fr-FR'
            },
            german: {
                name: 'German',
                flag: '🇩🇪',
                dataFile: '/data/german.json',
                phraseKey: 'german',
                ttsLang: 'de-DE',
                recognitionLang: 'de-DE',
                fallbackTts: 'de-DE'
            }
        };
        
        // DOM elements
        this.languageSelect = document.getElementById('language-select');
        this.myLanguageSelect = document.getElementById('my-language-select'); // New DOM reference
        this.voiceSpeedRange = document.getElementById('voice-speed-range');
        this.voiceSpeedValue = document.getElementById('voice-speed-value');
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
        this.errorMessageEl = document.getElementById('error-message');
        this.phraseJumpSelect = document.getElementById('phrase-jump-select');
        
        // Detailed feedback elements
        this.wordAccuracyScoreEl = document.getElementById('word-accuracy-score');
        this.wordAccuracyFillEl = document.getElementById('word-accuracy-fill');
        this.wordAccuracyFeedbackEl = document.getElementById('word-accuracy-feedback');
        this.timingScoreEl = document.getElementById('timing-score');
        this.timingFillEl = document.getElementById('timing-fill');
        this.timingFeedbackEl = document.getElementById('timing-feedback');
        this.fluencyScoreEl = document.getElementById('fluency-score');
        this.fluencyFillEl = document.getElementById('fluency-fill');
        this.fluencyFeedbackEl = document.getElementById('fluency-feedback');
        this.overallScoreEl = document.getElementById('overall-score');
        this.overallScoreFillEl = document.getElementById('overall-score-fill');
        this.overallFeedbackEl = document.getElementById('overall-feedback');
        
        // Auth state
        this.user = null; // { email, isPremium }
        
        // Initialize the app
        this.init();
    }
    
    async init() {
        try {
            // Set up event listeners first
            this.setupEventListeners();
            this.setupAuthUI();
            
            // Load phrases for default language
            await this.loadLanguage(this.currentLanguage);
            
            // Check browser compatibility
            this.checkBrowserSupport();
            
            // Populate phrase jump dropdown
            this.populatePhraseJumpDropdown();
            
        } catch (error) {
            this.showError('Failed to initialize the app: ' + error.message);
        }
    }
    
    async loadLanguage(languageKey, phraseIndexToShow) {
        try {
            this.currentLanguage = languageKey;
            const config = this.languages[languageKey];
            
            // Load phrases from JSON file
            await this.loadPhrases(config.dataFile);
            
            // Update UI for new language
            this.updateLanguageUI(config);
            
            // Set phrase index to previous or 0 if out of bounds
            if (
                typeof phraseIndexToShow === 'number' &&
                phraseIndexToShow >= 0 &&
                phraseIndexToShow < this.phrases.length
            ) {
                this.currentPhraseIndex = phraseIndexToShow;
            } else {
                this.currentPhraseIndex = 0;
            }
            
            // Display phrase
            this.displayCurrentPhrase();
            
            // Update UI
            this.updateUI();
            
            // Update speech recognition language
            this.updateSpeechRecognition();
            
            // Repopulate phrase jump dropdown
            this.populatePhraseJumpDropdown();
            
        } catch (error) {
            this.showError('Failed to load language: ' + error.message);
        }
    }
    
    updateLanguageUI(config) {
        this.appTitle.textContent = `${config.flag} ${config.name} Learning App`;
        this.appDescription.textContent = `Practice your ${config.name} pronunciation`;
        document.title = 'Pop Translate';
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
        this.recognition.interimResults = true; // Enable interim results for fluency analysis
        
        // Set up recognition event handlers
        this.recognition.onresult = (event) => {
            this.processSpeechResults(event);
        };
        
        this.recognition.onerror = (event) => {
            this.handleSpeechError(event.error);
        };
        
        this.recognition.onstart = () => {
            this.speechStartTime = Date.now();
            this.interimResults = [];
        };
        
        this.recognition.onend = () => {
            this.speechEndTime = Date.now();
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
        this.myLanguageSelect.addEventListener('change', (e) => this.handleMyLanguageChange(e.target.value)); // New event
        this.voiceSpeedRange.addEventListener('input', (e) => this.handleVoiceSpeedChange(e.target.value));
        if (this.phraseJumpSelect) {
            this.phraseJumpSelect.addEventListener('change', (e) => this.handlePhraseJump(e.target.value));
        }
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
            // Preserve current phrase index
            const prevIndex = this.currentPhraseIndex;
            // Load new language, passing previous index
            await this.loadLanguage(languageKey, prevIndex);
        } catch (error) {
            this.showError('Failed to switch language: ' + error.message);
        }
    }
    
    handleMyLanguageChange(languageKey) {
        this.myLanguage = languageKey;
        this.displayCurrentPhrase();
    }

    handleVoiceSpeedChange(value) {
        this.voiceSpeed = parseFloat(value);
        if (this.voiceSpeedValue) {
            this.voiceSpeedValue.textContent = this.voiceSpeed.toFixed(2) + 'x';
        }
    }
    
    displayCurrentPhrase() {
        if (this.phrases.length === 0) return;
        
        const phrase = this.phrases[this.currentPhraseIndex];
        const config = this.languages[this.currentLanguage];
        
        this.phraseEl.textContent = phrase[config.phraseKey];
        
        // Show the translation in the user's selected language
        this.englishTranslationEl.textContent = phrase[this.myLanguage];
        
        this.currentPhraseEl.textContent = this.currentPhraseIndex + 1;
        
        // Sync phrase jump dropdown
        if (this.phraseJumpSelect) {
            this.phraseJumpSelect.value = String(this.currentPhraseIndex);
        }
        
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
        utterance.rate = this.voiceSpeed; // Use user-selected speed
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
            
            // Calculate expected duration for current phrase
            this.calculateExpectedDuration();
            
            // Reset timing variables
            this.speechStartTime = null;
            this.speechEndTime = null;
            this.interimResults = [];
            
            // Start speech recognition
            this.recognition.start();
            
        } catch (error) {
            this.handleSpeechError('Failed to start recording: ' + error.message);
        }
    }
    
    calculateExpectedDuration() {
        // Estimate expected duration based on phrase complexity
        const phrase = this.phrases[this.currentPhraseIndex];
        const config = this.languages[this.currentLanguage];
        const text = phrase[config.phraseKey];
        
        // Count syllables (approximate)
        const syllableCount = this.estimateSyllables(text);
        
        // Average speaking rate: 3-4 syllables per second for language learning
        // Add buffer time for natural pauses
        this.expectedDuration = (syllableCount / 3.5) * 1000 + 1000; // in milliseconds
    }
    
    estimateSyllables(text) {
        // Simple syllable estimation
        const vowelGroups = text.toLowerCase().match(/[aeiouáéíóúàèìòùâêîôûäëïöü]+/g);
        return vowelGroups ? vowelGroups.length : Math.max(1, text.split(' ').length);
    }
    
    stopRecording() {
        this.isRecording = false;
        this.recordBtn.classList.remove('recording');
        this.recordBtn.innerHTML = '<span class="btn-icon">🎤</span><span class="btn-text">Record</span>';
        
        if (this.recognition) {
            this.recognition.stop();
        }
    }
    
    processSpeechResults(event) {
        const currentTime = Date.now();
        
        // Track interim results for fluency analysis
        for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            if (result.isFinal) {
                // Final result - process the complete speech
                const transcript = result[0].transcript;
                this.handleFinalSpeechResult(transcript, currentTime);
            } else {
                // Interim result - track for fluency
                this.interimResults.push({
                    transcript: result[0].transcript,
                    timestamp: currentTime
                });
            }
        }
    }
    
    handleFinalSpeechResult(transcript, endTime) {
        const phrase = this.phrases[this.currentPhraseIndex];
        const config = this.languages[this.currentLanguage];
        const originalPhrase = phrase[config.phraseKey];
        
        // Calculate comprehensive speech analysis
        const analysis = this.analyzeSpeech(originalPhrase, transcript, endTime);
        
        // Display detailed results
        this.showDetailedFeedback(transcript, analysis);
        
        // Stop recording
        this.stopRecording();
    }
    
    analyzeSpeech(original, spoken, endTime) {
        // Calculate actual speech duration
        const actualDuration = endTime - this.speechStartTime;
        
        // 1. Word Accuracy Analysis
        const wordAccuracy = this.calculateWordAccuracy(original, spoken);
        
        // 2. Timing Analysis (adjusted for word accuracy)
        let timingScore = this.calculateTimingScore(actualDuration);
        if (wordAccuracy.score === 0) {
            timingScore = { ...timingScore, score: 0, feedback: 'Please try the target phrase' };
        }
        
        // 3. Fluency Analysis (adjusted for word accuracy)
        let fluencyScore = this.calculateFluencyScore(actualDuration);
        if (wordAccuracy.score === 0) {
            fluencyScore = { ...fluencyScore, score: 0, feedback: 'Focus on saying the correct words' };
        }
        
        // 4. Overall Score - if word accuracy is 0, overall should be very low
        let overallScore;
        if (wordAccuracy.score === 0) {
            // If completely wrong words, overall score should be very low regardless of timing/fluency
            overallScore = 0;
        } else {
            // Normal weighted average for reasonable attempts
            overallScore = Math.round(
                (wordAccuracy.score * 0.6) + 
                (timingScore.score * 0.2) + 
                (fluencyScore.score * 0.2)
            );
        }
        
        return {
            wordAccuracy,
            timing: timingScore,
            fluency: fluencyScore,
            overall: overallScore,
            duration: actualDuration,
            expectedDuration: this.expectedDuration
        };
    }
    
    calculateWordAccuracy(original, spoken) {
        const originalWords = this.normalizeText(original).split(' ').filter(w => w.length > 0);
        const spokenWords = this.normalizeText(spoken).split(' ').filter(w => w.length > 0);
        
        let correctWords = 0;
        let partialMatches = 0;
        let details = [];
        let hasAnyMatch = false;
        
        // Analyze each expected word
        for (let i = 0; i < originalWords.length; i++) {
            const expectedWord = originalWords[i];
            let bestMatch = { score: 0, word: '', status: 'missing' };
            
            // Find best match in spoken words
            for (const spokenWord of spokenWords) {
                const similarity = this.calculateWordSimilarity(expectedWord, spokenWord);
                if (similarity > bestMatch.score) {
                    bestMatch = { score: similarity, word: spokenWord, status: 'matched' };
                }
            }
            
            // More generous thresholds for correct pronunciation
            if (bestMatch.score >= 0.85) {
                correctWords++;
                hasAnyMatch = true;
                details.push({ expected: expectedWord, actual: bestMatch.word, status: 'correct' });
            } else if (bestMatch.score >= 0.55) {
                partialMatches += 0.8; // More generous partial credit
                hasAnyMatch = true;
                details.push({ expected: expectedWord, actual: bestMatch.word, status: 'partial' });
            } else if (bestMatch.score >= 0.3) {
                // Only give minimal credit if there's some similarity
                partialMatches += 0.2;
                if (bestMatch.score > 0.3) hasAnyMatch = true;
                details.push({ expected: expectedWord, actual: bestMatch.word || '', status: 'incorrect' });
            } else {
                details.push({ expected: expectedWord, actual: bestMatch.word || '', status: 'incorrect' });
            }
        }
        
        // If no words have any reasonable similarity, return 0
        if (!hasAnyMatch) {
            return {
                score: 0,
                correctWords: 0,
                totalWords: originalWords.length,
                extraWords: spokenWords.length,
                details,
                feedback: "Try saying the phrase in the target language"
            };
        }
        
        // Check for extra words (penalize heavily for completely unrelated speech)
        const extraWords = Math.max(0, spokenWords.length - originalWords.length);
        
        const rawScore = (correctWords + partialMatches) / originalWords.length;
        let score = Math.round(rawScore * 100);
        
        // Reduce score for extra unrelated words
        if (extraWords > 2) {
            score = Math.max(0, score - (extraWords * 10));
        } else if (extraWords > 0) {
            score = Math.max(0, score - (extraWords * 5));
        }
        
        // More generous bonus for good attempts
        if (score >= 70) {
            score = Math.min(100, score + 8); // Bigger boost for good pronunciation
        } else if (score >= 50) {
            score = Math.min(100, score + 5); // Encourage decent attempts
        }
        
        return {
            score: Math.max(0, Math.min(100, score)),
            correctWords,
            totalWords: originalWords.length,
            extraWords,
            details,
            feedback: this.generateWordFeedback(correctWords, originalWords.length, extraWords)
        };
    }
    
    calculateTimingScore(actualDuration) {
        const ratio = actualDuration / this.expectedDuration;
        let score = 100;
        let feedback = '';
        
        if (ratio < 0.7) {
            // Too fast
            score = Math.max(60, 100 - ((0.7 - ratio) * 200));
            feedback = 'Try speaking a bit slower for clearer pronunciation';
        } else if (ratio > 2.0) {
            // Too slow
            score = Math.max(60, 100 - ((ratio - 2.0) * 150));
            feedback = 'Try to speak more fluently with fewer pauses';
        } else if (ratio > 1.5) {
            // Slightly slow
            score = Math.max(80, 100 - ((ratio - 1.5) * 80));
            feedback = 'Good pace, try to be a bit more natural';
        } else {
            // Good timing
            feedback = 'Great speaking pace!';
        }
        
        return {
            score: Math.round(score),
            actualDuration,
            expectedDuration: this.expectedDuration,
            ratio,
            feedback
        };
    }
    
    calculateFluencyScore(actualDuration) {
        // Analyze fluency based on interim results and total duration
        let score = 100;
        let feedback = 'Smooth and fluent delivery!';
        
        // Simple fluency estimation based on speech pattern
        const wordsPerSecond = this.interimResults.length / (actualDuration / 1000);
        
        if (this.interimResults.length < 2) {
            // Very few interim results suggest either very fast or very hesitant speech
            if (actualDuration < this.expectedDuration * 0.8) {
                score = 85;
                feedback = 'Good speed, work on clarity';
            } else {
                score = 70;
                feedback = 'Try to speak more continuously';
            }
        } else if (wordsPerSecond > 5) {
            score = 75;
            feedback = 'Good fluency, try speaking slightly slower';
        } else if (wordsPerSecond < 1) {
            score = 65;
            feedback = 'Work on speaking more fluently with fewer pauses';
        }
        
        return {
            score: Math.round(score),
            wordsPerSecond: Math.round(wordsPerSecond * 10) / 10,
            feedback
        };
    }
    
    generateWordFeedback(correct, total, extra) {
        const percentage = Math.round((correct / total) * 100);
        
        if (percentage >= 90) {
            return 'Excellent word accuracy!';
        } else if (percentage >= 75) {
            return 'Good pronunciation, keep practicing!';
        } else if (percentage >= 60) {
            return 'Getting better, focus on unclear words';
        } else {
            return 'Keep practicing, you\'re improving!';
        }
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
    
    showDetailedFeedback(transcript, analysis) {
        // Display what the user said
        this.userTranscriptionEl.textContent = transcript;
        
        // Update word accuracy
        this.wordAccuracyScoreEl.textContent = analysis.wordAccuracy.score + '%';
        this.wordAccuracyFeedbackEl.textContent = analysis.wordAccuracy.feedback;
        
        // Update timing
        this.timingScoreEl.textContent = analysis.timing.score + '%';
        this.timingFeedbackEl.textContent = analysis.timing.feedback;
        
        // Update fluency
        this.fluencyScoreEl.textContent = analysis.fluency.score + '%';
        this.fluencyFeedbackEl.textContent = analysis.fluency.feedback;
        
        // Update overall score
        this.overallScoreEl.textContent = analysis.overall + '%';
        this.overallFeedbackEl.textContent = this.generateOverallFeedback(analysis.overall);
        
        // Animate all progress bars with staggered timing
        setTimeout(() => {
            this.wordAccuracyFillEl.style.width = analysis.wordAccuracy.score + '%';
        }, 200);
        
        setTimeout(() => {
            this.timingFillEl.style.width = analysis.timing.score + '%';
        }, 400);
        
        setTimeout(() => {
            this.fluencyFillEl.style.width = analysis.fluency.score + '%';
        }, 600);
        
        setTimeout(() => {
            this.overallScoreFillEl.style.width = analysis.overall + '%';
        }, 800);
        
        // Show feedback section
        this.feedbackSection.style.display = 'block';
    }
    
    generateOverallFeedback(score) {
        if (score >= 95) {
            return 'Outstanding! Your pronunciation is excellent!';
        } else if (score >= 85) {
            return 'Excellent work! You\'re speaking very well!';
        } else if (score >= 75) {
            return 'Great job! Keep up the good practice!';
        } else if (score >= 65) {
            return 'Good effort! You\'re making solid progress!';
        } else if (score >= 50) {
            return 'Nice try! Focus on the areas that need work!';
        } else {
            return 'Keep practicing! Every attempt helps you improve!';
        }
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
        // Update progress bar
        const progressBar = document.getElementById('progress-bar-fill');
        if (progressBar && this.phrases.length > 0) {
            const percent = ((this.currentPhraseIndex + 1) / this.phrases.length) * 100;
            progressBar.style.width = percent + '%';
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

    handlePhraseJump(indexStr) {
        const idx = parseInt(indexStr, 10);
        if (!isNaN(idx) && idx >= 0 && idx < this.phrases.length) {
            this.currentPhraseIndex = idx;
            this.displayCurrentPhrase();
            this.updateUI();
        }
    }

    populatePhraseJumpDropdown() {
        if (!this.phraseJumpSelect) return;
        // Clear existing options
        this.phraseJumpSelect.innerHTML = '';
        const config = this.languages[this.currentLanguage];
        this.phrases.forEach((phrase, idx) => {
            const option = document.createElement('option');
            option.value = idx;
            option.textContent = `${idx + 1}. ${phrase[config.phraseKey]}`;
            this.phraseJumpSelect.appendChild(option);
        });
        // Set current value
        this.phraseJumpSelect.value = String(this.currentPhraseIndex);
    }

    setupAuthUI() {
        // Elements
        this.loginModal = document.getElementById('login-modal');
        this.loginBtn = document.getElementById('login-btn');
        this.logoutBtn = document.getElementById('logout-btn');
        this.userGreeting = document.getElementById('user-greeting');
        this.loginSubmit = document.getElementById('login-submit');
        this.loginEmail = document.getElementById('login-email');
        this.loginPassword = document.getElementById('login-password');
        this.loginError = document.getElementById('login-error');
        this.closeLogin = document.getElementById('close-login');
        this.premiumFeature = document.getElementById('premium-feature');
        this.upgradeBtn = document.getElementById('upgrade-btn');

        // Restore user from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            this.user = JSON.parse(userStr);
        }
        this.updateAuthUI();

        // Event listeners
        this.loginBtn.addEventListener('click', () => this.showLoginModal());
        this.logoutBtn.addEventListener('click', () => this.logout());
        this.loginSubmit.addEventListener('click', () => this.login());
        this.closeLogin.addEventListener('click', () => this.hideLoginModal());
        this.upgradeBtn.addEventListener('click', () => this.upgradeToPremium());
        window.addEventListener('click', (e) => {
            if (e.target === this.loginModal) this.hideLoginModal();
        });
    }
    showLoginModal() {
        this.loginModal.style.display = 'flex';
        this.loginError.textContent = '';
        this.loginEmail.value = '';
        this.loginPassword.value = '';
    }
    hideLoginModal() {
        this.loginModal.style.display = 'none';
    }
    login() {
        const email = this.loginEmail.value.trim();
        const password = this.loginPassword.value;
        if (!email || !password) {
            this.loginError.textContent = 'Please enter email and password.';
            return;
        }
        // Mock auth: any email/password accepted
        this.user = { email, isPremium: false };
        localStorage.setItem('user', JSON.stringify(this.user));
        this.updateAuthUI();
        this.hideLoginModal();
    }
    logout() {
        this.user = null;
        localStorage.removeItem('user');
        this.updateAuthUI();
    }
    upgradeToPremium() {
        if (!this.user) return;
        // Placeholder for Stripe integration
        this.user.isPremium = true;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.updateAuthUI();
        alert('You are now a premium user! (Stripe integration coming soon)');
    }
    updateAuthUI() {
        if (this.user) {
            this.userGreeting.textContent = `Logged in as ${this.user.email}${this.user.isPremium ? ' (Premium)' : ''}`;
            this.loginBtn.style.display = 'none';
            this.logoutBtn.style.display = 'inline-block';
            // Feature gating
            if (this.user.isPremium) {
                this.premiumFeature.style.display = 'none';
            } else {
                this.premiumFeature.style.display = 'block';
            }
        } else {
            this.userGreeting.textContent = 'Not logged in';
            this.loginBtn.style.display = 'inline-block';
            this.logoutBtn.style.display = 'none';
            this.premiumFeature.style.display = 'block';
        }
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
