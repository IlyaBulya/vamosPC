import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral';

const variantClasses: Record<StatusVariant, string> = {
    success: 'border-[#00bd7d]/50 bg-[#00bd7d]/12 text-[#9cf5d8]',
    warning: 'border-amber-400/45 bg-amber-400/10 text-amber-300',
    danger: 'border-red-400/50 bg-red-500/10 text-red-300',
    neutral: 'border-white/20 bg-white/5 text-slate-200',
};

type StatusBadgeProps = {
    children: ReactNode;
    variant?: StatusVariant;
    className?: string;
};

export default function StatusBadge({
    children,
    variant = 'neutral',
    className,
}: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold',
                variantClasses[variant],
                className,
            )}
        >
            {children}
        </span>
    );
}
