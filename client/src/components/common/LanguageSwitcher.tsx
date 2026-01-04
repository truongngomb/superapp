import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const LANGUAGES = {
  vi: { flag: 'vn', name: 'Tiếng Việt' },
  en: { flag: 'gb', name: 'English' },
  ko: { flag: 'kr', name: '한국어' },
} as const;

type LangCode = keyof typeof LANGUAGES;

const LANG_ORDER: LangCode[] = ['vi', 'en', 'ko'];
const DEFAULT_LANG: LangCode = 'en';

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLangCode = useMemo(() => 
    (i18n.language in LANGUAGES ? i18n.language : DEFAULT_LANG) as LangCode,
    [i18n.language]
  );

  const currentLang = LANGUAGES[currentLangCode];

  const handleSelect = useCallback((langCode: LangCode) => {
    void i18n.changeLanguage(langCode);
    setIsOpen(false);
  }, [i18n]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(!isOpen); }}
        className="p-2 rounded-lg hover:bg-surface transition-colors flex items-center gap-1"
        aria-label={t('actions_menu.change_language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`fi fi-${currentLang.flag} text-lg`} />
        <ChevronDown className={`w-3 h-3 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-1 py-1 w-36 bg-background rounded-lg shadow-lg border border-border z-50"
            role="listbox"
          >
            {LANG_ORDER.map((langCode) => {
              const lang = LANGUAGES[langCode];
              const isActive = langCode === currentLangCode;
              return (
                <button
                  key={langCode}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { handleSelect(langCode); }}
                  className={`w-full px-3 py-2 flex items-center gap-2 text-sm transition-colors
                    ${isActive ? 'bg-primary/10 text-primary' : 'hover:bg-surface text-foreground'}`}
                >
                  <span className={`fi fi-${lang.flag}`} />
                  <span>{lang.name}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

