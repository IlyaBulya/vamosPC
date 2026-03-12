import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useImagePreview } from '@/hooks/use-image-preview';
import AdminLayout from '@/layouts/admin-layout';

type CategoryValue = {
    id: number;
    name: string;
    type: string;
    description: string | null;
    image: string | null;
};

type CategoryFormData = {
    name: string;
    type: 'hardware' | 'accessory' | 'laptop';
    description: string;
    image: File | null;
    remove_image: boolean;
};

export default function AdminCategoryFormPage({
    mode,
    category,
}: {
    mode: 'create' | 'edit';
    category: CategoryValue | null;
}) {
    const form = useForm<CategoryFormData>({
        name: category?.name ?? '',
        type: (category?.type as CategoryFormData['type']) ?? 'hardware',
        description: category?.description ?? '',
        image: null,
        remove_image: false,
    });
    const imagePreview = useImagePreview(
        form.data.image,
        category?.image ?? null,
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
            form.post('/admin/categories', {
                forceFormData: true,
            });
            return;
        }

        form.put(`/admin/categories/${category?.id}`, {
            forceFormData: true,
        });
    };

    return (
        <>
            <Head title={mode === 'create' ? 'Create Category' : 'Edit Category'} />

            <AdminLayout
                title={mode === 'create' ? 'Create Category' : 'Edit Category'}
                description="Category names should match the route-safe format already used on the storefront."
                actions={
                    <Link
                        href="/admin/categories"
                        className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        Back to Categories
                    </Link>
                }
            >
                <form
                    onSubmit={submit}
                    className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6"
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-slate-200">
                                Category name
                            </Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="border-white/15 bg-[#0b1321] text-slate-100"
                            />
                            <p className="text-xs text-slate-500">
                                Example: graphics-card, office-laptops
                            </p>
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="type" className="text-slate-200">
                                Type
                            </Label>
                            <select
                                id="type"
                                value={form.data.type}
                                onChange={(event) =>
                                    form.setData(
                                        'type',
                                        event.target.value as CategoryFormData['type'],
                                    )
                                }
                                className="h-11 rounded-xl border border-white/15 bg-[#0b1321] px-3 text-sm text-slate-100"
                            >
                                <option value="hardware">hardware</option>
                                <option value="accessory">accessory</option>
                                <option value="laptop">laptop</option>
                            </select>
                            <InputError message={form.errors.type} />
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
                                rows={5}
                                className="rounded-xl border border-white/15 bg-[#0b1321] px-3 py-3 text-sm text-slate-100"
                            />
                            <InputError message={form.errors.description} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="image" className="text-slate-200">
                                Category image
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
                                            alt={form.data.name || 'Category preview'}
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

                                {category?.image ? (
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

                    <div className="mt-6 flex items-center gap-3">
                        <Button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-full bg-[#00bd7d] px-6 text-[#04120d] hover:bg-[#18d99a]"
                        >
                            {mode === 'create' ? 'Create Category' : 'Update Category'}
                        </Button>
                        <Link
                            href="/admin/categories"
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
