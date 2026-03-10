import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type PageHeroProps = {
    eyebrow?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    backHref?: string;
    backLabel?: string;
    meta?: ReactNode;
    actions?: ReactNode;
    aside?: ReactNode;
    children?: ReactNode;
    className?: string;
};

export default function PageHero({
    eyebrow,
    title,
    description,
    backHref,
    backLabel,
    meta,
    actions,
    aside,
    children,
    className,
}: PageHeroProps) {
    return (
        <section
            className={cn(
                'rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10',
                className,
            )}
        >
            {backHref && backLabel ? (
                <Link
                    href={backHref}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#9cf5d8]"
                >
                    <ChevronLeft className="h-4 w-4" />
                    {backLabel}
                </Link>
            ) : null}

            <div className={cn(backHref ? 'mt-4' : '')}>
                {aside ? (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            {eyebrow ? (
                                <div className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                                    {eyebrow}
                                </div>
                            ) : null}
                            <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
                                {title}
                            </h1>
                            {description ? (
                                <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                                    {description}
                                </p>
                            ) : null}
                        </div>
                        {aside}
                    </div>
                ) : (
                    <>
                        {eyebrow ? (
                            <div className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                                {eyebrow}
                            </div>
                        ) : null}
                        <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
                            {title}
                        </h1>
                        {description ? (
                            <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                                {description}
                            </p>
                        ) : null}
                    </>
                )}
            </div>

            {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
            {meta ? <div className="mt-6">{meta}</div> : null}
            {children ? <div className="mt-8">{children}</div> : null}
        </section>
    );
}
