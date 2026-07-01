import { FilterSidebar } from "@/components/FilterSidebar";

export default function LoadingPrograms() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Sidebar Skeleton */}
        <aside className="w-full md:w-64 shrink-0 animate-pulse">
          <div className="h-10 bg-bg-surface border border-border rounded-xl mb-4 w-full md:hidden"></div>
          <div className="hidden md:block space-y-6">
            <div className="h-6 bg-border/50 rounded w-1/3 mb-4"></div>
            <div className="h-10 bg-bg-surface border border-border rounded-lg"></div>
            <hr className="border-border/50" />
            <div className="h-6 bg-border/50 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-bg-surface border border-border rounded-lg"></div>
            <hr className="border-border/50" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-3 items-center">
                  <div className="w-5 h-5 rounded-full bg-border/50"></div>
                  <div className="h-4 bg-border/50 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content Area Skeleton */}
        <div className="flex-1 w-full animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-8 bg-border/50 rounded w-48"></div>
            <div className="h-8 bg-border/50 rounded w-24"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[360px] rounded-2xl bg-bg-surface border border-border flex flex-col overflow-hidden">
                <div className="h-48 bg-border/30 w-full shrink-0"></div>
                <div className="p-5 flex flex-col flex-1 gap-3">
                  <div className="h-3 bg-border/50 rounded w-1/3"></div>
                  <div className="h-5 bg-border/50 rounded w-3/4 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4 mt-auto">
                    <div className="h-3 bg-border/30 rounded w-full"></div>
                    <div className="h-3 bg-border/30 rounded w-full"></div>
                    <div className="h-3 bg-border/30 rounded w-full"></div>
                    <div className="h-3 bg-border/30 rounded w-full"></div>
                  </div>
                </div>
                <div className="h-12 bg-border/20 border-t border-border mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
