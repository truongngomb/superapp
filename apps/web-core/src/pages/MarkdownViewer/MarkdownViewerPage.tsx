import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MarkdownRenderer, 
  TableOfContents, 

  Card,
  CardContent
} from '@superapp/ui-kit';
import { markdownService } from '@/services';
import { MarkdownPage } from '@superapp/shared-types';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';
import { MarkdownViewerSkeleton } from './components/MarkdownViewerSkeleton';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function MarkdownViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<MarkdownPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    async function loadPage() {
      if (!slug) return;
      
      setLoading(true);
      setError(false);
      try {
        const data = await markdownService.getBySlug(slug);
        setPage(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    void loadPage();
  }, [slug]);

  // Normalize language to match supported keys
  const getValidLang = (lang: string) => {
    const supported = ['en', 'vi', 'ko'];
    if (supported.includes(lang)) return lang;
    return supported.find(l => lang.startsWith(l)) || 'en';
  };

  const currentLang = getValidLang(i18n.language);

  // Handle Language Switch Redirect
  useEffect(() => {
    if (page && slug) {
      const targetSlug = page.translations[currentLang]?.slug;
      
      // If we have a translation for the selected language, and it differs from current slug
      if (targetSlug && targetSlug !== slug) {
         void navigate(`/pages/${targetSlug}`, { replace: true });
      }
    }
  }, [currentLang, page, slug, navigate]);

  const translations = page?.translations;
  
  // Resolution Logic: 
  // 1. Exact match for current language
  // 2. Exact match for default language (if current is missing) -- User says this is happening
  // 3. Fallback to 'en'
  // 4. First available
  const trans = translations ? (
    translations[currentLang] || 
    translations[page.defaultLanguage || 'en'] || 
    translations['en'] || 
    Object.values(translations)[0]
  ) : null;

  useEffect(() => {
    if (trans?.title) {
      document.title = `${trans.title} | SuperApp`;
    }
  }, [trans]);

  if (loading) {
    return <MarkdownViewerSkeleton />;
  }

  if (error || !page || !trans) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted mb-8">{t('uikit:page_not_found')}</p>
        <Button onClick={() => { window.history.back(); }} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('uikit:actions.back')}
        </Button>
      </div>
    );
  }

  return (
    <>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="container py-8 max-w-6xl mx-auto px-4"
      >

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Main Content */}
           <div className="lg:col-span-9 space-y-6">
             {/* Cover Image */}
             {page.coverImage && (
               <motion.div variants={itemVariants} className="mb-0 rounded-xl overflow-hidden shadow-lg aspect-video max-h-[400px] bg-muted">
                 <img
                   src={page.coverImage}
                   alt={trans.title}
                   className="w-full h-full object-contain"
                 />
               </motion.div>
             )}

             {/* Header */}
             <motion.div variants={itemVariants} className="space-y-4 border-b pb-6">
               <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{trans.title}</h1>
               
               <div className="flex items-center gap-4 text-sm text-muted">
                 <div className="flex items-center gap-1">
                   <Calendar className="w-4 h-4" />
                   {new Date(page.created).toLocaleDateString(i18n.language)}
                 </div>
                 {page.updated !== page.created && (
                   <div className="flex items-center gap-1" title={t('uikit:last_updated')}>
                     <Clock className="w-4 h-4" />
                     {new Date(page.updated).toLocaleDateString(i18n.language)}
                   </div>
                 )}
               </div>
               
               {trans.excerpt && (
                 <p className="text-xl text-muted-foreground leading-relaxed">{trans.excerpt}</p>
               )}
             </motion.div>

             {/* Markdown Content */}
             <motion.article variants={itemVariants} className="min-h-[300px]">
               <MarkdownRenderer content={trans.content} />
             </motion.article>
           </div>

           {/* Sidebar: Table of Contents */}
           <motion.div variants={itemVariants} className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24 space-y-6">
               <Card className="border-none shadow-none bg-transparent">
                 <CardContent className="p-0">
                    <TableOfContents content={trans.content} />
                 </CardContent>
               </Card>
             </div>
           </motion.div>
         </div>
      </motion.div>
    </>
  );
}
