const fs = require('fs');

// Function to convert category name to directory name
function getCategoryDir(categoryName) {
    return categoryName.toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace(/\s+/g, '');
}

// Function to convert English text to filename
function getAudioFileName(id, englishText) {
    return `${id}_${englishText.toLowerCase()
        .replace(/[^a-z]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^_|_$/g, '')}.mp3`;
}

// Function to add audio paths to a JSON file
function addAudioPathsToFile(filename, languageKey) {
    console.log(`Processing ${filename}...`);
    
    const filePath = `./data/${filename}`;
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let modified = false;
    
    data.categories.forEach(category => {
        const categoryDir = getCategoryDir(category.name);
        
        category.phrases.forEach(phrase => {
            if (!phrase.audioFile) {
                const fileName = getAudioFileName(phrase.id, phrase.english);
                phrase.audioFile = `/audio/${languageKey}/${categoryDir}/${fileName}`;
                modified = true;
            }
        });
    });
    
    if (modified) {
        // Write back with proper formatting
        const jsonString = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonString, 'utf8');
        console.log(`✅ Updated ${filename} with audio paths`);
    } else {
        console.log(`⏭️  ${filename} already has audio paths`);
    }
}

// Process all language files
function addAudioPathsToAllFiles() {
    const languageFiles = [
        { filename: 'spanish.json', language: 'spanish' },
        { filename: 'french.json', language: 'french' },
        { filename: 'german.json', language: 'german' },
        { filename: 'english.json', language: 'english' }
    ];
    
    languageFiles.forEach(({ filename, language }) => {
        if (fs.existsSync(`./data/${filename}`)) {
            addAudioPathsToFile(filename, language);
        } else {
            console.log(`⚠️  File not found: ${filename}`);
        }
    });
    
    console.log('\n🎉 Audio path addition completed!');
    console.log('\nNext steps:');
    console.log('1. Run: node generate_audio.js');
    console.log('2. Or manually create audio files in the /audio/ directory structure');
}

// Run the script
if (require.main === module) {
    addAudioPathsToAllFiles();
}

module.exports = {
    addAudioPathsToFile,
    addAudioPathsToAllFiles,
    getCategoryDir,
    getAudioFileName
}; 