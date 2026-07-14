import {
    AlertTriangle,
    Check,
    Cpu,
    Loader2,
    Monitor,
    RotateCcw,
    Save,
    ShoppingCart,
    XCircle,
} from 'lucide-react';
import {
    formatPrice,
    type CheckResult,
    type ConfiguratorConfiguration,
    type SlotProduct,
} from '@/lib/configurator';

type SelectedEntry = SlotProduct & {
    slot_key: string;
    slot_label: string;
};

export default function SummaryCard({
    configuration,
    selectedProducts,
    check,
    isChecking,
    serverErrors,
    isBuying,
    isSavingDraft,
    draftSaved,
    onBuy,
    onSaveDraft,
    onReset,
}: {
    configuration: ConfiguratorConfiguration;
    selectedProducts: SelectedEntry[];
    check: CheckResult | null;
    isChecking: boolean;
    serverErrors: string[];
    isBuying: boolean;
    isSavingDraft: boolean;
    draftSaved: boolean;
    onBuy: () => void;
    onSaveDraft: () => void;
    onReset: () => void;
}) {
    const selectedTotalInCents = selectedProducts.reduce(
        (sum, product) => sum + product.price_in_cents,
        0,
    );
    const previewPriceInCents = Math.max(
        0,
        selectedTotalInCents + configuration.markup_in_cents,
    );
    const hasErrors = check?.has_errors ?? false;

    return (
        <aside className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-4 sm:p-5 lg:sticky lg:top-6 lg:h-fit">
            <div className="mb-4 flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                    Live Preview
                </p>
                {isChecking && (
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                )}
            </div>

            <article className="mx-auto max-w-[390px] rounded-[28px] border border-white/15 bg-gradient-to-b from-[#131a26] via-[#0c111a] to-[#070b12] p-4 shadow-[0_18px_35px_rgba(0,0,0,0.45)]">
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1622]">
                    <div className="aspect-[4/3]">
                        {configuration.image ? (
                            <img
                                src={configuration.image}
                                alt={configuration.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_18%,rgba(0,189,125,0.25),transparent_42%)]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(0,189,125,0.14),transparent_48%)]" />
                                <Monitor className="relative h-16 w-16 text-slate-500" />
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="mt-4 text-center text-3xl font-black uppercase tracking-[0.02em] text-white">
                    {configuration.name}
                </h2>

                <div className="mt-4 text-center">
                    <p className="text-4xl font-black text-white">
                        {formatPrice(previewPriceInCents)}
                    </p>
                </div>

                {(check?.violations.length ?? 0) > 0 && (
                    <div className="mt-3 space-y-1.5">
                        {check!.violations.map((violation, index) => (
                            <div
                                key={index}
                                className={`flex items-start gap-2 rounded-xl border p-2.5 text-xs ${
                                    violation.severity === 'error'
                                        ? 'border-red-500/40 bg-red-500/10 text-red-200'
                                        : 'border-amber-400/40 bg-amber-400/10 text-amber-200'
                                }`}
                            >
                                {violation.severity === 'error' ? (
                                    <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                ) : (
                                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                )}
                                <span>{violation.message}</span>
                            </div>
                        ))}
                    </div>
                )}

                {serverErrors.length > 0 && (
                    <div className="mt-3 space-y-1 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
                        {serverErrors.map((message, index) => (
                            <p key={index}>{message}</p>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={onBuy}
                    disabled={
                        selectedProducts.length === 0 || isBuying || hasErrors
                    }
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#00bd7d] px-4 py-3 text-sm font-bold text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <ShoppingCart className="h-4 w-4" />
                    {isBuying
                        ? 'Adding to Cart...'
                        : hasErrors
                          ? 'Resolve Issues to Buy'
                          : 'Buy This Build'}
                </button>

                <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={onSaveDraft}
                        disabled={isSavingDraft || selectedProducts.length === 0}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {draftSaved ? (
                            <Check className="h-3.5 w-3.5 text-[#9cf5d8]" />
                        ) : (
                            <Save className="h-3.5 w-3.5" />
                        )}
                        {draftSaved
                            ? 'Saved'
                            : isSavingDraft
                              ? 'Saving...'
                              : 'Save Draft'}
                    </button>
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Reset
                    </button>
                </div>

                <div className="mt-4 space-y-2">
                    {selectedProducts.map((product) => (
                        <div
                            key={product.slot_key}
                            className="rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2"
                        >
                            <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                                {product.slot_label}
                            </p>
                            <p className="mt-1 text-sm text-slate-200">
                                {product.name}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                    <Cpu className="h-3.5 w-3.5" />
                    {selectedProducts.length} selected components
                </div>
            </article>
        </aside>
    );
}
