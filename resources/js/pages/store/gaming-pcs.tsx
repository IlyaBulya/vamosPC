import { Head, Link } from '@inertiajs/react';
import { Cpu, Monitor, ShoppingCart } from 'lucide-react';
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

            <StoreLayout
                contentClassName="py-6 sm:py-10"
                footerClassName="mt-6"
            >
                <PageHero
                    compactOnMobile
                    backHref="/catalog"
                    backLabel="Back to Catalog"
                    eyebrow="Gaming PCs"
                    title="Choose Your Gaming Series"
                    description="Pick a base build, review the profile, then configure it before checkout."
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
                    <section className="mt-5 grid grid-cols-2 gap-x-2.5 gap-y-3 sm:mt-7 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 2xl:grid-cols-4">
                        {configurations.map((configuration, index) => (
                            <article
                                key={configuration.id}
                                className="group flex h-full min-w-0 flex-col rounded-[20px] border border-white/10 bg-gradient-to-b from-[#151d29] via-[#0f1521] to-[#090d15] p-2 shadow-[0_12px_26px_rgba(0,0,0,0.38)] transition active:border-[#00bd7d]/45 sm:rounded-[30px] sm:p-5 sm:shadow-[0_18px_42px_rgba(0,0,0,0.45)] sm:hover:-translate-y-0.5 sm:hover:border-[#00bd7d]/45 sm:hover:shadow-[0_24px_46px_rgba(0,0,0,0.5)]"
                            >
                                <Link
                                    href={`/gaming-pcs/${configuration.route_slug}`}
                                    className="block"
                                >
                                    <div className="relative overflow-hidden rounded-[14px] border border-white/10 bg-[#0f1622] sm:rounded-[22px]">
                                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_14%,rgba(0,189,125,0.26),transparent_44%)]" />
                                        <div className="aspect-square sm:aspect-[5/4]">
                                            {configuration.image ? (
                                                <img
                                                    src={configuration.image}
                                                    alt={configuration.name}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_78%,rgba(0,189,125,0.16),transparent_48%)]" />
                                                    <Monitor className="relative h-9 w-9 text-slate-500 sm:h-16 sm:w-16" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>

                                <div className="mt-2 flex min-w-0 items-center justify-start gap-1.5 sm:mt-4 sm:justify-center sm:gap-2">
                                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/30 bg-[#0d131f] sm:h-8 sm:w-8">
                                        <span className="h-3.5 w-3.5 rounded-full border border-white/40 bg-[#0b1422] shadow-[0_0_10px_rgba(0,189,125,0.35)] sm:h-5 sm:w-5 sm:shadow-[0_0_14px_rgba(0,189,125,0.35)]" />
                                    </span>
                                    <p className="truncate text-[0.68rem] text-slate-400 sm:overflow-visible sm:text-sm sm:whitespace-normal sm:text-slate-300">
                                        {getFinishLabel(configuration)}
                                    </p>
                                </div>

                                <Link
                                    href={`/gaming-pcs/${configuration.route_slug}`}
                                    className="mt-2 line-clamp-2 min-h-8 text-left text-[0.86rem] leading-[1.1] font-black text-white uppercase transition active:text-[#9cf5d8] min-[375px]:text-base sm:mt-5 sm:line-clamp-none sm:min-h-0 sm:text-center sm:text-[2.05rem] sm:leading-[0.95] sm:hover:text-[#9cf5d8]"
                                >
                                    {configuration.name}
                                </Link>

                                <p className="mt-4 hidden text-center text-sm leading-relaxed text-slate-300 sm:block sm:text-base">
                                    {configuration.description ??
                                        getFallbackDescription(index)}
                                </p>

                                <div className="mt-3 text-left sm:mt-7 sm:text-center">
                                    <p className="text-[0.65rem] tracking-[0.12em] text-slate-400 uppercase sm:text-xs sm:tracking-[0.14em]">
                                        from
                                    </p>
                                    <p className="mt-0.5 truncate text-xl leading-none font-black tracking-tight text-white tabular-nums min-[375px]:text-2xl sm:mt-1 sm:overflow-visible sm:text-4xl sm:leading-normal sm:tracking-normal sm:whitespace-normal">
                                        {formatPrice(
                                            configuration.price_in_cents,
                                        )}
                                    </p>
                                    <p className="mt-1 truncate text-[0.68rem] text-slate-400 sm:hidden">
                                        or{' '}
                                        {formatInstallment(
                                            configuration.price_in_cents,
                                        )}
                                        /mo
                                    </p>
                                    <p className="mt-2 hidden text-xs text-slate-400 sm:block">
                                        or{' '}
                                        {formatInstallment(
                                            configuration.price_in_cents,
                                        )}
                                        /month for {INSTALLMENT_MONTHS} months
                                    </p>
                                </div>

                                <div className="mt-auto pt-4 sm:pt-6">
                                    <Link
                                        href={`/gaming-pcs/${configuration.id}/configure`}
                                        className="inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-xl bg-[#00bd7d] px-2 py-2 text-[0.72rem] font-black text-[#04120d] shadow-[0_0_14px_rgba(0,189,125,0.38)] transition active:bg-[#18d99a] sm:gap-2 sm:rounded-full sm:px-4 sm:py-3 sm:text-base sm:font-bold sm:shadow-[0_0_18px_rgba(0,189,125,0.45)] sm:hover:bg-[#18d99a]"
                                    >
                                        <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="sm:hidden">
                                            Configure
                                        </span>
                                        <span className="hidden sm:inline">
                                            Configure &amp; Buy
                                        </span>
                                    </Link>

                                    <div className="mt-3 hidden items-center justify-center gap-2 text-xs text-slate-400 sm:flex">
                                        <Cpu className="h-3.5 w-3.5" />
                                        {configuration.components_count}{' '}
                                        components included
                                    </div>

                                    <Link
                                        href={`/gaming-pcs/${configuration.route_slug}`}
                                        className="mt-3 hidden w-full items-center justify-center rounded-full border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/50 hover:text-[#9cf5d8] sm:inline-flex"
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
