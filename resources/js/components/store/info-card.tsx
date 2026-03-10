import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InfoCardProps = {
    label: ReactNode;
    value: ReactNode;
    description?: ReactNode;
    className?: string;
    labelClassName?: string;
    valueClassName?: string;
};

export default function InfoCard({
    label,
    value,
    description,
    className,
    labelClassName,
    valueClassName,
}: InfoCardProps) {
    return (
        <div className={cn('rounded-2xl border border-white/10 bg-[#0a1322] p-4', className)}>
            <p
                className={cn(
                    'text-xs uppercase tracking-[0.14em] text-slate-400',
                    labelClassName,
                )}
            >
                {label}
            </p>
            <div className={cn('mt-2 text-2xl font-bold text-white', valueClassName)}>
                {value}
            </div>
            {description ? (
                <div className="mt-2 text-sm text-slate-300">{description}</div>
            ) : null}
        </div>
    );
}
