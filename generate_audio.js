const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const LANGUAGES = {
    spanish: {
        voice: 'es-MX',
        ttsService: 'google' // or 'azure', 'polly', etc.
    },
    french: {
        voice: 'fr-FR',
        ttsService: 'google'
    },
    german: {
        voice: 'de-DE',
        ttsService: 'google'
    },
    english: {
        voice: 'en-US',
        ttsService: 'google'
    }
};

// Create audio directories
function createAudioDirectories() {
    const baseDir = './audio';
    if (!fs.existsSync(baseDir)) {
        fs.mkdirSync(baseDir);
    }
    
    Object.keys(LANGUAGES).forEach(lang => {
        const langDir = path.join(baseDir, lang);
        if (!fs.existsSync(langDir)) {
            fs.mkdirSync(langDir);
        }
        
        // Create category directories
        const categories = ['greetingsintroductions', 'traveldirections', 'fooddining', 'emergencieshealth', 'shoppingmoney', 'socialdailylife'];
        categories.forEach(category => {
            const categoryDir = path.join(langDir, category);
            if (!fs.existsSync(categoryDir)) {
                fs.mkdirSync(categoryDir, { recursive: true });
            }
        });
    });
}

// Generate audio using Google Translate TTS (free)
function generateGoogleTTS(text, language, outputPath) {
    return new Promise((resolve, reject) => {
        const encodedText = encodeURIComponent(text);
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${language}&client=tw-ob`;
        
        // Ensure the directory exists
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        const file = fs.createWriteStream(outputPath);
        
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Generated: ${outputPath}`);
                    resolve();
                });
            } else {
                reject(new Error(`HTTP ${response.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to convert category name to directory name
function getCategoryDir(categoryName) {
    return categoryName.toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace(/\s+/g, '');
}

// Function to convert English text to filename
function getAudioFileName(id, englishText) {
    return `${id}_${englishText.toLowerCase()
        .replace(/[^a-z0-9]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '')}.mp3`;
}

// Process phrases and generate audio files
async function generateAudioFiles() {
    try {
        createAudioDirectories();
        
        // Load all language files
        const languageFiles = ['spanish.json', 'french.json', 'german.json', 'english.json'];
        
        for (const langFile of languageFiles) {
            const langKey = langFile.replace('.json', '');
            const data = JSON.parse(fs.readFileSync(`./data/${langFile}`, 'utf8'));
            
            console.log(`Processing ${langKey}...`);
            
            for (const category of data.categories) {
                const categoryDir = getCategoryDir(category.name);
                
                for (const phrase of category.phrases) {
                    const text = phrase[langKey];
                    const fileName = getAudioFileName(phrase.id, phrase.english);
                    const outputPath = `./audio/${langKey}/${categoryDir}/${fileName}`;
                    
                    // Skip if file already exists
                    if (fs.existsSync(outputPath)) {
                        console.log(`Skipping existing file: ${outputPath}`);
                        continue;
                    }
                    
                    try {
                        await generateGoogleTTS(text, LANGUAGES[langKey].voice, outputPath);
                        // Add delay to avoid rate limiting
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    } catch (error) {
                        console.error(`Error generating audio for "${text}":`, error.message);
                    }
                }
            }
        }
        
        console.log('Audio generation completed!');
        
    } catch (error) {
        console.error('Error generating audio files:', error);
    }
}

// Alternative: Use Azure Speech Service (requires API key)
async function generateAzureTTS(text, language, outputPath, apiKey) {
    // Implementation for Azure Speech Service
    // This would require the Azure Speech SDK
    console.log('Azure TTS implementation would go here');
}

// Alternative: Use Amazon Polly (requires AWS credentials)
async function generatePollyTTS(text, language, outputPath) {
    // Implementation for Amazon Polly
    // This would require the AWS SDK
    console.log('Amazon Polly implementation would go here');
}

// Run the script
if (require.main === module) {
    generateAudioFiles();
}

module.exports = {
    generateAudioFiles,
    generateGoogleTTS,
    generateAzureTTS,
    generatePollyTTS
}; 