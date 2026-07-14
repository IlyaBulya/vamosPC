import { AlertTriangle, X } from 'lucide-react';
import { type ResolveResult } from '@/lib/configurator';

/**
 * "Compatibility issues detected" dialog shown before an incompatible
 * pick is applied: lists the clashing parts and the proposed automatic
 * replacements. Confirm applies the pick plus the replacements.
 */
export default function ConflictModal({
    productName,
    result,
    onConfirm,
    onCancel,
}: {
    productName: string;
    result: ResolveResult;
    onConfirm: () => void;
    onCancel: () => void;
}) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Compatibility issues detected"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111821] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.6)] sm:p-8"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <h2 className="text-xl font-bold text-white">
                        Compatibility issues detected
                    </h2>
                    <button
                        type="button"
                        onClick={onCancel}
                        aria-label="Close"
                        className="rounded-full p-1 text-slate-400 transition hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <p className="mt-5 text-sm font-semibold text-slate-200">
                    These components are incompatible:
                </p>

                <div className="mt-3 flex gap-3">
                    <div className="flex flex-col items-center pt-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="w-0.5 flex-1 bg-red-500/70" />
                        <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                    </div>
                    <div className="flex flex-col justify-between gap-3">
                        <p className="text-base font-semibold text-white">
                            {productName}
                        </p>
                        {result.conflicts.map((conflict) => (
                            <p
                                key={conflict.slot_key}
                                className="text-base font-semibold text-white"
                            >
                                {conflict.product_name}
                            </p>
                        ))}
                    </div>
                </div>

                {result.replacements.length > 0 ? (
                    <>
                        <p className="mt-6 text-sm font-semibold text-slate-200">
                            Will be automatically replaced with:
                        </p>
                        <div className="mt-2 space-y-1">
                            {result.replacements.map((replacement) => (
                                <p
                                    key={replacement.slot_key}
                                    className="text-base text-slate-100"
                                >
                                    – {replacement.to_name}
                                </p>
                            ))}
                        </div>
                    </>
                ) : (
                    <p className="mt-6 flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        No compatible replacement is available. You can still
                        apply this part, but the build cannot be purchased
                        until the conflict is fixed.
                    </p>
                )}

                <div className="mt-7 flex items-center gap-4">
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex-1 rounded-full bg-[#00bd7d] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.45)] transition hover:bg-[#18d99a]"
                    >
                        Confirm
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-slate-200 transition hover:text-white"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
