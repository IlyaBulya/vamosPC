import { Head, Link, router } from '@inertiajs/react';
import {
    BarChart3,
    ChartNoAxesColumnIncreasing,
    Cpu,
    Monitor,
    Trash2,
    Zap,
} from 'lucide-react';
import FeaturePill from '@/components/store/feature-pill';
import PageHero from '@/components/store/page-hero';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type CompareBuild = {
    slug: string;
    name: string;
    specs: string;
    price_label: string;
    availability_label: string;
    target: string;
    gaming_target: string;
    thermal_profile: string;
    upgrade_headroom: string;
    graphics_card: string;
    processor: string;
    motherboard: string;
    cooling: string;
    memory: string;
    storage: string;
    power_supply: string;
    case: string;
};

interface ComparePageProps {
    builds: CompareBuild[];
}

const compareGroups = [
    {
        title: 'Quick Comparison',
        rows: [
            {
                label: 'Ideal For',
                icon: Monitor,
                key: 'target',
            },
            {
                label: 'Gaming Target',
                icon: BarChart3,
                key: 'gaming_target',
            },
            {
                label: 'Thermal Profile',
                icon: Zap,
                key: 'thermal_profile',
            },
            {
                label: 'Upgrade Headroom',
                icon: Cpu,
                key: 'upgrade_headroom',
            },
        ],
    },
    {
        title: 'Components',
        rows: [
            {
                label: 'Graphics Card',
                key: 'graphics_card',
            },
            {
                label: 'Processor',
                key: 'processor',
            },
            {
                label: 'Motherboard',
                key: 'motherboard',
            },
            {
                label: 'Cooling',
                key: 'cooling',
            },
            {
                label: 'Memory',
                key: 'memory',
            },
            {
                label: 'Storage',
                key: 'storage',
            },
            {
                label: 'Power Supply',
                key: 'power_supply',
            },
            {
                label: 'Case',
                key: 'case',
            },
        ],
    },
] as const;

function buildColumnWidth(buildCount: number) {
    return Math.max(240 * buildCount + 220, 1080);
}

