import { useLanguageStore } from '@/store/useLanguageStore';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  es: 'es-US',
};

export function useLocale(): string {
  const language = useLanguageStore((s) => s.language);
  return LOCALE_MAP[language] ?? /* istanbul ignore next */ 'en-US';
}
