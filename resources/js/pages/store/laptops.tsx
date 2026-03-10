import { Head } from '@inertiajs/react';
import PageHero from '@/components/store/page-hero';
import StoreLayout from '@/layouts/store-layout';

export default function LaptopsPage() {
    return (
        <>
            <Head title="Laptops" />

            <StoreLayout footerClassName="mt-6">
                <PageHero
                    eyebrow="Laptops"
                    title="Portable performance builds for gaming, work, and daily use."
                    description="This page is reserved for laptop listings and laptop build guidance."
                />
            </StoreLayout>
        </>
    );
}
