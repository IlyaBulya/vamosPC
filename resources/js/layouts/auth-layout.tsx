import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export default function AuthLayout({
    children,
    title,
    description,
    eyebrow,
    icon,
    cardClassName,
}: {
    children: ReactNode;
    title: string;
    description: string;
    eyebrow?: string;
    icon?: ReactNode;
    cardClassName?: string;
}) {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4 py-10 text-slate-100">
            <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

            <div
                className={cn(
                    'w-full max-w-md rounded-3xl border border-white/10 bg-[#08101c]/90 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:p-8',
                    cardClassName,
                )}
            >
                <Link href="/" className="inline-flex items-center gap-0">
                    <span className="text-[2.1rem] font-black tracking-[-0.015em] text-[#00bd7d]">
                        VAMOS
                    </span>
                    <img
                        src="/images/VamosLogo.png"
                        alt="VamosPC"
                        className="h-10 w-auto object-contain"
                    />
                </Link>

                {icon ? (
                    <div className="mt-6 inline-flex rounded-xl border border-[#00bd7d]/35 bg-[#00bd7d]/10 p-2">
                        {icon}
                    </div>
                ) : null}

                <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                    {eyebrow ?? 'Secure Access'}
                </p>
                <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
                <p className="mt-2 text-sm text-slate-300">{description}</p>

                <div className="mt-6">{children}</div>
            </div>
        </div>
    );
}
