import { Head, Link, usePage } from '@inertiajs/react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';
import { Box, Lock, Package, ShieldCheck } from 'lucide-react';

type AuthUser = {
    id: number;
    name: string;
    email: string;
};

export default function AccountPage() {
    const page = usePage<{ auth: { user: AuthUser | null } }>();
    const user = page.props.auth.user;

    return (
        <>
            <Head title="Account - VamosPC" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-16 top-24 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-8">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                            Account
                        </p>
                        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                            Welcome back{user?.name ? `, ${user.name}` : ''}.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                            Manage your profile, track orders, and keep your saved
                            configurations ready for checkout.
                        </p>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-2xl border border-[#00bd7d]/25 bg-[#00bd7d]/10 p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-[#9cf5d8]">
                                    Email
                                </p>
                                <p className="mt-2 text-sm text-slate-200">
                                    {user?.email ?? 'no-email@example.com'}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#0a1322] p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                    Orders
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">0</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#0a1322] p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                    Saved Configs
                                </p>
                                <p className="mt-2 text-2xl font-bold text-white">0</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-[#0a1322] p-4">
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                    Security Level
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#00bd7d]">
                                    Basic
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-6 lg:grid-cols-2">
                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-[#00bd7d]/40 bg-[#00bd7d]/10 p-2">
                                    <ShieldCheck className="h-5 w-5 text-[#00bd7d]" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Profile</h2>
                            </div>
                            <p className="mt-3 text-sm text-slate-300">
                                Update your account details and personal information.
                            </p>
                            <Link
                                href="/settings/profile"
                                className="mt-5 inline-flex rounded-full border border-[#00bd7d]/55 bg-[#00bd7d]/15 px-4 py-2 text-sm font-medium text-[#9cf5d8] transition hover:bg-[#00bd7d]/25"
                            >
                                Edit Profile
                            </Link>
                        </article>

                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-[#00bd7d]/40 bg-[#00bd7d]/10 p-2">
                                    <Package className="h-5 w-5 text-[#00bd7d]" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Orders</h2>
                            </div>
                            <p className="mt-3 text-sm text-slate-300">
                                Review your latest purchases and order status.
                            </p>
                            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-[#0b1321] p-4 text-sm text-slate-400">
                                No orders yet. Your future purchases will appear here.
                            </div>
                        </article>

                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-[#00bd7d]/40 bg-[#00bd7d]/10 p-2">
                                    <Box className="h-5 w-5 text-[#00bd7d]" />
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    Saved Configurations
                                </h2>
                            </div>
                            <p className="mt-3 text-sm text-slate-300">
                                Keep your favorite builds and continue editing anytime.
                            </p>
                            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-[#0b1321] p-4 text-sm text-slate-400">
                                No saved configurations yet.
                            </div>
                        </article>

                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-[#00bd7d]/40 bg-[#00bd7d]/10 p-2">
                                    <Lock className="h-5 w-5 text-[#00bd7d]" />
                                </div>
                                <h2 className="text-xl font-bold text-white">Security</h2>
                            </div>
                            <p className="mt-3 text-sm text-slate-300">
                                Secure your account with password updates and 2FA.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <Link
                                    href="/settings/password"
                                    className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                                >
                                    Change Password
                                </Link>
                                <Link
                                    href="/settings/two-factor"
                                    className="rounded-full border border-[#00bd7d]/55 bg-[#00bd7d]/15 px-4 py-2 text-sm text-[#9cf5d8] transition hover:bg-[#00bd7d]/25"
                                >
                                    Two-Factor Auth
                                </Link>
                            </div>
                        </article>
                    </section>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
