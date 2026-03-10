import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import AuthLayout from '@/layouts/auth-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { store } from '@/routes/two-factor/login';

export default function TwoFactorChallenge() {
    const [showRecoveryInput, setShowRecoveryInput] = useState<boolean>(false);
    const [code, setCode] = useState<string>('');

    const authConfigContent = useMemo<{
        title: string;
        description: string;
        toggleText: string;
    }>(() => {
        if (showRecoveryInput) {
            return {
                title: 'Recovery Code',
                description:
                    'Please confirm access to your account by entering one of your emergency recovery codes.',
                toggleText: 'login using an authentication code',
            };
        }

        return {
            title: 'Authentication Code',
            description:
                'Enter the authentication code provided by your authenticator application.',
            toggleText: 'login using a recovery code',
        };
    }, [showRecoveryInput]);

    const toggleRecoveryMode = (clearErrors: () => void): void => {
        setShowRecoveryInput(!showRecoveryInput);
        clearErrors();
        setCode('');
    };

    return (
        <>
            <Head title="Two-Factor Authentication" />

            <AuthLayout
                title={authConfigContent.title}
                description={authConfigContent.description}
                eyebrow="Account Security"
                icon={
                    showRecoveryInput ? (
                        <KeyRound className="h-5 w-5 text-[#00bd7d]" />
                    ) : (
                        <ShieldCheck className="h-5 w-5 text-[#00bd7d]" />
                    )
                }
            >
                <Form
                    {...store.form()}
                    className="flex flex-col gap-5"
                    resetOnError
                    resetOnSuccess={!showRecoveryInput}
                >
                    {({ errors, processing, clearErrors }) => (
                        <>
                            {showRecoveryInput ? (
                                <div className="grid gap-2">
                                    <Label
                                        htmlFor="recovery_code"
                                        className="text-slate-200"
                                    >
                                        Recovery code
                                    </Label>
                                    <Input
                                        id="recovery_code"
                                        name="recovery_code"
                                        type="text"
                                        placeholder="Enter recovery code"
                                        autoFocus={showRecoveryInput}
                                        required
                                        className="border-white/15 bg-[#0a1321] text-slate-100 placeholder:text-slate-500"
                                    />
                                    <InputError
                                        message={errors.recovery_code}
                                    />
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center space-y-3 text-center">
                                    <Label className="text-slate-300">
                                        Authentication code
                                    </Label>
                                    <div className="flex w-full items-center justify-center">
                                        <InputOTP
                                            name="code"
                                            maxLength={OTP_MAX_LENGTH}
                                            value={code}
                                            onChange={(value) => setCode(value)}
                                            disabled={processing}
                                            pattern={REGEXP_ONLY_DIGITS}
                                            containerClassName="justify-center"
                                        >
                                            <InputOTPGroup className="gap-2">
                                                {Array.from(
                                                    { length: OTP_MAX_LENGTH },
                                                    (_, index) => (
                                                        <InputOTPSlot
                                                            key={index}
                                                            index={index}
                                                            className="h-11 w-11 rounded-md border border-white/20 bg-[#0a1321] text-base text-slate-100 first:rounded-md first:border-l"
                                                        />
                                                    ),
                                                )}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>
                                    <InputError message={errors.code} />
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full rounded-xl bg-[#00bd7d] text-[#04120d] shadow-[0_0_24px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                                disabled={processing}
                            >
                                Continue
                            </Button>

                            <div className="text-center text-sm text-slate-400">
                                <span>or you can </span>
                                <button
                                    type="button"
                                    className="cursor-pointer font-medium text-[#9cf5d8] underline decoration-[#00bd7d]/60 underline-offset-4 transition hover:text-[#00bd7d]"
                                    onClick={() =>
                                        toggleRecoveryMode(clearErrors)
                                    }
                                >
                                    {authConfigContent.toggleText}
                                </button>
                            </div>
                        </>
                    )}
                </Form>
            </AuthLayout>
        </>
    );
}
