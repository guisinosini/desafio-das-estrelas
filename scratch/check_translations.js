const { translations } = require('./src/lib/translations');

const baseLanguage = 'pt-BR';
const baseKeys = Object.keys(translations[baseLanguage]);
const languages = Object.keys(translations);

let missingCount = 0;

languages.forEach(lang => {
    if (lang === baseLanguage) return;
    const langKeys = Object.keys(translations[lang]);
    
    const missing = baseKeys.filter(k => !langKeys.includes(k));
    const extra = langKeys.filter(k => !baseKeys.includes(k));
    
    if (missing.length > 0) {
        console.log(`Missing keys in ${lang}:`, missing);
        missingCount += missing.length;
    }
    if (extra.length > 0) {
        console.log(`Extra keys in ${lang}:`, extra);
    }
});

if (missingCount === 0) {
    console.log("All languages have all keys from pt-BR!");
} else {
    console.log(`Total missing keys: ${missingCount}`);
}
