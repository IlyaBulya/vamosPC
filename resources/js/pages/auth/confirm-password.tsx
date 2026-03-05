import { Form, Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4 py-10 text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#08101c]/90 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:p-8">
                    <div className="inline-flex rounded-xl border border-[#00bd7d]/35 bg-[#00bd7d]/10 p-2">
                        <ShieldAlert className="h-5 w-5 text-[#00bd7d]" />
                    </div>

                    <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                        Secure Area
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-white">
                        Confirm Password
                    </h1>
                    <p className="mt-2 text-sm text-slate-300">
                        This is a protected section. Confirm your password to continue.
                    </p>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="mt-6 flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-slate-200">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Password"
                                        autoComplete="current-password"
                                        autoFocus
                                        className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <Button
                                    className="w-full rounded-xl bg-[#00bd7d] text-[#04120d] shadow-[0_0_24px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                                    disabled={processing}
                                    data-test="confirm-password-button"
                                >
                                    {processing && <Spinner />}
                                    Confirm password
                                </Button>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}
