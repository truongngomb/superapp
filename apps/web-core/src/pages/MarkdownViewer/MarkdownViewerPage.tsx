import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  MarkdownRenderer, 
  TableOfContents, 
  Skeleton, 
  Card,
  CardContent
} from '@superapp/ui-kit';
import { markdownService } from '@/services';
import { MarkdownPage } from '@superapp/shared-types';
import { Calendar, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common';
import { env } from '@/config';

export default function MarkdownViewerPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<MarkdownPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { t } = useTranslation();

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

  useEffect(() => {
    if (page) {
      document.title = `${page.title} | SuperApp`;
    }
  }, [page]);

  if (loading) {
    return (
      <div className="container py-8 max-w-5xl mx-auto space-y-8 animate-pulse">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
           <div className="lg:col-span-3 space-y-4">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-3/4" />
           </div>
           <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="container py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted mb-8">{t('common:error.page_not_found', 'Page Not Found')}</p>
        <Button onClick={() => { window.history.back(); }} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common:action.back', 'Go Back')}
        </Button>
      </div>
    );
  }

  return (
    <>

      <div className="container py-8 max-w-6xl mx-auto px-4">
         {/* Cover Image */}
         {page.coverImage && (
           <div className="mb-8 rounded-xl overflow-hidden shadow-lg aspect-video max-h-[400px] bg-muted">
             <img
               src={`${env.API_BASE_URL}/api/files/markdown_pages/${page.id}/${page.coverImage}`}
               alt={page.title}
               className="w-full h-full object-cover"
             />
           </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           {/* Main Content */}
           <div className="lg:col-span-9 space-y-6">
             {/* Header */}
             <div className="space-y-4 border-b pb-6">
               <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">{page.title}</h1>
               
               <div className="flex items-center gap-4 text-sm text-muted">
                 <div className="flex items-center gap-1">
                   <Calendar className="w-4 h-4" />
                   {new Date(page.created).toLocaleDateString()}
                 </div>
                 {page.updated !== page.created && (
                   <div className="flex items-center gap-1" title="Last updated">
                     <Clock className="w-4 h-4" />
                     {new Date(page.updated).toLocaleDateString()}
                   </div>
                 )}
               </div>
               
               {page.excerpt && (
                 <p className="text-xl text-muted-foreground leading-relaxed">{page.excerpt}</p>
               )}
             </div>

             {/* Markdown Content */}
             <article className="min-h-[300px]">
               <MarkdownRenderer content={page.content} />
             </article>
           </div>

           {/* Sidebar: Table of Contents */}
           <div className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24 space-y-6">
               <Card className="border-none shadow-none bg-transparent">
                 <CardContent className="p-0">
                    <TableOfContents content={page.content} />
                 </CardContent>
               </Card>
             </div>
           </div>
         </div>
      </div>
    </>
  );
}
