import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Cpu, Monitor, ShoppingCart } from 'lucide-react';
import FeaturePill from '@/components/store/feature-pill';
import PageHero from '@/components/store/page-hero';
import StoreLayout from '@/layouts/store-layout';

type ConfigurationComponent = {
    id: number;
    name: string;
    category_name: string | null;
};

type ConfigurationCard = {
    id: number;
    route_slug: string;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    components_count: number;
    components: ConfigurationComponent[];
};

const INSTALLMENT_MONTHS = 24;
const FALLBACK_DESCRIPTIONS = [
    'Compact and powerful setup for smooth gaming and daily work.',
    'Balanced performance for gaming, streaming, and creative sessions.',
    'High airflow and strong power for demanding titles and multitasking.',
    'Premium build profile tuned for top-tier frame rates and visuals.',
];

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(priceInCents / 100);
}

function formatInstallment(priceInCents: number) {
    const installmentInCents = Math.ceil(priceInCents / INSTALLMENT_MONTHS);

    return formatPrice(installmentInCents);
}

function getFallbackDescription(index: number) {
    return FALLBACK_DESCRIPTIONS[index % FALLBACK_DESCRIPTIONS.length];
}

function getFinishLabel(configuration: ConfigurationCard) {
    const caseName = configuration.components.find((component) =>
        component.category_name?.toLowerCase().includes('case'),
    )?.name;

    if (!caseName) {
        return 'Stealth Black';
    }

    if (caseName.toLowerCase().includes('white')) {
        return 'Arctic White';
    }

    return 'Stealth Black';
}

export default function GamingPcPage({
    configurations,
}: {
    configurations: ConfigurationCard[];
}) {
    return (
        <>
            <Head title="Gaming PCs" />

            <StoreLayout footerClassName="mt-6">
                <PageHero
                    backHref="/catalog"
                    backLabel="Back to Catalog"
                    eyebrow="Gaming PCs"
                    title="Choose Your Gaming Series"
                    description="Pick a base build, review the profile, then configure it before checkout."
                    actions={
                        <Link
                            href="/catalog/hardware"
                            className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/55 px-5 py-2.5 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/10"
                        >
                            Open Hardware
                            <ChevronRight className="h-4 w-4" />
                        </Link>
                    }
                    meta={
                        <FeaturePill>
                            <span className="font-semibold">
                                {configurations.length}
                            </span>
                            builds available
                        </FeaturePill>
                    }
                />

                {configurations.length ? (
                    <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                        {configurations.map((configuration, index) => (
                            <article
                                key={configuration.id}
                                className="group flex h-full flex-col rounded-[30px] border border-white/10 bg-gradient-to-b from-[#151d29] via-[#0f1521] to-[#090d15] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.45)] transition hover:-translate-y-0.5 hover:border-[#00bd7d]/45 hover:shadow-[0_24px_46px_rgba(0,0,0,0.5)] sm:p-5"
                            >
                                <Link
                                    href={`/gaming-pcs/${configuration.route_slug}`}
                                    className="block"
                                >
                                    <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[#0f1622]">
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(0,189,125,0.26),transparent_44%)]" />
                                        <div className="aspect-[5/4]">
                                            {configuration.image ? (
                                                <img
                                                    src={configuration.image}
                                                    alt={configuration.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_78%,rgba(0,189,125,0.16),transparent_48%)]" />
                                                    <Monitor className="relative h-16 w-16 text-slate-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-[#0d131f]">
                                        <span className="h-5 w-5 rounded-full border border-white/40 bg-[#0b1422] shadow-[0_0_14px_rgba(0,189,125,0.35)]" />
                                    </span>
                                    <p className="text-sm text-slate-300">
                                        {getFinishLabel(configuration)}
                                    </p>
                                </div>

                                <Link
                                    href={`/gaming-pcs/${configuration.route_slug}`}
                                    className="mt-5 text-center text-[2.05rem] leading-[0.95] font-black text-white uppercase transition hover:text-[#9cf5d8]"
                                >
                                    {configuration.name}
                                </Link>

                                <p className="mt-4 text-center text-sm leading-relaxed text-slate-300 sm:text-base">
                                    {configuration.description ??
                                        getFallbackDescription(index)}
                                </p>

                                <div className="mt-7 text-center">
                                    <p className="text-xs tracking-[0.14em] text-slate-400 uppercase">
                                        from
                                    </p>
                                    <p className="mt-1 text-4xl font-black text-white">
                                        {formatPrice(
                                            configuration.price_in_cents,
                                        )}
                                    </p>
                                    <p className="mt-2 text-xs text-slate-400">
                                        or{' '}
                                        {formatInstallment(
                                            configuration.price_in_cents,
                                        )}
                                        /month for {INSTALLMENT_MONTHS} months
                                    </p>
                                </div>

                                <div className="mt-auto pt-6">
                                    <Link
                                        href={`/gaming-pcs/${configuration.id}/configure`}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00bd7d] px-4 py-3 text-base font-bold text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Configure & Buy
                                    </Link>

                                    <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400">
                                        <Cpu className="h-3.5 w-3.5" />
                                        {configuration.components_count}{' '}
                                        components included
                                    </div>

                                    <Link
                                        href={`/gaming-pcs/${configuration.route_slug}`}
                                        className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/50 hover:text-[#9cf5d8]"
                                    >
                                        View details
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </section>
                ) : (
                    <section className="mt-6 rounded-3xl border border-white/10 bg-[#08101c]/85 p-10 text-center">
                        <p className="text-xl font-semibold text-white">
                            No gaming configurations yet.
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                            Create configurations in Admin Panel and they will
                            appear here.
                        </p>
                    </section>
                )}
            </StoreLayout>
        </>
    );
}
