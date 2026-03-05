import type { ReactNode } from 'react';
import StoreHeader from '@/components/store-header';
import StoreFooter from '@/components/store-footer';

interface StoreLayoutProps {
    children: ReactNode;
    canRegister?: boolean;
}

export default function StoreLayout({
    children,
    canRegister = true,
}: StoreLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <StoreHeader canRegister={canRegister} />

            <main className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                {children}
            </main>

            <StoreFooter />
        </div>
    );
}
