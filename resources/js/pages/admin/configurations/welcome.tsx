import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/layouts/admin-layout';

type WelcomeConfiguration = {
    id: number;
    name: string;
    image: string | null;
    price: number;
    products_count: number;
    homepage_order: number | null;
};

type WelcomeFormData = {
    items: Array<{
        id: number;
        homepage_order: string;
    }>;
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function AdminConfigurationsWelcomePage({
    configurations,
}: {
    configurations: WelcomeConfiguration[];
}) {
    const form = useForm<WelcomeFormData>({
        items: configurations.map((configuration) => ({
            id: configuration.id,
            homepage_order:
                configuration.homepage_order !== null
                    ? String(configuration.homepage_order)
                    : '',
        })),
    });

    const maxPosition = configurations.length;
    const selectedOrders = form.data.items
        .map((item) => item.homepage_order)
        .filter((value) => value !== '');
    const selectedCount = selectedOrders.length;
    const hasDuplicates =
        new Set(selectedOrders).size !== selectedOrders.length;
    const saveDisabled = form.processing || selectedCount < 3 || hasDuplicates;

    const selectedByOrder = form.data.items
        .filter((item) => item.homepage_order !== '')
        .map((item) => {
            const configuration =
                configurations.find((entry) => entry.id === item.id) ?? null;

            return {
                configuration,
                homepage_order: Number(item.homepage_order),
            };
        })
        .filter(
            (
                item,
            ): item is {
                configuration: WelcomeConfiguration;
                homepage_order: number;
            } => item.configuration !== null,
        )
        .sort((left, right) => left.homepage_order - right.homepage_order);

    const updateOrder = (configurationId: number, value: string) => {
        form.setData(
            'items',
            form.data.items.map((item) =>
                item.id === configurationId
                    ? { ...item, homepage_order: value }
                    : item,
            ),
        );
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put('/admin/configurations/welcome');
    };

    return (
        <>
            <Head title="Welcome Order" />

            <AdminLayout
                title="Welcome Order"
                description="Choose which gaming PC appears in which position on the welcome page. At least 3 positions must be filled."
                actions={
                    <Link
                        href="/admin/configurations"
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        Back to Configurations
                    </Link>
                }
            >
                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <form
                        onSubmit={submit}
                        className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6"
                    >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-slate-300">
                                    Selected for welcome: {selectedCount}
                                </p>
                                <p className="mt-1 text-sm text-slate-500">
                                    Leave the value empty to hide a build from
                                    the welcome page.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={saveDisabled}
                                className="rounded-full bg-[#00bd7d] px-6 text-[#04120d] hover:bg-[#18d99a]"
                            >
                                Save Order
                            </Button>
                        </div>

                        <div className="mt-4 space-y-2">
                            <InputError message={form.errors.items} />
                            {selectedCount < 3 ? (
                                <p className="text-sm text-amber-300">
                                    Choose at least 3 gaming PCs.
                                </p>
                            ) : null}
                            {hasDuplicates ? (
                                <p className="text-sm text-amber-300">
                                    Welcome positions must be unique.
                                </p>
                            ) : null}
                        </div>

                        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                            <table className="w-full text-left text-sm">
                                <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">
                                            Gaming PC
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Price
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Components
                                        </th>
                                        <th className="px-4 py-3 font-medium">
                                            Welcome position
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {configurations.map((configuration) => {
                                        const currentItem =
                                            form.data.items.find(
                                                (item) =>
                                                    item.id ===
                                                    configuration.id,
                                            );

                                        if (!currentItem) {
                                            return null;
                                        }

                                        return (
                                            <tr
                                                key={configuration.id}
                                                className="border-b border-white/10 last:border-b-0"
                                            >
                                                <td className="px-4 py-4">
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
                                                                {
                                                                    configuration.name
                                                                }
                                                            </p>
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                ID #
                                                                {
                                                                    configuration.id
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 font-semibold text-white">
                                                    {formatPrice(
                                                        configuration.price,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-slate-300">
                                                    {
                                                        configuration.products_count
                                                    }
                                                </td>
                                                <td className="px-4 py-4">
                                                    <select
                                                        value={
                                                            currentItem.homepage_order
                                                        }
                                                        onChange={(event) =>
                                                            updateOrder(
                                                                configuration.id,
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        className="h-11 w-full rounded-xl border border-white/15 bg-[#0b1321] px-3 text-sm text-slate-100"
                                                    >
                                                        <option value="">
                                                            Not on welcome
                                                        </option>
                                                        {Array.from(
                                                            {
                                                                length: maxPosition,
                                                            },
                                                            (_, index) => (
                                                                <option
                                                                    key={
                                                                        index +
                                                                        1
                                                                    }
                                                                    value={String(
                                                                        index +
                                                                            1,
                                                                    )}
                                                                    className="bg-[#0b1321]"
                                                                >
                                                                    Position{' '}
                                                                    {index + 1}
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </form>

                    <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 lg:sticky lg:top-6 lg:h-fit">
                        <p className="text-xs tracking-[0.16em] text-[#9cf5d8] uppercase">
                            Welcome Preview
                        </p>
                        <h2 className="mt-3 text-2xl font-black text-white">
                            Current order
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            The welcome page will show these builds in this
                            sequence.
                        </p>

                        <div className="mt-5 space-y-3">
                            {selectedByOrder.length ? (
                                selectedByOrder.map((item) => (
                                    <div
                                        key={item.configuration.id}
                                        className="rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {item.configuration.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {formatPrice(
                                                        item.configuration
                                                            .price,
                                                    )}
                                                </p>
                                            </div>
                                            <span className="rounded-full border border-[#00bd7d]/35 bg-[#00bd7d]/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-[#9cf5d8] uppercase">
                                                #{item.homepage_order}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-2xl border border-dashed border-white/15 px-4 py-8 text-center text-sm text-slate-500">
                                    No welcome positions selected yet.
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </AdminLayout>
        </>
    );
}
