import {
    AppWindow,
    CircuitBoard,
    Cpu,
    Fan,
    FileText,
    Gamepad2,
    HardDrive,
    Headphones,
    Keyboard,
    MemoryStick,
    Mic,
    Microchip,
    Monitor,
    Mouse,
    PcCase,
    ShieldCheck,
    Snowflake,
    SquareDashedMousePointer,
    Thermometer,
    Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ComponentSlot } from '@/lib/configurator';
import { accessoryCategoryLabel } from '@/lib/configurator-accessories';
import type { AccessoryCategory } from '@/lib/configurator-accessories';
import { SOFTWARE_GROUPS } from '@/lib/configurator-software';
import type { SoftwareGroupKey } from '@/lib/configurator-software';
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

const SOFTWARE_ICONS: Record<SoftwareGroupKey, LucideIcon> = {
    os: AppWindow,
    office: FileText,
    antivirus: ShieldCheck,
};

const ACCESSORY_ICONS: Record<string, LucideIcon> = {
    monitor: Monitor,
    keyboard: Keyboard,
    mouse: Mouse,
    headset: Headphones,
    'mouse-pad': SquareDashedMousePointer,
    microphone: Mic,
};

type NavItem = {
    sectionId: string;
    label: string;
    icon: LucideIcon;
};

function NavGroup({
    title,
    items,
    activeSectionId,
}: {
    title: string;
    items: NavItem[];
    activeSectionId: string | null;
}) {
    const scrollToSection = (sectionId: string) => {
        document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div>
            <p className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-white uppercase">
                <span
                    aria-hidden
                    className="inline-block size-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-[#00bd7d]"
                />
                {title}
            </p>

            <ul className="mt-3 ml-[5px] space-y-0.5 border-l border-dashed border-white/15 pl-4">
                {items.map((item) => {
                    const isActive = item.sectionId === activeSectionId;
                    const Icon = item.icon;

                    return (
                        <li key={item.sectionId} className="relative">
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
                                onClick={() => scrollToSection(item.sectionId)}
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
                                {item.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function SideNav({
    slots,
    accessories,
    activeSectionId,
}: {
    slots: ComponentSlot[];
    accessories: AccessoryCategory[];
    activeSectionId: string | null;
}) {
    const componentItems: NavItem[] = slots.map((slot) => ({
        sectionId: `slot-${slot.slot_key}`,
        label: slot.component_type
            ? COMPONENT_TYPE_LABELS[slot.component_type]
            : slot.slot_label,
        icon: slot.component_type
            ? SLOT_ICONS[slot.component_type]
            : CircuitBoard,
    }));

    const softwareItems: NavItem[] = SOFTWARE_GROUPS.map((group) => ({
        sectionId: `software-${group.key}`,
        label: group.label,
        icon: SOFTWARE_ICONS[group.key],
    }));

    const accessoryItems: NavItem[] = accessories.map((category) => ({
        sectionId: `accessory-${category.slug}`,
        label: accessoryCategoryLabel(category.slug),
        icon: ACCESSORY_ICONS[category.slug] ?? Gamepad2,
    }));

    return (
        <div className="sticky top-6 space-y-5">
            <NavGroup
                title="Components"
                items={componentItems}
                activeSectionId={activeSectionId}
            />
            <NavGroup
                title="Programs"
                items={softwareItems}
                activeSectionId={activeSectionId}
            />
            {accessoryItems.length > 0 && (
                <NavGroup
                    title="Accessories"
                    items={accessoryItems}
                    activeSectionId={activeSectionId}
                />
            )}
        </div>
    );
}
