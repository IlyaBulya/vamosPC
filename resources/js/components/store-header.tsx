import { Link, usePage } from '@inertiajs/react';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { login, register } from '@/routes';

type StoreHeaderProps = {
    canRegister?: boolean;
};

const storeNavItems = [
    { href: '/gaming-pc', label: 'Gaming PC' },
    { href: '/catalog', label: 'Catalog' },
    { href: '/laptops', label: 'Laptops' },
    { href: '/assistance', label: 'Assistance' },
] as const;

const normalizePath = (url: string): string => {
    const [path] = url.split(/[?#]/);
    if (!path) {
        return '/';
    }

    return path.startsWith('/') ? path : `/${path}`;
};

const isActivePath = (currentPath: string, targetPath: string): boolean => {
    if (targetPath === '/') {
        return currentPath === '/';
    }

    return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`);
};

export default function StoreHeader({ canRegister = true }: StoreHeaderProps) {
    const page = usePage<{ auth: { user: unknown | null } }>();
    const currentPath = normalizePath(page.url);
    const isLoggedIn = Boolean(page.props.auth?.user);

    return (
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050b16] backdrop-blur">
            <div className="flex h-16 w-full items-center justify-between px-4 sm:px-8 lg:px-16">
                <Link href="/" className="inline-flex items-center gap-0">
                    <span className="text-[2.65rem] font-black tracking-[-0.015em] text-[#00bd7d]">
                        VAMOS
                    </span>
                    <img
                        src="/images/VamosLogo.png"
                        alt="VamosPC"
                        className="h-12 w-auto object-contain"
                    />
                </Link>

                <nav className="hidden items-center gap-2 md:flex">
                    {storeNavItems.map((item) => {
                        const isActive = isActivePath(currentPath, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                    isActive
                                        ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 text-[#00bd7d] shadow-[0_0_20px_rgba(0,189,125,0.45)]'
                                        : 'border-transparent text-slate-300 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <nav className="flex items-center gap-2 text-sm font-medium">
                    <Link
                        href="/compare"
                        className={`rounded-full border p-2 transition ${
                            isActivePath(currentPath, '/compare')
                                ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 text-[#00bd7d] shadow-[0_0_20px_rgba(0,189,125,0.45)]'
                                : 'border-white/15 text-slate-300 hover:border-white/35 hover:text-white'
                        }`}
                    >
                        <span className="sr-only">Compare</span>
                        <ChartNoAxesColumnIncreasing className="h-5 w-5" />
                    </Link>

                    {isLoggedIn ? (
                        <Link
                            href="/account"
                            className={`rounded-full border px-4 py-2 transition ${
                                isActivePath(currentPath, '/account')
                                    ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 text-[#00bd7d] shadow-[0_0_20px_rgba(0,189,125,0.45)]'
                                    : 'border-white/15 text-slate-200 hover:border-white/35 hover:text-white'
                            }`}
                        >
                            Account
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="rounded-full border border-white/15 px-4 py-2 text-slate-200 transition hover:border-white/35 hover:text-white"
                            >
                                Log in
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="rounded-full bg-[#00bd7d] px-4 py-2 text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.5)] transition hover:bg-[#18d99a]"
                                >
                                    Sign up
                                </Link>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
