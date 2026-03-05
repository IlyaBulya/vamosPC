import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, FolderTree } from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

type CategorySummary = {
    name: string;
    description: string | null;
};

interface CategoryTypePageProps {
    title: string;
    type: string;
    categories: CategorySummary[];
}

function formatLabel(value: string) {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function CategoryTypePage({
    title,
    type,
    categories,
}: CategoryTypePageProps) {
    const itemBasePath = type === 'laptop' ? '/laptops' : `/catalog/${type}`;
    const prettyType = title.toLowerCase();

    return (
        <>
            <Head title={title} />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-52 h-72 w-72 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-[#9cf5d8]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Back to Catalog
                        </Link>

                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                            Category Type
                        </p>
                        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
                            {title}
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                            Browse the available {prettyType} categories and open
                            the one you need.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-2 text-sm text-[#9cf5d8]">
                            <FolderTree className="h-4 w-4" />
                            {categories.length} categories
                        </div>
                    </section>

                    <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                href={`${itemBasePath}/${category.name}`}
                                className="group rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 transition hover:border-[#00bd7d]/55 hover:bg-[#0b1624]"
                            >
                                <p className="text-xs uppercase tracking-[0.14em] text-slate-400">
                                    Category
                                </p>
                                <h2 className="mt-3 text-2xl font-bold text-white">
                                    {formatLabel(category.name)}
                                </h2>
                                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                    {category.description ??
                                        'No description available for this category yet.'}
                                </p>
                                <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-slate-200 transition group-hover:text-[#9cf5d8]">
                                    Open category
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            </Link>
                        ))}
                    </section>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
