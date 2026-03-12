import { Transition } from '@headlessui/react';
import { Form, Head } from '@inertiajs/react';
import { useRef } from 'react';
import PasswordController from '@/actions/App/Http/Controllers/Settings/PasswordController';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SettingsLayout from '@/layouts/settings/layout';
import StoreLayout from '@/layouts/store-layout';

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    return (
        <>
            <Head title="Password Settings - VamosPC" />

            <StoreLayout
                contentClassName="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 lg:px-12"
                footerClassName="mt-6"
            >
                <h1 className="sr-only">Password Settings</h1>

                <SettingsLayout>
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                        <div className="mb-5">
                            <p className="text-xs tracking-[0.16em] text-[#9cf5d8] uppercase">
                                Security
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">
                                Update Password
                            </h2>
                            <p className="mt-2 text-sm text-slate-300">
                                Use a strong password that you do not reuse on
                                other websites.
                            </p>
                        </div>

                        <Form
                            {...PasswordController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            resetOnError={[
                                'password',
                                'password_confirmation',
                                'current_password',
                            ]}
                            resetOnSuccess
                            onError={(errors) => {
                                if (errors.password) {
                                    passwordInput.current?.focus();
                                }

                                if (errors.current_password) {
                                    currentPasswordInput.current?.focus();
                                }
                            }}
                            className="space-y-5"
                        >
                            {({ errors, processing, recentlySuccessful }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="current_password"
                                            className="text-sm text-slate-200"
                                        >
                                            Current Password
                                        </Label>

                                        <Input
                                            id="current_password"
                                            ref={currentPasswordInput}
                                            name="current_password"
                                            type="password"
                                            className="h-11 border-white/15 bg-[#0d1624] text-slate-100 placeholder:text-slate-500"
                                            autoComplete="current-password"
                                            placeholder="Current password"
                                        />

                                        <InputError
                                            className="text-sm text-red-300"
                                            message={errors.current_password}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-sm text-slate-200"
                                        >
                                            New Password
                                        </Label>

                                        <Input
                                            id="password"
                                            ref={passwordInput}
                                            name="password"
                                            type="password"
                                            className="h-11 border-white/15 bg-[#0d1624] text-slate-100 placeholder:text-slate-500"
                                            autoComplete="new-password"
                                            placeholder="New password"
                                        />

                                        <InputError
                                            className="text-sm text-red-300"
                                            message={errors.password}
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-sm text-slate-200"
                                        >
                                            Confirm Password
                                        </Label>

                                        <Input
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            type="password"
                                            className="h-11 border-white/15 bg-[#0d1624] text-slate-100 placeholder:text-slate-500"
                                            autoComplete="new-password"
                                            placeholder="Confirm password"
                                        />

                                        <InputError
                                            className="text-sm text-red-300"
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="update-password-button"
                                            className="cursor-pointer rounded-full bg-[#00bd7d] px-6 py-2.5 text-sm font-semibold text-[#04120d] shadow-[0_0_20px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a] disabled:cursor-not-allowed disabled:bg-[#0d5a43] disabled:text-[#7fdabc] disabled:shadow-none"
                                        >
                                            Save Password
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
                </SettingsLayout>
            </StoreLayout>
        </>
    );
}
