import { Head, Link } from '@inertiajs/react';
import { Cpu, Tag, Wrench } from 'lucide-react';
import BackLinkRow from '@/components/store/back-link-row';
import InfoCard from '@/components/store/info-card';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type ConfigurationComponent = {
    id: number;
    name: string;
    description: string | null;
    category_name: string | null;
    price_in_cents: number;
};

type ConfigurationDetails = {
    id: number;
    route_slug: string;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    components_count: number;
    components: ConfigurationComponent[];
};

type ConfigurationNavigation = {
    back_to_list_href: string;
    configure_href: string;
};

interface GamingPcShowPageProps {
    configuration: ConfigurationDetails;
    navigation: ConfigurationNavigation;
}

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

function shortDescription(description: string | null) {
    const fallback = 'Configuration details are currently being finalized.';
    const text = (description ?? fallback).trim();

    if (text.length <= 96) {
        return text;
    }

    return `${text.slice(0, 93)}...`;
}

export default function GamingPcShowPage({
    configuration,
    navigation,
}: GamingPcShowPageProps) {
    return (
        <>
            <Head title={configuration.name} />

            <StoreLayout footerClassName="mt-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <BackLinkRow
                        href={navigation.back_to_list_href}
                        label="Back to Gaming PCs"
                    />

                    <Link
                        href={navigation.configure_href}
                        className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/55 px-4 py-2 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/10"
                    >
                        <Wrench className="h-4 w-4" />
                        Open Configurator
                    </Link>
                </div>

                <section className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                        <p className="text-xs tracking-[0.18em] text-[#9cf5d8] uppercase">
                            Gaming PC
                        </p>
                        <h1 className="mt-3 text-4xl leading-tight font-black text-white sm:text-5xl">
                            {configuration.name}
                        </h1>
                        <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
                            {configuration.description ??
                                'Built and balanced for strong gaming performance and daily productivity.'}
                        </p>

                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            <InfoCard
                                label="Price"
                                value={formatPrice(
                                    configuration.price_in_cents,
                                )}
                                valueClassName="text-2xl font-bold text-[#00bd7d]"
                            />
                            <InfoCard
                                label="Included"
                                value={`${configuration.components_count} components`}
                                valueClassName="text-lg font-semibold text-white"
                            />
                            <InfoCard
                                label="Build ID"
                                value={`#${configuration.id}`}
                                valueClassName="text-lg font-semibold text-white"
                            />
                        </div>

                        <div className="mt-8">
                            <h2 className="text-xl font-black text-white">
                                Included Components
                            </h2>

                            {configuration.components.length ? (
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    {configuration.components.map(
                                        (component) => (
                                            <div
                                                key={component.id}
                                                className="rounded-2xl border border-white/10 bg-[#0b1321] p-4"
                                            >
                                                <p className="text-xs tracking-[0.12em] text-slate-500 uppercase">
                                                    {component.category_name ??
                                                        'Component'}
                                                </p>
                                                <p className="mt-1 text-base font-semibold text-white">
                                                    {component.name}
                                                </p>
                                                <p className="mt-2 text-sm text-slate-300">
                                                    {shortDescription(
                                                        component.description,
                                                    )}
                                                </p>
                                                <p className="mt-3 text-sm font-semibold text-[#9cf5d8]">
                                                    {formatPrice(
                                                        component.price_in_cents,
                                                    )}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-[#0b1321] p-5 text-sm text-slate-300">
                                    Components list is not available for this
                                    configuration yet.
                                </div>
                            )}
                        </div>
                    </article>

                    <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                        <ProductMediaBlock
                            imageSrc={configuration.image}
                            imageAlt={configuration.name}
                            className="p-0"
                            aspectClassName="flex h-56 items-center justify-center rounded-2xl border border-white/15 bg-[#0d1623]"
                            innerClassName="text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]/80"
                        />

                        <div className="mt-5 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Tag className="h-4 w-4 text-[#00bd7d]" />
                                Build SKU: #{configuration.id}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Cpu className="h-4 w-4 text-[#00bd7d]" />
                                Ready build with included parts
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <Wrench className="h-4 w-4 text-[#00bd7d]" />
                                Fully configurable before checkout
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col gap-3">
                            <Link
                                href={navigation.configure_href}
                                className="rounded-xl bg-[#00bd7d] px-5 py-3 text-center text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.5)] transition hover:bg-[#18d99a]"
                            >
                                Configure & Buy
                            </Link>
                            <Link
                                href={navigation.back_to_list_href}
                                className="rounded-xl border border-white/20 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                            >
                                Back to builds
                            </Link>
                        </div>
                    </aside>
                </section>
            </StoreLayout>
        </>
    );
}
