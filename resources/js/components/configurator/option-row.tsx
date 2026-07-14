import { AlertTriangle } from 'lucide-react';
import { formatDelta, specChips, type SlotProduct } from '@/lib/configurator';

export default function OptionRow({
    product,
    isSelected,
    deltaInCents,
    incompatibleMessages,
    onSelect,
}: {
    product: SlotProduct;
    isSelected: boolean;
    deltaInCents: number;
    incompatibleMessages: string[] | null;
    onSelect: () => void;
}) {
    const chips = specChips(product);
    const isIncompatible = !isSelected && incompatibleMessages !== null;

    return (
        <button
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={onSelect}
            className={`block w-full rounded-xl border px-3 py-2.5 text-left transition ${
                isSelected
                    ? 'border-[#00bd7d]/70 bg-[#00bd7d]/10'
                    : isIncompatible
                      ? 'border-red-500/25 bg-[#0b1321] opacity-70 hover:opacity-100'
                      : 'border-white/10 bg-[#0b1321] hover:border-white/25'
            }`}
        >
            <div className="flex items-center gap-3">
                <span
                    aria-hidden
                    className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                        isSelected
                            ? 'border-[#00bd7d] bg-[#00bd7d] shadow-[0_0_8px_rgba(0,189,125,0.6)]'
                            : 'border-slate-500'
                    }`}
                />

                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span
                            className={`text-sm font-semibold ${
                                isSelected ? 'text-white' : 'text-slate-200'
                            }`}
                        >
                            {product.name}
                        </span>
                        {chips.map((chip) => (
                            <span
                                key={chip}
                                className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[11px] text-slate-400"
                            >
                                {chip}
                            </span>
                        ))}
                    </span>
                </span>

                <span
                    className={`shrink-0 text-sm font-semibold ${
                        isSelected
                            ? 'text-[#9cf5d8]'
                            : deltaInCents > 0
                              ? 'text-slate-200'
                              : 'text-[#9cf5d8]'
                    }`}
                >
                    {isSelected ? 'Selected' : formatDelta(deltaInCents)}
                </span>
            </div>

            {isIncompatible && (
                <span className="mt-2 flex items-start gap-1.5 pl-7 text-xs text-red-300">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span>{incompatibleMessages[0]}</span>
                </span>
            )}
        </button>
    );
}
