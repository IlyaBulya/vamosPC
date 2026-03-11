import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout from '@/layouts/admin-layout';

type CategoryValue = {
    id: number;
    name: string;
    type: string;
    description: string | null;
};

type CategoryFormData = {
    name: string;
    type: 'hardware' | 'accessory' | 'laptop' | 'gaming-pc';
    description: string;
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
    });

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (mode === 'create') {
            form.post('/admin/categories');
            return;
        }

        form.put(`/admin/categories/${category?.id}`);
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
                                Example: graphics-cards, gaming-laptops
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
                                <option value="gaming-pc">gaming-pc</option>
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
