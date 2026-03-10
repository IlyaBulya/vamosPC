import { Form, Head, Link } from '@inertiajs/react';
import GoogleAuthButton from '@/components/auth/google-auth-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
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

            <AuthLayout
                title="Log in"
                description="Enter your email and password to continue."
                eyebrow="Welcome Back"
            >
                {status && (
                    <div className="rounded-xl border border-[#00bd7d]/45 bg-[#00bd7d]/10 px-3 py-2 text-sm text-[#9cf5d8]">
                        {status}
                    </div>
                )}

                <GoogleAuthButton />

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
                                <Checkbox id="remember" name="remember" tabIndex={3} />
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
            </AuthLayout>
        </>
    );
}
