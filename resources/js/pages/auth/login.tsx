import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    return (
        <>
            <Head title="Log in" />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-4 py-10 text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-[#00bd7d]/20 blur-3xl" />

                <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#08101c]/90 p-7 shadow-[0_24px_70px_rgba(0,0,0,0.5)] sm:p-8">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                        Welcome Back
                    </p>
                    <h1 className="mt-2 text-3xl font-black text-white">Log in</h1>
                    <p className="mt-2 text-sm text-slate-300">
                        Enter your email and password to continue.
                    </p>

                    {status && (
                        <div className="mt-4 rounded-xl border border-[#00bd7d]/45 bg-[#00bd7d]/10 px-3 py-2 text-sm text-[#9cf5d8]">
                            {status}
                        </div>
                    )}

                    <a
                        href="/auth/google/redirect"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:border-[#00bd7d]/50 hover:bg-[#00bd7d]/10"
                    >
                        <span className="text-base font-bold text-[#00bd7d]">G</span>
                        Continue with Google
                    </a>

                    <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-slate-500">
                        <span className="h-px flex-1 bg-white/10" />
                        or
                        <span className="h-px flex-1 bg-white/10" />
                    </div>

                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-5"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-slate-200">
                                        Email address
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        placeholder="email@example.com"
                                        className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="grid gap-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password" className="text-slate-200">
                                            Password
                                        </Label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                className="ml-auto text-xs font-medium text-[#9cf5d8] transition hover:text-[#00bd7d]"
                                                tabIndex={5}
                                            >
                                                Forgot password?
                                            </Link>
                                        )}
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder="Password"
                                        className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                    />
                                    <Label htmlFor="remember" className="text-slate-300">
                                        Remember me
                                    </Label>
                                </div>

                                <Button
                                    type="submit"
                                    className="mt-2 w-full rounded-xl bg-[#00bd7d] text-[#04120d] shadow-[0_0_24px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                                    tabIndex={4}
                                    disabled={processing}
                                    data-test="login-button"
                                >
                                    {processing && <Spinner />}
                                    Log in
                                </Button>
                            </>
                        )}
                    </Form>

                    {canRegister && (
                        <div className="mt-6 text-center text-sm text-slate-400">
                            Don't have an account?{' '}
                            <Link
                                href={register()}
                                tabIndex={5}
                                className="font-medium text-[#9cf5d8] transition hover:text-[#00bd7d]"
                            >
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
