import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/utils';

type BuildCardProps = {
    title: ReactNode;
    description?: ReactNode;
    media: ReactNode;
    topSlot?: ReactNode;
    children?: ReactNode;
    mediaRef?: Ref<HTMLDivElement>;
    className?: string;
    titleClassName?: string;
    bodyClassName?: string;
};

export default function BuildCard({
    title,
    description,
    media,
    topSlot,
    children,
    mediaRef,
    className,
    titleClassName,
    bodyClassName,
}: BuildCardProps) {
    return (
        <article
            className={cn(
                'rounded-2xl border border-white/12 bg-[#0a1019]/95 shadow-[0_12px_36px_rgba(0,0,0,0.5)]',
                className,
            )}
        >
            <div className="flex h-full flex-col p-4">
                {topSlot}

                <div
                    ref={mediaRef}
                    className={cn(topSlot ? 'mt-3' : '', bodyClassName)}
                >
                    {media}
                </div>

                <h3
                    className={cn(
                        'mt-4 text-2xl font-black text-white',
                        titleClassName,
                    )}
                >
                    {title}
                </h3>

                {description ? (
                    <div className="mt-3 text-sm leading-relaxed text-slate-300">
                        {description}
                    </div>
                ) : null}

                {children ? (
                    <div className="mt-auto pt-4">{children}</div>
                ) : null}
            </div>
        </article>
    );
}
