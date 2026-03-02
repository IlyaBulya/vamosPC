import { Head } from '@inertiajs/react';
import StoreLayout from '@/layouts/store-layout';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    return (
        <>
            <Head title="Welcome" />

            <StoreLayout canRegister={canRegister}>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    Welcome to VamosPC
                </h1>
                <p className="mt-4 max-w-2xl text-base text-slate-600 md:text-lg">
                    Buy ready-to-go computers or build your custom PC in
                    Barcelona.
                </p>
            </StoreLayout>
        </>
    );
}
