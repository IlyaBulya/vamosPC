import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, ShieldBan, ShieldCheck, ShieldQuestion, Smartphone } from 'lucide-react';
import { useState } from 'react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import { disable, enable } from '@/routes/two-factor';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);

    return (
        <>
            <Head title="Two-Factor Authentication - VamosPC" />

            <div className="relative min-h-screen overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-12 top-20 h-72 w-72 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-48 h-80 w-80 rounded-full bg-[#00bd7d]/15 blur-3xl" />

                <StoreHeader />

                <main className="mx-auto w-full max-w-[1280px] px-4 py-10 sm:px-8 lg:px-12">
                    <section className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.45)] sm:p-8">
                        <Link
                            href="/account"
                            className="inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-[#9cf5d8]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Account
                        </Link>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <p className="text-xs uppercase tracking-[0.18em] text-[#9cf5d8]">
                                    Security
                                </p>
                                <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
                                    Two-Factor Authentication
                                </h1>
                                <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                                    Add an extra verification step to protect your
                                    account and keep your builds secure.
                                </p>
                            </div>

                            <div
                                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${
                                    twoFactorEnabled
                                        ? 'border-[#00bd7d]/50 bg-[#00bd7d]/12 text-[#9cf5d8]'
                                        : 'border-red-400/50 bg-red-500/10 text-red-300'
                                }`}
                            >
                                {twoFactorEnabled ? (
                                    <ShieldCheck className="h-4 w-4" />
                                ) : (
                                    <ShieldQuestion className="h-4 w-4" />
                                )}
                                {twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                            {twoFactorEnabled ? (
                                <div className="space-y-5">
                                    <p className="text-sm text-slate-300 sm:text-base">
                                        Your account is protected with a one-time
                                        code from your authenticator app on every
                                        sign in.
                                    </p>

                                    <TwoFactorRecoveryCodes
                                        recoveryCodesList={recoveryCodesList}
                                        fetchRecoveryCodes={fetchRecoveryCodes}
                                        errors={errors}
                                    />

                                    <Form {...disable.form()}>
                                        {({ processing }) => (
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="inline-flex items-center gap-2 rounded-full border border-red-500/70 bg-red-500/15 px-5 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/25 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                <ShieldBan className="h-4 w-4" />
                                                Disable 2FA
                                            </button>
                                        )}
                                    </Form>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <p className="text-sm text-slate-300 sm:text-base">
                                        Enable two-factor authentication to require
                                        a six-digit code from your authenticator
                                        app during login.
                                    </p>

                                    <div className="rounded-2xl border border-white/10 bg-[#0a1322] p-4">
                                        <ul className="space-y-2 text-sm text-slate-300">
                                            <li>
                                                1. Scan your personal QR code in an
                                                authenticator app.
                                            </li>
                                            <li>
                                                2. Confirm with a one-time code.
                                            </li>
                                            <li>
                                                3. Save your recovery codes in a
                                                safe place.
                                            </li>
                                        </ul>
                                    </div>

                                    {hasSetupData ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowSetupModal(true)}
                                            className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/65 bg-[#00bd7d]/15 px-5 py-2 text-sm font-semibold text-[#9cf5d8] transition hover:bg-[#00bd7d]/25"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            Continue Setup
                                        </button>
                                    ) : (
                                        <Form
                                            {...enable.form()}
                                            onSuccess={() => setShowSetupModal(true)}
                                        >
                                            {({ processing }) => (
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="inline-flex items-center gap-2 rounded-full bg-[#00bd7d] px-5 py-2 text-sm font-semibold text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a] disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    <ShieldCheck className="h-4 w-4" />
                                                    Enable 2FA
                                                </button>
                                            )}
                                        </Form>
                                    )}
                                </div>
                            )}
                        </article>

                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-6 sm:p-7">
                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-[#00bd7d]/40 bg-[#00bd7d]/10 p-2">
                                    <Smartphone className="h-5 w-5 text-[#00bd7d]" />
                                </div>
                                <h2 className="text-xl font-bold text-white">
                                    Security Tips
                                </h2>
                            </div>
                            <ul className="mt-4 space-y-3 text-sm text-slate-300">
                                <li>
                                    Use Google Authenticator, Authy, or 1Password
                                    as your TOTP app.
                                </li>
                                <li>
                                    Keep recovery codes outside your browser and
                                    cloud notes.
                                </li>
                                <li>
                                    If you change phone, reconfigure 2FA
                                    immediately.
                                </li>
                            </ul>
                        </article>
                    </section>

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </main>

                <StoreFooter className="mt-6" />
            </div>
        </>
    );
}
