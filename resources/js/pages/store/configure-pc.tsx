import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AccessorySection from '@/components/configurator/accessory-section';
import ConflictModal from '@/components/configurator/conflict-modal';
import MobilePurchaseBar from '@/components/configurator/mobile-purchase-bar';
import MobileSectionNav from '@/components/configurator/mobile-section-nav';
import SideNav from '@/components/configurator/side-nav';
import SlotSection from '@/components/configurator/slot-section';
import SoftwareSection from '@/components/configurator/software-section';
import SummaryCard from '@/components/configurator/summary-card';
import { useCompatibility } from '@/hooks/use-compatibility';
import { useScrollspy } from '@/hooks/use-scrollspy';
import StoreLayout from '@/layouts/store-layout';
import { postJson } from '@/lib/configurator';
import type {
    ComponentSlot,
    ConfiguratorConfiguration,
    ResolveResult,
    SlotProduct,
} from '@/lib/configurator';
import { selectedAccessoryEntries } from '@/lib/configurator-accessories';
import type { AccessoryCategory } from '@/lib/configurator-accessories';
import {
    EMPTY_SOFTWARE_SELECTIONS,
    selectedSoftwareEntries,
} from '@/lib/configurator-software';
import type {
    SoftwareGroup,
    SoftwareGroupKey,
    SoftwareSelections,
} from '@/lib/configurator-software';

type SelectedEntry = SlotProduct & {
    slot_key: string;
    slot_label: string;
};

type PendingConflict = {
    slotKey: string;
    productId: number;
    productName: string;
    result: ResolveResult;
};

