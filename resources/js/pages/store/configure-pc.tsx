import { Head, Link, router, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ConflictModal from '@/components/configurator/conflict-modal';
import SlotSection from '@/components/configurator/slot-section';
import SummaryCard from '@/components/configurator/summary-card';
import { useCompatibility } from '@/hooks/use-compatibility';
import {
    postJson,
    type ComponentSlot,
    type ConfiguratorConfiguration,
    type ResolveResult,
    type SlotProduct,
} from '@/lib/configurator';
import { COMPONENT_TYPE_LABELS } from '@/lib/spec-schema';
import StoreLayout from '@/layouts/store-layout';

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

    const [selectedBySlot, setSelectedBySlot] = useState<Record<string, number>>(
        () => ({
            ...defaultSelections,
            ...(initial_selections ?? {}),
        }),
    );
    const [isBuying, setIsBuying] = useState(false);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [draftSaved, setDraftSaved] = useState(false);
    const [pendingConflict, setPendingConflict] =
        useState<PendingConflict | null>(null);
    const [isResolving, setIsResolving] = useState(false);

    const { errors } = usePage().props;
    const serverErrors = Object.values(errors ?? {});

    const { check, isChecking } = useCompatibility(
        configuration.id,
        selectedBySlot,
    );

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
                .filter((product): product is SelectedEntry => product !== null),
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
    };

    return (
        <>
            <Head title={`Configure ${configuration.name}`} />

            <StoreLayout footerClassName="mt-6">
                <div className="flex items-center justify-between gap-3">
                    <Link
                        href="/gaming-pcs"
                        className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-[#00bd7d]/55 hover:text-[#9cf5d8]"
                    >
                        Back to Gaming PCs
                    </Link>
                    <span className="text-xs uppercase tracking-[0.14em] text-slate-400">
                        Base #{configuration.id}
                    </span>
                </div>

                <section className="mt-6 grid gap-6 xl:grid-cols-[200px_1fr_minmax(340px,0.9fr)]">
                    <nav className="hidden xl:block">
                        <div className="sticky top-6 space-y-1">
                            <p className="mb-3 text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
                                Components
                            </p>
                            {slots.map((slot) => (
                                <a
                                    key={slot.slot_key}
                                    href={`#slot-${slot.slot_key}`}
                                    className="block rounded-lg px-3 py-1.5 text-sm text-slate-400 transition hover:bg-white/[0.04] hover:text-[#9cf5d8]"
                                >
                                    {slot.component_type
                                        ? COMPONENT_TYPE_LABELS[
                                              slot.component_type
                                          ]
                                        : slot.slot_label}
                                </a>
                            ))}
                        </div>
                    </nav>

                    <article className="rounded-3xl border border-white/10 bg-[#08101c]/85 p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.16em] text-[#9cf5d8]">
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

                    <SummaryCard
                        configuration={configuration}
                        selectedProducts={selectedProducts}
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
