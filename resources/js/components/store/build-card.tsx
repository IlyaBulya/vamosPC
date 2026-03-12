import type { CSSProperties, ReactNode, Ref } from 'react';
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
    descriptionClassName?: string;
    contentClassName?: string;
    footerClassName?: string;
    style?: CSSProperties;
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
    descriptionClassName,
    contentClassName,
    footerClassName,
    style,
}: BuildCardProps) {
    return (
        <article
            style={style}
            className={cn(
                'relative isolate overflow-hidden rounded-[30px] border border-white/12 bg-[#0a1019]/95 shadow-[0_12px_36px_rgba(0,0,0,0.5)]',
                className,
            )}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,189,125,0.14),transparent_38%)]" />

            <div
                className={cn(
                    'relative flex h-full w-full flex-col gap-6 p-6',
                    contentClassName,
                )}
            >
                {topSlot}

                <div
                    ref={mediaRef}
                    className={cn(
                        'relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#08111c]',
                        topSlot ? 'mt-1' : '',
                        bodyClassName,
                    )}
                >
                    {media}
                </div>

                <div className="flex min-h-0 w-full flex-1 flex-col">
                    <h3
                        className={cn(
                            'w-full text-2xl font-black text-white',
                            titleClassName,
                        )}
                    >
                        {title}
                    </h3>

                    {description ? (
                        <div
                            className={cn(
                                'mt-4 w-full text-sm leading-relaxed text-slate-300',
                                descriptionClassName,
                            )}
                        >
                            {description}
                        </div>
                    ) : null}

                    {children ? (
                        <div
                            className={cn('mt-auto w-full pt-6', footerClassName)}
                        >
                            {children}
                        </div>
                    ) : null}
                </div>
            </div>
        </article>
    );
}
