// frontend/src/i18n.js

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationEL from './locales/el/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  el: {
    translation: translationEL
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'el',            // Προεπιλεγμένη γλώσσα
    fallbackLng: 'en',    // Αν δεν βρεθεί μετάφραση
    interpolation: {
      escapeValue: false  // Η React κάνει ήδη escaping
    }
  });

export default i18n;
