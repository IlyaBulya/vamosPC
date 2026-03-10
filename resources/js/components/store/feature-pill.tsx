import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FeaturePillProps = {
    children: ReactNode;
    dotClassName?: string;
    className?: string;
};

export default function FeaturePill({
    children,
    dotClassName,
    className,
}: FeaturePillProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-2 text-sm text-[#9cf5d8]',
                className,
            )}
        >
            <span className={cn('h-2.5 w-2.5 rounded-full bg-[#00bd7d]', dotClassName)} />
            {children}
        </span>
    );
}
