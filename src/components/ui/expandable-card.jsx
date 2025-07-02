'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Maximize2 } from 'lucide-react';
/**
 * ExpandableCard Component
 * 
 * Komponen reusable card dengan fitur expand ke dialog fullscreen
 * 
 * @param {string} title - Judul card
 * @param {ReactNode} content - Konten normal card
 * @param {ReactNode} expandedContent - Konten saat dialog expanded
 * @param {boolean} fullWidth - Opsi untuk mengatur lebar card (untuk grid layouts)
 */
const ExpandableCard = ({ title, content, expandedContent, fullWidth = false }) => {
    return (
        <div className={`bg-white p-4 rounded-xl border border-gray-200 transition-shadow ${fullWidth ? 'md:col-span-2' : ''}`}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <Dialog.Root>
                    <Dialog.Trigger asChild>
                        <button className="text-cyan-600 hover:text-cyan-700 text-sm font-medium flex items-center px-2 py-1 rounded-md hover:bg-cyan-50 transition-colors">
                            <Maximize2 size={16} />
                        </button>
                    </Dialog.Trigger>

                    <Dialog.Portal>
                        <Dialog.Overlay className="bg-gray-900/60 z-50 fixed inset-0 backdrop-blur-sm" />
                        <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-auto">
                            <div className="flex justify-between items-center mb-4 border-b pb-3">
                                <Dialog.Title className="text-xl font-bold text-gray-800">{title}</Dialog.Title>
                                <Dialog.Close asChild>
                                    <button className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-full transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </Dialog.Close>
                            </div>
                            <div className="mt-4">
                                {expandedContent}
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>
            </div>
            <div className="mt-2">
                {content}
            </div>
        </div>
    );
};

export { ExpandableCard };