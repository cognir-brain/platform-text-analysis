"use client";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar-chat";
import { AppSidebar } from "@/components/app-sidebar";
import { SearchHistoryDialog } from "@/components/history/search-history-dialog";
import { useAuth } from "@/context/authContext";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function ProtectedLayout({ children }) {
    const { session, user } = useAuth();
    const pathname = usePathname();

    // Enhanced page title logic with AI Notes support
    const getPageTitle = () => {
        if (pathname === '/analysis') return 'Text Analysis';
        if (pathname === '/history') return 'Analysis History';
        if (pathname.startsWith('/history/')) return 'View Analysis';

        // AI Notes routes
        if (pathname === '/notes') return 'AI Notes';
        if (pathname === '/notes/history') return 'Notes History';
        if (pathname.startsWith('/notes/') && pathname.includes('/chatbot')) return 'Chat Bot';
        if (pathname.startsWith('/notes/') && pathname.includes('/flashcard')) return 'Flashcard';
        if (pathname.startsWith('/notes/') && pathname.includes('/quiz')) return 'Quiz';
        if (pathname.startsWith('/notes/') && pathname.includes('/transcript')) return 'Transcript';
        if (pathname.startsWith('/notes/') && !pathname.includes('/')) return 'View Notes';

        return 'Dashboard';
    };

    // Enhanced breadcrumb logic
    const getBreadcrumbs = () => {
        const breadcrumbs = [];

        // Notes routes
        if (pathname.startsWith('/notes/history')) {
            breadcrumbs.push({
                href: '/notes',
                label: 'AI Notes'
            });
            breadcrumbs.push({
                href: '/notes/history',
                label: 'Notes History'
            });
        } else if (pathname.startsWith('/notes/') && pathname !== '/notes') {
            // For individual note pages
            breadcrumbs.push({
                href: '/notes',
                label: 'AI Notes'
            });

            // Extract note ID for note-specific pages
            const pathParts = pathname.split('/');
            if (pathParts.length >= 3 && pathParts[2]) {
                const noteId = pathParts[2];
                breadcrumbs.push({
                    href: `/notes/${noteId}`,
                    label: 'Notes'
                });
            }
        }

        return breadcrumbs;
    };

    const pageTitle = getPageTitle();
    const breadcrumbs = getBreadcrumbs();

    return (
        <SidebarProvider>
            <AppSidebar user={user || session?.user} />
            <SidebarInset>
                <header className="flex h-16 shrink-0 bg-gray-50 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4 flex-1">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((breadcrumb, index) => (
                                    <div key={index} className="flex items-center">
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href={breadcrumb.href}>
                                                {breadcrumb.label}
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                    </div>
                                ))}

                                <BreadcrumbItem>
                                    <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-2 px-4">
                        <SearchHistoryDialog />
                    </div>
                </header>
                <main className="flex flex-1 flex-col gap-4 pt-0 p-4 bg-gray-50">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}