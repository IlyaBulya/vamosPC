import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

type CatalogType = {
    title: string;
    href: string;
    description: string;
    count: number;
};

export default function CatalogPage({ types }: { types: CatalogType[] }) {
    return (
        <>
            <Head title="Catalog" />

            <StoreLayout>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    Catalog
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                    Browse the main category types and jump into the section you
                    want to explore.
                </p>

                <div className="mt-12 grid gap-4 md:grid-cols-3">
                    {types.map((type) => (
                        <Link
                            key={type.title}
                            href={type.href}
                            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:bg-slate-100"
                        >
                            <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                                Category Type
                            </p>
                            <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                                {type.title}
                            </h2>
                            <p className="mt-3 text-sm text-slate-600">
                                {type.description}
                            </p>
                            <p className="mt-6 text-sm font-medium text-slate-500">
                                {type.count} categories
                            </p>
                        </Link>
                    ))}
                </div>
            </StoreLayout>
        </>
    );
}
