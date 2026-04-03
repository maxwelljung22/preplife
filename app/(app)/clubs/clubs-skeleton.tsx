// app/(app)/clubs/clubs-skeleton.tsx
export function ClubsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-3 w-40 bg-muted rounded mb-4" />
        <div className="h-9 w-64 bg-muted rounded-lg mb-2" />
        <div className="h-4 w-80 bg-muted rounded" />
      </div>
      <div className="flex gap-2 flex-wrap">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-20 bg-muted rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="h-[108px] bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 bg-muted rounded" />
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
            </div>
            <div className="px-4 py-3 border-t border-border flex justify-between items-center">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-8 w-16 bg-muted rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
