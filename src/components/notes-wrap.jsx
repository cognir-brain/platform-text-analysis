'use client'

import { RecentNotes } from '@/components/recent-notes';

export default function NotesPageWrapper() {
    return (
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto mt-12 mb-8">
                <RecentNotes />
            </div>
        </div>
    );
}