import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';

export default function GamingPcPage() {
    const { auth } = usePage().props;
    return (
        <>
            <Head title="Gaming PC" />

            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
                        <div className="flex items-center gap-4">
                            <Link href="/" className="text-4xl font-bold tracking-tight md:text-5xl">
                                VamosPC
                            </Link>
                            <Link href="/gaming-pc" className="text-sm font-medium">
                                Gaming PC
                            </Link>
                        </div>

                        <nav className="flex items-center gap-3 text-sm font-medium">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-md px-3 py-1.5 text-slate-700 transition hover:bg-slate-100"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-md bg-slate-900 px-3 py-1.5 text-white transition hover:bg-slate-700"
                                    >
                                        Sign up
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto w-full max-w-6xl px-4 py-24 md:px-6">
                    <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                        Gaming PC
                    </h1>
                    <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                        This page is reserved for gaming desktop builds.
                        Products and configuration logic will be connected in
                        the next step.
                    </p>
                </main>
            </div>
        </>
    );
}
