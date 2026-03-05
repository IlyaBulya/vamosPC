import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

type ProductItem = {
    name: string;
    description: string | null;
    price_in_cents: number;
    is_component: boolean;
};

type CategoryItem = {
    name: string;
    description: string | null;
    product_count: number;
    products: ProductItem[];
};

interface CategoryItemPageProps {
    title: string;
    typeLabel: string;
    backHref: string;
    category: CategoryItem;
}

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function CategoryItemPage({
    title,
    typeLabel,
    backHref,
    category,
}: CategoryItemPageProps) {
    return (
        <>
            <Head title={title} />

            <StoreLayout>
                <Link
                    href={backHref}
                    className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
                >
                    Back to {typeLabel}
                </Link>

                <p className="mt-8 text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                    Category
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                    {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                    {category.description ??
                        'No description available for this category yet.'}
                </p>
                <p className="mt-6 text-sm font-medium text-slate-500">
                    {category.product_count} products
                </p>
                {category.products.length > 0 ? (
                    <ul className="mt-6 space-y-3">
                        {category.products.map((product) => (
                            <li
                                key={`${category.name}-${product.name}-${product.price_in_cents}`}
                                className="rounded-lg border border-slate-200 bg-white p-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        {product.name}
                                    </h2>
                                    <span className="shrink-0 text-sm font-semibold text-slate-700">
                                        {formatPrice(product.price_in_cents)}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-600">
                                    {product.description ??
                                        'No description available.'}
                                </p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="mt-6 text-sm text-slate-500">
                        No products available in this category yet.
                    </p>
                )}
                <p className="mt-6 text-sm text-slate-500">Type: {typeLabel}</p>
            </StoreLayout>
        </>
    );
}
