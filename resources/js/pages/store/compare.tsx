import { Head, Link } from '@inertiajs/react';
import { BarChart3, Check, Cpu, Monitor, Zap } from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

const comparisonColumns = [
    {
        name: 'Starter Core',
        target: '1080p esports and everyday gaming',
        specs: [
            'Intel Core i5',
            'RTX 4060',
            '16GB DDR5',
            '1TB NVMe SSD',
        ],
        accent: 'border-white/10 bg-[#101722]/90',
    },
    {
        name: 'Performance X',
        target: '1440p ultra settings and streaming',
        specs: [
            'AMD Ryzen 7',
            'RTX 5070',
            '32GB DDR5',
            '2TB NVMe SSD',
        ],
        accent: 'border-[#00bd7d]/45 bg-[#0d1a1a]/95 shadow-[0_0_28px_rgba(0,189,125,0.16)]',
    },
    {
        name: 'Ultra Apex',
        target: '4K gaming and workstation-grade loads',
        specs: [
            'Intel Core i9',
            'RTX 5090',
            '64GB DDR5',
            '4TB NVMe SSD',
        ],
        accent: 'border-white/10 bg-[#101722]/90',
    },
];

const metrics = [
    {
        label: 'Gaming Target',
        icon: Monitor,
        values: ['1080p High', '1440p Ultra', '4K Ultra'],
    },
    {
        label: 'Thermal Profile',
        icon: Zap,
        values: ['Balanced', 'Optimized', 'Advanced Cooling'],
    },
    {
        label: 'Upgrade Headroom',
        icon: Cpu,
        values: ['Good', 'High', 'Maximum'],
    },
];

export default function ComparePage() {
    return (
        <>
            <Head title="Compare" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-24 h-80 w-80 rounded-full bg-[#00bd7d]/18 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-96 w-96 rounded-full bg-[#00bd7d]/14 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                        <p className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Compare
                        </p>
                        <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight text-white sm:text-5xl">
                            Compare builds side by side before you configure your next PC.
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                            Review performance class, hardware balance, and upgrade
                            headroom in one place. The full dynamic compare flow can be
                            connected later without redesigning the page.
                        </p>

                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link
                                href="/gaming-pc"
                                className="rounded-full bg-[#00bd7d] px-6 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                            >
                                Browse Gaming PC
                            </Link>
                            <Link
                                href="/laptops"
                                className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                            >
                                Compare Laptops
                            </Link>
                        </div>
                    </section>

                    <section className="mt-7 grid gap-5 xl:grid-cols-3">
                        {comparisonColumns.map((column) => (
                            <article
                                key={column.name}
                                className={`rounded-2xl border p-5 transition ${column.accent}`}
                            >
                                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a1019] p-4">
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                                    <div className="relative aspect-[16/10] rounded-lg border border-white/10 bg-gradient-to-b from-[#1a2431] to-[#0a111a]" />
                                </div>

                                <h2 className="mt-4 text-2xl font-black text-white">
                                    {column.name}
                                </h2>
                                <p className="mt-2 text-sm text-slate-300">
                                    {column.target}
                                </p>

                                <div className="mt-5 space-y-3">
                                    {column.specs.map((spec) => (
                                        <div
                                            key={spec}
                                            className="flex items-center gap-2 text-sm text-slate-200"
                                        >
                                            <Check className="h-4 w-4 text-[#00bd7d]" />
                                            {spec}
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    href="/gaming-pc"
                                    className="mt-6 inline-flex rounded-full border border-[#00bd7d]/45 bg-[#00bd7d]/10 px-4 py-2 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                                >
                                    Open Build
                                </Link>
                            </article>
                        ))}
                    </section>

                    <section className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/88">
                        <div className="border-b border-white/10 bg-[#0b1422] px-6 py-4">
                            <h2 className="text-2xl font-black text-white">
                                Quick Comparison
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[880px] text-left">
                                <thead className="border-b border-white/10 text-xs uppercase tracking-[0.14em] text-slate-400">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Metric</th>
                                        <th className="px-6 py-4 font-semibold">
                                            Starter Core
                                        </th>
                                        <th className="px-6 py-4 font-semibold text-[#9cf5d8]">
                                            Performance X
                                        </th>
                                        <th className="px-6 py-4 font-semibold">
                                            Ultra Apex
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {metrics.map((metric) => (
                                        <tr
                                            key={metric.label}
                                            className="border-b border-white/10 last:border-b-0"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3 text-white">
                                                    <metric.icon className="h-4 w-4 text-[#00bd7d]" />
                                                    <span className="font-semibold">
                                                        {metric.label}
                                                    </span>
                                                </div>
                                            </td>
                                            {metric.values.map((value, index) => (
                                                <td
                                                    key={`${metric.label}-${value}`}
                                                    className={`px-6 py-5 text-sm ${
                                                        index === 1
                                                            ? 'text-[#9cf5d8]'
                                                            : 'text-slate-300'
                                                    }`}
                                                >
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
