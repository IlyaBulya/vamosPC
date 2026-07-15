import { Check } from 'lucide-react';
import { formatDelta, formatPrice } from '@/lib/configurator';
import type {
    SoftwareGroup,
    SoftwareGroupKey,
} from '@/lib/configurator-software';

export default function SoftwareSection({
    group,
    selectedOptionId,
    onToggle,
}: {
    group: SoftwareGroup;
    selectedOptionId: string | null;
    onToggle: (groupKey: SoftwareGroupKey, optionId: string) => void;
}) {
    const selected =
        group.options.find((option) => option.id === selectedOptionId) ?? null;

    return (
        <section
            id={`software-${group.key}`}
            className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#0b1321] p-4"
            aria-label={group.label}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold tracking-[0.1em] text-white uppercase">
                    {group.label}
                </p>
                <p className="text-xs tracking-[0.12em] text-slate-500 uppercase">
                    Optional
                </p>
            </div>

            <div className="relative mt-3 h-44 overflow-hidden rounded-xl border border-white/10 bg-[#090f18] sm:h-52">
                <img
                    src={group.image}
                    alt={selected?.name ?? group.label}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05080f]/95 via-[#05080f]/45 to-transparent px-4 pt-10 pb-3">
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#9cf5d8] uppercase">
                        {selected ? 'Selected' : 'Not installed'}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-white">
                        {selected?.name ?? group.note}
                    </p>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                {group.options.map((option) => {
                    const isSelected = option.id === selectedOptionId;

                    return (
                        <button
                            key={option.id}
                            type="button"
                            role="checkbox"
                            aria-checked={isSelected}
                            onClick={() => onToggle(group.key, option.id)}
                            className={`block w-full rounded-xl border px-3 py-2.5 text-left transition ${
                                isSelected
                                    ? 'border-[#00bd7d]/70 bg-[#00bd7d]/10'
                                    : 'border-white/10 bg-[#0b1321] hover:border-white/25'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    aria-hidden
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 ${
                                        isSelected
                                            ? 'border-[#00bd7d] bg-[#00bd7d] shadow-[0_0_8px_rgba(0,189,125,0.6)]'
                                            : 'border-slate-500'
                                    }`}
                                >
                                    {isSelected && (
                                        <Check className="h-3 w-3 text-[#04120d]" />
                                    )}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span
                                        className={`block text-sm font-semibold ${
                                            isSelected
                                                ? 'text-white'
                                                : 'text-slate-200'
                                        }`}
                                    >
                                        {option.name}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-slate-400">
                                        {option.description}
                                    </span>
                                </span>

                                <span
                                    className={`shrink-0 text-sm font-semibold ${
                                        isSelected
                                            ? 'text-[#9cf5d8]'
                                            : 'text-slate-200'
                                    }`}
                                >
                                    {isSelected
                                        ? formatPrice(option.price_in_cents)
                                        : formatDelta(option.price_in_cents)}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
