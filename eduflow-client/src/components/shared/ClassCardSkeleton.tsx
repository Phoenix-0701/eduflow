export default function ClassCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col h-[200px] animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-full">
          {/* Badge Skeleton */}
          <div className="w-16 h-6 bg-surface-variant rounded mb-3"></div>
          {/* Title Skeleton */}
          <div className="w-3/4 h-6 bg-surface-variant rounded mb-2"></div>
          <div className="w-1/2 h-4 bg-surface-variant rounded"></div>
        </div>
        {/* Menu Button Skeleton */}
        <div className="w-8 h-8 bg-surface-variant rounded-md"></div>
      </div>
      <div className="mt-auto grid grid-cols-2 gap-4 border-t border-outline-variant pt-4">
        <div>
          <div className="w-16 h-3 bg-surface-variant rounded mb-2"></div>
          <div className="w-10 h-5 bg-surface-variant rounded"></div>
        </div>
        <div>
          <div className="w-16 h-3 bg-surface-variant rounded mb-2"></div>
          <div className="w-10 h-5 bg-surface-variant rounded"></div>
        </div>
      </div>
    </div>
  );
}
