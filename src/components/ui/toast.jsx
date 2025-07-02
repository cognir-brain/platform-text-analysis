// src/components/ui/toast.jsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export function Toast({ message, type = 'info', duration = 3000, onClose }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: CheckCircle,
        error: XCircle,
        info: Info,
    };

    const colors = {
        success: 'bg-green-50 border-green-200 text-green-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const Icon = icons[type];

    return (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
            <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${colors[type]} shadow-lg`}>
                <Icon size={20} />
                <span className="text-sm font-medium">{message}</span>
            </div>
        </div>
    );
}