import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { useEffect, useRef, useState } from 'react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage().props;
    const modelAnchorRef = useRef<HTMLDivElement | null>(null);
    const [modelTransform, setModelTransform] = useState({
        x: 0,
        y: 0,
        scale: 1,
    });

    useEffect(() => {
        const update = () => {
            const height = window.innerHeight || 1;
            const progress = Math.min(Math.max(window.scrollY / (height * 0.95), 0), 1);

            let x = 0;
            let y = 0;

            if (modelAnchorRef.current) {
                const rect = modelAnchorRef.current.getBoundingClientRect();
                const anchorCenterX = rect.left + rect.width / 2;
                const anchorCenterY = rect.top + rect.height / 2;

                const viewportCenterX = window.innerWidth / 2;
                const viewportCenterY = window.innerHeight / 2;

                x = (viewportCenterX - anchorCenterX) * progress;
                y = (viewportCenterY - anchorCenterY) * progress;
            }

            setModelTransform({
                x,
                y,
                scale: 1 + 0.14 * progress,
            });
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <>
            <Head title="Welcome to VamosPC" />

            <div className="relative min-h-[200vh] w-full overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-[18%] h-72 w-72 rounded-full bg-[#00bd7d]/25 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 top-[14%] h-96 w-96 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 left-0 h-80 w-80 rounded-full bg-[#00bd7d]/25 blur-3xl" />
                <header className="sticky top-0 z-20 border-b border-white/10 bg-[#050b16]/95">
                    <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-16">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-0"
                        >
                            <span className="text-[2.65rem] font-black tracking-[-0.015em] text-[#00bd7d]">
                                VAMOS
                            </span>
                            <img
                                src="/images/VamosLogo.png"
                                alt="VamosPC"
                                className="h-12 w-auto object-contain"
                            />
                        </Link>

                        <nav className="hidden items-center gap-10 text-base text-slate-300 md:flex">
                            <Link href="/" className="font-medium text-[#00bd7d]">
                                Home
                            </Link>
                            <Link
                                href="/gaming-pc"
                                className="transition hover:text-[#00bd7d]"
                            >
                                Build Your PC
                            </Link>
                            <span className="cursor-default text-slate-400">
                                About
                            </span>
                            <span className="cursor-default text-slate-400">
                                Support
                            </span>
                        </nav>

                        <Link
                            href={auth.user ? dashboard() : login()}
                            aria-label={
                                auth.user || canRegister
                                    ? 'Open account'
                                    : 'Log in'
                            }
                            className="rounded-full border border-white/15 p-2 text-slate-300 transition hover:border-[#00bd7d] hover:text-[#00bd7d]"
                        >
                            <svg
                                className="h-5 w-5"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20 21C20 17.6863 16.866 15 13 15H11C7.13401 15 4 17.6863 4 21"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                />
                                <circle
                                    cx="12"
                                    cy="8"
                                    r="4"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                />
                            </svg>
                        </Link>
                    </div>
                </header>

                <main className="sticky top-16 z-10 h-[calc(100vh-64px)] w-full">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_73%_52%,rgba(0,189,125,0.22),transparent_40%)]" />

                    <section className="relative grid h-full w-full grid-cols-1 items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-16 lg:py-12">
                        <div className="max-w-[700px]">
                            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-[98px] lg:leading-[0.96]">
                                <span className="bg-gradient-to-r from-white to-[#b8ffe8] bg-clip-text text-transparent">
                                    VAMOS PC
                                </span>
                            </h1>

                            <p className="mt-5 max-w-[620px] text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-[62px] lg:leading-[1.03]">
                                custom high-performance
                                <br />
                                PC builds
                            </p>

                            <div className="mt-10 flex flex-wrap gap-4">
                                <Link
                                    href="/gaming-pc"
                                    className="rounded-full bg-[#00bd7d] px-8 py-3 text-lg font-semibold text-white shadow-[0_0_25px_rgba(0,189,125,0.6)] transition hover:bg-[#02a96f]"
                                >
                                    Build Yours Now
                                </Link>
                                <button
                                    type="button"
                                    className="rounded-full border border-[#00bd7d] px-8 py-3 text-lg font-semibold text-[#00bd7d] transition hover:bg-[#00bd7d]/10"
                                >
                                    Learn More
                                </button>
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                {['Fast Build', 'Warranty', 'Stress Tested'].map(
                                    (item) => (
                                        <span
                                            key={item}
                                            className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-2 text-lg text-[#9cf5d8]"
                                        >
                                            <span className="h-2.5 w-2.5 rounded-full bg-[#00bd7d]" />
                                            {item}
                                        </span>
                                    ),
                                )}
                            </div>
                        </div>

                        <div
                            ref={modelAnchorRef}
                            className="relative h-[46vh] min-h-[360px] w-full lg:h-[70vh] lg:min-h-[560px]"
                        >
                            <div
                                className="relative h-full w-full will-change-transform"
                                style={{
                                    transform: `translate3d(${modelTransform.x}px, ${modelTransform.y}px, 0) scale(${modelTransform.scale})`,
                                }}
                            >
                                <div className="pointer-events-none absolute -inset-6 rounded-[42px] bg-[#00bd7d]/20 blur-3xl" />
                                <div className="relative flex h-full w-full items-center justify-center border-2 border-dashed border-[#00bd7d]/70 bg-[#07121f]/70 px-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#9cf5d8] sm:text-base">
                                    PC Image Placeholder
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
