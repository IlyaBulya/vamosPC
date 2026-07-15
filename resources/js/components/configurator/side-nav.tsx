import {
    CircuitBoard,
    Cpu,
    Fan,
    HardDrive,
    MemoryStick,
    Microchip,
    PcCase,
    Snowflake,
    Thermometer,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentSlot } from '@/lib/configurator';
import { COMPONENT_TYPE_LABELS } from '@/lib/spec-schema';
import type { ComponentType } from '@/lib/spec-schema';
import { cn } from '@/lib/utils';

const SLOT_ICONS: Record<ComponentType, LucideIcon> = {
    gpu: Microchip,
    cpu: Cpu,
    motherboard: CircuitBoard,
    cooler: Snowflake,
    ram: MemoryStick,
    storage: HardDrive,
    psu: Zap,
    case: PcCase,
    case_fan: Fan,
    thermal_paste: Thermometer,
};

export default function SideNav({
    slots,
    activeSlotKey,
}: {
    slots: ComponentSlot[];
    activeSlotKey: string | null;
}) {
    const scrollToSlot = (slotKey: string) => {
        document
            .getElementById(`slot-${slotKey}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="sticky top-6">
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-white uppercase">
                <span
                    aria-hidden
                    className="inline-block size-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-[#00bd7d]"
                />
                Components
            </p>

            <ul className="mt-3 ml-[5px] space-y-0.5 border-l border-dashed border-white/15 pl-4">
                {slots.map((slot) => {
                    const isActive = slot.slot_key === activeSlotKey;
                    const Icon = slot.component_type
                        ? SLOT_ICONS[slot.component_type]
                        : CircuitBoard;
                    const label = slot.component_type
                        ? COMPONENT_TYPE_LABELS[slot.component_type]
                        : slot.slot_label;

                    return (
                        <li key={slot.slot_key} className="relative">
                            <span
                                aria-hidden
                                className={cn(
                                    'absolute top-1/2 -left-[21.5px] size-2 -translate-y-1/2 rounded-full border transition',
                                    isActive
                                        ? 'border-[#00bd7d] bg-[#00bd7d] shadow-[0_0_8px_rgba(0,189,125,0.8)]'
                                        : 'border-white/25 bg-[#08101c]',
                                )}
                            />
                            <button
                                type="button"
                                onClick={() => scrollToSlot(slot.slot_key)}
                                aria-current={isActive ? 'true' : undefined}
                                className={cn(
                                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-sm transition',
                                    isActive
                                        ? 'bg-[#00bd7d]/10 font-semibold text-[#9cf5d8]'
                                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-[#9cf5d8]',
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'size-4 shrink-0 transition',
                                        isActive
                                            ? 'text-[#00bd7d]'
                                            : 'text-slate-500',
                                    )}
                                />
                                {label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
