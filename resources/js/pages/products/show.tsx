import { Head, Link, router } from '@inertiajs/react';
import { Box, Laptop, Tag } from 'lucide-react';
import BackLinkRow from '@/components/store/back-link-row';
import InfoCard from '@/components/store/info-card';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type ProductDetails = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    is_component: boolean;
    is_sellable: boolean;
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

            <StoreLayout footerClassName="mt-6">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <BackLinkRow
                        href={navigation.back_to_type_href}
                        label={`Back to ${category.type_label}`}
                    />
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
                            <InfoCard
                                label="Price"
                                value={formatPrice(product.price_in_cents)}
                                valueClassName="text-2xl font-bold text-[#00bd7d]"
                            />
                            <InfoCard
                                label="Category"
                                value={category.label}
                                valueClassName="text-lg font-semibold text-white"
                            />
                            <InfoCard
                                label="Type"
                                value={category.type_label}
                                valueClassName="text-lg font-semibold text-white"
                            />
                        </div>
                    </article>

                    <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                        <ProductMediaBlock
                            imageSrc={product.image}
                            imageAlt={product.name}
                            className="p-0"
                            aspectClassName="flex h-56 items-center justify-center rounded-2xl border border-white/15 bg-[#0d1623]"
                            innerClassName="text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]/80"
                        />

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
                            {product.is_sellable ? (
                                <button
                                    type="button"
                                    onClick={addToCart}
                                    className="rounded-xl bg-[#00bd7d] px-5 py-3 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.5)] transition hover:bg-[#18d99a]"
                                >
                                    Add to Cart
                                </button>
                            ) : null}
                            {!product.is_sellable ? (
                                <div className="rounded-xl border border-white/15 bg-[#0b1321] px-5 py-3 text-sm text-slate-300">
                                    This item is not available for direct purchase.
                                </div>
                            ) : null}
                            <Link
                                href="/cart"
                                className="rounded-xl border border-white/20 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                            >
                                Open Cart
                            </Link>
                        </div>
                    </aside>
                </section>
            </StoreLayout>
        </>
    );
}
