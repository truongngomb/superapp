import { useCallback, useMemo, useState, useRef } from 'react';
import { useOnClickOutside } from '@superapp/core-logic';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';
import { Button } from './index';

const LANGUAGES = {
  vi: { flag: 'vn', name: 'Tiếng Việt' },
  en: { flag: 'gb', name: 'English' },
  ko: { flag: 'kr', name: '한국어' },
} as const;

type LangCode = keyof typeof LANGUAGES;

const LANG_ORDER: LangCode[] = ['vi', 'en', 'ko'];
const DEFAULT_LANG: LangCode = 'en';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
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
  useOnClickOutside(dropdownRef, () => {
    if (isOpen) setIsOpen(false);
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => { setIsOpen(!isOpen); }}
        className={cn('flex items-center gap-1', className || 'hover:bg-surface')}
        aria-label={t('actions_menu.change_language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={`fi fi-${currentLang.flag} text-lg`} />
        <ChevronDown className={`w-3 h-3 text-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

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
                <Button
                  key={langCode}
                  variant="ghost"
                  size="sm"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => { handleSelect(langCode); }}
                  className={cn(
                    'w-full justify-start gap-2',
                    isActive ? 'bg-primary/10 text-primary' : 'text-foreground'
                  )}
                >
                  <span className={`fi fi-${lang.flag}`} />
                  <span>{lang.name}</span>
                </Button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

