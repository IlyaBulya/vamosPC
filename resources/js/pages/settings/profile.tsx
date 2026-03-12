import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';
import StoreLayout from '@/layouts/store-layout';
import { send } from '@/routes/verification';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Profile Settings - VamosPC" />

            <StoreLayout
                contentClassName="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 lg:px-12"
                footerClassName="mt-6"
            >
                <h1 className="sr-only">Profile Settings</h1>

                <SettingsLayout>
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                        <div className="mb-5">
                            <p className="text-xs tracking-[0.16em] text-[#9cf5d8] uppercase">
                                Profile
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Profile Information
                            </h2>
                            <p className="mt-2 text-sm text-slate-300">
                                Update your display name and email address used
                                for account notifications.
                            </p>
                        </div>

                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-5"
                        >
                            {({ processing, recentlySuccessful, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="name"
                                            className="text-sm text-slate-200"
                                        >
                                            Name
                                        </Label>

                                        <Input
                                            id="name"
                                            className="h-11 border-white/15 bg-[#0d1624] text-slate-100 placeholder:text-slate-500"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError
                                            className="text-sm text-red-300"
                                            message={errors.name}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="email"
                                            className="text-sm text-slate-200"
                                        >
                                            Email Address
                                        </Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="h-11 border-white/15 bg-[#0d1624] text-slate-100 placeholder:text-slate-500"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError
                                            className="text-sm text-red-300"
                                            message={errors.email}
                                        />
                                    </div>

                                    {mustVerifyEmail &&
                                        auth.user.email_verified_at ===
                                            null && (
                                            <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                                                <p>
                                                    Your email address is
                                                    unverified.{` `}
                                                    <Link
                                                        href={send()}
                                                        as="button"
                                                        className="cursor-pointer font-semibold underline decoration-amber-300/60 underline-offset-4 transition hover:decoration-amber-200"
                                                    >
                                                        Click here to resend the
                                                        verification email.
                                                    </Link>
                                                </p>

                                                {status ===
                                                    'verification-link-sent' && (
                                                    <p className="mt-2 font-medium text-[#9cf5d8]">
                                                        A new verification link
                                                        has been sent to your
                                                        email address.
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-profile-button"
                                            className="cursor-pointer rounded-full bg-[#00bd7d] px-6 py-2.5 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a] disabled:cursor-not-allowed disabled:bg-[#0d5a43] disabled:text-[#7fdabc] disabled:shadow-none"
                                        >
                                            Save Profile
                                        </button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm font-medium text-[#9cf5d8]">
                                                Saved
                                            </p>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                    </section>

                    <DeleteUser />
                </SettingsLayout>
            </StoreLayout>
        </>
    );
}
