import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import enDebts from './locales/en/debts.json';
import enPayoff from './locales/en/payoff.json';
import enCharts from './locales/en/charts.json';
import enSettings from './locales/en/settings.json';
import enTimeline from './locales/en/timeline.json';
import enDocumentation from './locales/en/documentation.json';
import enExport from './locales/en/export.json';
import enIncome from './locales/en/income.json';

import esCommon from './locales/es/common.json';
import esDebts from './locales/es/debts.json';
import esPayoff from './locales/es/payoff.json';
import esCharts from './locales/es/charts.json';
import esSettings from './locales/es/settings.json';
import esTimeline from './locales/es/timeline.json';
import esDocumentation from './locales/es/documentation.json';
import esExport from './locales/es/export.json';
import esIncome from './locales/es/income.json';

import { useLanguageStore } from '@/store/useLanguageStore';

const storedLang = useLanguageStore.getState().language;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        debts: enDebts,
        payoff: enPayoff,
        charts: enCharts,
        settings: enSettings,
        timeline: enTimeline,
        documentation: enDocumentation,
        export: enExport,
        income: enIncome,
      },
      es: {
        common: esCommon,
        debts: esDebts,
        payoff: esPayoff,
        charts: esCharts,
        settings: esSettings,
        timeline: esTimeline,
        documentation: esDocumentation,
        export: esExport,
        income: esIncome,
      },
    },
    lng: storedLang,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'debts', 'payoff', 'charts', 'settings', 'timeline', 'documentation', 'export', 'income'],
    interpolation: {
      escapeValue: false,
    },
  });

// Sync store changes to i18next
useLanguageStore.subscribe((state) => {
  if (i18n.language !== state.language) {
    i18n.changeLanguage(state.language);
  }
});

export default i18n;
