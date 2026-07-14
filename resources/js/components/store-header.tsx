import { Link, usePage } from '@inertiajs/react';
import { Menu, ShoppingCart, User, X } from 'lucide-react';
import { useState } from 'react';
import { login, register } from '@/routes';

type StoreHeaderProps = {
    canRegister?: boolean;
};

const storeNavItems = [
    { href: '/gaming-pcs', label: 'Gaming PCs' },
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

    return (
        currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    );
};

export default function StoreHeader({ canRegister = true }: StoreHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const page = usePage<{
        auth: { user: unknown | null };
        cart?: { count?: number };
    }>();
    const currentPath = normalizePath(page.url);
    const isLoggedIn = Boolean(page.props.auth?.user);
    const cartCount = Number(page.props.cart?.count ?? 0);

    return (
        <header className="store-header-surface sticky top-0 z-50 border-b border-white/10">
            <div className="flex h-16 w-full items-center justify-between gap-2 px-3 sm:px-8 lg:px-16">
                <Link
                    href="/"
                    className="inline-flex min-w-0 shrink-0 items-center gap-0"
                    aria-label="VamosPC home"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <span className="text-[1.65rem] font-black tracking-[-0.015em] text-[#00bd7d] sm:text-[2.65rem]">
                        VAMOS
                    </span>
                    <img
                        src="/images/VamosLogo.png"
                        alt=""
                        width={48}
                        height={48}
                        aria-hidden="true"
                        className="h-9 w-auto object-contain sm:h-12"
                    />
                </Link>

                <nav
                    aria-label="Primary navigation"
                    className="hidden items-center gap-2 lg:flex"
                >
                    {storeNavItems.map((item) => {
                        const isActive = isActivePath(currentPath, item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={isActive ? 'page' : undefined}
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

                <nav
                    aria-label="Account navigation"
                    className="flex items-center gap-1.5 text-sm font-medium sm:gap-2"
                >
                    <Link
                        href="/cart"
                        aria-label={
                            cartCount > 0
                                ? `Cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`
                                : 'Cart'
                        }
                        aria-current={
                            isActivePath(currentPath, '/cart')
                                ? 'page'
                                : undefined
                        }
                        className={`relative inline-flex size-11 items-center justify-center rounded-full border transition ${
                            isActivePath(currentPath, '/cart')
                                ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 text-[#00bd7d] shadow-[0_0_20px_rgba(0,189,125,0.45)]'
                                : 'border-white/15 text-slate-200 hover:border-white/35 hover:text-white'
                        }`}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#00bd7d] px-1 text-[11px] leading-none font-bold text-[#04120d] shadow-[0_0_16px_rgba(0,189,125,0.65)]">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>

                    {isLoggedIn ? (
                        <Link
                            href="/account"
                            aria-current={
                                isActivePath(currentPath, '/account')
                                    ? 'page'
                                    : undefined
                            }
                            className={`inline-flex size-11 items-center justify-center rounded-full border transition ${
                                isActivePath(currentPath, '/account')
                                    ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 text-[#00bd7d] shadow-[0_0_20px_rgba(0,189,125,0.45)]'
                                    : 'border-white/15 text-slate-200 hover:border-white/35 hover:text-white'
                            }`}
                        >
                            <span className="sr-only">Account</span>
                            <User className="h-5 w-5" />
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="hidden rounded-full border border-white/15 px-4 py-2 text-slate-200 transition hover:border-white/35 hover:text-white sm:inline-flex"
                            >
                                Log in
                            </Link>
                            {canRegister && (
                                <Link
                                    href={register()}
                                    className="hidden rounded-full bg-[#00bd7d] px-4 py-2 text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.5)] transition hover:bg-[#18d99a] sm:inline-flex"
                                >
                                    Sign up
                                </Link>
                            )}
                        </>
                    )}

                    <button
                        type="button"
                        className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:border-white/35 hover:text-white lg:hidden"
                        aria-controls="mobile-store-navigation"
                        aria-expanded={isMobileMenuOpen}
                        aria-label={
                            isMobileMenuOpen
                                ? 'Close navigation menu'
                                : 'Open navigation menu'
                        }
                        onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </nav>
            </div>

            {isMobileMenuOpen ? (
                <div
                    id="mobile-store-navigation"
                    className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-white/10 bg-[#050b16]/98 px-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_24px_48px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:px-8 lg:hidden"
                >
                    <nav aria-label="Mobile navigation" className="grid gap-2">
                        {storeNavItems.map((item) => {
                            const isActive = isActivePath(
                                currentPath,
                                item.href,
                            );

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    aria-current={isActive ? 'page' : undefined}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex min-h-11 items-center rounded-2xl border px-4 py-2.5 text-base font-medium transition ${
                                        isActive
                                            ? 'border-[#00bd7d]/65 bg-[#00bd7d]/12 text-[#00bd7d]'
                                            : 'border-white/10 text-slate-200 hover:border-white/25 hover:text-white'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 sm:hidden">
                        {isLoggedIn ? (
                            <Link
                                href="/account"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="col-span-2 inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 px-4 py-2.5 font-medium text-slate-100"
                            >
                                Account
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 px-4 py-2.5 font-medium text-slate-100 ${canRegister ? '' : 'col-span-2'}`}
                                >
                                    Log in
                                </Link>
                                {canRegister ? (
                                    <Link
                                        href={register()}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#00bd7d] px-4 py-2.5 font-semibold text-[#04120d]"
                                    >
                                        Sign up
                                    </Link>
                                ) : null}
                            </>
                        )}
                    </div>
                </div>
            ) : null}
        </header>
    );
}
