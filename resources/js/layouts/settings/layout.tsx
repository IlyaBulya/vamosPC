import { Link, usePage } from '@inertiajs/react';
import type { InertiaLinkProps } from '@inertiajs/react';
import { KeyRound, ShieldCheck, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { cn, toUrl } from '@/lib/utils';
import { edit } from '@/routes/profile';
import { show } from '@/routes/two-factor';
import { edit as editPassword } from '@/routes/user-password';

type NavHref = NonNullable<InertiaLinkProps['href']>;

type SidebarNavItem = {
    title: string;
    description: string;
    href: NavHref;
    icon: typeof UserRound;
};

const sidebarNavItems: SidebarNavItem[] = [
    {
        title: 'Profile',
        description: 'Name and email',
        href: edit(),
        icon: UserRound,
    },
    {
        title: 'Password',
        description: 'Update credentials',
        href: editPassword(),
        icon: KeyRound,
    },
    {
        title: 'Two-Factor Auth',
        description: 'Authenticator app',
        href: show(),
        icon: ShieldCheck,
    },
];

function pathnameFromHref(href: NavHref): string {
    return new URL(toUrl(href), 'http://localhost').pathname;
}

export default function SettingsLayout({ children }: PropsWithChildren) {
    const page = usePage();
    const currentPath = new URL(page.url, 'http://localhost').pathname;

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.35)] sm:p-8">
                <p className="text-xs tracking-[0.18em] text-[#9cf5d8] uppercase">
                    Account
                </p>
                <h1 className="mt-3 text-3xl font-black text-white sm:text-4xl">
                    Settings
                </h1>
                <p className="mt-3 max-w-3xl text-sm text-slate-300 sm:text-base">
                    Manage your profile details, password, and security options.
                </p>
            </section>

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                <aside className="h-fit rounded-3xl border border-white/10 bg-[#070d17]/95 p-3 lg:sticky lg:top-24">
                    <nav className="space-y-2" aria-label="Settings">
                        {sidebarNavItems.map((item) => {
                            const isActive =
                                pathnameFromHref(item.href) === currentPath;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={toUrl(item.href)}
                                    href={item.href}
                                    className={cn(
                                        'group flex cursor-pointer items-center gap-3 rounded-2xl border border-transparent px-4 py-3 transition',
                                        isActive
                                            ? 'border-[#00bd7d]/40 bg-[#00bd7d]/12 shadow-[0_0_18px_rgba(0,189,125,0.35)]'
                                            : 'hover:border-white/15 hover:bg-[#0d1625]',
                                    )}
                                >
                                    <span
                                        className={cn(
                                            'inline-flex rounded-lg border p-2 transition',
                                            isActive
                                                ? 'border-[#00bd7d]/45 bg-[#00bd7d]/12 text-[#9cf5d8]'
                                                : 'border-white/15 bg-[#0b1321] text-slate-300 group-hover:text-white',
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span>
                                        <span
                                            className={cn(
                                                'block text-sm font-semibold',
                                                isActive
                                                    ? 'text-[#9cf5d8]'
                                                    : 'text-slate-100',
                                            )}
                                        >
                                            {item.title}
                                        </span>
                                        <span className="text-xs text-slate-400">
                                            {item.description}
                                        </span>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <div className="space-y-6">{children}</div>
            </div>
        </div>
    );
}
