import translations from '../assets/translations.js';
export function getTranslation(lang, key) {
    try {
        return translations[lang][key];
    }
    catch (error) {
        return translations.en[key];
    }
}
