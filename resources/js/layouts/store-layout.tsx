import type { ReactNode } from 'react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';
import { cn } from '@/lib/utils';

interface StoreLayoutProps {
    children: ReactNode;
    canRegister?: boolean;
    className?: string;
    contentClassName?: string;
    footerClassName?: string;
}

export default function StoreLayout({
    children,
    canRegister = true,
    className,
    contentClassName,
    footerClassName,
}: StoreLayoutProps) {
    return (
        <div
            className={cn(
                'relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100',
                className,
            )}
        >
            <div className="pointer-events-none absolute -left-16 top-24 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

            <StoreHeader canRegister={canRegister} />

            <main
                className={cn(
                    'mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12',
                    contentClassName,
                )}
            >
                {children}
            </main>

            <StoreFooter className={footerClassName} />
        </div>
    );
}
