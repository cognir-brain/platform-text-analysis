export function SkeletonLoading() {
    return (
        <div className="grid grid-rows-3 grid-flow-col gap-4 py-4 mt-6 leading-10 max-w-6xl mx-auto">
            <div className="p-4 w-full bg-gray-300 animate-pulse rounded-xl row-span-3 h-full"></div>
            <div className="p-4 w-full bg-gray-300 animate-pulse rounded-xl col-span-2 h-10"></div>
            <div className="p-4 w-full bg-gray-300 animate-pulse rounded-xl row-span-2 col-span-2 h-full"></div>
        </div>
    );
}