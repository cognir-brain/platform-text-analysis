// src/components/history/loading-skeleton.jsx
export function HistoryLoadingSkeleton() {
    return (
        <div className="container mx-auto px-4 py-6 max-w-4xl">
            <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-card border rounded-lg p-6 animate-pulse">
                        <div className="flex justify-between mb-4">
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-4"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded w-full mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}