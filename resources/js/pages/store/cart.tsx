import { Head, Link, router } from '@inertiajs/react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';
import { Input } from '@/components/ui/input';

type CartItem = {
    id: number;
    name: string;
    subtitle: string | null;
    availability: 'In stock' | 'Pre-order';
    unit_price_in_cents: number;
    qty: number;
    href: string;
};

const formatPrice = (priceInCents: number): string =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);

export default function CartPage({ items }: { items: CartItem[] }) {
    const [promoCode, setPromoCode] = useState('');

    const preparedItems = items.map((item) => ({
        ...item,
        subtotal_in_cents: item.unit_price_in_cents * item.qty,
    }));

    const totalQty = preparedItems.reduce((sum, item) => sum + item.qty, 0);
    const totalInCents = preparedItems.reduce(
        (sum, item) => sum + item.subtotal_in_cents,
        0,
    );

    const updateQty = (item: CartItem, nextQty: number) => {
        if (nextQty <= 0) {
            router.delete(`/cart/items/${item.id}`, {
                preserveScroll: true,
            });
            return;
        }

        router.patch(
            `/cart/items/${item.id}`,
            {
                quantity: nextQty,
            },
            {
                preserveScroll: true,
            },
        );
    };

    const removeItem = (item: CartItem) => {
        router.delete(`/cart/items/${item.id}`, {
            preserveScroll: true,
        });
    };

    const clearAll = () => {
        router.delete('/cart/items', {
            preserveScroll: true,
        });
    };

    const availabilityClass = (availability: CartItem['availability']) => {
        return availability === 'In stock' ? 'text-[#9cf5d8]' : 'text-amber-300';
    };

    return (
        <>
            <Head title="Cart" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-16 top-28 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-8">
                    <section className="mb-6 text-center">
                        <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                            Cart
                        </h1>
                    </section>

                    <div className="mb-3 flex justify-end">
                        <button
                            type="button"
                            onClick={clearAll}
                            disabled={!preparedItems.length}
                            className="text-sm font-medium text-slate-300 transition hover:text-[#9cf5d8] disabled:cursor-not-allowed disabled:text-slate-600"
                        >
                            Clear all
                        </button>
                    </div>

                    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#070d17]/95">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[920px] text-left">
                                <colgroup>
                                    <col className="w-[50%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[16%]" />
                                    <col className="w-[14%]" />
                                    <col className="w-[6%]" />
                                </colgroup>
                                <thead className="border-b border-white/10 bg-[#111821]">
                                    <tr className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                        <th className="px-7 py-4 font-semibold">Product</th>
                                        <th className="px-7 py-4 font-semibold">Availability</th>
                                        <th className="px-7 py-4 font-semibold">Quantity</th>
                                        <th className="px-7 py-4 text-right font-semibold">Price</th>
                                        <th className="px-7 py-4 text-right font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preparedItems.length ? (
                                        preparedItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b border-white/10 text-slate-200 last:border-b-0"
                                            >
                                                <td className="px-7 py-5">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex h-16 w-24 shrink-0 items-center justify-center rounded-md border border-white/15 bg-[#0d1623] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9cf5d8]/80">
                                                            Photo
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={item.href}
                                                                className="text-xl font-semibold text-white transition hover:text-[#9cf5d8]"
                                                            >
                                                                {item.name}
                                                            </Link>
                                                            {item.subtitle && (
                                                                <p className="mt-1 text-sm text-slate-300">
                                                                    {item.subtitle}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td
                                                    className={`px-7 py-5 text-sm font-semibold ${availabilityClass(item.availability)}`}
                                                >
                                                    {item.availability}
                                                </td>
                                                <td className="px-7 py-5">
                                                    <div className="inline-flex items-center rounded-md border border-white/15 bg-[#111821]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQty(
                                                                    item,
                                                                    item.qty - 1,
                                                                )
                                                            }
                                                            className="p-2 text-slate-300 transition hover:text-[#9cf5d8]"
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="w-10 text-center text-sm font-semibold text-white">
                                                            {item.qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                updateQty(
                                                                    item,
                                                                    item.qty + 1,
                                                                )
                                                            }
                                                            className="p-2 text-slate-300 transition hover:text-[#9cf5d8]"
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-7 py-5 text-right text-2xl font-semibold text-white">
                                                    {formatPrice(
                                                        item.subtotal_in_cents,
                                                    )}
                                                </td>
                                                <td className="px-7 py-5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(item)
                                                        }
                                                        className="inline-flex rounded-md p-1.5 text-red-400 transition hover:bg-red-500/10"
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-7 py-16 text-center text-slate-400"
                                            >
                                                Your cart is empty.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div className="flex max-w-md items-center gap-2">
                            <Input
                                value={promoCode}
                                onChange={(event) =>
                                    setPromoCode(event.target.value)
                                }
                                placeholder="Promo code"
                                className="border-white/15 bg-[#111821] text-slate-100 placeholder:text-slate-500"
                            />
                            <button
                                type="button"
                                disabled={!promoCode.trim()}
                                className="rounded-xl border border-white/20 px-6 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Apply
                            </button>
                        </div>

                        <div className="text-left lg:text-right">
                            <p className="text-sm text-slate-400">
                                Items:{' '}
                                <span className="font-semibold text-white">
                                    {totalQty}
                                </span>
                            </p>
                            <p className="mt-1 text-3xl font-black text-white">
                                Total:{' '}
                                <span className="text-[#00bd7d]">
                                    {formatPrice(totalInCents)}
                                </span>
                            </p>
                            <p className="mt-1 text-sm text-slate-400">
                                Financing options available at checkout
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col items-center gap-3">
                        <button
                            type="button"
                            className="min-w-[280px] rounded-full bg-[#00bd7d] px-8 py-3 font-semibold text-[#04120d] shadow-[0_0_24px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                        >
                            Proceed to Checkout
                        </button>
                        <Link
                            href="/catalog"
                            className="text-sm text-slate-300 transition hover:text-[#9cf5d8]"
                        >
                            Continue shopping
                        </Link>
                    </div>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}

