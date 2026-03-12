import { Head, Link, router } from '@inertiajs/react';
import { Cpu, Monitor, ShoppingCart } from 'lucide-react';
import { useMemo, useState } from 'react';
import StoreLayout from '@/layouts/store-layout';

type SlotProduct = {
    id: number;
    name: string;
    description: string | null;
    price_in_cents: number;
    color: string | null;
    category_name: string | null;
};

type ComponentSlot = {
    slot_key: string;
    slot_label: string;
    category_id: number | null;
    category_name: string;
    default_product_id: number;
    products: SlotProduct[];
};

type Configuration = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    base_components_total_in_cents: number;
    markup_in_cents: number;
};

type SelectedProduct = SlotProduct & {
    slot_key: string;
    slot_label: string;
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function ConfigurePcPage({
    configuration,
    slots,
}: {
    configuration: Configuration;
    slots: ComponentSlot[];
}) {
    const [selectedBySlot, setSelectedBySlot] = useState<Record<string, number>>(
        () =>
            Object.fromEntries(
                slots.map((slot) => [slot.slot_key, slot.default_product_id]),
            ),
    );
    const [isBuying, setIsBuying] = useState(false);

    const selectedProducts = useMemo<SelectedProduct[]>(
        () =>
            slots
                .map((slot) => {
                    const selectedId =
                        selectedBySlot[slot.slot_key] ?? slot.default_product_id;
                    const selected =
                        slot.products.find((product) => product.id === selectedId) ??
                        slot.products[0] ??
                        null;

                    if (! selected) {
                        return null;
                    }

                    return {
                        ...selected,
                        slot_key: slot.slot_key,
                        slot_label: slot.slot_label,
                    };
                })
                .filter((product): product is SelectedProduct => product !== null),
        [selectedBySlot, slots],
    );

    const selectedTotalInCents = selectedProducts.reduce(
        (sum, product) => sum + product.price_in_cents,
        0,
    );
    const previewPriceInCents = Math.max(
        0,
        selectedTotalInCents + configuration.markup_in_cents,
    );

    const setSelectedSlot = (slotKey: string, value: string) => {
        const nextProductId = Number(value);

        if (! Number.isFinite(nextProductId)) {
            return;
        }

        setSelectedBySlot((current) => ({
            ...current,
            [slotKey]: nextProductId,
        }));
    };

    const buyBuild = () => {
        if (! slots.length || isBuying) {
            return;
        }

        router.post(
            `/gaming-pcs/${configuration.id}/buy`,
            {
                selected_components: selectedBySlot,
            },
            {
                onStart: () => setIsBuying(true),
                onFinish: () => setIsBuying(false),
            },
        );
    };

    return (
        <>
            <Head title={`Configure ${configuration.name}`} />

            <StoreLayout footerClassName="mt-6">
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/gaming-pcs"
                        className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        Back to Gaming PCs
                    </Link>
                    <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Base #{configuration.id}
                    </span>
                </div>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
                    <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                                    Configure
                                </p>
                                <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                    {configuration.name}
                                </h1>
                                <p className="mt-2 max-w-3xl text-sm text-slate-300">
                                    {configuration.description ??
                                        'Adjust your preferred components and review the preview before buying.'}
                                </p>
                            </div>
                            <span className="rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-3 py-1 text-xs font-semibold text-[#9cf5d8]">
                                {slots.length} slots
                            </span>
                        </div>

                        <div className="mt-5 space-y-3">
                            {slots.map((slot) => {
                                const selectedId =
                                    selectedBySlot[slot.slot_key] ??
                                    slot.default_product_id;

                                return (
                                    <label
                                        key={slot.slot_key}
                                        className="block rounded-2xl border border-white/10 bg-[#0b1321] p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <p className="text-sm font-semibold text-white">
                                                {slot.slot_label}
                                            </p>
                                            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                                {slot.category_name}
                                            </p>
                                        </div>

                                        <select
                                            value={String(selectedId)}
                                            onChange={(event) =>
                                                setSelectedSlot(
                                                    slot.slot_key,
                                                    event.target.value,
                                                )
                                            }
                                            disabled={!slot.products.length}
                                            className="mt-3 w-full rounded-xl border border-white/15 bg-[#111821] px-3 py-2 text-sm text-slate-100"
                                        >
                                            {slot.products.map((product) => (
                                                <option
                                                    key={product.id}
                                                    value={String(product.id)}
                                                >
                                                    {product.name} -{' '}
                                                    {formatPrice(product.price_in_cents)}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                );
                            })}
                        </div>
                    </article>

                    <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-4 sm:p-5 lg:sticky lg:top-6 lg:h-fit">
                        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                            Live Preview
                        </p>

                        <article className="mx-auto max-w-[390px] rounded-[28px] border border-white/15 bg-gradient-to-b from-[#131a26] via-[#0c111a] to-[#070b12] p-4 shadow-[0_18px_35px_rgba(0,0,0,0.45)]">
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1622]">
                                <div className="aspect-[4/3]">
                                    {configuration.image ? (
                                        <img
                                            src={configuration.image}
                                            alt={configuration.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_18%,rgba(0,189,125,0.25),transparent_42%)]" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(0,189,125,0.14),transparent_48%)]" />
                                            <Monitor className="relative h-16 w-16 text-slate-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-[0.02em] text-white">
                                {configuration.name}
                            </h2>

                            <div className="mt-4 text-center">
                                <p className="text-4xl font-black text-white">
                                    {formatPrice(previewPriceInCents)}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    selected parts + base markup
                                </p>
                            </div>

                            <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-[#0a121f] p-3 text-sm text-slate-300">
                                <p>
                                    Selected parts total:{' '}
                                    <span className="font-semibold text-white">
                                        {formatPrice(selectedTotalInCents)}
                                    </span>
                                </p>
                                <p>
                                    Base build markup:{' '}
                                    <span className="font-semibold text-white">
                                        {formatPrice(configuration.markup_in_cents)}
                                    </span>
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={buyBuild}
                                disabled={!slots.length || isBuying}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00bd7d] px-4 py-3 text-sm font-bold text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {isBuying ? 'Adding to Cart...' : 'Buy This Build'}
                            </button>

                            <div className="mt-4 space-y-2">
                                {selectedProducts.map((product) => (
                                    <div
                                        key={product.slot_key}
                                        className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                                    >
                                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                            {product.slot_label}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-200">
                                            {product.name}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                                <Cpu className="h-3.5 w-3.5" />
                                {selectedProducts.length} selected components
                            </div>
                        </article>
                    </aside>
                </section>
            </StoreLayout>
        </>
    );
}
