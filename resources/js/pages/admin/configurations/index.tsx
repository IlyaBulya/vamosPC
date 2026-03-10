import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type ConfigurationRow = {
    id: number;
    name: string;
    user_name: string;
    user_email: string;
    base_product_name: string | null;
    price_in_cents: number;
    products_count: number;
    created_at: string | null;
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
                description="Review saved custom builds created by customers."
            >
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[960px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Configuration</th>
                                    <th className="px-5 py-4 font-medium">User</th>
                                    <th className="px-5 py-4 font-medium">Base Product</th>
                                    <th className="px-5 py-4 font-medium">Components</th>
                                    <th className="px-5 py-4 font-medium">Price</th>
                                    <th className="px-5 py-4 font-medium">Created</th>
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
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                <p>{configuration.user_name}</p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {configuration.user_email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {configuration.base_product_name ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {configuration.products_count}
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-white">
                                                {formatPrice(configuration.price_in_cents)}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {configuration.created_at ?? '-'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
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
