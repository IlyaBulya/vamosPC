import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeft,
    Plus,
    ShoppingCart,
    SlidersHorizontal,
} from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

type ProductItem = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    price_in_cents: number;
    stock: number;
    color: string | null;
    is_component: boolean;
};

type CategoryItem = {
    name: string;
    type: string;
    description: string | null;
    route_slug: string;
    product_count: number;
    products: ProductItem[];
};

interface CategoryItemPageProps {
    title: string;
    typeLabel: string;
    backHref: string;
    category: CategoryItem;
}

const filterGroups = [
    'Store',
    'Price, EUR',
    'Brand',
    'Graphics Card',
    'Processor',
    'Memory',
    'Storage',
];

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

function formatMonthly(priceInCents: number) {
    const monthly = Math.max(1, Math.round(priceInCents / 100 / 24));

    return `${monthly.toLocaleString('en-US')} EUR/month`;
}

function shortDescription(description: string | null) {
    const fallback = 'Tuned and tested build for smooth gaming and creative work.';
    const text = (description ?? fallback).trim();

    if (text.length <= 96) {
        return text;
    }

    return `${text.slice(0, 93)}...`;
}

export default function CategoryItemPage({
    title,
    typeLabel,
    backHref,
    category,
}: CategoryItemPageProps) {
    const productBasePath =
        category.type === 'laptop'
            ? `/laptops/${category.route_slug}`
            : `/catalog/${category.route_slug}`;

    const addToCart = (productId: number) => {
        router.post(
            '/cart/items',
            {
                product_id: productId,
                quantity: 1,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={title} />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-52 h-72 w-72 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-8 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                        <Link
                            href={backHref}
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#9cf5d8]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to {typeLabel}
                        </Link>

                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                            Category
                        </p>
                        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
                            {title}
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                            {category.description ??
                                'No description available for this category yet.'}
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-2 text-sm text-[#9cf5d8]">
                            <ShoppingCart className="h-4 w-4" />
                            {category.product_count} products
                        </div>
                    </section>

                    {category.products.length > 0 ? (
                        <section className="mt-7 grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
                            <aside className="h-fit rounded-3xl border border-white/10 bg-[#070d17]/95 p-5 xl:sticky xl:top-24">
                                <div className="flex items-center gap-2 border-b border-white/10 pb-4 text-sm font-semibold text-white">
                                    <SlidersHorizontal className="h-4 w-4 text-[#00bd7d]" />
                                    Filters
                                </div>

                                <div className="mt-2 divide-y divide-white/10 border-b border-white/10">
                                    {filterGroups.map((filter) => (
                                        <button
                                            key={filter}
                                            type="button"
                                            className="flex w-full items-center justify-between py-4 text-left text-lg font-medium text-slate-200 transition hover:text-[#9cf5d8]"
                                        >
                                            <span>{filter}</span>
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    ))}
                                </div>
                            </aside>

                            <div className="grid gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                                {category.products.map((product) => {
                                    const inStock = product.stock > 0;
                                    const productHref = `${productBasePath}/${product.slug}`;

                                    return (
                                        <article
                                            key={product.id}
                                            className="rounded-2xl border border-white/10 bg-[#111722]/90 p-4 shadow-[0_16px_30px_rgba(0,0,0,0.35)] transition hover:border-[#00bd7d]/35 hover:bg-[#151d2a]"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`inline-flex items-center gap-2 text-sm ${
                                                        inStock
                                                            ? 'text-[#b9ffd2]'
                                                            : 'text-amber-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-2.5 w-2.5 rounded-full ${
                                                            inStock
                                                                ? 'bg-[#b6ff37] shadow-[0_0_10px_rgba(182,255,55,0.8)]'
                                                                : 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]'
                                                        }`}
                                                    />
                                                    {inStock
                                                        ? 'In stock'
                                                        : 'Pre-order'}
                                                </div>

                                                {product.color && (
                                                    <span className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                                        {product.color}
                                                    </span>
                                                )}
                                            </div>

                                            <Link href={productHref} className="group mt-3 block">
                                                <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#090f18] p-4">
                                                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00bd7d]/30 blur-3xl transition group-hover:scale-110" />
                                                    <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-gradient-to-b from-[#1b2533] to-[#0a1019]">
                                                        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9cf5d8]/85">
                                                            Product Image
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>

                                            <div className="mt-4 space-y-2">
                                                <Link
                                                    href={productHref}
                                                    className="text-[1.72rem] font-black leading-tight text-white transition hover:text-[#9cf5d8]"
                                                >
                                                    {product.name}
                                                </Link>

                                                <p className="text-sm leading-relaxed text-slate-300">
                                                    {shortDescription(
                                                        product.description,
                                                    )}
                                                </p>
                                            </div>

                                            <div className="mt-5 flex items-end justify-between gap-3">
                                                <div>
                                                    <p className="text-3xl font-black text-white">
                                                        {formatPrice(
                                                            product.price_in_cents,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        from{' '}
                                                        {formatMonthly(
                                                            product.price_in_cents,
                                                        )}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        addToCart(product.id)
                                                    }
                                                    className="inline-flex items-center gap-1 rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_16px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                    Buy
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    ) : (
                        <section className="mt-6 rounded-2xl border border-dashed border-white/20 bg-[#08101c]/75 p-8 text-center text-slate-400">
                            No products available in this category yet.
                        </section>
                    )}
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
