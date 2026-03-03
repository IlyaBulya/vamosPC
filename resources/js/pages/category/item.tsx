import { Head, Link } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

type CategoryItem = {
    name: string;
    description: string | null;
};

interface CategoryItemPageProps {
    title: string;
    type: string;
    category: CategoryItem;
}

function formatLabel(value: string) {
    return value
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function CategoryItemPage({
    title,
    type,
    category,
}: CategoryItemPageProps) {
    return (
        <>
            <Head title={title} />

            <StoreLayout>
                <Link
                    href={`/category/${type}`}
                    className="text-sm font-medium text-slate-500 transition hover:text-slate-700"
                >
                    Back to {formatLabel(type)}
                </Link>

                <p className="mt-8 text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
                    Category
                </p>
                <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                    {title}
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                    {category.description ??
                        'No description available for this category yet.'}
                </p>
                <p className="mt-6 text-sm text-slate-500">
                    Type: {formatLabel(type)}
                </p>
            </StoreLayout>
        </>
    );
}
