import { Head, Link } from '@inertiajs/react';
import { Cpu, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

const highlights = [
    {
        title: 'Performance Tuned',
        description: 'Every build is optimized and stress-tested before shipping.',
        icon: Gauge,
    },
    {
        title: 'Premium Components',
        description: 'Only trusted parts from top brands and latest generations.',
        icon: Cpu,
    },
    {
        title: 'Warranty Included',
        description: 'Full 2-year support with diagnostics and replacement help.',
        icon: ShieldCheck,
    },
];

const buildCards = [
    {
        name: 'Starter Core',
        specs: 'Intel Core i5 / RTX 4060 / 16GB RAM / 1TB SSD',
        price: 'from EUR 1,299',
    },
    {
        name: 'Performance X',
        specs: 'AMD Ryzen 7 / RTX 5070 / 32GB RAM / 2TB SSD',
        price: 'from EUR 2,199',
    },
    {
        name: 'Ultra Apex',
        specs: 'Intel Core i9 / RTX 5090 / 64GB RAM / 4TB SSD',
        price: 'from EUR 3,999',
    },
];

export default function GamingPcPage() {
    return (
        <>
            <Head title="Gaming PC" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]">
                            <Sparkles className="h-3.5 w-3.5" />
                            Gaming PC
                        </p>
                        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl">
                            Custom desktop builds engineered for high FPS and stability.
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                            Pick your base configuration, fine-tune components, and get a
                            stress-tested system assembled in Barcelona.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                href="/catalog/hardware"
                                className="rounded-full bg-[#00bd7d] px-6 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                            >
                                Browse Components
                            </Link>
                            <Link
                                href="/cart"
                                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                            >
                                Open Cart
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-3">
                            {highlights.map((item) => (
                                <article
                                    key={item.title}
                                    className="rounded-2xl border border-white/10 bg-[#0a1322]/95 p-5"
                                >
                                    <item.icon className="h-5 w-5 text-[#00bd7d]" />
                                    <h2 className="mt-3 text-lg font-bold text-white">
                                        {item.title}
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-300">
                                        {item.description}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="mt-7 grid gap-5 lg:grid-cols-3">
                        {buildCards.map((build) => (
                            <article
                                key={build.name}
                                className="rounded-2xl border border-white/10 bg-[#101722]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition hover:border-[#00bd7d]/45"
                            >
                                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1019] p-4">
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00bd7d]/25 blur-3xl" />
                                    <div className="relative aspect-[16/10] rounded-lg border border-white/10 bg-gradient-to-b from-[#1a2431] to-[#0a111a]" />
                                </div>

                                <h3 className="mt-4 text-2xl font-black leading-tight text-white">
                                    {build.name}
                                </h3>
                                <p className="mt-2 text-sm text-slate-300">{build.specs}</p>
                                <p className="mt-4 text-xl font-bold text-[#9cf5d8]">
                                    {build.price}
                                </p>

                                <Link
                                    href="/catalog/hardware"
                                    className="mt-5 inline-flex items-center rounded-full border border-[#00bd7d]/50 bg-[#00bd7d]/10 px-4 py-2 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                                >
                                    Configure Build
                                </Link>
                            </article>
                        ))}
                    </section>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
