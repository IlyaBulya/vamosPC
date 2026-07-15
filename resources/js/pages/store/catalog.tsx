import { Head, Link } from '@inertiajs/react';
import { ChevronRight, Cpu, Gamepad2, Laptop, Mouse } from 'lucide-react';
import FeaturePill from '@/components/store/feature-pill';
import PageHero from '@/components/store/page-hero';
import StoreLayout from '@/layouts/store-layout';

type CatalogType = {
    title: string;
    href: string;
    description: string;
    count: number;
};

const iconByTitle = {
    'Gaming PCs': Gamepad2,
    Hardware: Cpu,
    Accessories: Mouse,
    Laptops: Laptop,
} as const;

export default function CatalogPage({ types }: { types: CatalogType[] }) {
    const totalEntries = types.reduce((sum, type) => sum + type.count, 0);

    return (
        <>
            <Head title="Catalog" />

            <StoreLayout
                contentClassName="py-6 sm:py-10"
                footerClassName="mt-6"
            >
                <PageHero
                    compactOnMobile
                    eyebrow="Store Catalog"
                    title="Choose Your Category"
                    description="Browse gaming PC configurations, hardware, accessories, and laptop categories."
                    meta={
                        <FeaturePill>
                            <span className="font-semibold">
                                {totalEntries}
                            </span>
                            items available
                        </FeaturePill>
                    }
                />

                <section className="mt-5 grid grid-cols-2 gap-3 sm:mt-6 sm:gap-5 lg:grid-cols-2 xl:grid-cols-4">
                    {types.map((type) => {
                        const Icon =
                            iconByTitle[
                                type.title as keyof typeof iconByTitle
                            ] ?? Cpu;
                        const countLabel =
                            type.title === 'Gaming PCs'
                                ? 'builds'
                                : 'categories';

                        return (
                            <Link
                                key={type.title}
                                href={type.href}
                                className="group flex h-full min-w-0 flex-col rounded-[20px] border border-white/10 bg-[#08101c]/85 p-3 shadow-[0_12px_26px_rgba(0,0,0,0.28)] transition active:border-[#00bd7d]/55 active:bg-[#0b1624] sm:block sm:h-auto sm:rounded-3xl sm:p-6 sm:shadow-none sm:hover:border-[#00bd7d]/55 sm:hover:bg-[#0b1624]"
                            >
                                <div className="inline-flex w-fit rounded-lg border border-[#00bd7d]/40 bg-[#00bd7d]/10 p-1.5 sm:rounded-xl sm:p-2">
                                    <Icon className="h-4 w-4 text-[#00bd7d] sm:h-5 sm:w-5" />
                                </div>

                                <h2 className="mt-3 line-clamp-2 min-h-[2.4rem] text-lg leading-[1.05] font-black text-white min-[375px]:text-xl sm:mt-4 sm:line-clamp-none sm:min-h-0 sm:text-3xl sm:leading-9">
                                    {type.title}
                                </h2>
                                <p className="mt-2 line-clamp-3 min-h-[3rem] text-[0.7rem] leading-[1.45] text-slate-400 sm:mt-3 sm:line-clamp-none sm:min-h-0 sm:text-sm sm:leading-relaxed sm:text-slate-300">
                                    {type.description}
                                </p>

                                <div className="mt-auto flex items-center justify-between gap-2 pt-4 sm:pt-6">
                                    <span className="min-w-0 text-[0.68rem] leading-tight font-semibold text-[#9cf5d8] sm:text-sm sm:font-medium">
                                        {type.count} {countLabel}
                                    </span>
                                    <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/12 text-slate-200 transition group-active:border-[#00bd7d]/40 group-active:text-[#9cf5d8] sm:h-auto sm:w-auto sm:gap-1 sm:border-0 sm:text-sm sm:font-semibold sm:group-hover:text-[#9cf5d8]">
                                        <span className="hidden sm:inline">
                                            Open
                                        </span>
                                        <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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
