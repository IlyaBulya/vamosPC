import { Head, Link, router } from '@inertiajs/react';
import { Plus, ShoppingCart, SlidersHorizontal } from 'lucide-react';
import FeaturePill from '@/components/store/feature-pill';
import PageHero from '@/components/store/page-hero';
import ProductCard from '@/components/store/product-card';
import StoreLayout from '@/layouts/store-layout';

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

            <StoreLayout contentClassName="mx-auto w-full max-w-[1540px] px-4 py-8 sm:px-8 lg:px-12" footerClassName="mt-6">
                <PageHero
                    backHref={backHref}
                    backLabel={`Back to ${typeLabel}`}
                    eyebrow="Category"
                    title={title}
                    description={
                        category.description ??
                        'No description available for this category yet.'
                    }
                    meta={
                        <FeaturePill>
                            <ShoppingCart className="h-4 w-4" />
                            {category.product_count} products
                        </FeaturePill>
                    }
                />

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
                                const productHref = `${productBasePath}/${product.slug}`;

                                return (
                                    <ProductCard
                                        key={product.id}
                                        href={productHref}
                                        name={product.name}
                                        description={shortDescription(product.description)}
                                        price={formatPrice(product.price_in_cents)}
                                        note={`from ${formatMonthly(product.price_in_cents)}`}
                                        availability={
                                            product.stock > 0
                                                ? 'In stock'
                                                : 'Pre-order'
                                        }
                                        color={product.color}
                                        onAddToCart={() => addToCart(product.id)}
                                    />
                                );
                            })}
                        </div>
                    </section>
                ) : (
                    <section className="mt-6 rounded-2xl border border-dashed border-white/20 bg-[#08101c]/75 p-8 text-center text-slate-400">
                        No products available in this category yet.
                    </section>
                )}
            </StoreLayout>
        </>
    );
}
