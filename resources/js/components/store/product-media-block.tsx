import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ProductMediaBlockProps = {
    label?: ReactNode;
    children?: ReactNode;
    className?: string;
    innerClassName?: string;
    aspectClassName?: string;
    imageSrc?: string | null;
    imageAlt?: string;
    imageClassName?: string;
    imageLoading?: 'eager' | 'lazy';
};

export default function ProductMediaBlock({
    label = 'Product Image',
    children,
    className,
    innerClassName,
    aspectClassName,
    imageSrc,
    imageAlt = 'Product image',
    imageClassName,
    imageLoading = 'eager',
}: ProductMediaBlockProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-xl border border-white/10 bg-[#090f18] p-4',
                className,
            )}
        >
            <div className="pointer-events-none absolute top-1/2 left-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00bd7d]/30 blur-3xl" />
            <div
                className={cn(
                    'relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-[#1b2533] to-[#0a1019]',
                    aspectClassName,
                )}
            >
                {children ? (
                    children
                ) : imageSrc ? (
                    <img
                        src={imageSrc}
                        alt={imageAlt}
                        loading={imageLoading}
                        decoding="async"
                        className={cn(
                            'h-full w-full object-cover',
                            imageClassName,
                        )}
                    />
                ) : (
                    <div
                        className={cn(
                            'absolute inset-0 flex items-center justify-center text-[11px] font-semibold tracking-[0.2em] text-[#9cf5d8]/85 uppercase',
                            innerClassName,
                        )}
                    >
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
}
