'use client';

import * as React from 'react';
import {
    History,
    MessageCirclePlus,
    LogOut,
    Plus,
    ChevronDown,
    ChevronRight,
    FileText,
    MessageSquare,
    Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/authContext';
import Image from 'next/image';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar-chat';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { SidebarHistory } from './history/sidebar-history';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function AppSidebar({ user, ...props }) {
    const { signOut } = useAuth();
    const router = useRouter();
    const { setOpenMobile } = useSidebar();
    const [showLogoutDialog, setShowLogoutDialog] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);
    const [expandedSections, setExpandedSections] = React.useState({
        textAnalysis: true,
        aiNotes: true,
        recent: true
    });
    const [recentTab, setRecentTab] = React.useState('all');

    const userAvatar = user?.user_metadata?.avatar_url || null;
    const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';

    const handleSignOut = async () => {
        try {
            await signOut();
            setShowLogoutDialog(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleNewChat = () => {
        setOpenMobile(false);
        router.push('/analysis');
        router.refresh();
    };

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    return (
        <>
            <Sidebar variant="inset" {...props}>
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <div className="flex flex-row justify-between items-center">
                                <SidebarMenuButton size="lg" asChild>
                                    <Link
                                        href="/analysis"
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                            <img src="/img/logo.png" alt="logo" className="h-5 w-5 shrink-0" />
                                        </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">Cognir AI</span>
                                            <span className="truncate text-xs">AI-Powered Platform</span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push('/analysis')}>
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            New Text Analysis
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push('/notes')}>
                                            <FileText className="h-4 w-4 mr-2" />
                                            New AI Notes
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    {/* Main Menu Items */}
                    <SidebarGroup>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/analysis"
                                            onClick={() => setOpenMobile(false)}
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            <span>New Text Analysis</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/history"
                                            onClick={() => setOpenMobile(false)}
                                        >
                                            <History className="h-4 w-4" />
                                            <span>Analysis History</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/notes"
                                            onClick={() => setOpenMobile(false)}
                                        >
                                            <Sparkles className="h-4 w-4" />
                                            <span>AI Notes</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* Recent Section */}
                    <SidebarGroup>
                        <SidebarGroupLabel>
                            <button
                                onClick={() => toggleSection('recent')}
                                className="flex items-center justify-between w-full text-left hover:text-sidebar-accent-foreground"
                            >
                                <span>Recent</span>
                                {expandedSections.recent ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </button>
                        </SidebarGroupLabel>
                        {expandedSections.recent && (
                            <SidebarGroupContent>
                                <div className="flex space-x-1 mb-2">
                                    <Button
                                        variant={recentTab === 'all' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setRecentTab('all')}
                                        className="h-7 px-2 text-xs"
                                    >
                                        All
                                    </Button>
                                    <Button
                                        variant={recentTab === 'analysis' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setRecentTab('analysis')}
                                        className="h-7 px-2 text-xs"
                                    >
                                        Analysis
                                    </Button>
                                    <Button
                                        variant={recentTab === 'notes' ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setRecentTab('notes')}
                                        className="h-7 px-2 text-xs"
                                    >
                                        Notes
                                    </Button>
                                </div>
                                <SidebarHistory user={user} type={recentTab} />
                            </SidebarGroupContent>
                        )}
                    </SidebarGroup>
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <SidebarMenuButton
                                        size="lg"
                                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                    >
                                        {userAvatar && !imageError ? (
                                            <Image
                                                src={userAvatar}
                                                alt={userName}
                                                width={32}
                                                height={32}
                                                className="rounded-full object-cover"
                                                unoptimized={true}
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                                                <span className="text-sm font-medium">
                                                    {userName.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">{userName}</span>
                                            <span className="truncate text-xs">{userEmail}</span>
                                        </div>
                                    </SidebarMenuButton>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                    side="bottom"
                                    align="end"
                                    sideOffset={4}
                                >
                                    <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer">
                                        <LogOut />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
                <SidebarRail />
            </Sidebar>

            {/* Logout Confirmation Dialog */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to sign out? You'll need to sign in again to access your analysis history.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSignOut}>
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}


function LogoIcon() {
    return (
        <Link href="/" className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black">
            <img src="/img/logo.png" alt="logo" className="h-5 w-5 shrink-0" />
        </Link>
    );
}