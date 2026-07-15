import OptionRow from '@/components/configurator/option-row';
import type {ComponentSlot, OptionAnnotation} from '@/lib/configurator';
import { componentImage } from '@/lib/configurator-images';
import { COMPONENT_TYPE_LABELS } from '@/lib/spec-schema';

export default function SlotSection({
    slot,
    selectedId,
    annotations,
    onSelect,
}: {
    slot: ComponentSlot;
    selectedId: number;
    annotations: OptionAnnotation[] | undefined;
    onSelect: (slotKey: string, productId: number) => void;
}) {
    const selected = slot.products.find((product) => product.id === selectedId);
    const selectedPrice = selected?.price_in_cents ?? 0;
    const title = slot.component_type
        ? COMPONENT_TYPE_LABELS[slot.component_type]
        : slot.slot_label;
    const imageSrc = componentImage(selected?.image, slot.component_type);

    return (
        <section
            id={`slot-${slot.slot_key}`}
            className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#0b1321] p-4"
            role="radiogroup"
            aria-label={title}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold tracking-[0.1em] text-white uppercase">
                    {title}
                </p>
                <p className="text-xs tracking-[0.12em] text-slate-500 uppercase">
                    {slot.slot_label}
                </p>
            </div>

            <div className="relative mt-3 h-44 overflow-hidden rounded-xl border border-white/10 bg-[#090f18] sm:h-52">
                <img
                    src={imageSrc}
                    alt={selected?.name ?? title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05080f]/95 via-[#05080f]/45 to-transparent px-4 pt-10 pb-3">
                    <p className="text-xs font-semibold tracking-[0.14em] text-[#9cf5d8] uppercase">
                        Selected
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-white">
                        {selected?.name ?? '—'}
                    </p>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                {slot.products.map((product) => {
                    const annotation =
                        annotations?.find(
                            (item) => item.product_id === product.id,
                        ) ?? null;

                    return (
                        <OptionRow
                            key={product.id}
                            product={product}
                            isSelected={product.id === selectedId}
                            deltaInCents={
                                product.price_in_cents - selectedPrice
                            }
                            incompatibleMessages={annotation?.messages ?? null}
                            onSelect={() => onSelect(slot.slot_key, product.id)}
                        />
                    );
                })}
            </div>
        </section>
    );
}
