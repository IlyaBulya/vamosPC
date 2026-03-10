import { Head, Link } from '@inertiajs/react';
import { Cpu, Gauge, ShieldCheck, Sparkles } from 'lucide-react';
import BuildCard from '@/components/store/build-card';
import PageHero from '@/components/store/page-hero';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type BuildCardItem = {
    slug: string;
    name: string;
    specs: string;
    price_label: string;
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
}

export default function GamingPcPage({ builds }: GamingPcPageProps) {
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
                        <BuildCard
                            key={build.name}
                            title={build.name}
                            description={build.specs}
                            media={<ProductMediaBlock label="Build Preview" />}
                            className="border-white/10 bg-[#101722]/90 transition hover:border-[#00bd7d]/45"
                            footer={
                                <>
                                    <p className="text-xl font-bold text-[#9cf5d8]">
                                        {build.price_label}
                                    </p>
                                    <Link
                                        href={`/gaming-pc/configurator/${build.slug}`}
                                        className="mt-5 inline-flex items-center rounded-full border border-[#00bd7d]/50 bg-[#00bd7d]/10 px-4 py-2 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                                    >
                                        Configure Build
                                    </Link>
                                </>
                            }
                        />
                    ))}
                </section>
            </StoreLayout>
        </>
    );
}
