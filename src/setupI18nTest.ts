import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enCommon from './i18n/locales/en/common.json';
import enDebts from './i18n/locales/en/debts.json';
import enPayoff from './i18n/locales/en/payoff.json';
import enCharts from './i18n/locales/en/charts.json';
import enSettings from './i18n/locales/en/settings.json';
import enTimeline from './i18n/locales/en/timeline.json';
import enDocumentation from './i18n/locales/en/documentation.json';
import enExport from './i18n/locales/en/export.json';
import enIncome from './i18n/locales/en/income.json';

i18n.use(initReactI18next).init({
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
  },
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: ['common', 'debts', 'payoff', 'charts', 'settings', 'timeline', 'documentation', 'export', 'income'],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
