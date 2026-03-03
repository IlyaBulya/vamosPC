import { Head } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

export default function AssistancePage() {
    return (
        <>
            <Head title="Assistance" />

            <StoreLayout>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    Assistance
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                    This page is reserved for customer assistance and support.
                </p>
            </StoreLayout>
        </>
    );
}
