import { Head, Link } from '@inertiajs/react';

export default function GamingPcPage() {
    return (
        <>
            <Head title="Gaming PC" />

            <div className="min-h-screen bg-slate-50 text-slate-900">
                <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
                        <Link href="/" className="text-lg font-semibold">
                            VamosPC
                        </Link>
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
