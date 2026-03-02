import { Head } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

export default function LaptopsPage() {
    return (
        <>
            <Head title="Laptops" />

            <StoreLayout>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    Laptops
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                    This page is reserved for laptop listings and laptop build
                    guidance.
                </p>
            </StoreLayout>
        </>
    );
}