export default function ComparePage({ builds }: ComparePageProps) {
    const clearCompare = () => {
        router.delete('/compare/items', {
            preserveScroll: true,
        });
    };

    const removeBuild = (slug: string) => {
        router.delete(`/compare/items/${slug}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Compare" />

            <StoreLayout
                contentClassName="mx-auto w-full max-w-[1760px] px-4 py-10 sm:px-6 lg:px-8"
                footerClassName="mt-6"
            >
                <PageHero
                    eyebrow={
                        <span className="inline-flex items-center gap-2">
                            <BarChart3 className="h-3.5 w-3.5" />
                            Compare
                        </span>
                    }
                    title="Compare gaming builds in a single aligned matrix."
                    description="Each build now sits directly above its own comparison column, so the specs below are easier to read without guessing which PC they belong to."
                    actions={
                        builds.length > 0 ? (
                            <>
                                <Link
                                    href="/gaming-pc"
                                    className="rounded-full bg-[#00bd7d] px-6 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                                >
                                    Add More Builds
                                </Link>
                                <button
                                    type="button"
                                    onClick={clearCompare}
                                    className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-red-400/55 hover:text-red-300"
                                >
                                    Clear Compare
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/gaming-pc"
                                className="rounded-full bg-[#00bd7d] px-6 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                            >
                                Add Gaming PCs
                            </Link>
                        )
                    }
                    meta={
                        builds.length > 0 ? (
                            <FeaturePill>
                                <ChartNoAxesColumnIncreasing className="h-4 w-4" />
                                {builds.length} build{builds.length === 1 ? '' : 's'} selected
                            </FeaturePill>
                        ) : undefined
                    }
                />

                {builds.length === 0 ? (
                    <section className="mt-7 rounded-[32px] border border-dashed border-white/15 bg-[#08101c]/88 p-10 text-center">
                        <div className="mx-auto flex max-w-2xl flex-col items-center">
                            <div className="rounded-full border border-[#00bd7d]/35 bg-[#00bd7d]/10 p-4 text-[#00bd7d]">
                                <ChartNoAxesColumnIncreasing className="h-8 w-8" />
                            </div>
                            <h2 className="mt-5 text-3xl font-black text-white">
                                Compare is empty
                            </h2>
                            <p className="mt-3 text-base text-slate-300">
                                Add gaming PCs from the Gaming PC page so this matrix can
                                show their specs side by side.
                            </p>
                            <Link
                                href="/gaming-pc"
                                className="mt-6 rounded-full border border-[#00bd7d]/50 bg-[#00bd7d]/10 px-5 py-3 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                            >
                                Add Gaming PCs
                            </Link>
                        </div>
                    </section>
                ) : (
                    <section className="mt-7 rounded-[34px] border border-white/10 bg-[#050b15]/95 p-5 shadow-[0_22px_80px_rgba(0,0,0,0.5)] sm:p-6">
                        <div className="overflow-x-auto">
                            <table
                                className="w-full border-separate border-spacing-0"
                                style={{
                                    minWidth: `${buildColumnWidth(builds.length)}px`,
                                }}
                            >
                                <thead>
                                    <tr>
                                        <th className="w-[220px] px-4 pb-6 align-bottom text-left">
                                            <div className="rounded-3xl border border-white/10 bg-[#08101c]/88 p-5">
                                                <p className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                                                    Compare Sheet
                                                </p>
                                                <h2 className="mt-3 text-2xl font-black text-white">
                                                    Gaming PC Matrix
                                                </h2>
                                                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                                    Every build stays in the same column from
                                                    the preview card down to the last spec row.
                                                </p>
                                            </div>
                                        </th>

                                        {builds.map((build) => (
                                            <th
                                                key={build.slug}
                                                className="min-w-[240px] px-4 pb-6 align-top"
                                            >
                                                <div className="h-full rounded-3xl border border-white/10 bg-[#08101c]/90 p-4 text-left shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9cf5d8]">
                                                            {build.availability_label}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeBuild(build.slug)}
                                                            className="rounded-full border border-white/15 p-2 text-slate-300 transition hover:border-red-400/55 hover:text-red-300"
                                                        >
                                                            <span className="sr-only">
                                                                Remove from compare
                                                            </span>
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>

                                                    <ProductMediaBlock
                                                        label={build.name}
                                                        className="mt-4 p-3"
                                                        aspectClassName="aspect-[4/3] rounded-2xl border border-white/12 bg-[#0c1522]"
                                                        innerClassName="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9cf5d8]/80"
                                                    />

                                                    <div className="mt-4">
                                                        <h3 className="text-2xl font-black text-white">
                                                            {build.name}
                                                        </h3>
                                                        <p className="mt-2 text-base font-semibold text-[#9cf5d8]">
                                                            {build.price_label}
                                                        </p>
                                                        <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                                            {build.specs}
                                                        </p>
                                                    </div>

                                                    <div className="mt-5">
                                                        <Link
                                                            href={`/gaming-pc/configurator/${build.slug}`}
                                                            className="inline-flex w-full items-center justify-center rounded-full bg-[#00bd7d] px-4 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.4)] transition hover:bg-[#18d99a]"
                                                        >
                                                            Configure Build
                                                        </Link>
                                                    </div>
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody>
                                    {compareGroups.map((group) => (
                                        <>
                                            <tr key={`${group.title}-header`}>
                                                <td
                                                    colSpan={builds.length + 1}
                                                    className="border-t border-white/10 bg-[#0a1019] px-4 py-4 text-left text-lg font-bold text-white first:rounded-l-2xl last:rounded-r-2xl"
                                                >
                                                    {group.title}
                                                </td>
                                            </tr>

                                            {group.rows.map((row) => (
                                                <tr
                                                    key={`${group.title}-${row.key}`}
                                                    className="align-top"
                                                >
                                                    <td className="border-b border-white/8 px-4 py-5">
                                                        <div className="pr-4">
                                                            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                                {row.label}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {builds.map((build) => (
                                                        <td
                                                            key={`${build.slug}-${row.key}`}
                                                            className="border-b border-white/8 px-4 py-5"
                                                        >
                                                            <div className="min-h-16 rounded-2xl border border-transparent bg-white/[0.02] px-3 py-2">
                                                                <p className="text-sm leading-relaxed text-slate-200">
                                                                    {build[row.key]}
                                                                </p>
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                )}
            </StoreLayout>
        </>
    );
}
