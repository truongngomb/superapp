import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'vi' ? 'en' : 'vi';
    void i18n.changeLanguage(newLang);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleLanguage}
      className="p-2 rounded-lg hover:bg-surface transition-colors flex items-center gap-2"
      aria-label="Switch language"
      title={i18n.language === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
    >
      <Globe className="w-5 h-5 text-muted" />
      <span className="text-sm font-medium text-muted uppercase">
        {i18n.language === 'vi' ? 'VI' : 'EN'}
      </span>
    </motion.button>
  );
}
