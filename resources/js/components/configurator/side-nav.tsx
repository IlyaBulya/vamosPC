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
import { useState } from 'react';
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

type NavGroupData = {
    title: string;
    items: NavItem[];
};

function NavGroup({
    title,
    items,
    isOpen,
    onToggle,
    activeSectionId,
}: {
    title: string;
    items: NavItem[];
    isOpen: boolean;
    onToggle: () => void;
    activeSectionId: string | null;
}) {
    const scrollToSection = (sectionId: string) => {
        document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div>
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-2 rounded-lg py-1 text-left text-xs font-bold tracking-[0.16em] text-white uppercase transition hover:text-[#9cf5d8]"
            >
                <span
                    aria-hidden
                    className={cn(
                        'inline-block size-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-[#00bd7d] transition-transform duration-200',
                        !isOpen && '-rotate-90',
                    )}
                />
                {title}
            </button>

            {isOpen && (
                <ul className="mt-2 ml-[5px] space-y-0.5 border-l border-dashed border-white/15 pl-4">
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
                                    onClick={() =>
                                        scrollToSection(item.sectionId)
                                    }
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
            )}
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

    const groups: NavGroupData[] = [
        { title: 'Components', items: componentItems },
        { title: 'Programs', items: softwareItems },
        ...(accessoryItems.length > 0
            ? [{ title: 'Accessories', items: accessoryItems }]
            : []),
    ];

    const activeGroupTitle =
        groups.find((group) =>
            group.items.some((item) => item.sectionId === activeSectionId),
        )?.title ??
        groups[0]?.title ??
        null;

    // A click overrides the scroll-driven group until the user scrolls
    // to another section; then the override expires and scrollspy takes
    // over again.
    const [manualToggle, setManualToggle] = useState<{
        group: string;
        whileSection: string | null;
    } | null>(null);

    const openGroupTitle =
        manualToggle && manualToggle.whileSection === activeSectionId
            ? manualToggle.group
            : activeGroupTitle;

    const toggleGroup = (title: string) => {
        if (openGroupTitle === title) {
            // The group you are currently scrolled into cannot be closed.
            if (title === activeGroupTitle) {
                return;
            }

            // Closing a manually opened group hands control back to
            // scrollspy, so the active group re-opens.
            setManualToggle(null);
            return;
        }

        setManualToggle({
            group: title,
            whileSection: activeSectionId,
        });
    };

    return (
        <div className="sticky top-20 space-y-3">
            {groups.map((group) => (
                <NavGroup
                    key={group.title}
                    title={group.title}
                    items={group.items}
                    isOpen={group.title === openGroupTitle}
                    onToggle={() => toggleGroup(group.title)}
                    activeSectionId={activeSectionId}
                />
            ))}
        </div>
    );
}
