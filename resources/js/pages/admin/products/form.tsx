import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImagePreview } from '@/hooks/use-image-preview';
import AdminLayout from '@/layouts/admin-layout';

type CategoryOption = {
    id: number;
    name: string;
    type: string;
};

type ProductFormData = {
    category_id: string;
    name: string;
    description: string;
    image: File | null;
    remove_image: boolean;
    price_in_cents: string;
    stock: string;
    color: string;
    is_component: boolean;
    is_sellable: boolean;
};

type ProductValue = {
    id: number;
    category_id: number;
    name: string;
    description: string | null;
    image: string | null;
    price_in_cents: number;
    stock: number;
    color: string | null;
    is_component: boolean;
    is_sellable: boolean;
};

export default function AdminProductFormPage({
    mode,
    product,
    categories,
}: {
    mode: 'create' | 'edit';
    product: ProductValue | null;
    categories: CategoryOption[];
}) {
    const form = useForm<ProductFormData>({
        category_id: product ? String(product.category_id) : '',
        name: product?.name ?? '',
        description: product?.description ?? '',
        image: null,
        remove_image: false,
        price_in_cents: product ? String(product.price_in_cents) : '0',
        stock: product ? String(product.stock) : '0',
        color: product?.color ?? '',
        is_component: product?.is_component ?? false,
        is_sellable: product?.is_sellable ?? true,
    });
    const imagePreview = useImagePreview(
        form.data.image,
        product?.image ?? null,
        form.data.remove_image,
    );

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
            form.post('/admin/products', {
                forceFormData: true,
            });
            return;
        }

        form.put(`/admin/products/${product?.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={mode === 'create' ? 'Create Product' : 'Edit Product'} />

            <AdminLayout
                title={mode === 'create' ? 'Create Product' : 'Edit Product'}
                description="Manage the data used by the public catalog and product pages."
                actions={
                    <Link
                        href="/admin/products"
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        Back to Products
                    </Link>
                }
            >
                <form
                    onSubmit={submit}
                    className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="category_id" className="text-slate-200">
                                Category
                            </Label>
                            <select
                                id="category_id"
                                value={form.data.category_id}
                                onChange={(event) =>
                                    form.setData('category_id', event.target.value)
                                }
                                className="h-11 rounded-xl border border-white/15 bg-[#0b1321] px-3 text-sm text-slate-100"
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                        className="bg-[#0b1321]"
                                    >
                                        {category.name} ({category.type})
                                    </option>
                                ))}
                            </select>
                            <InputError message={form.errors.category_id} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-200">
                                Product name
                            </Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="border-white/15 bg-[#0b1321] text-slate-100"
                            />
                            <InputError message={form.errors.name} />
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
                                rows={4}
                                className="rounded-xl border border-white/15 bg-[#0b1321] px-3 py-3 text-sm text-slate-100"
                            />
                            <InputError message={form.errors.description} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="image" className="text-slate-200">
                                Product image
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

                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1622]">
                                <div className="aspect-[4/3]">
                                    {imagePreview ? (
                                        <img
                                            src={imagePreview}
                                            alt={form.data.name || 'Product preview'}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            No image selected
                                        </div>
                                    )}
                                </div>
                            </div>

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

                                {product?.image ? (
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

                        <div className="grid gap-2">
                            <Label htmlFor="price_in_cents" className="text-slate-200">
                                Price in cents
                            </Label>
                            <Input
                                id="price_in_cents"
                                type="number"
                                min="0"
                                value={form.data.price_in_cents}
                                onChange={(event) =>
                                    form.setData('price_in_cents', event.target.value)
                                }
                                className="border-white/15 bg-[#0b1321] text-slate-100"
                            />
                            <InputError message={form.errors.price_in_cents} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="stock" className="text-slate-200">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                min="0"
                                value={form.data.stock}
                                onChange={(event) =>
                                    form.setData('stock', event.target.value)
                                }
                                className="border-white/15 bg-[#0b1321] text-slate-100"
                            />
                            <InputError message={form.errors.stock} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="color" className="text-slate-200">
                                Color
                            </Label>
                            <Input
                                id="color"
                                value={form.data.color}
                                onChange={(event) =>
                                    form.setData('color', event.target.value)
                                }
                                className="border-white/15 bg-[#0b1321] text-slate-100"
                            />
                            <InputError message={form.errors.color} />
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-3">
                            <Checkbox
                                id="is_component"
                                checked={form.data.is_component}
                                onCheckedChange={(checked) =>
                                    form.setData('is_component', checked === true)
                                }
                            />
                            <Label htmlFor="is_component" className="text-slate-200">
                                Save as component
                            </Label>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-3">
                            <Checkbox
                                id="is_sellable"
                                checked={form.data.is_sellable}
                                onCheckedChange={(checked) =>
                                    form.setData('is_sellable', checked === true)
                                }
                            />
                            <Label htmlFor="is_sellable" className="text-slate-200">
                                Available for direct sale
                            </Label>
                        </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-[#0b1321] px-4 py-4 text-sm text-slate-400">
                        Use these flags to control product behavior:
                        <div className="mt-3 space-y-1">
                            <p>`Save as component` = mark internal PC parts vs complete products.</p>
                            <p>`Available for direct sale` = can be bought from catalog/product page.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-full bg-[#00bd7d] px-6 text-[#04120d] hover:bg-[#18d99a]"
                        >
                            {mode === 'create' ? 'Create Product' : 'Update Product'}
                        </Button>
                        <Link
                            href="/admin/products"
                            className="text-sm text-slate-400 transition hover:text-slate-200"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </AdminLayout>
        </>
    );
}
