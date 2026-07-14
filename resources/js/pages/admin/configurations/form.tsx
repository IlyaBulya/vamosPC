import { Head, Link, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    Check,
    Cpu,
    Loader2,
    Monitor,
    ShoppingCart,
    XCircle,
    Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImagePreview } from '@/hooks/use-image-preview';
import AdminLayout from '@/layouts/admin-layout';
import { postJson, type Violation } from '@/lib/configurator';

type ComponentOption = {
    id: number;
    name: string;
    description: string | null;
    price_in_cents: number;
    color: string | null;
    category_name: string | null;
    category_type: string | null;
};

type ConfigurationFormData = {
    name: string;
    description: string;
    image: File | null;
    remove_image: boolean;
    price: string;
    products: string[];
    quantities: Record<string, string>;
};

type AdminCheckResult = {
    violations: Violation[];
    has_errors: boolean;
    load_watts: number | null;
    components_total_in_cents: number;
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function AdminConfigurationFormPage({
    mode,
    configuration,
    components,
}: {
    mode: 'create' | 'edit';
    configuration: {
        id: number;
        name: string;
        description: string | null;
        image: string | null;
        price: number;
        products: number[];
        quantities: Record<string, number>;
    } | null;
    components: ComponentOption[];
}) {
    const form = useForm<ConfigurationFormData>({
        name: configuration?.name ?? '',
        description: configuration?.description ?? '',
        image: null,
        remove_image: false,
        price: configuration ? String(configuration.price) : '0',
        products: configuration
            ? configuration.products.map((productId) => String(productId))
            : [],
        quantities: Object.fromEntries(
            Object.entries(configuration?.quantities ?? {}).map(
                ([productId, quantity]) => [productId, String(quantity)],
            ),
        ),
    });
    const [check, setCheck] = useState<AdminCheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);
    const imagePreview = useImagePreview(
        form.data.image,
        configuration?.image ?? null,
        form.data.remove_image,
    );

    const groupedComponents = components.reduce<Record<string, ComponentOption[]>>(
        (groups, component) => {
            const key = component.category_name ?? 'Uncategorized';

            if (! groups[key]) {
                groups[key] = [];
            }

            groups[key].push(component);

            return groups;
        },
        {},
    );

    const selectedIdSet = new Set(form.data.products.map((value) => Number(value)));
    const selectedComponents = components.filter((component) =>
        selectedIdSet.has(component.id),
    );
    const quantityOf = (productId: number) => {
        const raw = Number(form.data.quantities[String(productId)] ?? '1');

        return Number.isFinite(raw) && raw >= 1 ? Math.min(10, Math.round(raw)) : 1;
    };
    const selectedComponentsTotal = selectedComponents.reduce(
        (sum, component) =>
            sum + component.price_in_cents * quantityOf(component.id),
        0,
    );

    const productsKey = JSON.stringify([
        form.data.products,
        form.data.quantities,
    ]);

    useEffect(() => {
        if (!form.data.products.length) {
            setCheck(null);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(() => {
            setIsChecking(true);
            const [products, quantities] = JSON.parse(productsKey) as [
                string[],
                Record<string, string>,
            ];
            postJson<AdminCheckResult>(
                '/admin/configurations/check',
                {
                    products: products.map(Number),
                    quantities: Object.fromEntries(
                        Object.entries(quantities).map(([id, qty]) => [
                            id,
                            Number(qty) || 1,
                        ]),
                    ),
                },
                controller.signal,
            )
                .then((result) => {
                    setCheck(result);
                    setIsChecking(false);
                })
                .catch((error: unknown) => {
                    if (
                        !(
                            error instanceof DOMException &&
                            error.name === 'AbortError'
                        )
                    ) {
                        console.error(error);
                        setIsChecking(false);
                    }
                });
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productsKey]);

    const manualPrice = Number(form.data.price);
    const previewPrice =
        Number.isFinite(manualPrice) && manualPrice > 0
            ? manualPrice
            : selectedComponentsTotal;

    const componentItemErrorKey = Object.keys(form.errors).find((key) =>
        key.startsWith('products.'),
    );

    const toggleProduct = (productId: number, checked: boolean) => {
        const productKey = String(productId);

        if (checked) {
            if (form.data.products.includes(productKey)) {
                return;
            }

            form.setData('products', [...form.data.products, productKey]);
            form.setData('quantities', {
                ...form.data.quantities,
                [productKey]: form.data.quantities[productKey] ?? '1',
            });

            return;
        }

        const nextQuantities = { ...form.data.quantities };
        delete nextQuantities[productKey];

        form.setData(
            'products',
            form.data.products.filter((value) => value !== productKey),
        );
        form.setData('quantities', nextQuantities);
    };

    const setQuantity = (productId: number, value: string) => {
        form.setData('quantities', {
            ...form.data.quantities,
            [String(productId)]: value,
        });
    };

    const onImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const nextFile = event.target.files?.[0] ?? null;

        form.setData('image', nextFile);

        if (nextFile) {
            form.setData('remove_image', false);
        }
    };

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'create') {
            form.post('/admin/configurations', {
                forceFormData: true,
            });
            return;
        }

        form.put(`/admin/configurations/${configuration?.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={mode === 'create' ? 'Create Configuration' : 'Edit Configuration'} />

            <AdminLayout
                title={mode === 'create' ? 'Create Configuration' : 'Edit Configuration'}
                description="Select component products and publish a full configuration card."
                actions={
                    <Link
                        href="/admin/configurations"
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        Back to Configurations
                    </Link>
                }
            >
                <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                    <form
                        onSubmit={submit}
                        className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-slate-200">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    value={form.data.name}
                                    onChange={(event) =>
                                        form.setData('name', event.target.value)
                                    }
                                    placeholder="PLAY 5 PLUS"
                                    className="border-white/15 bg-[#0b1321] text-slate-100"
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="price" className="text-slate-200">
                                    Price in cents
                                </Label>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    value={form.data.price}
                                    onChange={(event) =>
                                        form.setData('price', event.target.value)
                                    }
                                    className="border-white/15 bg-[#0b1321] text-slate-100"
                                />
                                <p className="text-xs text-slate-500">
                                    Leave 0 to use selected component total.
                                </p>
                                <InputError message={form.errors.price} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="description" className="text-slate-200">
                                    Description
                                </Label>
                                <textarea
                                    id="description"
                                    value={form.data.description}
                                    onChange={(event) =>
                                        form.setData('description', event.target.value)
                                    }
                                    rows={3}
                                    placeholder="Compact and powerful. Built for work and gaming."
                                    className="rounded-xl border border-white/15 bg-[#0b1321] px-3 py-3 text-sm text-slate-100"
                                />
                                <InputError message={form.errors.description} />
                            </div>

                            <div className="grid gap-2 md:col-span-2">
                                <Label htmlFor="image" className="text-slate-200">
                                    Configuration image
                                </Label>
                                <input
                                    id="image"
                                    type="file"
                                    accept="image/*"
                                    onChange={onImageChange}
                                    className="block w-full rounded-xl border border-white/15 bg-[#0b1321] px-3 py-2.5 text-sm text-slate-100 file:mr-3 file:rounded-full file:border-0 file:bg-[#00bd7d] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-[#04120d]"
                                />
                                <p className="text-xs text-slate-500">
                                    JPG, PNG, WEBP, or GIF up to 4 MB.
                                </p>
                                <InputError message={form.errors.image} />

                                <div className="flex flex-wrap gap-3">
                                    {form.data.image ? (
                                        <button
                                            type="button"
                                            onClick={() => form.setData('image', null)}
                                            className="text-sm text-slate-400 transition hover:text-slate-200"
                                        >
                                            Clear selected file
                                        </button>
                                    ) : null}

                                    {configuration?.image ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                form.setData(
                                                    'remove_image',
                                                    ! form.data.remove_image,
                                                )
                                            }
                                            className="text-sm text-slate-400 transition hover:text-slate-200"
                                        >
                                            {form.data.remove_image
                                                ? 'Keep current image'
                                                : 'Remove current image'}
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-white/10 bg-[#0b1321] p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">
                                        Components
                                    </h2>
                                    <p className="text-sm text-slate-400">
                                        Pick parts to attach to this configuration.
                                    </p>
                                </div>
                                <span className="rounded-full border border-[#00bd7d]/35 bg-[#00bd7d]/10 px-3 py-1 text-xs font-semibold text-[#9cf5d8]">
                                    {selectedComponents.length} selected
                                </span>
                            </div>

                            <div className="mt-4 space-y-4">
                                {Object.entries(groupedComponents).map(
                                    ([categoryName, categoryComponents]) => (
                                        <div key={categoryName} className="space-y-2">
                                            <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                                                {categoryName}
                                            </p>

                                            {categoryComponents.map((component) => (
                                                <label
                                                    key={component.id}
                                                    className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-[#0a121f] px-3 py-3 transition hover:border-[#00bd7d]/40"
                                                >
                                                    <Checkbox
                                                        checked={selectedIdSet.has(
                                                            component.id,
                                                        )}
                                                        onCheckedChange={(checked) =>
                                                            toggleProduct(
                                                                component.id,
                                                                checked === true,
                                                            )
                                                        }
                                                        className="mt-0.5 border-white/40 data-[state=checked]:border-[#00bd7d] data-[state=checked]:bg-[#00bd7d] data-[state=checked]:text-[#04120d]"
                                                    />

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                                            <p className="font-medium text-white">
                                                                {component.name}
                                                            </p>
                                                            <div className="flex items-center gap-2">
                                                                {selectedIdSet.has(
                                                                    component.id,
                                                                ) ? (
                                                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                                                        ×
                                                                        <input
                                                                            type="number"
                                                                            min={1}
                                                                            max={10}
                                                                            value={
                                                                                form
                                                                                    .data
                                                                                    .quantities[
                                                                                    String(
                                                                                        component.id,
                                                                                    )
                                                                                ] ??
                                                                                '1'
                                                                            }
                                                                            onClick={(
                                                                                event,
                                                                            ) =>
                                                                                event.preventDefault()
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                setQuantity(
                                                                                    component.id,
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                            className="h-7 w-14 rounded-lg border border-white/15 bg-[#0b1321] px-2 text-center text-xs text-slate-100"
                                                                        />
                                                                    </span>
                                                                ) : null}
                                                                <p className="text-sm font-semibold text-[#9cf5d8]">
                                                                    {formatPrice(
                                                                        component.price_in_cents,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {component.description ? (
                                                            <p className="mt-1 text-xs text-slate-400">
                                                                {component.description}
                                                            </p>
                                                        ) : null}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    ),
                                )}
                            </div>

                            <div className="mt-4 space-y-1 rounded-xl border border-white/10 bg-[#0a121f] px-3 py-3 text-sm text-slate-300">
                                <p className="flex justify-between">
                                    <span>Components total</span>
                                    <span className="font-semibold text-white">
                                        {formatPrice(selectedComponentsTotal)}
                                    </span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Markup (price − components)</span>
                                    <span
                                        className={`font-semibold ${
                                            previewPrice - selectedComponentsTotal < 0
                                                ? 'text-red-300'
                                                : 'text-white'
                                        }`}
                                    >
                                        {formatPrice(
                                            previewPrice - selectedComponentsTotal,
                                        )}
                                    </span>
                                </p>
                            </div>

                            <InputError message={form.errors.products} />
                            {componentItemErrorKey ? (
                                <InputError
                                    message={
                                        form.errors[
                                            componentItemErrorKey as keyof typeof form.errors
                                        ]
                                    }
                                />
                            ) : null}
                        </div>

                        <div className="mt-6 flex items-center gap-3">
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="rounded-full bg-[#00bd7d] px-6 text-[#04120d] hover:bg-[#18d99a]"
                            >
                                {mode === 'create'
                                    ? 'Create Configuration'
                                    : 'Update Configuration'}
                            </Button>
                            <Link
                                href="/admin/configurations"
                                className="text-sm text-slate-400 transition hover:text-slate-200"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>

                    <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-4 sm:p-5 lg:sticky lg:top-6 lg:h-fit">
                        <p className="mb-4 text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                            Live Preview
                        </p>

                        <article className="mx-auto max-w-[340px] rounded-[28px] border border-white/15 bg-gradient-to-b from-[#131a26] via-[#0c111a] to-[#070b12] p-4 shadow-[0_18px_35px_rgba(0,0,0,0.45)]">
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1622]">
                                <div className="aspect-[4/3]">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt={form.data.name || 'Configuration preview'}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_18%,rgba(0,189,125,0.25),transparent_42%)]" />
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(0,189,125,0.14),transparent_48%)]" />
                                            <Monitor className="relative h-16 w-16 text-slate-500" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-400">
                                {isChecking ? (
                                    <>
                                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        Checking...
                                    </>
                                ) : check?.has_errors ? (
                                    <>
                                        <span className="h-3 w-3 rounded-full border border-white/50 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                                        Incompatible Build
                                    </>
                                ) : (
                                    <>
                                        <span className="h-3 w-3 rounded-full border border-white/50 bg-[#00bd7d] shadow-[0_0_12px_rgba(0,189,125,0.8)]" />
                                        Build Ready
                                    </>
                                )}
                            </div>

                            {check?.load_watts != null && (
                                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-400">
                                    <Zap className="h-3.5 w-3.5 text-[#9cf5d8]" />
                                    Estimated load: {check.load_watts} W
                                </p>
                            )}

                            {(check?.violations.length ?? 0) > 0 && (
                                <div className="mt-3 space-y-1.5">
                                    {check!.violations.map((violation, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs ${
                                                violation.severity === 'error'
                                                    ? 'border-red-500/40 bg-red-500/10 text-red-200'
                                                    : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                                            }`}
                                        >
                                            {violation.severity === 'error' ? (
                                                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            ) : (
                                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            )}
                                            <span>{violation.message}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {check !== null &&
                                !check.has_errors &&
                                !check.violations.length && (
                                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-[#9cf5d8]">
                                        <Check className="h-3.5 w-3.5" />
                                        All components are compatible
                                    </p>
                                )}

                            <h3 className="mt-4 text-center text-3xl font-black uppercase tracking-[0.02em] text-white">
                                {form.data.name || 'New Configuration'}
                            </h3>

                            <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
                                {form.data.description ||
                                    'Powerful and balanced setup for smooth gaming and daily work.'}
                            </p>

                            <div className="mt-5 text-center">
                                <p className="text-4xl font-black text-white">
                                    {formatPrice(previewPrice)}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                    from selected parts
                                </p>
                            </div>

                            <button
                                type="button"
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00bd7d] px-4 py-3 text-sm font-bold text-[#04120d] shadow-[0_0_16px_rgba(0,189,125,0.45)]"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                Configure & Buy
                            </button>

                            <button
                                type="button"
                                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#00bd7d]/80 px-4 py-3 text-sm font-semibold text-[#9cf5d8]"
                            >
                                More Details
                            </button>

                            <div className="mt-4 space-y-2">
                                {selectedComponents.slice(0, 6).map((component) => (
                                    <div
                                        key={component.id}
                                        className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                                    >
                                        <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                            {component.category_name ?? 'Component'}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-200">
                                            {component.name}
                                        </p>
                                    </div>
                                ))}

                                {! selectedComponents.length ? (
                                    <div className="rounded-xl border border-dashed border-white/20 px-3 py-4 text-center text-sm text-slate-500">
                                        Select components to preview card specs.
                                    </div>
                                ) : null}

                                {selectedComponents.length > 6 ? (
                                    <p className="text-center text-xs text-slate-400">
                                        +{selectedComponents.length - 6} more components
                                    </p>
                                ) : null}
                            </div>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                                <Cpu className="h-3.5 w-3.5" />
                                {selectedComponents.length} components attached
                            </div>
                        </article>
                    </aside>
                </div>
            </AdminLayout>
        </>
    );
}
