'use client';

import * as React from 'react';
import {
    Bot,
    CreditCard,
    HelpCircle,
    FileText as Transcript,
    FileText,
    ArrowLeft,
    Home
} from 'lucide-react';
import Link from 'next/link';
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    useSidebar
} from '@/components/ui/sidebar-chat';

export function SidebarNotes({ noteId, noteTitle, user, ...props }) {
    const { setOpenMobile } = useSidebar();

    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link
                                href="/notes"
                                onClick={() => setOpenMobile(false)}
                                className="flex items-center gap-3"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <img src="/img/logo.png" alt="logo" className="h-5 w-5 shrink-0" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">AI Notes</span>
                                    <span className="truncate text-xs">{noteTitle}</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Back to Dashboard */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href="/notes"
                                        onClick={() => setOpenMobile(false)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        <span>Back to Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                {/* Notes Tools */}
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href={`/notes/${noteId}`}
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <FileText className="h-4 w-4" />
                                        <span>Notes</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href={`/notes/${noteId}/chatbot`}
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <Bot className="h-4 w-4" />
                                        <span>Chat Bot</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href={`/notes/${noteId}/flashcard`}
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <CreditCard className="h-4 w-4" />
                                        <span>Flashcard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href={`/notes/${noteId}/quiz`}
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <HelpCircle className="h-4 w-4" />
                                        <span>Quiz</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link
                                        href={`/notes/${noteId}/transcript`}
                                        onClick={() => setOpenMobile(false)}
                                    >
                                        <Transcript className="h-4 w-4" />
                                        <span>Transcript</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                {/* User profile same as main sidebar */}
                {/* ...copy user profile section from main sidebar... */}
            </SidebarFooter>
        </Sidebar>
    );
}