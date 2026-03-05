import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Cpu, Laptop, Mouse } from 'lucide-react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';

type CatalogType = {
    title: string;
    href: string;
    description: string;
    count: number;
};

const iconByTitle = {
    Hardware: Cpu,
    Accessories: Mouse,
    Laptops: Laptop,
} as const;

export default function CatalogPage({ types }: { types: CatalogType[] }) {
    const totalCategories = types.reduce((sum, type) => sum + type.count, 0);

    return (
        <>
            <Head title="Catalog" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-16 top-24 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-44 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1540px] px-4 py-10 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-7 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-10">
                        <p className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                            Store Catalog
                        </p>
                        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-5xl">
                            Choose Your Category
                        </h1>
                        <p className="mt-4 max-w-3xl text-base text-slate-300 sm:text-lg">
                            Browse the main catalog sections and jump into hardware,
                            accessories, or laptop categories.
                        </p>

                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-2 text-sm text-[#9cf5d8]">
                            <span className="font-semibold">{totalCategories}</span>
                            categories available
                        </div>
                    </section>

                    <section className="mt-6 grid gap-5 lg:grid-cols-3">
                        {types.map((type) => {
                            const Icon =
                                iconByTitle[type.title as keyof typeof iconByTitle] ??
                                Cpu;

                            return (
                                <Link
                                    key={type.title}
                                    href={type.href}
                                    className="group rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 transition hover:border-[#00bd7d]/55 hover:bg-[#0b1624]"
                                >
                                    <div className="inline-flex rounded-xl border border-[#00bd7d]/40 bg-[#00bd7d]/10 p-2">
                                        <Icon className="h-5 w-5 text-[#00bd7d]" />
                                    </div>

                                    <h2 className="mt-4 text-3xl font-black text-white">
                                        {type.title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                        {type.description}
                                    </p>

                                    <div className="mt-6 flex items-center justify-between">
                                        <span className="text-sm font-medium text-[#9cf5d8]">
                                            {type.count} categories
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-slate-200 transition group-hover:text-[#9cf5d8]">
                                            Open
                                            <ChevronRight className="h-4 w-4" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </section>
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
