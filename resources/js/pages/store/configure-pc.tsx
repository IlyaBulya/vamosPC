import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ConflictModal from '@/components/configurator/conflict-modal';
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
import {
    EMPTY_SOFTWARE_SELECTIONS,
    SOFTWARE_GROUPS,
    selectedSoftwareEntries,
} from '@/lib/configurator-software';
import type {
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
    initial_selections,
}: {
    configuration: ConfiguratorConfiguration;
    slots: ComponentSlot[];
    initial_selections?: Record<string, number> | null;
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
        useState<SoftwareSelections>(EMPTY_SOFTWARE_SELECTIONS);

    const { errors } = usePage().props;
    const serverErrors = Object.values(errors ?? {});

    const { check, isChecking } = useCompatibility(
        configuration.id,
        selectedBySlot,
    );

    const sectionIds = useMemo(
        () => [
            ...slots.map((slot) => `slot-${slot.slot_key}`),
            ...SOFTWARE_GROUPS.map((group) => `software-${group.key}`),
        ],
        [slots],
    );
    const activeSectionId = useScrollspy(sectionIds);

    const toggleSoftware = (groupKey: SoftwareGroupKey, optionId: string) => {
        setSoftwareSelections((current) => ({
            ...current,
            [groupKey]: current[groupKey] === optionId ? null : optionId,
        }));
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
            { selected_components: selectedBySlot },
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
            { selected_components: selectedBySlot },
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
    };

    return (
        <>
            <Head title={`Configure ${configuration.name}`} />

            <StoreLayout hideHeader footerClassName="mt-6">
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/gaming-pcs"
                        className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        Back to Gaming PCs
                    </Link>
                    <span className="text-xs tracking-[0.14em] text-slate-400 uppercase">
                        Base #{configuration.id}
                    </span>
                </div>

                <section className="mt-6 grid gap-6 xl:grid-cols-[200px_1fr_minmax(340px,0.9fr)]">
                    <nav className="hidden xl:block" aria-label="Sections">
                        <SideNav
                            slots={slots}
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
                                {SOFTWARE_GROUPS.map((group) => (
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
                    </div>

                    <SummaryCard
                        configuration={configuration}
                        selectedProducts={selectedProducts}
                        selectedSoftware={selectedSoftwareEntries(
                            softwareSelections,
                        )}
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