export default function ConfigurePcPage({
    configuration,
    slots,
    software_groups,
    accessories,
    initial_selections,
    initial_software_selections,
    initial_accessory_ids,
}: {
    configuration: ConfiguratorConfiguration;
    slots: ComponentSlot[];
    software_groups: SoftwareGroup[];
    accessories: AccessoryCategory[];
    initial_selections?: Record<string, number> | null;
    initial_software_selections?: Partial<SoftwareSelections> | null;
    initial_accessory_ids?: number[] | null;
}) {
    const defaultSelections = useMemo(
        () =>
            Object.fromEntries(
                slots.map((slot) => [slot.slot_key, slot.default_product_id]),
            ),
        [slots],
    );

    const [selectedBySlot, setSelectedBySlot] = useState<
        Record<string, number>
    >(() => ({
        ...defaultSelections,
        ...(initial_selections ?? {}),
    }));
    const [isBuying, setIsBuying] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [pendingConflict, setPendingConflict] =
        useState<PendingConflict | null>(null);
    const [isResolving, setIsResolving] = useState(false);
    const [softwareSelections, setSoftwareSelections] =
        useState<SoftwareSelections>(() => ({
            ...EMPTY_SOFTWARE_SELECTIONS,
            ...(initial_software_selections ?? {}),
        }));
    const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<number[]>(
        () => initial_accessory_ids ?? [],
    );

    const { errors } = usePage().props;
    const serverErrors = Object.values(errors ?? {});

    const { check, isChecking } = useCompatibility(
        configuration.id,
        selectedBySlot,
        softwareSelections,
        selectedAccessoryIds,
    );

    const sectionIds = useMemo(
        () => [
            ...slots.map((slot) => `slot-${slot.slot_key}`),
            ...software_groups.map((group) => `software-${group.key}`),
            ...accessories.map((category) => `accessory-${category.slug}`),
        ],
        [slots, software_groups, accessories],
    );
    const activeSectionId = useScrollspy(sectionIds);

    const toggleSoftware = (groupKey: SoftwareGroupKey, optionId: string) => {
        setDraftSaved(false);
        setSoftwareSelections((current) => ({
            ...current,
            [groupKey]: current[groupKey] === optionId ? null : optionId,
        }));
    };

    const toggleAccessory = (productId: number) => {
        setDraftSaved(false);
        setSelectedAccessoryIds((current) =>
            current.includes(productId)
                ? current.filter((id) => id !== productId)
                : [...current, productId],
        );
    };

    const selectedProducts = useMemo<SelectedEntry[]>(
        () =>
            slots
                .map((slot) => {
                    const selectedId =
                        selectedBySlot[slot.slot_key] ??
                        slot.default_product_id;
                    const selected =
                        slot.products.find(
                            (product) => product.id === selectedId,
                        ) ??
                        slot.products[0] ??
                        null;

                    if (!selected) {
                        return null;
                    }

                    return {
                        ...selected,
                        slot_key: slot.slot_key,
                        slot_label: slot.slot_label,
                    };
                })
                .filter(
                    (product): product is SelectedEntry => product !== null,
                ),
        [selectedBySlot, slots],
    );

    const selectedSoftware = useMemo(
        () => selectedSoftwareEntries(softwareSelections, software_groups),
        [softwareSelections, software_groups],
    );
    const selectedAccessories = useMemo(
        () => selectedAccessoryEntries(accessories, selectedAccessoryIds),
        [accessories, selectedAccessoryIds],
    );
    const previewPriceInCents = useMemo(() => {
        const selectedComponentsTotal = selectedProducts.reduce(
            (sum, product) => sum + product.price_in_cents,
            0,
        );
        const softwareTotal = selectedSoftware.reduce(
            (sum, entry) => sum + entry.price_in_cents,
            0,
        );
        const accessoriesTotal = selectedAccessories.reduce(
            (sum, entry) => sum + entry.price_in_cents,
            0,
        );

        // Anchor on the configuration's headline price and adjust only by how
        // the current selection differs from the (live-priced) default parts.
        // The default build therefore always equals the catalog price, matching
        // the server's finalPrice(). Using the stored markup_in_cents instead is
        // a stale snapshot that can drift negative and collapse this to €0.00.
        return Math.max(
            0,
            configuration.price_in_cents +
                (selectedComponentsTotal -
                    configuration.base_components_total_in_cents) +
                softwareTotal +
                accessoriesTotal,
        );
    }, [
        configuration.price_in_cents,
        configuration.base_components_total_in_cents,
        selectedAccessories,
        selectedProducts,
        selectedSoftware,
    ]);
    const hasCompatibilityErrors = check?.has_errors ?? false;
    const purchaseErrorMessage =
        serverErrors[0] ??
        check?.violations.find((violation) => violation.severity === 'error')
            ?.message ??
        null;

    const applySelections = (changes: Record<string, number>) => {
        setDraftSaved(false);
        setSelectedBySlot((current) => ({
            ...current,
            ...changes,
        }));
    };

    const setSelectedSlot = (slotKey: string, productId: number) => {
        const isAnnotatedIncompatible = check?.option_annotations[
            slotKey
        ]?.some((annotation) => annotation.product_id === productId);

        if (!isAnnotatedIncompatible) {
            applySelections({ [slotKey]: productId });
            return;
        }

        if (isResolving) {
            return;
        }

        const productName =
            slots
                .find((slot) => slot.slot_key === slotKey)
                ?.products.find((product) => product.id === productId)?.name ??
            'Selected component';

        setIsResolving(true);
        postJson<ResolveResult>(`/gaming-pcs/${configuration.id}/resolve`, {
            selected_components: { ...selectedBySlot, [slotKey]: productId },
            changed_slot_key: slotKey,
        })
            .then((result) => {
                if (!result.conflicts.length) {
                    // The annotation was stale; the pick is fine after all.
                    applySelections({ [slotKey]: productId });
                    return;
                }

                setPendingConflict({
                    slotKey,
                    productId,
                    productName,
                    result,
                });
            })
            .catch(() => {
                // If the resolver is unreachable, apply anyway — the server
                // still blocks incompatible purchases.
                applySelections({ [slotKey]: productId });
            })
            .finally(() => setIsResolving(false));
    };

    const confirmConflict = () => {
        if (!pendingConflict) {
            return;
        }

        applySelections({
            [pendingConflict.slotKey]: pendingConflict.productId,
            ...Object.fromEntries(
                pendingConflict.result.replacements.map((replacement) => [
                    replacement.slot_key,
                    replacement.to_product_id,
                ]),
            ),
        });
        setPendingConflict(null);
    };

    const buyBuild = () => {
        if (!slots.length || isBuying || check?.has_errors) {
            return;
        }

        router.post(
            `/gaming-pcs/${configuration.id}/buy`,
            {
                selected_components: selectedBySlot,
                selected_software: softwareSelections,
                selected_accessory_ids: selectedAccessoryIds,
            },
            {
                onStart: () => setIsBuying(true),
                onFinish: () => setIsBuying(false),
            },
        );
    };

    const saveDraft = () => {
        if (!slots.length || isSavingDraft) {
            return;
        }

        router.post(
            `/gaming-pcs/${configuration.id}/drafts`,
            {
                selected_components: selectedBySlot,
                selected_software: softwareSelections,
                selected_accessory_ids: selectedAccessoryIds,
            },
            {
                preserveScroll: true,
                onStart: () => setIsSavingDraft(true),
                onSuccess: () => setDraftSaved(true),
                onFinish: () => setIsSavingDraft(false),
            },
        );
    };

    const resetSelections = () => {
        setDraftSaved(false);
        setSelectedBySlot(defaultSelections);
        setSoftwareSelections(EMPTY_SOFTWARE_SELECTIONS);
        setSelectedAccessoryIds([]);
    };

    return (
        <>
            <Head title={`Configure ${configuration.name}`} />

            <StoreLayout
                hideHeader
                className="pb-[calc(7rem+env(safe-area-inset-bottom))] md:pb-0"
                footerClassName="mt-6"
            >
                <div className="sticky top-0 z-40 -mx-4 border-b border-white/10 bg-[#030712]/95 backdrop-blur-md sm:-mx-8 md:bg-[#030712]/85 lg:-mx-12">
                    <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-12">
                        <Link
                            href="/gaming-pcs"
                            className="shrink-0 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold whitespace-nowrap text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                        >
                            Back to Gaming PCs
                        </Link>
                        <span className="shrink-0 text-xs tracking-[0.14em] text-slate-400 uppercase">
                            Base #{configuration.id}
                        </span>
                    </div>

                    <MobileSectionNav
                        slots={slots}
                        softwareGroups={software_groups}
                        accessories={accessories}
                        activeSectionId={activeSectionId}
                    />
                </div>

                <section className="mt-6 grid gap-6 xl:grid-cols-[200px_1fr_minmax(340px,0.9fr)]">
                    <nav className="hidden xl:block" aria-label="Sections">
                        <SideNav
                            slots={slots}
                            softwareGroups={software_groups}
                            accessories={accessories}
                            activeSectionId={activeSectionId}
                        />
                    </nav>

                    <div className="space-y-6">
                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs tracking-[0.16em] text-[#9cf5d8] uppercase">
                                        Configure
                                    </p>
                                    <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">
                                        {configuration.name}
                                    </h1>
                                    <p className="mt-2 max-w-3xl text-sm text-slate-300">
                                        {configuration.description ??
                                            'Adjust your preferred components and review the preview before buying.'}
                                    </p>
                                </div>
                                <span className="rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-3 py-1 text-xs font-semibold text-[#9cf5d8]">
                                    {slots.length} slots
                                </span>
                            </div>

                            <div className="mt-5 space-y-4">
                                {slots.map((slot) => (
                                    <SlotSection
                                        key={slot.slot_key}
                                        slot={slot}
                                        selectedId={
                                            selectedBySlot[slot.slot_key] ??
                                            slot.default_product_id
                                        }
                                        annotations={
                                            check?.option_annotations[
                                                slot.slot_key
                                            ]
                                        }
                                        onSelect={setSelectedSlot}
                                    />
                                ))}
                            </div>
                        </article>

                        <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-5 sm:p-6">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs tracking-[0.16em] text-[#9cf5d8] uppercase">
                                        Programs
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                        Optional Software
                                    </h2>
                                    <p className="mt-2 max-w-3xl text-sm text-slate-300">
                                        Pick an operating system, office suite
                                        or antivirus — we install and activate
                                        everything before shipping. Click a
                                        selected item again to remove it.
                                    </p>
                                </div>
                                <span className="rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-3 py-1 text-xs font-semibold text-[#9cf5d8]">
                                    Optional
                                </span>
                            </div>

                            <div className="mt-5 space-y-4">
                                {software_groups.map((group) => (
                                    <SoftwareSection
                                        key={group.key}
                                        group={group}
                                        selectedOptionId={
                                            softwareSelections[group.key]
                                        }
                                        onToggle={toggleSoftware}
                                    />
                                ))}
                            </div>
                        </article>

                        {accessories.length > 0 && (
                            <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-5 sm:p-6">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs tracking-[0.16em] text-[#9cf5d8] uppercase">
                                            Accessories
                                        </p>
                                        <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                                            Complete Your Setup
                                        </h2>
                                        <p className="mt-2 max-w-3xl text-sm text-slate-300">
                                            Add monitors, keyboards, mice and
                                            more to your build — as many as you
                                            like. Click an added item again to
                                            remove it.
                                        </p>
                                    </div>
                                    <span className="rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-3 py-1 text-xs font-semibold text-[#9cf5d8]">
                                        Optional
                                    </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                    {accessories.map((category) => (
                                        <AccessorySection
                                            key={category.slug}
                                            category={category}
                                            selectedIds={selectedAccessoryIds}
                                            onToggle={toggleAccessory}
                                        />
                                    ))}
                                </div>
                            </article>
                        )}
                    </div>

                    <SummaryCard
                        configuration={configuration}
                        selectedProducts={selectedProducts}
                        selectedSoftware={selectedSoftware}
                        selectedAccessories={selectedAccessories}
                        previewPriceInCents={previewPriceInCents}
                        check={check}
                        isChecking={isChecking}
                        serverErrors={serverErrors}
                        isBuying={isBuying}
                        isSavingDraft={isSavingDraft}
                        draftSaved={draftSaved}
                        onBuy={buyBuild}
                        onSaveDraft={saveDraft}
                        onReset={resetSelections}
                    />
                </section>

                <MobilePurchaseBar
                    previewPriceInCents={previewPriceInCents}
                    isChecking={isChecking}
                    isBuying={isBuying}
                    hasErrors={hasCompatibilityErrors}
                    isDisabled={
                        selectedProducts.length === 0 ||
                        isBuying ||
                        hasCompatibilityErrors
                    }
                    errorMessage={purchaseErrorMessage}
                    onBuy={buyBuild}
                />

                {pendingConflict && (
                    <ConflictModal
                        productName={pendingConflict.productName}
                        result={pendingConflict.result}
                        onConfirm={confirmConflict}
                        onCancel={() => setPendingConflict(null)}
                    />
                )}
            </StoreLayout>
        </>
    );
}
