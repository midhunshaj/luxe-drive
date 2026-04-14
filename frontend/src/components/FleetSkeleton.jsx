const SkeletonCard = () => (
  <div className="relative bg-[#0d0d0d] border border-white/5 overflow-hidden flex flex-col md:flex-row h-auto md:h-[350px] animate-pulse">
    {/* Image placeholder */}
    <div className="md:w-1/2 h-64 md:h-full bg-white/5 relative">
      <div className="absolute top-6 left-6 h-6 w-24 bg-white/10 rounded-full" />
    </div>

    {/* Content placeholder */}
    <div className="md:w-1/2 p-6 md:p-10 flex flex-col justify-between">
      <div>
        {/* Title */}
        <div className="mb-3 md:mb-4 space-y-2">
          <div className="h-6 w-32 bg-white/10 rounded" />
          <div className="h-5 w-20 bg-luxe-gold/20 rounded" />
        </div>
        {/* Tags */}
        <div className="flex gap-4 mb-6 md:mb-8">
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {/* Price row */}
        <div className="flex items-baseline justify-between border-b border-white/5 pb-3 md:pb-4">
          <div className="h-3 w-16 bg-white/5 rounded" />
          <div className="h-6 w-28 bg-white/10 rounded" />
        </div>
        {/* Button placeholder */}
        <div className="h-12 w-full bg-white/10 rounded" />
      </div>
    </div>
  </div>
);

const FleetSkeleton = ({ count = 4 }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default FleetSkeleton;
