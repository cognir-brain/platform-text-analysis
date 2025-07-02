// src/components/history/empty-state.jsx
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

export function EmptyHistoryState() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
            <div className="mb-8">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-2xl font-bold mb-2">No Analysis History Yet</h1>
                <p className="text-muted-foreground mb-8">
                    Start your first text analysis to see your conversation history here
                </p>

                <Link
                    href="/analysis"
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    Start New Analysis
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 text-left">
                <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">📊 Sentiment Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                        Analyze the emotional tone of your text
                    </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-2">📝 Text Summary</h3>
                    <p className="text-sm text-muted-foreground">
                        Get concise summaries of long texts
                    </p>
                </div>
            </div>
        </div>
    );
}