'use client';

import * as React from 'react';
import { History, MessageCirclePlus, LogOut, Plus } from 'lucide-react';
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
                                            <img src="/img/logo.png" alt="logo" className="h-5 w-5 shrink-0" />                                    </div>
                                        <div className="grid flex-1 text-left text-sm leading-tight">
                                            <span className="truncate font-semibold">Cognir AI</span>
                                            <span className="truncate text-xs">Text Analysis Platform</span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={handleNewChat}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent align="end">New Analysis</TooltipContent>
                                </Tooltip>
                            </div>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                <SidebarMenuItem>
                                    <SidebarMenuButton asChild>
                                        <Link
                                            href="/analysis"
                                            onClick={() => setOpenMobile(false)}
                                        >
                                            <MessageCirclePlus />
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
                                            <History />
                                            <span>Analysis History</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    {/* History Section */}
                    <SidebarHistory user={user} />
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