import type { ReactNode } from 'react';
import MobilePullToRefresh from '@/components/mobile-pull-to-refresh';
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
            data-store-layout-root
            className={cn(
                'relative min-h-screen overflow-x-clip bg-[#030712] text-slate-100',
                className,
            )}
        >
            <div className="store-performance-glow pointer-events-none absolute top-24 -left-16 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
            <div className="store-performance-glow pointer-events-none absolute top-44 right-0 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

            <MobilePullToRefresh />
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
