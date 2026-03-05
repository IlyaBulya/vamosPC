import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

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

    return (
        <>
            <Head title={title} />

            <StoreLayout>
                <p className="text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                    Category Type
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                    {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                    Browse the available {title.toLowerCase()} categories.
                </p>

                <div className="mt-12 grid gap-4 md:grid-cols-2">
                    {categories.map((category) => (
                        <Link
                            key={category.name}
                            href={`${itemBasePath}/${category.name}`}
                            className="rounded-xl border border-slate-200 bg-white p-6 transition hover:border-slate-300 hover:bg-slate-100"
                        >
                            <h2 className="text-xl font-semibold text-slate-900">
                                {formatLabel(category.name)}
                            </h2>
                            <p className="mt-3 text-sm text-slate-600">
                                {category.description ??
                                    'No description available for this category yet.'}
                            </p>
                        </Link>
                    ))}
                </div>
            </StoreLayout>
        </>
    );
}
