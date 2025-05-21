import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en/translation.json'; // ✅ artık src içinden import ediyoruz
import tr from './locales/tr/translation.json'; // ✅ varsa Türkçe çeviri de ekle

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
    lng: 'en', // varsayılan dil
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
