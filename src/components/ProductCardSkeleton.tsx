export default function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-line rounded-sm overflow-hidden">
      <div className="tag-perforation" />
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="skeleton h-3 w-20 rounded-sm" />
          <div className="skeleton h-3 w-12 rounded-sm" />
        </div>
        <div className="skeleton h-4 w-full rounded-sm" />
        <div className="skeleton h-4 w-2/3 rounded-sm" />
        <div className="flex items-center justify-between pt-1">
          <div className="skeleton h-5 w-24 rounded-sm" />
          <div className="skeleton h-3 w-14 rounded-sm" />
        </div>
      </div>
    </div>
  );
}
