import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type DashboardStats = {
    users: number;
    admins: number;
    products: number;
    categories: number;
    orders: number;
};

type RecentOrder = {
    id: number;
    user_name: string;
    status: string;
    total_in_cents: number;
    created_at: string | null;
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function AdminDashboardPage({
    stats,
    recentOrders,
}: {
    stats: DashboardStats;
    recentOrders: RecentOrder[];
}) {
    const cards = [
        { label: 'Users', value: stats.users },
        { label: 'Admins', value: stats.admins },
        { label: 'Products', value: stats.products },
        { label: 'Categories', value: stats.categories },
        { label: 'Orders', value: stats.orders },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <AdminLayout
                title="Dashboard"
                description="Monitor the current store data and access the main management sections."
            >
                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {cards.map((card) => (
                        <article
                            key={card.label}
                            className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6"
                        >
                            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                                {card.label}
                            </p>
                            <p className="mt-3 text-4xl font-black text-white">
                                {card.value}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    Recent Orders
                                </h2>
                                <p className="mt-1 text-sm text-slate-400">
                                    Latest orders created by customers.
                                </p>
                            </div>
                            <Link
                                href="/admin/orders"
                                className="rounded-full border border-[#00bd7d]/45 px-4 py-2 text-sm text-[#9cf5d8] transition hover:bg-[#00bd7d]/10"
                            >
                                View all orders
                            </Link>
                        </div>

                        <div className="mt-5 overflow-x-auto">
                            <table className="w-full min-w-[520px] text-left text-sm">
                                <thead className="text-slate-400">
                                    <tr className="border-b border-white/10">
                                        <th className="pb-3 font-medium">Order</th>
                                        <th className="pb-3 font-medium">Customer</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 text-right font-medium">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.length ? (
                                        recentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b border-white/10 last:border-b-0"
                                            >
                                                <td className="py-4 text-white">
                                                    #{order.id}
                                                    {order.created_at ? (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {order.created_at}
                                                        </p>
                                                    ) : null}
                                                </td>
                                                <td className="py-4 text-slate-300">
                                                    {order.user_name}
                                                </td>
                                                <td className="py-4">
                                                    <span className="rounded-full border border-[#00bd7d]/30 bg-[#00bd7d]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]">
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right font-semibold text-white">
                                                    {formatPrice(order.total_in_cents)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="py-8 text-center text-slate-400"
                                            >
                                                No orders yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </article>

                    <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                        <h2 className="text-xl font-bold text-white">
                            Quick Actions
                        </h2>
                        <div className="mt-5 space-y-3">
                            <Link
                                href="/admin/products/create"
                                className="block rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-4 text-sm font-medium text-slate-200 transition hover:border-[#00bd7d]/45 hover:text-[#9cf5d8]"
                            >
                                Create a new product
                            </Link>
                            <Link
                                href="/admin/categories/create"
                                className="block rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-4 text-sm font-medium text-slate-200 transition hover:border-[#00bd7d]/45 hover:text-[#9cf5d8]"
                            >
                                Add a new category
                            </Link>
                            <Link
                                href="/admin/users"
                                className="block rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-4 text-sm font-medium text-slate-200 transition hover:border-[#00bd7d]/45 hover:text-[#9cf5d8]"
                            >
                                Review user accounts
                            </Link>
                        </div>
                    </article>
                </section>
            </AdminLayout>
        </>
    );
}
