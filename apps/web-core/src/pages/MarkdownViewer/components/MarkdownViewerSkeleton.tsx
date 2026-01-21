import { Skeleton } from '@superapp/ui-kit';

export const MarkdownViewerSkeleton = () => {
  return (
    <div className="container py-8 max-w-6xl mx-auto px-4">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-9 space-y-6">
          {/* Cover Image Skeleton */}
          <div className="mb-0 rounded-xl overflow-hidden aspect-video max-h-[400px]">
            <Skeleton className="w-full h-full" />
          </div>

          {/* Header Section */}
          <div className="space-y-4 border-b pb-6">
            <Skeleton className="h-10 md:h-12 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-6 w-full" />
          </div>

          {/* Article Content Simulation */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-64 w-full rounded-lg my-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>

        {/* Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
