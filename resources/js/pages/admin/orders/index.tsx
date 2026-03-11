import { Head, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AdminLayout from '@/layouts/admin-layout';

type OrderItem = {
    id: number;
    name: string;
    qty: number;
    price_in_cents: number;
};

type OrderRow = {
    id: number;
    user_name: string;
    user_email: string;
    status: string;
    total_in_cents: number;
    discount_in_cents: number;
    created_at: string | null;
    items: OrderItem[];
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function AdminOrdersPage({
    orders,
    statuses,
}: {
    orders: OrderRow[];
    statuses: string[];
}) {
    const initialStatuses = useMemo(
        () =>
            Object.fromEntries(
                orders.map((order) => [order.id, order.status]),
            ) as Record<number, string>,
        [orders],
    );

    const [selectedStatuses, setSelectedStatuses] = useState(initialStatuses);

    const updateStatus = (orderId: number) => {
        router.patch(`/admin/orders/${orderId}`, {
            status: selectedStatuses[orderId],
        });
    };

    return (
        <>
            <Head title="Admin Orders" />

            <AdminLayout
                title="Orders"
                description="Review order contents and update statuses as fulfillment progresses."
            >
                <div className="space-y-4">
                    {orders.length ? (
                        orders.map((order) => (
                            <article
                                key={order.id}
                                className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6"
                            >
                                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Order #{order.id}
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-300">
                                            {order.user_name} • {order.user_email}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {order.created_at ?? 'No date available'}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-start gap-3 xl:items-end">
                                        <p className="text-2xl font-black text-[#00bd7d]">
                                            {formatPrice(order.total_in_cents)}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <select
                                                value={selectedStatuses[order.id] ?? order.status}
                                                onChange={(event) =>
                                                    setSelectedStatuses((current) => ({
                                                        ...current,
                                                        [order.id]: event.target.value,
                                                    }))
                                                }
                                                className="h-10 rounded-xl border border-white/15 bg-[#0b1321] px-3 text-sm text-slate-100"
                                            >
                                                {statuses.map((status) => (
                                                    <option
                                                        key={status}
                                                        value={status}
                                                        className="bg-[#0b1321]"
                                                    >
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => updateStatus(order.id)}
                                                className="rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] transition hover:bg-[#18d99a]"
                                            >
                                                Save Status
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
                                    <table className="w-full text-left text-sm">
                                        <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                            <tr>
                                                <th className="px-4 py-3 font-medium">Item</th>
                                                <th className="px-4 py-3 font-medium">Kind</th>
                                                <th className="px-4 py-3 font-medium">Qty</th>
                                                <th className="px-4 py-3 text-right font-medium">
                                                    Price
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.items.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="border-b border-white/10 last:border-b-0"
                                                >
                                                    <td className="px-4 py-3 text-white">
                                                        {item.name}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        Product
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-300">
                                                        {item.qty}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-white">
                                                        {formatPrice(item.price_in_cents)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </article>
                        ))
                    ) : (
                        <div className="rounded-3xl border border-dashed border-white/15 bg-[#08101c]/65 px-6 py-10 text-center text-slate-400">
                            No orders found.
                        </div>
                    )}
                </div>
            </AdminLayout>
        </>
    );
}
