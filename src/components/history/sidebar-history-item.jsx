'use client';

import { memo } from 'react';
import Link from 'next/link';
import { MoreHorizontalIcon, TrashIcon } from 'lucide-react';
import {
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar-chat';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar-chat';

const PureAnalysisItem = ({
    analysis,
    isActive,
    onDelete,
}) => {
    const { setOpenMobile } = useSidebar();

    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link
                    href={`/history/${analysis.id}`}
                    onClick={() => setOpenMobile(false)}
                >
                    <span className="truncate">
                        {analysis.question && analysis.question.length > 50
                            ? `${analysis.question.substring(0, 50)}...`
                            : analysis.question || 'Untitled Analysis'
                        }
                    </span>
                </Link>
            </SidebarMenuButton>

            <DropdownMenu modal={true}>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuAction
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
                        showOnHover={!isActive}
                    >
                        <MoreHorizontalIcon size={16} />
                        <span className="sr-only">More</span>
                    </SidebarMenuAction>
                </DropdownMenuTrigger>

                <DropdownMenuContent side="bottom" align="end">
                    <DropdownMenuItem
                        className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
                        onSelect={() => onDelete(analysis.id)}
                    >
                        <TrashIcon size={16} />
                        <span>Delete</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    );
};

export const AnalysisItem = memo(PureAnalysisItem, (prevProps, nextProps) => {
    if (prevProps.isActive !== nextProps.isActive) return false;
    return true;
});