import { Head, Link, router } from '@inertiajs/react';
import { GripVertical, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
    const [rows, setRows] = useState<ConfigurationRow[]>(configurations);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const dragIndex = useRef<number | null>(null);
    const orderChanged = useRef(false);

    useEffect(() => {
        setRows(configurations);
    }, [configurations]);

    const onDragStart = (index: number) => {
        dragIndex.current = index;
        orderChanged.current = false;
    };

    const onDragOverRow = (index: number, event: React.DragEvent) => {
        event.preventDefault();

        const from = dragIndex.current;

        if (from === null || from === index) {
            return;
        }

        setRows((current) => {
            const next = [...current];
            const [moved] = next.splice(from, 1);
            next.splice(index, 0, moved);

            return next;
        });
        dragIndex.current = index;
        orderChanged.current = true;
    };

    const onDragEnd = () => {
        dragIndex.current = null;

        if (!orderChanged.current) {
            return;
        }

        orderChanged.current = false;
        setRows((current) => {
            router.put(
                '/admin/configurations/reorder',
                { ids: current.map((row) => row.id) },
                {
                    preserveScroll: true,
                    onStart: () => setIsSavingOrder(true),
                    onFinish: () => setIsSavingOrder(false),
                },
            );

            return current;
        });
    };

    const destroyConfiguration = (configurationId: number) => {
        if (!window.confirm('Delete this configuration?')) {
            return;
        }

        router.delete(`/admin/configurations/${configurationId}`);
    };

    return (
        <>
            <Head title="Admin Configurations" />

            <AdminLayout
                title="Configurations"
                description="Create ready-to-sell PC configurations and attach selected component products."
                actions={
                    <>
                        <Link
                            href="/admin/configurations/welcome"
                            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                        >
                            Welcome Order
                        </Link>
                        <Link
                            href="/admin/configurations/create"
                            className="rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.35)] transition hover:bg-[#18d99a]"
                        >
                            New Configuration
                        </Link>
                    </>
                }
            >
                <p className="mb-3 flex items-center gap-2 text-xs text-slate-500">
                    <GripVertical className="h-3.5 w-3.5" />
                    Drag rows to change the order on the Gaming PCs page.
                    {isSavingOrder && (
                        <span className="flex items-center gap-1 text-[#9cf5d8]">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving order...
                        </span>
                    )}
                </p>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                <tr>
                                    <th className="w-10 px-3 py-4" />
                                    <th className="px-5 py-4 font-medium">
                                        Configuration
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Price
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Components
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Component Preview
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Updated
                                    </th>
                                    <th className="px-5 py-4 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length ? (
                                    rows.map((configuration, index) => (
                                        <tr
                                            key={configuration.id}
                                            draggable
                                            onDragStart={() =>
                                                onDragStart(index)
                                            }
                                            onDragOver={(event) =>
                                                onDragOverRow(index, event)
                                            }
                                            onDragEnd={onDragEnd}
                                            className="border-b border-white/10 last:border-b-0"
                                        >
                                            <td className="cursor-grab px-3 py-4 text-slate-600 active:cursor-grabbing">
                                                <GripVertical className="h-4 w-4" />
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f1622]">
                                                        <div className="flex h-14 w-20 items-center justify-center">
                                                            {configuration.image ? (
                                                                <img
                                                                    src={
                                                                        configuration.image
                                                                    }
                                                                    alt={
                                                                        configuration.name
                                                                    }
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                                                    Image
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <p className="font-semibold text-white">
                                                            {configuration.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            ID #
                                                            {configuration.id}
                                                        </p>
                                                        {configuration.description ? (
                                                            <p className="mt-2 line-clamp-2 text-sm text-slate-300">
                                                                {
                                                                    configuration.description
                                                                }
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-white">
                                                {formatPrice(
                                                    configuration.price,
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {configuration.products_count}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {configuration.products
                                                        .length ? (
                                                        configuration.products.map(
                                                            (product) => (
                                                                <span
                                                                    key={
                                                                        product.id
                                                                    }
                                                                    className="rounded-full border border-[#00bd7d]/35 bg-[#00bd7d]/10 px-3 py-1 text-xs text-[#9cf5d8]"
                                                                >
                                                                    {
                                                                        product.name
                                                                    }
                                                                </span>
                                                            ),
                                                        )
                                                    ) : (
                                                        <span className="text-slate-500">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {configuration.updated_at ??
                                                    '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/configurations/${configuration.id}/edit`}
                                                        className="rounded-full border border-[#00bd7d]/45 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-[#9cf5d8] uppercase transition hover:bg-[#00bd7d]/10"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            destroyConfiguration(
                                                                configuration.id,
                                                            )
                                                        }
                                                        className="rounded-full border border-red-500/45 px-4 py-2 text-xs font-semibold tracking-[0.14em] text-red-300 uppercase transition hover:bg-red-500/10"
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
                                            colSpan={7}
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
