import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type ConfigurationRow = {
    id: number;
    name: string;
    description: string | null;
    image: string | null;
    price: number;
    products_count: number;
    products: Array<{
        id: number;
        name: string;
    }>;
    updated_at: string | null;
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function AdminConfigurationsPage({
    configurations,
}: {
    configurations: ConfigurationRow[];
}) {
    return (
        <>
            <Head title="Admin Configurations" />

            <AdminLayout
                title="Configurations"
                description="Create ready-to-sell PC configurations and attach selected component products."
                actions={
                    <Link
                        href="/admin/configurations/create"
                        className="rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.35)] transition hover:bg-[#18d99a]"
                    >
                        New Configuration
                    </Link>
                }
            >
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">
                                        Configuration
                                    </th>
                                    <th className="px-5 py-4 font-medium">Price</th>
                                    <th className="px-5 py-4 font-medium">Components</th>
                                    <th className="px-5 py-4 font-medium">
                                        Component Preview
                                    </th>
                                    <th className="px-5 py-4 font-medium">Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                {configurations.length ? (
                                    configurations.map((configuration) => (
                                        <tr
                                            key={configuration.id}
                                            className="border-b border-white/10 last:border-b-0"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-white">
                                                    {configuration.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    ID #{configuration.id}
                                                </p>
                                                {configuration.description ? (
                                                    <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                                                        {configuration.description}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-white">
                                                {formatPrice(configuration.price)}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {configuration.products_count}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {configuration.products.length ? (
                                                        configuration.products.map((product) => (
                                                            <span
                                                                key={product.id}
                                                                className="rounded-full border border-[#00bd7d]/35 bg-[#00bd7d]/10 px-3 py-1 text-xs text-[#9cf5d8]"
                                                            >
                                                                {product.name}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-slate-500">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {configuration.updated_at ?? '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            No configurations found.
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

