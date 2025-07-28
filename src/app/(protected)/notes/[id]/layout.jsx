'use client';

import { usePathname } from 'next/navigation';
import { NotesSidebar } from '@/components/notes-sidebar';
import { useAuth } from '@/context/authContext';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

export default function NotesLayout({ children }) {
    const { session, user } = useAuth();
    const pathname = usePathname();

    // Get page title based on current route
    const getPageTitle = () => {
        if (pathname.includes('/chat')) return 'Chat Bot';
        if (pathname.includes('/flashcards')) return 'Flashcards';
        if (pathname.includes('/quiz')) return 'Quiz';
        if (pathname.includes('/transcript')) return 'Transcript';
        return 'Notes';
    };

    // Get breadcrumbs for notes pages
    const getBreadcrumbs = () => {
        const breadcrumbs = [];

        // Always start with Dashboard
        breadcrumbs.push({
            href: '/',
            label: 'Dashboard'
        });

        // Add AI Notes
        breadcrumbs.push({
            href: '/notes',
            label: 'AI Notes'
        });

        // Extract note ID from path
        const pathParts = pathname.split('/');
        if (pathParts.length >= 3 && pathParts[2]) {
            const noteId = pathParts[2];

            // Add current note
            breadcrumbs.push({
                href: `/notes/${noteId}`,
                label: 'Notes'
            });
        }

        return breadcrumbs;
    };

    const pageTitle = getPageTitle();
    const breadcrumbs = getBreadcrumbs();

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Notes Sidebar */}
            <NotesSidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex h-16 shrink-0 bg-white border-b border-gray-200 items-center gap-2">
                    <div className="flex items-center gap-2 px-6 flex-1">
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={index} className="flex items-center">
                                        <BreadcrumbItem>
                                            <BreadcrumbLink
                                                href={breadcrumb.href}
                                                className="text-gray-600 hover:text-gray-900"
                                            >
                                                {breadcrumb.label}
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="mx-2" />
                                    </div>
                                ))}

                                <BreadcrumbItem>
                                    <BreadcrumbPage className="font-medium text-gray-900">
                                        {pageTitle}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Optional header actions */}
                    <div className="flex items-center gap-2 px-6">
                        <div className="text-xs text-gray-500">
                            {user?.email}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-auto p-6 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}
