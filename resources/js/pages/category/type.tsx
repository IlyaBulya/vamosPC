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

            <StoreLayout
                contentClassName="py-6 sm:py-10"
                footerClassName="mt-6"
            >
                <PageHero
                    compactOnMobile
                    backHref="/catalog"
                    backLabel="Back to Catalog"
                    eyebrow="Category Type"
                    title={title}
                    description={`Browse the available ${prettyType} categories and open the one you need.`}
                    meta={
                        <FeaturePill>
                            {categories.length} categories
                        </FeaturePill>
                    }
                />

                <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={`${itemBasePath}/${category.name}`}
                            className="group flex h-full min-w-0 flex-col rounded-[20px] border border-white/10 bg-[#08101c]/85 p-2.5 shadow-[0_12px_26px_rgba(0,0,0,0.28)] transition active:border-[#00bd7d]/55 active:bg-[#0b1624] sm:block sm:h-auto sm:rounded-3xl sm:p-6 sm:shadow-none sm:hover:border-[#00bd7d]/55 sm:hover:bg-[#0b1624]"
                        >
                            <div className="overflow-hidden rounded-[14px] border border-white/10 bg-[#0f1622] sm:rounded-2xl">
                                <div className="aspect-[4/3]">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={formatLabel(category.name)}
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center px-2 text-center text-[0.65rem] leading-tight font-semibold tracking-[0.1em] text-slate-500 uppercase sm:text-xs sm:tracking-[0.16em]">
                                            Category image
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="mt-2.5 text-[0.65rem] font-semibold tracking-[0.12em] text-[#9cf5d8]/80 uppercase sm:mt-4 sm:text-xs sm:font-normal sm:tracking-[0.14em] sm:text-slate-400">
                                Category
                            </p>
                            <h2 className="mt-1 line-clamp-2 min-h-[2.1rem] text-sm leading-[1.15] font-extrabold text-white min-[375px]:text-base sm:mt-3 sm:line-clamp-none sm:min-h-0 sm:text-2xl sm:leading-8 sm:font-bold">
                                {formatLabel(category.name)}
                            </h2>
                            <p className="mt-2 line-clamp-2 min-h-8 text-[0.68rem] leading-[1.45] text-slate-400 sm:mt-3 sm:line-clamp-none sm:min-h-0 sm:text-sm sm:leading-relaxed sm:text-slate-300">
                                {category.description ??
                                    'No description available for this category yet.'}
                            </p>
                            <div className="mt-auto inline-flex items-center gap-1 pt-3 text-[0.65rem] font-bold text-slate-200 transition group-active:text-[#9cf5d8] sm:pt-5 sm:text-sm sm:font-semibold sm:group-hover:text-[#9cf5d8]">
                                <span className="sm:hidden">Open</span>
                                <span className="hidden sm:inline">
                                    Open category
                                </span>
                                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            </div>
                        </Link>
                    ))}
                </section>
            </StoreLayout>
        </>
    );
}
