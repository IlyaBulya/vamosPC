import { Form, Head } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { store } from '@/routes/password/confirm';

export default function ConfirmPassword() {
    return (
        <>
            <Head title="Confirm password" />

            <AuthLayout
                title="Confirm Password"
                description="This is a protected section. Confirm your password to continue."
                eyebrow="Secure Area"
                icon={<ShieldAlert className="h-5 w-5 text-[#00bd7d]" />}
            >
                <Form
                    {...store.form()}
                    resetOnSuccess={['password']}
                    className="flex flex-col gap-5"
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
            </AuthLayout>
        </>
    );
}
