// src/app/(main)/account/DownloadButton.tsx
'use client';

import { useTransition } from 'react';
import toast from 'react-hot-toast';
import { getSecureDownloadUrlAction } from '@/app/actions/downloadActions';
import { DownloadIcon } from '@/components/icons';

export default function DownloadButton({ fontId }: { fontId: string }) {
    const [isDownloading, startTransition] = useTransition();

    const handleDownload = () => {
        startTransition(async () => {
            toast.loading('Preparing download...');
            const result = await getSecureDownloadUrlAction(fontId);
            toast.dismiss();

            if (result.error) {
                toast.error(result.error);
            } else if (result.url) {
                // Membuat link tak terlihat dan mengkliknya untuk memulai download
                const link = document.createElement('a');
                link.href = result.url;
                link.target = '_blank'; // Buka di tab baru untuk keamanan
                link.rel = 'noopener noreferrer';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("Your download will begin shortly!");
            }
        });
    };

    return (
        <button 
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-brand-orange text-white text-sm font-medium rounded-full hover:bg-brand-orange-hover transition-colors disabled:opacity-50"
        >
            <DownloadIcon className="w-4 h-4" />
            <span>{isDownloading ? 'Preparing...' : 'Download'}</span>
        </button>
    );
};
