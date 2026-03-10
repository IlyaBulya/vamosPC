import { Head, Link } from '@inertiajs/react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import FeaturePill from '@/components/store/feature-pill';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type DemoBuild = {
    slug: string;
    name: string;
    specs: string;
    price_label: string;
    base_price_in_cents: number;
};

type ConfigProduct = {
    id: number;
    name: string;
    description: string | null;
    price_in_cents: number;
    stock: number;
    color: string | null;
};

type ConfigSection = {
    id: number;
    key: string;
    label: string;
    description: string | null;
    products: ConfigProduct[];
};

interface GamingPcConfiguratorPageProps {
    build: DemoBuild;
    sections: ConfigSection[];
}

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

function shortDescription(description: string | null) {
    const fallback = 'Performance-focused option ready for the demo configurator.';
    const text = (description ?? fallback).trim();

    if (text.length <= 96) {
        return text;
    }

    return `${text.slice(0, 93)}...`;
}

export default function GamingPcConfiguratorPage({
    build,
    sections,
}: GamingPcConfiguratorPageProps) {
    const [activeSectionKey, setActiveSectionKey] = useState<string>(
        sections[0]?.key ?? '',
    );
    const defaultSelection = useMemo(
        () =>
            Object.fromEntries(
                sections
                    .filter((section) => section.products[0] !== undefined)
                    .map((section) => [section.id, section.products[0].id]),
            ) as Record<number, number>,
        [sections],
    );

    const [selectedBySection, setSelectedBySection] =
        useState<Record<number, number>>(defaultSelection);

    const selectedProducts = useMemo(
        () =>
            sections
                .map((section) => {
                    const productId = selectedBySection[section.id];

                    if (!productId) {
                        return null;
                    }

                    const product =
                        section.products.find((item) => item.id === productId) ??
                        null;

                    if (!product) {
                        return null;
                    }

                    return {
                        section,
                        product,
                    };
                })
                .filter((item): item is { section: ConfigSection; product: ConfigProduct } => item !== null),
        [sections, selectedBySection],
    );

    const totalPriceInCents = useMemo(
        () =>
            build.base_price_in_cents +
            selectedProducts.reduce(
                (sum, item) => sum + item.product.price_in_cents,
                0,
            ),
        [build.base_price_in_cents, selectedProducts],
    );

    const resetSelection = () => {
        setSelectedBySection(defaultSelection);
    };

    useEffect(() => {
        if (sections.length === 0) {
            return;
        }

        const updateActiveSection = () => {
            const activationOffset = 180;
            let currentKey = sections[0]?.key ?? '';

            for (const section of sections) {
                const element = document.getElementById(section.key);

                if (!element) {
                    continue;
                }

                const rect = element.getBoundingClientRect();

                if (rect.top - activationOffset <= 0) {
                    currentKey = section.key;
                } else {
                    break;
                }
            }

            setActiveSectionKey(currentKey);
        };

        updateActiveSection();

        window.addEventListener('scroll', updateActiveSection, { passive: true });
        window.addEventListener('resize', updateActiveSection);

        return () => {
            window.removeEventListener('scroll', updateActiveSection);
            window.removeEventListener('resize', updateActiveSection);
        };
    }, [sections]);

    return (
        <>
            <Head title={`${build.name} Configurator`} />

            <StoreLayout
                className="overflow-x-visible"
                contentClassName="mx-auto w-full max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8"
                footerClassName="mt-6"
            >
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link
                        href="/gaming-pc"
                        className="inline-flex items-center rounded-full border border-[#00bd7d]/55 bg-[#00bd7d]/12 px-4 py-2 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                    >
                        Close Configurator
                    </Link>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                        <FeaturePill>
                            <Sparkles className="h-4 w-4" />
                            Demo Mode
                        </FeaturePill>
                        <span>
                            Visual flow only for now. Real ready-made PC products will
                            connect here later.
                        </span>
                    </div>
                </div>

                <section className="mt-6 grid items-start gap-4 lg:grid-cols-[220px_minmax(0,1fr)_280px] xl:gap-6 2xl:grid-cols-[240px_minmax(0,1fr)_300px]">
                    <aside className="rounded-3xl border border-white/10 bg-[#070d17]/95 p-5 lg:sticky lg:top-24 lg:z-20 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                            Components
                        </p>
                        <nav className="mt-4 space-y-2 lg:pr-1">
                            {sections.map((section) => {
                                const isActive = activeSectionKey === section.key;

                                return (
                                    <a
                                        key={section.id}
                                        href={`#${section.key}`}
                                        aria-current={isActive ? 'true' : undefined}
                                        className={`flex items-center justify-between rounded-2xl border px-3 py-2 text-sm transition ${
                                            isActive
                                                ? 'border-[#00bd7d]/55 bg-[#0b1321] text-white shadow-[0_0_18px_rgba(0,189,125,0.12)]'
                                                : 'border-transparent text-slate-300 hover:border-[#00bd7d]/35 hover:bg-[#0b1321] hover:text-white'
                                        }`}
                                    >
                                        <span>{section.label}</span>
                                        <span
                                            className={`text-xs ${
                                                isActive
                                                    ? 'text-[#9cf5d8]'
                                                    : 'text-slate-500'
                                            }`}
                                        >
                                            {section.products.length}
                                        </span>
                                    </a>
                                );
                            })}
                        </nav>
                    </aside>

                    <div className="space-y-6 lg:space-y-8">
                        {sections.map((section) => (
                            <section
                                key={section.id}
                                id={section.key}
                                className="scroll-mt-32 rounded-3xl border border-white/10 bg-[#070d17]/95 p-5 sm:p-6 lg:scroll-mt-28"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                                    <div>
                                        <h2 className="text-2xl font-black text-white">
                                            {section.label}
                                        </h2>
                                        <p className="mt-2 max-w-2xl text-sm text-slate-400">
                                            {section.description ??
                                                'Choose one option for this slot in the demo configurator.'}
                                        </p>
                                    </div>
                                    <FeaturePill>
                                        {section.products.length} options
                                    </FeaturePill>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {section.products.map((product) => {
                                        const isSelected =
                                            selectedBySection[section.id] === product.id;

                                        return (
                                            <button
                                                key={product.id}
                                                type="button"
                                                onClick={() =>
                                                    setSelectedBySection((current) => ({
                                                        ...current,
                                                        [section.id]: product.id,
                                                    }))
                                                }
                                                className={`grid w-full gap-4 rounded-3xl border p-4 text-left transition sm:grid-cols-[220px_minmax(0,1fr)_140px] ${
                                                    isSelected
                                                        ? 'border-[#00bd7d]/65 bg-[#00bd7d]/10 shadow-[0_0_24px_rgba(0,189,125,0.16)]'
                                                        : 'border-white/10 bg-[#0b1321] hover:border-[#00bd7d]/35'
                                                }`}
                                            >
                                                <ProductMediaBlock
                                                    label={product.name}
                                                    className="p-3"
                                                    aspectClassName="flex h-full min-h-36 items-center justify-center rounded-2xl border border-white/12 bg-[#0d1623]"
                                                    innerClassName="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#9cf5d8]/75"
                                                />

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={`h-3 w-3 rounded-full ${
                                                                product.stock > 0
                                                                    ? 'bg-[#00bd7d]'
                                                                    : 'bg-amber-400'
                                                            }`}
                                                        />
                                                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                            {product.stock > 0
                                                                ? 'In stock'
                                                                : 'Pre-order'}
                                                        </span>
                                                        {product.color ? (
                                                            <span className="rounded-full border border-white/10 px-2 py-1 text-[11px] text-slate-300">
                                                                {product.color}
                                                            </span>
                                                        ) : null}
                                                    </div>

                                                    <h3 className="mt-3 text-xl font-bold text-white">
                                                        {product.name}
                                                    </h3>
                                                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                                        {shortDescription(product.description)}
                                                    </p>
                                                </div>

                                                <div className="flex flex-col items-start justify-between gap-4 sm:items-end">
                                                    <div className="text-left sm:text-right">
                                                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
                                                            Component Price
                                                        </p>
                                                        <p className="mt-2 text-2xl font-black text-[#9cf5d8]">
                                                            {formatPrice(product.price_in_cents)}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                                                            isSelected
                                                                ? 'bg-[#00bd7d] text-[#04120d]'
                                                                : 'border border-white/15 text-slate-200'
                                                        }`}
                                                    >
                                                        {isSelected ? 'Selected' : 'Select'}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>

                    <aside className="rounded-3xl border border-white/10 bg-[#070d17]/95 p-4 lg:sticky lg:top-24 lg:z-20 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                            Configurator
                        </p>
                        <h1 className="mt-2 text-2xl font-black text-white">
                            {build.name}
                        </h1>
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">
                            {build.specs}
                        </p>

                        <ProductMediaBlock
                            label="Build Preview"
                            className="mt-4 p-2"
                            aspectClassName="flex min-h-44 items-center justify-center rounded-2xl border border-white/12 bg-[#0d1623]"
                            innerClassName="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9cf5d8]/80"
                        />

                        <div className="mt-4 rounded-2xl border border-[#00bd7d]/20 bg-[#0b1321] p-3.5">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                                Demo Base Price
                            </p>
                            <p className="mt-1.5 text-base font-bold text-white">
                                {build.price_label}
                            </p>
                            <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-400">
                                Live Estimated Total
                            </p>
                            <p className="mt-1.5 text-2xl font-black text-[#00bd7d]">
                                {formatPrice(totalPriceInCents)}
                            </p>
                        </div>

                        <div className="mt-4 flex gap-2.5">
                            <button
                                type="button"
                                onClick={resetSelection}
                                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-3.5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/45 hover:text-[#9cf5d8]"
                            >
                                <RotateCcw className="h-4 w-4" />
                                Reset
                            </button>
                            <button
                                type="button"
                                className="flex-1 rounded-2xl bg-[#00bd7d] px-4 py-2.5 text-sm font-semibold text-[#04120d] shadow-[0_0_24px_rgba(0,189,125,0.35)]"
                            >
                                Demo Buy Flow
                            </button>
                        </div>

                        <div className="mt-4 rounded-2xl border border-dashed border-white/15 bg-[#0b1321] p-3 text-sm text-slate-400">
                            This page is a visual prototype. When ready-made PC products
                            are added, this same layout will be connected to real
                            configurations, saving, and checkout.
                        </div>

                        <div className="mt-4 border-t border-white/10 pt-4">
                            <h2 className="text-lg font-bold text-white">
                                Current Configuration
                            </h2>
                            <div className="mt-3 space-y-2.5">
                                {selectedProducts.map(({ section, product }) => (
                                    <div
                                        key={section.id}
                                        className="rounded-2xl border border-white/10 bg-[#0b1321] p-3"
                                    >
                                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                                            {section.label}
                                        </p>
                                        <p className="mt-1.5 text-sm font-semibold text-white">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 text-sm text-[#9cf5d8]">
                                            {formatPrice(product.price_in_cents)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </section>
            </StoreLayout>
        </>
    );
}
