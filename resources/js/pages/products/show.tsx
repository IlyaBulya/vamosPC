import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Box, Laptop, Tag } from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

type ProductDetails = {
    id: number;
    name: string;
    description: string | null;
    price_in_cents: number;
    is_component: boolean;
};

type ProductCategory = {
    name: string;
    label: string;
    type: string;
    type_label: string;
};

type ProductNavigation = {
    back_to_type_href: string;
    back_to_category_href: string;
};

interface ProductShowPageProps {
    product: ProductDetails;
    category: ProductCategory;
    navigation: ProductNavigation;
}

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function ProductShowPage({
    product,
    category,
    navigation,
}: ProductShowPageProps) {
    const addToCart = () => {
        router.post(
            '/cart/items',
            {
                product_id: product.id,
                quantity: 1,
            },
            {
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title={product.name} />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-16 top-20 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12">
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                        <Link
                            href={navigation.back_to_type_href}
                            className="inline-flex items-center gap-2 font-medium text-slate-300 transition hover:text-[#9cf5d8]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to {category.type_label}
                        </Link>
                        <span className="text-slate-500">/</span>
                        <Link
                            href={navigation.back_to_category_href}
                            className="font-medium text-slate-300 transition hover:text-[#9cf5d8]"
                        >
                            {category.label}
                        </Link>
                    </div>

                    <section className="mt-5 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                            <p className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                                Product
                            </p>
                            <h1 className="mt-3 text-4xl font-black leading-tight text-white sm:text-5xl">
                                {product.name}
                            </h1>
                            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 sm:text-lg">
                                {product.description ??
                                    'No description available for this product yet.'}
                            </p>

                            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl border border-white/10 bg-[#0a1322] p-5">
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                        Price
                                    </p>
                                    <p className="mt-2 text-2xl font-bold text-[#00bd7d]">
                                        {formatPrice(product.price_in_cents)}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-[#0a1322] p-5">
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                        Category
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {category.label}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-[#0a1322] p-5">
                                    <p className="text-xs uppercase tracking-[0.12em] text-slate-400">
                                        Type
                                    </p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {category.type_label}
                                    </p>
                                </div>
                            </div>
                        </article>

                        <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                            <div className="flex h-56 items-center justify-center rounded-2xl border border-white/15 bg-[#0d1623]">
                                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]/80">
                                    Product Image
                                </span>
                            </div>

                            <div className="mt-5 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Tag className="h-4 w-4 text-[#00bd7d]" />
                                    SKU: #{product.id}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Laptop className="h-4 w-4 text-[#00bd7d]" />
                                    Series: {category.type_label}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <Box className="h-4 w-4 text-[#00bd7d]" />
                                    {product.is_component ? 'Component item' : 'Complete product'}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <button
                                    type="button"
                                    onClick={addToCart}
                                    className="rounded-xl bg-[#00bd7d] px-5 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.5)] transition hover:bg-[#18d99a]"
                                >
                                    Add to Cart
                                </button>
                                <Link
                                    href="/cart"
                                    className="rounded-xl border border-white/20 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                                >
                                    Open Cart
                                </Link>
                            </div>
                        </aside>
                    </section>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}

