import { Head, router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import AdminLayout from '@/layouts/admin-layout';

type UserRow = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    is_super_admin: boolean;
    orders_count: number;
    two_factor_enabled: boolean;
    created_at: string | null;
};

export default function AdminUsersPage({ users }: { users: UserRow[] }) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };

    const updateRole = (user: UserRow, isAdmin: boolean) => {
        router.patch(
            `/admin/users/${user.id}/role`,
            { is_admin: isAdmin },
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="Admin Users" />

            <AdminLayout
                title="Users"
                description="Review customer accounts, admin access, and account activity."
            >
                <section className="mb-6 rounded-3xl border border-white/10 bg-[#08101c]/85 p-5 sm:p-6">
                    <h2 className="text-lg font-semibold text-white">
                        Create Admin
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Add a new admin account directly from the panel.
                    </p>

                    <form onSubmit={submit} className="mt-5 grid gap-4 lg:grid-cols-2">
                        <div>
                            <label
                                htmlFor="admin-name"
                                className="mb-2 block text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase"
                            >
                                Name
                            </label>
                            <input
                                id="admin-name"
                                type="text"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                className="w-full rounded-2xl border border-white/15 bg-[#050b18] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#00bd7d]/55"
                                autoComplete="name"
                                required
                            />
                            {form.errors.name ? (
                                <p className="mt-1.5 text-xs text-red-300">
                                    {form.errors.name}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label
                                htmlFor="admin-email"
                                className="mb-2 block text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase"
                            >
                                Email
                            </label>
                            <input
                                id="admin-email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                className="w-full rounded-2xl border border-white/15 bg-[#050b18] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#00bd7d]/55"
                                autoComplete="email"
                                required
                            />
                            {form.errors.email ? (
                                <p className="mt-1.5 text-xs text-red-300">
                                    {form.errors.email}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label
                                htmlFor="admin-password"
                                className="mb-2 block text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase"
                            >
                                Password
                            </label>
                            <input
                                id="admin-password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                className="w-full rounded-2xl border border-white/15 bg-[#050b18] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#00bd7d]/55"
                                autoComplete="new-password"
                                required
                            />
                            {form.errors.password ? (
                                <p className="mt-1.5 text-xs text-red-300">
                                    {form.errors.password}
                                </p>
                            ) : null}
                        </div>

                        <div>
                            <label
                                htmlFor="admin-password-confirmation"
                                className="mb-2 block text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase"
                            >
                                Confirm password
                            </label>
                            <input
                                id="admin-password-confirmation"
                                type="password"
                                value={form.data.password_confirmation}
                                onChange={(event) =>
                                    form.setData(
                                        'password_confirmation',
                                        event.target.value,
                                    )
                                }
                                className="w-full rounded-2xl border border-white/15 bg-[#050b18] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#00bd7d]/55"
                                autoComplete="new-password"
                                required
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <button
                                type="submit"
                                disabled={form.processing}
                                className="inline-flex cursor-pointer items-center rounded-full border border-[#00bd7d]/45 bg-[#00bd7d]/10 px-5 py-2.5 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing ? 'Creating...' : 'Create Admin'}
                            </button>
                        </div>
                    </form>
                </section>

                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1080px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">User</th>
                                    <th className="px-5 py-4 font-medium">Role</th>
                                    <th className="px-5 py-4 font-medium">Orders</th>
                                    <th className="px-5 py-4 font-medium">2FA</th>
                                    <th className="px-5 py-4 font-medium">Created</th>
                                    <th className="px-5 py-4 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length ? (
                                    users.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-white/10 last:border-b-0"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-white">
                                                    {user.name}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {user.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {user.is_super_admin
                                                    ? 'Super Admin'
                                                    : user.is_admin
                                                      ? 'Admin'
                                                      : 'Customer'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {user.orders_count}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {user.two_factor_enabled
                                                    ? 'Enabled'
                                                    : 'Disabled'}
                                            </td>
                                            <td className="px-5 py-4 text-slate-300">
                                                {user.created_at ?? '-'}
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.is_admin ? (
                                                    <button
                                                        type="button"
                                                        disabled={
                                                            user.is_super_admin
                                                        }
                                                        onClick={() =>
                                                            updateRole(
                                                                user,
                                                                false,
                                                            )
                                                        }
                                                        className="inline-flex cursor-pointer items-center rounded-full border border-red-500/55 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:border-white/20 disabled:bg-transparent disabled:text-slate-500"
                                                    >
                                                        {user.is_super_admin
                                                            ? 'Protected'
                                                            : 'Demote'}
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            updateRole(
                                                                user,
                                                                true,
                                                            )
                                                        }
                                                        className="inline-flex cursor-pointer items-center rounded-full border border-[#00bd7d]/45 bg-[#00bd7d]/10 px-3 py-1.5 text-xs font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/20"
                                                    >
                                                        Promote
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-5 py-10 text-center text-slate-400"
                                        >
                                            No users found.
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
