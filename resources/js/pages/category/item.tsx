import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ShoppingCart } from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

type ProductItem = {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    price_in_cents: number;
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
    const productBasePath =
        category.type === 'laptop'
            ? `/laptops/${category.route_slug}`
            : `/catalog/${category.route_slug}`;

    return (
        <>
            <Head title={title} />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-52 h-72 w-72 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12">
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
                        <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[920px] text-left">
                                    <colgroup>
                                        <col className="w-[42%]" />
                                        <col className="w-[34%]" />
                                        <col className="w-[12%]" />
                                        <col className="w-[12%]" />
                                    </colgroup>
                                    <thead className="border-b border-white/10 bg-[#0a1322]">
                                        <tr className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                            <th className="px-7 py-4 font-semibold">Product</th>
                                            <th className="px-7 py-4 font-semibold">Description</th>
                                            <th className="px-7 py-4 font-semibold">Type</th>
                                            <th className="px-7 py-4 text-right font-semibold">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {category.products.map((product) => (
                                            <tr
                                                key={product.id}
                                                className="border-b border-white/10 text-slate-200 last:border-b-0"
                                            >
                                                <td className="px-7 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-md border border-white/15 bg-[#0d1623] text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9cf5d8]/80">
                                                            Photo
                                                        </div>
                                                        <div>
                                                            <Link
                                                                href={`${productBasePath}/${product.slug}`}
                                                                className="text-base font-semibold text-white transition hover:text-[#9cf5d8]"
                                                            >
                                                                {product.name}
                                                            </Link>
                                                            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-slate-500">
                                                                View details
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-7 py-5 text-sm leading-relaxed text-slate-300">
                                                    {product.description ??
                                                        'No description available.'}
                                                </td>
                                                <td className="px-7 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                                                            product.is_component
                                                                ? 'border-[#00bd7d]/45 bg-[#00bd7d]/12 text-[#9cf5d8]'
                                                                : 'border-white/20 bg-white/5 text-slate-200'
                                                        }`}
                                                    >
                                                        {product.is_component
                                                            ? 'Component'
                                                            : 'Product'}
                                                    </span>
                                                </td>
                                                <td className="px-7 py-5 text-right text-base font-semibold text-[#9cf5d8]">
                                                    {formatPrice(product.price_in_cents)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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

