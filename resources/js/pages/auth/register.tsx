import { Form, Head, Link } from '@inertiajs/react';
import GoogleAuthButton from '@/components/auth/google-auth-button';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <>
            <Head title="Register" />

            <AuthLayout
                title="Sign up"
                description="Set up your account and start building your next PC."
                eyebrow="Create Account"
            >
                <GoogleAuthButton />

                <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <span className="h-px flex-1 bg-white/10" />
                    or
                    <span className="h-px flex-1 bg-white/10" />
                </div>

                <Form
                    {...store.form()}
                    resetOnSuccess={['password', 'password_confirmation']}
                    disableWhileProcessing
                    className="flex flex-col gap-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-slate-200">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                    className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-slate-200">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-slate-200">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-slate-200"
                                >
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full rounded-xl bg-[#00bd7d] text-[#04120d] shadow-[0_0_24px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </>
                    )}
                </Form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    Already have an account?{' '}
                    <Link
                        href={login()}
                        tabIndex={6}
                        className="font-medium text-[#9cf5d8] transition hover:text-[#00bd7d]"
                    >
                        Log in
                    </Link>
                </div>
            </AuthLayout>
        </>
    );
}
