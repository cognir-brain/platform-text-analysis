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

    // Simple page title logic
    const getPageTitle = () => {
        if (pathname === '/analysis') return 'Text Analysis';
        if (pathname === '/history') return 'Analysis History';
        if (pathname.startsWith('/history/')) return 'View Analysis';
        return 'Text Analysis';
    };

    const isHomePage = pathname === '/analysis';
    const pageTitle = getPageTitle();

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
                                {!isHomePage && (
                                    <>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="/analysis">
                                                Cognir AI
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                    </>
                                )}

                                {pathname.startsWith('/history/') && (
                                    <>
                                        <BreadcrumbItem className="hidden md:block">
                                            <BreadcrumbLink href="/history">
                                                History
                                            </BreadcrumbLink>
                                        </BreadcrumbItem>
                                        <BreadcrumbSeparator className="hidden md:block" />
                                    </>
                                )}

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