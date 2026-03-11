import { Head } from '@inertiajs/react';
import AdminLayout from '@/layouts/admin-layout';

type UserRow = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    orders_count: number;
    two_factor_enabled: boolean;
    created_at: string | null;
};

export default function AdminUsersPage({ users }: { users: UserRow[] }) {
    return (
        <>
            <Head title="Admin Users" />

            <AdminLayout
                title="Users"
                description="Review customer accounts, admin access, and account activity."
            >
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#08101c]/85">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="border-b border-white/10 bg-[#0b1321] text-slate-400">
                                <tr>
                                    <th className="px-5 py-4 font-medium">User</th>
                                    <th className="px-5 py-4 font-medium">Role</th>
                                    <th className="px-5 py-4 font-medium">Orders</th>
                                    <th className="px-5 py-4 font-medium">2FA</th>
                                    <th className="px-5 py-4 font-medium">Created</th>
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
                                                {user.is_admin ? 'Admin' : 'Customer'}
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
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={5}
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
