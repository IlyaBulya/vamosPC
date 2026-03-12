import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type CategoryRow = {
    id: number;
    name: string;
    type: string;
    description: string | null;
    image: string | null;
    products_count: number;
};

export default function AdminCategoriesPage({
    categories,
}: {
    categories: CategoryRow[];
}) {
    const destroyCategory = (categoryId: number) => {
        if (! window.confirm('Delete this category?')) {
            return;
        }

        router.delete(`/admin/categories/${categoryId}`);
    };

    return (
        <>
            <Head title="Admin Categories" />

            <AdminLayout
                title="Categories"
                description="Manage category records used to organize the public catalog."
                actions={
                    <Link
                        href="/admin/categories/create"
                        className="rounded-full bg-[#00bd7d] px-4 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.35)] transition hover:bg-[#18d99a]"
                    >
                        New Category
                    </Link>
                }
            >
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">Name</th>
                                    <th className="px-5 py-4 font-medium">Type</th>
                                    <th className="px-5 py-4 font-medium">Description</th>
                                    <th className="px-5 py-4 font-medium">Products</th>
                                    <th className="px-5 py-4 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.length ? (
                                    categories.map((category) => (
                                        <tr
                                            key={category.id}
                                            className="border-b border-white/10 last:border-b-0"
                                        >
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0f1622]">
                                                        <div className="flex h-14 w-20 items-center justify-center">
                                                            {category.image ? (
                                                                <img
                                                                    src={category.image}
                                                                    alt={category.name}
                                                                    className="h-full w-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                                                    Image
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="font-semibold text-white">
                                                        {category.name}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {category.type}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {category.description ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {category.products_count}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={`/admin/categories/${category.id}/edit`}
                                                        className="rounded-full border border-[#00bd7d]/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9cf5d8] transition hover:bg-[#00bd7d]/10"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => destroyCategory(category.id)}
                                                        className="rounded-full border border-red-500/45 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-300 transition hover:bg-red-500/10"
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
                                            colSpan={5}
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            No categories found.
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
