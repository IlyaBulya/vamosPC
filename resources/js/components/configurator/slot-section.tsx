import OptionRow from '@/components/configurator/option-row';
import {
    type ComponentSlot,
    type OptionAnnotation,
} from '@/lib/configurator';
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
    const selected = slot.products.find(
        (product) => product.id === selectedId,
    );
    const selectedPrice = selected?.price_in_cents ?? 0;
    const title = slot.component_type
        ? COMPONENT_TYPE_LABELS[slot.component_type]
        : slot.slot_label;

    return (
        <section
            id={`slot-${slot.slot_key}`}
            className="scroll-mt-24 rounded-2xl border border-white/10 bg-[#0b1321] p-4"
            role="radiogroup"
            aria-label={title}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-white">
                    {title}
                </p>
                <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {slot.slot_label}
                </p>
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
                            onSelect={() =>
                                onSelect(slot.slot_key, product.id)
                            }
                        />
                    );
                })}
            </div>
        </section>
    );
}
