import { useEffect, useRef } from 'react';
import type { ComponentSlot } from '@/lib/configurator';
import { accessoryCategoryLabel } from '@/lib/configurator-accessories';
import type { AccessoryCategory } from '@/lib/configurator-accessories';
import type { SoftwareGroup } from '@/lib/configurator-software';
import { COMPONENT_TYPE_LABELS } from '@/lib/spec-schema';
import { cn } from '@/lib/utils';

type MobileSectionNavProps = {
    slots: ComponentSlot[];
    softwareGroups: SoftwareGroup[];
    accessories: AccessoryCategory[];
    activeSectionId: string | null;
};

type NavItem = {
    sectionId: string;
    label: string;
};

function prefersReducedMotion(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function MobileSectionNav({
    slots,
    softwareGroups,
    accessories,
    activeSectionId,
}: MobileSectionNavProps) {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    const items: NavItem[] = [
        ...slots.map((slot) => ({
            sectionId: `slot-${slot.slot_key}`,
            label: slot.component_type
                ? COMPONENT_TYPE_LABELS[slot.component_type]
                : slot.slot_label,
        })),
        ...softwareGroups.map((group) => ({
            sectionId: `software-${group.key}`,
            label: group.label,
        })),
        ...accessories.map((category) => ({
            sectionId: `accessory-${category.slug}`,
            label: accessoryCategoryLabel(category.slug),
        })),
    ];

    useEffect(() => {
        if (!activeSectionId) {
            return;
        }

        const scroller = scrollerRef.current;
        const button = buttonRefs.current[activeSectionId];

        if (!scroller || !button) {
            return;
        }

        const scrollerRect = scroller.getBoundingClientRect();
        const buttonRect = button.getBoundingClientRect();
        const centeredLeft =
            scroller.scrollLeft +
            buttonRect.left -
            scrollerRect.left -
            (scroller.clientWidth - buttonRect.width) / 2;
        const maxScrollLeft = scroller.scrollWidth - scroller.clientWidth;

        scroller.scrollTo({
            left: Math.max(0, Math.min(centeredLeft, maxScrollLeft)),
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
    }, [activeSectionId]);

    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);

        if (!section) {
            return;
        }

        section.scrollIntoView({
            behavior: prefersReducedMotion() ? 'auto' : 'smooth',
            block: 'start',
        });
    };

    return (
        <nav
            aria-label="Configurator sections"
            data-pull-refresh-ignore
            className="relative border-t border-white/10 bg-[#030712]/95 py-2 md:hidden"
        >
            <div
                ref={scrollerRef}
                className="relative flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-4 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {items.map((item) => {
                    const isActive = item.sectionId === activeSectionId;

                    return (
                        <button
                            key={item.sectionId}
                            ref={(button) => {
                                buttonRefs.current[item.sectionId] = button;
                            }}
                            type="button"
                            aria-controls={item.sectionId}
                            aria-current={isActive ? 'location' : undefined}
                            onClick={() => scrollToSection(item.sectionId)}
                            className={cn(
                                'inline-flex min-h-11 shrink-0 items-center rounded-full border px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-colors',
                                isActive
                                    ? 'border-[#00bd7d]/70 bg-[#00bd7d]/15 text-[#9cf5d8] shadow-[0_0_16px_rgba(0,189,125,0.16)]'
                                    : 'border-white/15 bg-[#08101c] text-slate-300 hover:border-[#00bd7d]/40 hover:text-[#9cf5d8]',
                            )}
                        >
                            {item.label}
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
