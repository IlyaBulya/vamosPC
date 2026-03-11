import { Head, Link, router } from '@inertiajs/react';
import { ChartNoAxesColumnIncreasing, Cpu, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import BuildCard from '@/components/store/build-card';
import PageHero from '@/components/store/page-hero';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type BuildCardItem = {
    slug: string;
    name: string;
    specs: string;
    price_label: string;
    target: string;
};

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

interface GamingPcPageProps {
    builds: BuildCardItem[];
    compareSlugs: string[];
}

export default function GamingPcPage({ builds, compareSlugs }: GamingPcPageProps) {
    const toggleCompare = (slug: string, isInCompare: boolean) => {
        if (isInCompare) {
            router.delete(`/compare/items/${slug}`, {
                preserveScroll: true,
            });

            return;
        }

        router.post(
            '/compare/items',
            {
                build: slug,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Gaming PC" />

            <StoreLayout footerClassName="mt-6">
                <PageHero
                    eyebrow={
                        <span className="inline-flex items-center gap-2">
                            <Sparkles className="h-3.5 w-3.5" />
                            Gaming PC
                        </span>
                    }
                    title="Custom desktop builds engineered for high FPS and stability."
                    description="Pick a demo base build, fine-tune real components from the database, and preview how the configurator flow will feel before ready-made PCs are added."
                    actions={
                        <>
                            <Link
                                href="/compare"
                                className="rounded-full border border-[#00bd7d]/50 bg-[#00bd7d]/10 px-6 py-3 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                            >
                                Open Compare
                            </Link>
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
                        </>
                    }
                >
                    <div className="grid gap-4 md:grid-cols-3">
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
                </PageHero>

                <section className="mt-7 grid gap-5 lg:grid-cols-3">
                    {builds.map((build) => (
                        (() => {
                            const isInCompare = compareSlugs.includes(build.slug);

                            return (
                                <BuildCard
                                    key={build.name}
                                    title={build.name}
                                    description={
                                        <>
                                            <p>{build.specs}</p>
                                            <p className="mt-3 text-slate-400">
                                                {build.target}
                                            </p>
                                        </>
                                    }
                                    media={<ProductMediaBlock label="Build Preview" />}
                                    topSlot={
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleCompare(build.slug, isInCompare)
                                                }
                                                className={`rounded-full border p-2 transition ${
                                                    isInCompare
                                                        ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 text-[#00bd7d] shadow-[0_0_20px_rgba(0,189,125,0.45)]'
                                                        : 'border-white/15 text-slate-300 hover:border-white/35 hover:text-white'
                                                }`}
                                            >
                                                <span className="sr-only">
                                                    {isInCompare
                                                        ? 'Remove from compare'
                                                        : 'Add to compare'}
                                                </span>
                                                <ChartNoAxesColumnIncreasing className="h-5 w-5" />
                                            </button>
                                        </div>
                                    }
                                    className="border-white/10 bg-[#101722]/90 transition hover:border-[#00bd7d]/45"
                                    footer={
                                        <>
                                            <p className="text-xl font-bold text-[#9cf5d8]">
                                                {build.price_label}
                                            </p>
                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <Link
                                                    href={`/gaming-pc/configurator/${build.slug}`}
                                                    className="inline-flex items-center rounded-full border border-[#00bd7d]/50 bg-[#00bd7d]/10 px-4 py-2 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                                                >
                                                    Configure Build
                                                </Link>
                                                {isInCompare ? (
                                                    <Link
                                                        href="/compare"
                                                        className="inline-flex items-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                                                    >
                                                        View Compare
                                                    </Link>
                                                ) : null}
                                            </div>
                                        </>
                                    }
                                />
                            );
                        })()
                    ))}
                </section>
            </StoreLayout>
        </>
    );
}
