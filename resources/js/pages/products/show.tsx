import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

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
    return (
        <>
            <Head title={product.name} />

            <StoreLayout>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                    <Link
                        href={navigation.back_to_type_href}
                        className="font-medium text-slate-500 transition hover:text-slate-700"
                    >
                        Back to {category.type_label}
                    </Link>
                    <span className="text-slate-300">/</span>
                    <Link
                        href={navigation.back_to_category_href}
                        className="font-medium text-slate-500 transition hover:text-slate-700"
                    >
                        {category.label}
                    </Link>
                </div>

                <p className="mt-8 text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                    Product
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                    {product.name}
                </h1>
                <p className="mt-4 max-w-3xl text-base text-slate-600 md:text-lg">
                    {product.description ?? 'No description available for this product yet.'}
                </p>

                <div className="mt-8 grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-xs tracking-wide text-slate-500 uppercase">
                            Price
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">
                            {formatPrice(product.price_in_cents)}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-xs tracking-wide text-slate-500 uppercase">
                            Category
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                            {category.label}
                        </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-5">
                        <p className="text-xs tracking-wide text-slate-500 uppercase">
                            Type
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-900">
                            {category.type_label}
                        </p>
                    </div>
                </div>
            </StoreLayout>
        </>
    );
}
