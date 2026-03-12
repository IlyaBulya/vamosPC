import { Form } from '@inertiajs/react';
import { useRef } from 'react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import InputError from '@/components/input-error';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DeleteUser() {
    const passwordInput = useRef<HTMLInputElement>(null);

    return (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 sm:p-7">
            <p className="text-xs tracking-[0.16em] text-red-300 uppercase">
                Danger Zone
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
                Delete Account
            </h2>
            <p className="mt-2 text-sm text-red-100/90">
                Permanently remove your account and all associated resources.
                This action cannot be undone.
            </p>

            <div className="mt-5 rounded-2xl border border-red-400/35 bg-[#2a0d17]/70 p-4 text-sm text-red-100">
                Make sure you have exported any important data before
                continuing.
            </div>

            <Dialog>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        data-test="delete-user-button"
                        className="mt-5 inline-flex cursor-pointer items-center rounded-full border border-red-400/65 bg-red-500/20 px-5 py-2.5 text-sm font-semibold text-red-200 transition hover:bg-red-500/30"
                    >
                        Delete account
                    </button>
                </DialogTrigger>
                <DialogContent className="border border-red-400/35 bg-[#120810] text-slate-100 sm:max-w-md">
                    <DialogTitle className="text-xl font-bold text-white">
                        Delete your account?
                    </DialogTitle>
                    <DialogDescription className="text-slate-300">
                        This will permanently remove your account and related
                        records. Enter your password to confirm.
                    </DialogDescription>

                    <Form
                        {...ProfileController.destroy.form()}
                        options={{
                            preserveScroll: true,
                        }}
                        onError={() => passwordInput.current?.focus()}
                        resetOnSuccess
                        className="space-y-5"
                    >
                        {({ resetAndClearErrors, processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="password"
                                        className="text-sm text-slate-200"
                                    >
                                        Password
                                    </Label>

                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        ref={passwordInput}
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="h-11 border-white/15 bg-[#0d1624] text-slate-100 placeholder:text-slate-500"
                                    />

                                    <InputError
                                        className="text-sm text-red-300"
                                        message={errors.password}
                                    />
                                </div>

                                <DialogFooter className="gap-2">
                                    <DialogClose asChild>
                                        <button
                                            type="button"
                                            className="cursor-pointer rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-white/40 hover:text-white"
                                            onClick={() =>
                                                resetAndClearErrors()
                                            }
                                        >
                                            Cancel
                                        </button>
                                    </DialogClose>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        data-test="confirm-delete-user-button"
                                        className="cursor-pointer rounded-full border border-red-400/65 bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/35 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Delete account
                                    </button>
                                </DialogFooter>
                            </>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
