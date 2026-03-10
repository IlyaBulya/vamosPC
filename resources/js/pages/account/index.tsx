import { Head, Link, usePage } from '@inertiajs/react';
import { Box, Lock, Package, ShieldCheck } from 'lucide-react';
import InfoCard from '@/components/store/info-card';
import PageHero from '@/components/store/page-hero';
import StoreLayout from '@/layouts/store-layout';
import { logout } from '@/routes';

type AuthUser = {
    id: number;
    name: string;
    email: string;
};

type AccountStats = {
    orders_count: number;
    configurations_count: number;
    security_level: string;
};

type AccountOrder = {
    id: number;
    status: string;
    total_in_cents: number;
    items_count: number;
    created_at: string | null;
};

type SavedConfiguration = {
    id: number;
    name: string;
    description: string | null;
    price_in_cents: number;
    components_count: number;
    base_product_name: string | null;
    created_at: string | null;
};

function formatPrice(priceInCents: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
    }).format(priceInCents / 100);
}

export default function AccountPage() {
    const page = usePage<{
        auth: { user: AuthUser | null };
        stats: AccountStats;
        orders: AccountOrder[];
        configurations: SavedConfiguration[];
    }>();
    const user = page.props.auth.user;
    const { stats, orders, configurations } = page.props;

    return (
        <>
            <Head title="Account - VamosPC" />

            <StoreLayout
                contentClassName="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 lg:px-12"
                footerClassName="mt-6"
            >
                <PageHero
                    eyebrow="Account"
                    title={`Welcome back${user?.name ? `, ${user.name}` : ''}.`}
                    description="Manage your profile, track orders, and keep your saved configurations ready for checkout."
                >
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <InfoCard
                            label="Email"
                            value={user?.email ?? 'no-email@example.com'}
                            className="border-[#00bd7d]/25 bg-[#00bd7d]/10"
                            labelClassName="text-[#9cf5d8]"
                            valueClassName="text-sm text-slate-200"
                        />
                        <InfoCard label="Orders" value={stats.orders_count} />
                        <InfoCard
                            label="Saved Configs"
                            value={stats.configurations_count}
                        />
                        <InfoCard
                            label="Security Level"
                            value={stats.security_level}
                            valueClassName="text-2xl font-bold text-[#00bd7d]"
                        />
                    </div>
                </PageHero>

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
                        {orders.length ? (
                            <div className="mt-5 space-y-3">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="rounded-2xl border border-white/10 bg-[#0b1321] p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    Order #{order.id}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {order.items_count} items
                                                    {order.created_at
                                                        ? ` • ${order.created_at}`
                                                        : ''}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#9cf5d8]">
                                                    {order.status}
                                                </p>
                                                <p className="mt-1 text-lg font-bold text-white">
                                                    {formatPrice(order.total_in_cents)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-[#0b1321] p-4 text-sm text-slate-400">
                                No orders yet. Your future purchases will appear here.
                            </div>
                        )}
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
                        {configurations.length ? (
                            <div className="mt-5 space-y-3">
                                {configurations.map((configuration) => (
                                    <div
                                        key={configuration.id}
                                        className="rounded-2xl border border-white/10 bg-[#0b1321] p-4"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {configuration.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {configuration.base_product_name
                                                        ? `Base: ${configuration.base_product_name}`
                                                        : 'Base product not available'}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-400">
                                                    {configuration.components_count} components
                                                    {configuration.created_at
                                                        ? ` • ${configuration.created_at}`
                                                        : ''}
                                                </p>
                                                {configuration.description ? (
                                                    <p className="mt-2 text-sm text-slate-300">
                                                        {configuration.description}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <p className="text-lg font-bold text-[#00bd7d]">
                                                {formatPrice(configuration.price_in_cents)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="mt-5 rounded-2xl border border-dashed border-white/15 bg-[#0b1321] p-4 text-sm text-slate-400">
                                No saved configurations yet.
                            </div>
                        )}
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
                            <Link
                                href={logout()}
                                as="button"
                                className="rounded-full border border-red-500/70 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/25 hover:text-red-200"
                            >
                                Sign out
                            </Link>
                        </div>
                    </article>
                </section>
            </StoreLayout>
        </>
    );
}
