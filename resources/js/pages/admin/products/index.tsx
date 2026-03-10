import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type ProductRow = {
    id: number;
    name: string;
    category_name: string | null;
    category_type: string | null;
    price_in_cents: number;
    stock: number;
    color: string | null;
    is_component: boolean;
    can_be_base_product: boolean;
    is_sellable: boolean;
    is_available_for_configuration: boolean;
    order_items_count: number;
    configurations_count: number;
    base_configurations_count: number;
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function AdminProductsPage({
    products,
}: {
    products: ProductRow[];
}) {
    const destroyProduct = (productId: number) => {
        if (! window.confirm('Delete this product?')) {
            return;
        }

        router.delete(`/admin/products/${productId}`);
    };

    return (
        <>
            <Head title="Admin Products" />

            <AdminLayout
                title="Products"
                description="Create, edit, and review all store products."
                actions={
                    <Link
                        href="/admin/products/create"
                        className="rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.35)] transition hover:bg-[#18d99a]"
                    >
                        New Product
                    </Link>
                }
            >
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1120px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Product</th>
                                    <th className="px-5 py-4 font-medium">Category</th>
                                    <th className="px-5 py-4 font-medium">Type</th>
                                    <th className="px-5 py-4 font-medium">Price</th>
                                    <th className="px-5 py-4 font-medium">Stock</th>
                                    <th className="px-5 py-4 font-medium">Mode</th>
                                    <th className="px-5 py-4 font-medium">Flags</th>
                                    <th className="px-5 py-4 font-medium">Usage</th>
                                    <th className="px-5 py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.length ? (
                                    products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="border-b border-white/10 last:border-b-0"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-white">
                                                    {product.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    ID #{product.id}
                                                    {product.color
                                                        ? ` • ${product.color}`
                                                        : ''}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {product.category_name ?? 'Unassigned'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {product.category_type ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-white">
                                                {formatPrice(product.price_in_cents)}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {product.stock}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
                                                    {product.is_component
                                                        ? 'Component'
                                                        : 'Product'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                <p>
                                                    Base:{' '}
                                                    {product.can_be_base_product
                                                        ? 'Yes'
                                                        : 'No'}
                                                </p>
                                                <p>
                                                    Sellable:{' '}
                                                    {product.is_sellable ? 'Yes' : 'No'}
                                                </p>
                                                <p>
                                                    Config:{' '}
                                                    {product.is_available_for_configuration
                                                        ? 'Yes'
                                                        : 'No'}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                <p>Orders: {product.order_items_count}</p>
                                                <p>Pivot: {product.configurations_count}</p>
                                                <p>
                                                    Base builds:{' '}
                                                    {product.base_configurations_count}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/products/${product.id}/edit`}
                                                        className="rounded-full border border-[#00bd7d]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9cf5d8] transition hover:bg-[#00bd7d]/10"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroyProduct(product.id)}
                                                        className="rounded-full border border-red-500/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/10"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={9}
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
