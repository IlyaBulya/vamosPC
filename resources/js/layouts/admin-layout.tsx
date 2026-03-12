import { Link, usePage } from '@inertiajs/react';
import {
    Cpu,
    FolderTree,
    LayoutDashboard,
    ListOrdered,
    LogOut,
    Package,
    Settings2,
    ShoppingCart,
    Store,
    Users,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';

type AuthUser = {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
};

type SharedPageProps = {
    auth: {
        user: AuthUser | null;
    };
    flash?: {
        status?: string | null;
        error?: string | null;
    };
};

type AdminLayoutProps = {
    title: string;
    description?: string;
    actions?: ReactNode;
    children: ReactNode;
};

const navigation = [
    { title: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { title: 'Products', href: '/admin/products', icon: Package },
    { title: 'Configurations', href: '/admin/configurations', icon: Cpu },
    {
        title: 'Welcome Order',
        href: '/admin/configurations/welcome',
        icon: ListOrdered,
    },
    { title: 'Categories', href: '/admin/categories', icon: FolderTree },
    { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { title: 'Users', href: '/admin/users', icon: Users },
];

export default function AdminLayout({
    title,
    description,
    actions,
    children,
}: AdminLayoutProps) {
    const page = usePage<SharedPageProps>();
    const user = page.props.auth.user;
    const flash = page.props.flash;
    const currentUrl = page.url;

    return (
        <div className="min-h-screen bg-[#040816] text-slate-100">
            <div className="flex min-h-screen flex-col lg:flex-row">
                <aside className="border-b border-white/10 bg-[#08101c] lg:min-h-screen lg:w-[280px] lg:border-r lg:border-b-0">
                    <div className="border-b border-white/10 px-6 py-6">
                        <Link
                            href="/admin"
                            className="inline-flex items-center gap-3"
                        >
                            <div className="rounded-2xl border border-[#00bd7d]/35 bg-[#00bd7d]/10 p-3">
                                <Settings2 className="h-6 w-6 text-[#00bd7d]" />
                            </div>
                            <div>
                                <p className="text-xs tracking-[0.18em] text-[#9cf5d8] uppercase">
                                    VamosPC
                                </p>
                                <p className="text-xl font-black text-white">
                                    Admin Panel
                                </p>
                            </div>
                        </Link>
                    </div>

                    <nav className="px-4 py-5">
                        <div className="space-y-1">
                            {navigation.map((item) => {
                                const isActive =
                                    item.href === '/admin'
                                        ? currentUrl === '/admin'
                                        : item.href === '/admin/configurations'
                                          ? currentUrl ===
                                                '/admin/configurations' ||
                                            currentUrl ===
                                                '/admin/configurations/create' ||
                                            /^\/admin\/configurations\/\d+\/edit$/.test(
                                                currentUrl,
                                            )
                                          : currentUrl === item.href ||
                                            currentUrl.startsWith(
                                                `${item.href}/`,
                                            );

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-[#0d1625] hover:text-white',
                                            isActive &&
                                                'border border-[#00bd7d]/35 bg-[#00bd7d]/12 text-[#9cf5d8]',
                                        )}
                                    >
                                        <item.icon className="h-4 w-4" />
                                        {item.title}
                                    </Link>
                                );
                            })}
                        </div>
                    </nav>
                </aside>

                <div className="flex-1">
                    <header className="border-b border-white/10 bg-[#050b18]/90">
                        <div className="flex flex-col gap-5 px-6 py-6 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <p className="text-xs tracking-[0.18em] text-[#9cf5d8] uppercase">
                                    Admin Area
                                </p>
                                <h1 className="mt-2 text-3xl font-black text-white">
                                    {title}
                                </h1>
                                {description ? (
                                    <p className="mt-2 max-w-3xl text-sm text-slate-300">
                                        {description}
                                    </p>
                                ) : null}
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                                {actions}
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                                >
                                    <Store className="h-4 w-4" />
                                    Open Store
                                </Link>
                                <Link
                                    href={logout()}
                                    as="button"
                                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-500/60 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Sign out
                                </Link>
                            </div>
                        </div>
                    </header>

                    <main className="px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#08101c]/85 px-5 py-4">
                            <div>
                                <p className="text-sm font-semibold text-white">
                                    {user?.name ?? 'Admin'}
                                </p>
                                <p className="text-sm text-slate-400">
                                    {user?.email ?? 'admin@example.com'}
                                </p>
                            </div>
                            <p className="rounded-full border border-[#00bd7d]/35 bg-[#00bd7d]/10 px-4 py-1.5 text-xs font-semibold tracking-[0.18em] text-[#9cf5d8] uppercase">
                                Administrator
                            </p>
                        </div>

                        {flash?.status ? (
                            <div className="mb-4 rounded-2xl border border-[#00bd7d]/35 bg-[#00bd7d]/10 px-4 py-3 text-sm text-[#9cf5d8]">
                                {flash.status}
                            </div>
                        ) : null}

                        {flash?.error ? (
                            <div className="mb-4 rounded-2xl border border-red-500/35 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {flash.error}
                            </div>
                        ) : null}

                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
