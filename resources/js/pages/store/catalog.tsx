import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Cpu, Laptop, Mouse } from 'lucide-react';
import PageHero from '@/components/store/page-hero';
import FeaturePill from '@/components/store/feature-pill';
import StoreLayout from '@/layouts/store-layout';

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

            <StoreLayout footerClassName="mt-6">
                <PageHero
                    eyebrow="Store Catalog"
                    title="Choose Your Category"
                    description="Browse the main catalog sections and jump into hardware, accessories, or laptop categories."
                    meta={
                        <FeaturePill>
                            <span className="font-semibold">{totalCategories}</span>
                            categories available
                        </FeaturePill>
                    }
                />

                <section className="mt-6 grid gap-5 lg:grid-cols-3">
                    {types.map((type) => {
                        const Icon =
                            iconByTitle[type.title as keyof typeof iconByTitle] ?? Cpu;

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
            </StoreLayout>
        </>
    );
}
