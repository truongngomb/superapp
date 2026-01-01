import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LANGUAGES = {
  vi: { flag: 'vn', name: 'Tiếng Việt' },
  en: { flag: 'gb', name: 'English' },
} as const;

type LangCode = keyof typeof LANGUAGES;

const DEFAULT_LANG: LangCode = 'en';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const currentLangCode = (i18n.language in LANGUAGES ? i18n.language : DEFAULT_LANG) as LangCode;

  const { currentLang, targetLang, targetLangCode } = useMemo(() => ({
    currentLang: LANGUAGES[currentLangCode],
    targetLangCode: currentLangCode === 'vi' ? 'en' : 'vi',
    targetLang: LANGUAGES[currentLangCode === 'vi' ? 'en' : 'vi'],
  }), [currentLangCode]);

  const toggleLanguage = useCallback(() => {
    void i18n.changeLanguage(targetLangCode);
  }, [i18n, targetLangCode]);

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="p-2 rounded-lg hover:bg-surface transition-colors flex items-center"
      aria-label={`Switch to ${targetLang.name}`}
      title={`Switch to ${targetLang.name}`}
    >
      <span className={`fi fi-${currentLang.flag} text-lg`} />
    </motion.button>
  );
}
