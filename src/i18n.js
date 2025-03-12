import i18n, { reloadResources } from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

const languageDetector = {
  async: true,
  detect: (callback) => {
    const language = localStorage.getItem('i18nextLng') || 'en';
    callback(language);
  },
  cacheUserLanguage: (lng) => {
    localStorage.setItem('i18nextLng', lng);
  }
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: false, 
    detection: languageDetector,
    interpolation: {
      escapeValue: false
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json'
    },
    ns: ['translation' ],
    defaultNS: 'translation'
  });

export default i18n;