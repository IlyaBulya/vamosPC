import { Check, Plus } from 'lucide-react';
import { formatDelta, formatPrice } from '@/lib/configurator';
import {
    accessoryCategoryLabel,
    accessoryImage,
} from '@/lib/configurator-accessories';
import type { AccessoryCategory } from '@/lib/configurator-accessories';

export default function AccessorySection({
    category,
    selectedIds,
    onToggle,
}: {
    category: AccessoryCategory;
    selectedIds: number[];
    onToggle: (productId: number) => void;
}) {
    const label = accessoryCategoryLabel(category.slug);
    const selectedCount = category.products.filter((product) =>
        selectedIds.includes(product.id),
    ).length;

    return (
        <section
            id={`accessory-${category.slug}`}
            className="scroll-mt-[8.25rem] rounded-2xl border border-white/10 bg-[#0b1321] p-4 md:scroll-mt-24"
            aria-label={label}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold tracking-[0.1em] text-white uppercase">
                    {label}
                </p>
                <p className="text-xs tracking-[0.12em] text-slate-500 uppercase">
                    {selectedCount > 0 ? `${selectedCount} added` : 'Optional'}
                </p>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {category.products.map((product) => {
                    const isSelected = selectedIds.includes(product.id);

                    return (
                        <button
                            key={product.id}
                            type="button"
                            role="checkbox"
                            aria-checked={isSelected}
                            onClick={() => onToggle(product.id)}
                            className={`group overflow-hidden rounded-xl border text-left transition ${
                                isSelected
                                    ? 'border-[#00bd7d]/70 bg-[#00bd7d]/10'
                                    : 'border-white/10 bg-[#0b1321] hover:border-white/25'
                            }`}
                        >
                            <div className="relative h-32 overflow-hidden border-b border-white/10 bg-[#090f18]">
                                <img
                                    src={accessoryImage(
                                        product.image,
                                        category.slug,
                                    )}
                                    alt={product.name}
                                    loading="lazy"
                                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                                />
                                {isSelected && (
                                    <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#00bd7d] shadow-[0_0_10px_rgba(0,189,125,0.7)]">
                                        <Check className="h-4 w-4 text-[#04120d]" />
                                    </span>
                                )}
                            </div>

                            <div className="p-3">
                                <p
                                    className={`text-sm font-semibold ${
                                        isSelected
                                            ? 'text-white'
                                            : 'text-slate-200'
                                    }`}
                                >
                                    {product.name}
                                </p>
                                {product.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                                        {product.description}
                                    </p>
                                )}

                                <div className="mt-2.5 flex items-center justify-between gap-2">
                                    <span
                                        className={`text-sm font-semibold ${
                                            isSelected
                                                ? 'text-[#9cf5d8]'
                                                : 'text-slate-200'
                                        }`}
                                    >
                                        {isSelected
                                            ? formatPrice(
                                                  product.price_in_cents,
                                              )
                                            : formatDelta(
                                                  product.price_in_cents,
                                              )}
                                    </span>
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                                            isSelected
                                                ? 'border-[#00bd7d]/60 bg-[#00bd7d]/15 text-[#9cf5d8]'
                                                : 'border-white/20 text-slate-300 group-hover:border-[#00bd7d]/50 group-hover:text-[#9cf5d8]'
                                        }`}
                                    >
                                        {isSelected ? (
                                            <>
                                                <Check className="h-3 w-3" />
                                                Added
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-3 w-3" />
                                                Add
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
