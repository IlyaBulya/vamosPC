import { Loader2, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/configurator';

type MobilePurchaseBarProps = {
    previewPriceInCents: number;
    isChecking: boolean;
    isBuying: boolean;
    hasErrors: boolean;
    isDisabled: boolean;
    errorMessage: string | null;
    onBuy: () => void;
};

export default function MobilePurchaseBar({
    previewPriceInCents,
    isChecking,
    isBuying,
    hasErrors,
    isDisabled,
    errorMessage,
    onBuy,
}: MobilePurchaseBarProps) {
    const isBuyDisabled = isDisabled || isChecking || isBuying || hasErrors;
    const buttonLabel = isBuying
        ? 'Adding to Cart...'
        : hasErrors
          ? 'Resolve Issues'
          : 'Buy Build';

    return (
        <aside
            data-pull-refresh-ignore
            aria-label="Purchase summary"
            className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050b16]/92 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-16px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden"
        >
            {errorMessage && (
                <p
                    role="alert"
                    className="mb-2 truncate rounded-lg border border-red-500/35 bg-red-500/10 px-2.5 py-1.5 text-xs text-red-200"
                    title={errorMessage}
                >
                    {errorMessage}
                </p>
            )}

            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                        <p className="text-[0.65rem] font-semibold tracking-[0.14em] text-slate-400 uppercase">
                            Total
                        </p>
                        {isChecking && (
                            <>
                                <Loader2
                                    aria-hidden="true"
                                    className="h-3 w-3 animate-spin text-[#9cf5d8]"
                                />
                                <span className="sr-only">
                                    Checking compatibility
                                </span>
                            </>
                        )}
                    </div>
                    <p
                        aria-live="polite"
                        className="truncate text-xl leading-tight font-black text-white tabular-nums"
                    >
                        {formatPrice(previewPriceInCents)}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onBuy}
                    disabled={isBuyDisabled}
                    aria-busy={isBuying}
                    className="inline-flex min-h-11 min-w-[9.5rem] shrink-0 items-center justify-center gap-2 rounded-full bg-[#00bd7d] px-4 py-2.5 text-sm font-bold text-[#04120d] shadow-[0_0_18px_rgba(0,189,125,0.38)] transition hover:bg-[#18d99a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isBuying ? (
                        <Loader2
                            aria-hidden="true"
                            className="h-4 w-4 animate-spin"
                        />
                    ) : (
                        <ShoppingCart aria-hidden="true" className="h-4 w-4" />
                    )}
                    {buttonLabel}
                </button>
            </div>
        </aside>
    );
}
