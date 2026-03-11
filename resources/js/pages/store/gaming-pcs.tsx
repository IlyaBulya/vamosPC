import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Cpu, Monitor, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
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
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    components_count: number;
    components: ConfigurationComponent[];
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function GamingPcPage({
    configurations,
}: {
    configurations: ConfigurationCard[];
}) {
    const [previewId, setPreviewId] = useState<number | null>(
        configurations[0]?.id ?? null,
    );

    const previewConfiguration =
        configurations.find((configuration) => configuration.id === previewId) ??
        configurations[0] ??
        null;

    return (
        <>
            <Head title="Gaming PCs" />

            <StoreLayout footerClassName="mt-6">
                <PageHero
                    backHref="/catalog"
                    backLabel="Back to Catalog"
                    eyebrow="Gaming PCs"
                    title="Ready-to-Buy Configurations"
                    description="Choose a base gaming build and preview exactly what goes into the setup."
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
                            configurations available
                        </FeaturePill>
                    }
                />

                {previewConfiguration ? (
                    <section className="mt-6 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
                        <div className="space-y-3 rounded-3xl border border-white/10 bg-[#08101c]/85 p-4 sm:p-5">
                            {configurations.map((configuration) => {
                                const isPreview =
                                    configuration.id === previewConfiguration.id;

                                return (
                                    <button
                                        key={configuration.id}
                                        type="button"
                                        onClick={() => setPreviewId(configuration.id)}
                                        onMouseEnter={() => setPreviewId(configuration.id)}
                                        className={`w-full rounded-2xl border px-4 py-4 text-left transition ${
                                            isPreview
                                                ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 shadow-[0_0_28px_rgba(0,189,125,0.25)]'
                                                : 'border-white/10 bg-[#0b1321] hover:border-[#00bd7d]/35'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p
                                                    className={`text-xl font-black uppercase ${
                                                        isPreview
                                                            ? 'text-[#9cf5d8]'
                                                            : 'text-white'
                                                    }`}
                                                >
                                                    {configuration.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-300">
                                                    {configuration.description ??
                                                        'Balanced gaming build.'}
                                                </p>
                                            </div>

                                            {isPreview ? (
                                                <span className="rounded-full border border-[#00bd7d]/60 bg-[#00bd7d]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#9cf5d8]">
                                                    Preview
                                                </span>
                                            ) : null}
                                        </div>

                                        <div className="mt-4 flex items-center justify-between">
                                            <p className="text-lg font-semibold text-white">
                                                {formatPrice(configuration.price_in_cents)}
                                            </p>
                                            <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                                {configuration.components_count}{' '}
                                                components
                                            </p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        <article className="mx-auto w-full max-w-[430px] rounded-[30px] border border-white/15 bg-gradient-to-b from-[#161d2a] via-[#0d121c] to-[#070b12] p-4 shadow-[0_18px_44px_rgba(0,0,0,0.55)] sm:p-5">
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1622]">
                                <div className="aspect-[4/3]">
                                    {previewConfiguration.image ? (
                                        <img
                                            src={previewConfiguration.image}
                                            alt={previewConfiguration.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_20%,rgba(0,189,125,0.24),transparent_42%)]" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_78%,rgba(0,189,125,0.14),transparent_48%)]" />
                                            <Monitor className="relative h-16 w-16 text-slate-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                                <span className="h-3 w-3 rounded-full bg-[#00bd7d] shadow-[0_0_12px_rgba(0,189,125,0.8)]" />
                                In Preview
                            </div>

                            <h2 className="mt-3 text-center text-4xl font-black uppercase tracking-[0.02em] text-white">
                                {previewConfiguration.name}
                            </h2>

                            <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
                                {previewConfiguration.description ??
                                    'Compact and powerful setup for smooth gaming and work.'}
                            </p>

                            <div className="mt-5 text-center">
                                <p className="text-4xl font-black text-white">
                                    {formatPrice(previewConfiguration.price_in_cents)}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    configured price
                                </p>
                            </div>

                            <button
                                type="button"
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00bd7d] px-4 py-3 text-sm font-bold text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.45)]"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Configure & Buy
                            </button>

                            <button
                                type="button"
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#00bd7d]/80 px-4 py-3 text-sm font-semibold text-[#9cf5d8]"
                            >
                                More Details
                            </button>

                            <div className="mt-4 space-y-2">
                                {previewConfiguration.components
                                    .slice(0, 6)
                                    .map((component) => (
                                        <div
                                            key={component.id}
                                            className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                                        >
                                            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                                {component.category_name ?? 'Component'}
                                            </p>
                                            <p className="mt-1 text-sm text-slate-200">
                                                {component.name}
                                            </p>
                                        </div>
                                    ))}

                                {previewConfiguration.components.length > 6 ? (
                                    <p className="text-center text-xs text-slate-400">
                                        +
                                        {previewConfiguration.components.length - 6}{' '}
                                        more components
                                    </p>
                                ) : null}
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                                <Cpu className="h-3.5 w-3.5" />
                                {previewConfiguration.components_count} components attached
                            </div>
                        </article>
                    </section>
                ) : (
                    <section className="mt-6 rounded-3xl border border-white/10 bg-[#08101c]/85 p-10 text-center">
                        <p className="text-xl font-semibold text-white">
                            No gaming configurations yet.
                        </p>
                        <p className="mt-2 text-sm text-slate-400">
                            Create configurations in Admin Panel and they will appear
                            here.
                        </p>
                    </section>
                )}
            </StoreLayout>
        </>
    );
}

