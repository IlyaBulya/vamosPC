import { Head, Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import FeaturePill from '@/components/store/feature-pill';
import PageHero from '@/components/store/page-hero';
import StoreLayout from '@/layouts/store-layout';

type CategorySummary = {
    name: string;
    description: string | null;
    image: string | null;
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

            <StoreLayout footerClassName="mt-6">
                <PageHero
                    backHref="/catalog"
                    backLabel="Back to Catalog"
                    eyebrow="Category Type"
                    title={title}
                    description={`Browse the available ${prettyType} categories and open the one you need.`}
                    meta={<FeaturePill>{categories.length} categories</FeaturePill>}
                />

                <section className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={`${itemBasePath}/${category.name}`}
                            className="group rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 transition hover:border-[#00bd7d]/55 hover:bg-[#0b1624]"
                        >
                            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1622]">
                                <div className="aspect-[4/3]">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={formatLabel(category.name)}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            Category image
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="mt-4 text-xs uppercase tracking-[0.14em] text-slate-400">
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
            </StoreLayout>
        </>
    );
}
