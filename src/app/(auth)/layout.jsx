import Link from 'next/link';

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-md lg:w-[450px]">
                    {/* Logo and Home Link */}
                    <div className="mb-8">
                        <Link href="/" className="flex items-center space-x-2 text-gray-900 hover:underline transition-colors">
                            <div className="w-8 h-8 border border-gray-400 rounded-lg flex items-center justify-center">
                                <img src="/img/logo.png" alt="logo" className="h-5 w-5 shrink-0" />
                            </div>
                            <span className="text-xl font-semibold">Back to home</span>
                        </Link>
                    </div>

                    {title && (
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-2 text-sm text-gray-600">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    <div className="space-y-6">
                        {children}
                    </div>
                </div>
            </div>

            {/* Right side - Image/Decoration */}
            <div className="hidden lg:block relative flex-1" style={{ backgroundImage: 'url(/img/moon-4.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white p-8">
                        <div className="w-32 h-32 mx-auto mb-8 bg-white/15 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Welcome to Cognirize</h3>
                        <p className="text-lg opacity-90 max-w-md">
                            Unlock the power of AI-driven insights and transform your data into actionable intelligence.
                        </p>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl" />
                    <div className="absolute bottom-20 right-20 w-48 h-48 bg-white/5 rounded-full blur-xl" />
                    <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg" />
                    <div className="absolute bottom-1/3 left-1/3 w-16 h-16 bg-white/10 rounded-full blur-md" />
                </div>
            </div>
        </div>
    );
}
