'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import {
    FileText,
    MessageCircle,
    CreditCard,
    HelpCircle,
    FileAudio,
    ArrowLeft,
    Home,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { notesService } from '@/lib/notesService';

const sidebarItems = [
    {
        title: 'Notes',
        icon: FileText,
        href: '/notes/[id]',
        description: 'View AI-generated notes'
    },
    {
        title: 'Chatbot',
        icon: MessageCircle,
        href: '/notes/[id]/chat',
        description: 'Chat with your notes'
    },
    {
        title: 'Flashcard',
        icon: CreditCard,
        href: '/notes/[id]/flashcards',
        description: 'Study with flashcards'
    },
    {
        title: 'Quiz',
        icon: HelpCircle,
        href: '/notes/[id]/quiz',
        description: 'Test your knowledge'
    },
    {
        title: 'Transkrip',
        icon: FileAudio,
        href: '/notes/[id]/transcript',
        description: 'View original transcript'
    }
];

export function NotesSidebar() {
    const params = useParams();
    const router = useRouter();
    const pathname = usePathname();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchNote();
        }
    }, [params.id]);

    const fetchNote = async () => {
        try {
            setLoading(true);
            const result = await notesService.getNote(params.id);
            if (result.success) {
                setNote(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch note:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackToDashboard = () => {
        router.push('/');
    };

    const getActiveHref = (href) => {
        return href.replace('[id]', params.id);
    };

    const isActive = (href) => {
        const actualHref = getActiveHref(href);
        return pathname === actualHref;
    };

    const getSourceIcon = (sourceType) => {
        switch (sourceType) {
            case 'youtube':
                return '🎥';
            case 'file':
                return '📄';
            default:
                return '🌐';
        }
    };

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
            {/* Header */}
            <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4">
                <button
                    onClick={handleBackToDashboard}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                </button>
            </div>

            {/* Note Info */}
            <div className="border-b border-gray-200 p-4">
                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ) : note ? (
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getSourceIcon(note.source_type)}</span>
                            <h3 className="font-medium text-gray-900 text-sm truncate">
                                {note.ai_generated_data?.title || note.title || `Note ${note.id}`}
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                            {note.source_type === 'youtube' && note.file_metadata?.title
                                ? note.file_metadata.title
                                : note.source_type === 'file' && note.file_metadata?.filename
                                    ? note.file_metadata.filename
                                    : `${note.source_type} content`
                            }
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            {new Date(note.created_at).toLocaleDateString('id-ID')}
                        </p>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">Note not found</div>
                )}
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-3 py-4">
                <ul className="space-y-2">
                    {sidebarItems.map((item) => {
                        const href = getActiveHref(item.href);
                        const active = isActive(item.href);

                        return (
                            <li key={item.title}>
                                <Link
                                    href={href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                        active
                                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "h-4 w-4",
                                        active ? "text-blue-600" : "text-gray-500"
                                    )} />
                                    <span>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer Actions */}
            <div className="border-t border-gray-200 p-4">
                <div className="text-xs text-gray-500 mb-2">Quick Actions</div>
                <div className="space-y-2">
                    <button
                        onClick={handleBackToDashboard}
                        className="w-full flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="h-3 w-3" />
                        <span>Back to Dashboard</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default NotesSidebar;
