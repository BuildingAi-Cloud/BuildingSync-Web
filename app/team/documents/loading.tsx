import { Skeleton, SkeletonRow } from "@/components/Skeleton";

export default function DocumentsLoading() {
  return (
    <main className="px-4 md:px-6 py-8 md:py-10 max-w-5xl mx-auto">
      <Skeleton className="h-9 w-40" />
      <Skeleton className="mt-1 h-3 w-2/3" />
      <Skeleton className="mt-8 h-56 rounded-md" />
      <div className="mt-10 space-y-2">
        <Skeleton className="h-3 w-32 mb-3" />
        {Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} height="h-20" />)}
      </div>
    </main>
  );
}
