import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Çevirileri doğrudan import ediyoruz
import enTranslation from '../public/locales/en/translation.json';
import trTranslation from '../public/locales/tr/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation
      },
      tr: {
        translation: trTranslation
      }
    },
    lng: localStorage.getItem('i18nextLng') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;