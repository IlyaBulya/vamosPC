import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import BuildCard from '@/components/store/build-card';
import FeaturePill from '@/components/store/feature-pill';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type ModelFrame = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type ConfigurationCard = {
    id: number;
    name: string;
    description: string;
    price_in_cents: number;
};

const MODEL_LAND_END_PROGRESS = 0.32;
const HORIZONTAL_LOCK_START_PROGRESS = 0;
const HORIZONTAL_UNLOCK_THRESHOLD = 0.995;
const MODEL_SHRINK_START_PROGRESS = 0.3;
const MODEL_PRESHRINK_DURATION = 0.7;
const MODEL_PRESHRINK_PORTION = 0.42;
const MODEL_SHRINK_UPWARD_CENTER_RATIO = 0.6;
const MODEL_FINAL_SCALE_IN_CARD = 0.2;
const LOCK_POSITION_TOLERANCE = 28;
const LOCK_COOLDOWN_MS = 160;
const CARDS_PER_VIEW = 3;
const CARD_GAP_PX = 20;
const MIN_CARD_WIDTH_PX = 280;

const lerp = (from: number, to: number, t: number): number =>
    from + (to - from) * t;

const formatPrice = (priceInCents: number): string =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(priceInCents / 100);

const splitDescriptionLines = (
    description: string,
): { firstLine: string; secondLine: string | null } => {
    const parts = description
        .split(' | ')
        .map((part) => part.trim())
        .filter(Boolean);
    const ramIndex = parts.findIndex((part) => part.startsWith('RAM:'));

    if (ramIndex === -1) {
        return {
            firstLine: description,
            secondLine: null,
        };
    }

    const ramPart = parts[ramIndex] ?? null;
    const firstLineParts = parts.filter((_, index) => index !== ramIndex);

    return {
        firstLine: firstLineParts.join(' | '),
        secondLine: ramPart,
    };
};

const getCardsPerViewForWidth = (
    availableWidth: number,
    maxCardsPerView: number,
): number => {
    for (let count = maxCardsPerView; count > 1; count -= 1) {
        const cardWidth =
            (availableWidth - CARD_GAP_PX * (count - 1)) / count;

        if (cardWidth >= MIN_CARD_WIDTH_PX) {
            return count;
        }
    }

    return 1;
};

export default function Welcome({
    canRegister = true,
    configurations = [],
}: {
    canRegister?: boolean;
    configurations?: ConfigurationCard[];
}) {
    const scrollTrackRef = useRef<HTMLDivElement | null>(null);
    const modelAnchorRef = useRef<HTMLDivElement | null>(null);
    const targetCardRef = useRef<HTMLDivElement | null>(null);
    const cardsSectionRef = useRef<HTMLElement | null>(null);
    const cardsViewportRef = useRef<HTMLDivElement | null>(null);
    const cardsRailRef = useRef<HTMLDivElement | null>(null);
    const landingLockRef = useRef<ModelFrame | null>(null);
    const horizontalProgressRef = useRef(0);
    const scrollLockYRef = useRef<number | null>(null);
    const landingLockYRef = useRef(0);
    const horizontalDistanceRef = useRef(1);
    const hasHorizontalOverflowRef = useRef(false);
    const lastScrollYRef = useRef(0);
    const lockCooldownUntilRef = useRef(0);

    const [modelFrame, setModelFrame] = useState<ModelFrame>({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    });
    const [cardsTranslateX, setCardsTranslateX] = useState(0);
    const [landingProgress, setLandingProgress] = useState(0);
    const [desktopCardWidth, setDesktopCardWidth] = useState<number | null>(
        null,
    );
    const modelTargetIndex = configurations.length > 1 ? 1 : 0;
    const maxCardsPerView = Math.min(
        CARDS_PER_VIEW,
        Math.max(configurations.length, 1),
    );

    useEffect(() => {
        let frameId: number | null = null;

        const update = () => {
            const track = scrollTrackRef.current;
            const anchor = modelAnchorRef.current;

            if (!track || !anchor) {
                return;
            }

            const trackRect = track.getBoundingClientRect();
            const totalScrollable = Math.max(
                track.offsetHeight - window.innerHeight,
                1,
            );
            const scrolled = Math.min(
                Math.max(-trackRect.top, 0),
                totalScrollable,
            );
            const progress = scrolled / totalScrollable;
            const heroProgress = Math.min(Math.max(progress / 0.3, 0), 1);

            const visibleViewportWidth =
                cardsViewportRef.current?.clientWidth ?? 0;
            const cardsPerViewport = getCardsPerViewForWidth(
                visibleViewportWidth,
                maxCardsPerView,
            );
            const nextDesktopCardWidth =
                visibleViewportWidth > 0
                    ? (visibleViewportWidth -
                          CARD_GAP_PX * (cardsPerViewport - 1)) /
                      cardsPerViewport
                    : null;
            let widthChanged = false;
            setDesktopCardWidth((current) => {
                widthChanged = current !== nextDesktopCardWidth;

                return widthChanged ? nextDesktopCardWidth : current;
            });
            if (widthChanged) {
                if (frameId !== null) {
                    window.cancelAnimationFrame(frameId);
                }

                frameId = window.requestAnimationFrame(() => {
                    frameId = null;
                    update();
                });
            }
            const railWidth = cardsRailRef.current?.scrollWidth ?? 0;
            const maxHorizontalShift = Math.max(
                railWidth - visibleViewportWidth,
                0,
            );
            const hasHorizontalOverflow = maxHorizontalShift > 0.5;
            hasHorizontalOverflowRef.current = hasHorizontalOverflow;
            const stickyTop = 64;
            const cardsSection = cardsSectionRef.current;
            const cardsSectionRect = cardsSection?.getBoundingClientRect();
            const cardsScrollable = cardsSection
                ? Math.max(
                      cardsSection.offsetHeight -
                          (window.innerHeight - stickyTop),
                      1,
                  )
                : 1;
            const cardsScrolled = cardsSectionRect
                ? Math.min(
                      Math.max(stickyTop - cardsSectionRect.top, 0),
                      cardsScrollable,
                  )
                : 0;
            const cardsStageProgress = cardsScrolled / cardsScrollable;
            const landProgress = Math.min(
                Math.max(cardsStageProgress / MODEL_LAND_END_PROGRESS, 0),
                1,
            );
            const currentScrollY = window.scrollY;
            const isScrollingUp = currentScrollY < lastScrollYRef.current;
            const isScrollingDown = currentScrollY > lastScrollYRef.current;
            if (cardsSectionRect) {
                const cardsViewportRect =
                    cardsViewportRef.current?.getBoundingClientRect();
                const contentCenterY =
                    stickyTop + (window.innerHeight - stickyTop) / 2;
                if (cardsViewportRect) {
                    const cardsViewportCenterY =
                        cardsViewportRect.top + cardsViewportRect.height / 2;
                    landingLockYRef.current = Math.max(
                        currentScrollY +
                            (cardsViewportCenterY - contentCenterY),
                        0,
                    );
                } else {
                    landingLockYRef.current = Math.max(
                        currentScrollY + (cardsSectionRect.top - stickyTop),
                        0,
                    );
                }
                horizontalDistanceRef.current = hasHorizontalOverflow
                    ? Math.max(maxHorizontalShift, 1)
                    : 1;
            }

            if (!hasHorizontalOverflow) {
                horizontalProgressRef.current = 0;
                if (scrollLockYRef.current !== null) {
                    scrollLockYRef.current = null;
                }
            }

            if (scrollLockYRef.current === null) {
                const canLock = Date.now() >= lockCooldownUntilRef.current;
                const crossedLockGoingDown =
                    isScrollingDown &&
                    lastScrollYRef.current < landingLockYRef.current &&
                    currentScrollY >= landingLockYRef.current;
                const crossedLockGoingUp =
                    isScrollingUp &&
                    lastScrollYRef.current > landingLockYRef.current &&
                    currentScrollY <= landingLockYRef.current;

                if (
                    canLock &&
                    hasHorizontalOverflow &&
                    cardsStageProgress >= HORIZONTAL_LOCK_START_PROGRESS &&
                    horizontalProgressRef.current <
                        HORIZONTAL_UNLOCK_THRESHOLD &&
                    (crossedLockGoingDown ||
                        (isScrollingDown &&
                            Math.abs(
                                currentScrollY - landingLockYRef.current,
                            ) <= LOCK_POSITION_TOLERANCE))
                ) {
                    scrollLockYRef.current = landingLockYRef.current;
                    window.scrollTo(0, landingLockYRef.current);
                }
                if (
                    canLock &&
                    hasHorizontalOverflow &&
                    isScrollingUp &&
                    horizontalProgressRef.current > 0 &&
                    (crossedLockGoingUp ||
                        Math.abs(currentScrollY - landingLockYRef.current) <=
                            LOCK_POSITION_TOLERANCE)
                ) {
                    scrollLockYRef.current = landingLockYRef.current;
                    window.scrollTo(0, landingLockYRef.current);
                }
            } else {
                if (Math.abs(currentScrollY - scrollLockYRef.current) > 0.5) {
                    window.scrollTo(0, scrollLockYRef.current);
                }
            }

            if (horizontalProgressRef.current >= HORIZONTAL_UNLOCK_THRESHOLD) {
                horizontalProgressRef.current = 1;
            }

            setCardsTranslateX(
                hasHorizontalOverflow
                    ? -maxHorizontalShift * horizontalProgressRef.current
                    : 0,
            );
            setLandingProgress(landProgress);
            lastScrollYRef.current = window.scrollY;

            const startRect = anchor.getBoundingClientRect();
            const startX = startRect.left + startRect.width / 2;
            const startY = startRect.top + startRect.height / 2;
            const startWidth = startRect.width;
            const startHeight = startRect.height;

            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const centerWidth = startWidth * 1.08;
            const centerHeight = startHeight * 1.08;

            const targetRect = targetCardRef.current?.getBoundingClientRect();
            const liveEndX = targetRect
                ? targetRect.left + targetRect.width / 2
                : centerX;
            const liveEndY = targetRect
                ? targetRect.top + targetRect.height / 2
                : centerY;
            const targetMaxWidth = targetRect
                ? targetRect.width * MODEL_FINAL_SCALE_IN_CARD
                : centerWidth * 0.5;
            const targetMaxHeight = targetRect
                ? targetRect.height * MODEL_FINAL_SCALE_IN_CARD
                : centerHeight * 0.5;
            const uniformEndScale = Math.min(
                targetMaxWidth / Math.max(centerWidth, 1),
                targetMaxHeight / Math.max(centerHeight, 1),
            );
            const liveEndWidth = centerWidth * uniformEndScale;
            const liveEndHeight = centerHeight * uniformEndScale;

            if (cardsStageProgress <= 0) {
                landingLockRef.current = null;
            }

            if (cardsStageProgress > 0 && !landingLockRef.current) {
                landingLockRef.current = {
                    x: liveEndX,
                    y: liveEndY,
                    width: liveEndWidth,
                    height: liveEndHeight,
                };
            }

            const lockedEnd = landingLockRef.current;
            const endX = lockedEnd?.x ?? liveEndX;
            const endY = lockedEnd?.y ?? liveEndY;
            const endWidth = lockedEnd?.width ?? liveEndWidth;
            const endHeight = lockedEnd?.height ?? liveEndHeight;
            const preShrinkProgress = Math.min(
                Math.max(
                    (progress - MODEL_SHRINK_START_PROGRESS) /
                        MODEL_PRESHRINK_DURATION,
                    0,
                ),
                1,
            );
            const cardTravelProgress = Math.min(
                Math.max(
                    Math.max(landProgress, horizontalProgressRef.current),
                    0,
                ),
                1,
            );
            const preShrinkSizeProgress =
                preShrinkProgress * MODEL_PRESHRINK_PORTION;
            const sizeProgress = Math.min(
                preShrinkSizeProgress +
                    (1 - preShrinkSizeProgress) * cardTravelProgress,
                1,
            );
            const shrinkCenterY =
                centerY -
                centerY * MODEL_SHRINK_UPWARD_CENTER_RATIO * sizeProgress;

            let x = startX;
            let y = startY;
            let width = startWidth;
            let height = startHeight;

            if (heroProgress < 1) {
                const t = heroProgress;
                x = lerp(startX, centerX, t);
                y = lerp(startY, centerY, t);
                width = lerp(startWidth, centerWidth, t);
                height = lerp(startHeight, centerHeight, t);
            } else if (cardTravelProgress < 1) {
                x = lerp(centerX, endX, cardTravelProgress);
                y = lerp(shrinkCenterY, endY, cardTravelProgress);
                width = lerp(centerWidth, endWidth, sizeProgress);
                height = lerp(centerHeight, endHeight, sizeProgress);
            } else {
                x = endX;
                y = endY;
                width = endWidth;
                height = endHeight;
            }

            setModelFrame({ x, y, width, height });
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        const handleWheel = (event: WheelEvent) => {
            const delta =
                Math.abs(event.deltaY) >= Math.abs(event.deltaX)
                    ? event.deltaY
                    : event.deltaX;

            if (delta === 0) {
                return;
            }

            if (!hasHorizontalOverflowRef.current) {
                return;
            }

            if (scrollLockYRef.current === null) {
                const canLock = Date.now() >= lockCooldownUntilRef.current;
                if (
                    canLock &&
                    ((delta > 0 &&
                        horizontalProgressRef.current <
                            HORIZONTAL_UNLOCK_THRESHOLD &&
                        Math.abs(window.scrollY - landingLockYRef.current) <=
                            LOCK_POSITION_TOLERANCE) ||
                        (delta < 0 &&
                            horizontalProgressRef.current > 0 &&
                            Math.abs(
                                window.scrollY - landingLockYRef.current,
                            ) <= LOCK_POSITION_TOLERANCE))
                ) {
                    scrollLockYRef.current = landingLockYRef.current;
                    window.scrollTo(0, landingLockYRef.current);
                } else {
                    return;
                }
            }

            event.preventDefault();

            const distance = Math.max(horizontalDistanceRef.current, 1);
            let nextProgress = Math.min(
                Math.max(horizontalProgressRef.current + delta / distance, 0),
                1,
            );
            if (nextProgress >= HORIZONTAL_UNLOCK_THRESHOLD) {
                nextProgress = 1;
            }
            if (nextProgress <= 1 - HORIZONTAL_UNLOCK_THRESHOLD) {
                nextProgress = 0;
            }

            if (nextProgress !== horizontalProgressRef.current) {
                horizontalProgressRef.current = nextProgress;
                const visibleViewportWidth =
                    cardsViewportRef.current?.clientWidth ?? 0;
                const railWidth = cardsRailRef.current?.scrollWidth ?? 0;
                const maxHorizontalShift = Math.max(
                    railWidth - visibleViewportWidth,
                    0,
                );
                setCardsTranslateX(-maxHorizontalShift * nextProgress);
            }

            if (delta > 0 && nextProgress >= HORIZONTAL_UNLOCK_THRESHOLD) {
                horizontalProgressRef.current = 1;
                scrollLockYRef.current = null;
                lockCooldownUntilRef.current = Date.now() + LOCK_COOLDOWN_MS;
                window.scrollTo(0, landingLockYRef.current + 2);
                return;
            }

            if (delta < 0 && nextProgress <= 0) {
                scrollLockYRef.current = null;
                lockCooldownUntilRef.current = Date.now() + LOCK_COOLDOWN_MS;
                window.scrollTo(0, Math.max(landingLockYRef.current - 1, 0));
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            window.removeEventListener('wheel', handleWheel);
        };
    }, [maxCardsPerView]);

    return (
        <>
            <Head title="Welcome to VamosPC" />

            <StoreLayout
                canRegister={canRegister}
                contentClassName="relative max-w-none px-0 py-0 sm:px-0 lg:px-0"
                footerClassName="mt-6"
            >
                <div className="pointer-events-none absolute top-[18%] -left-20 h-72 w-72 rounded-full bg-[#00bd7d]/25 blur-3xl" />
                <div className="pointer-events-none absolute top-[14%] -right-24 h-96 w-96 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#00bd7d]/25 blur-3xl" />

                <div ref={scrollTrackRef} className="relative">
                    <main className="sticky top-16 z-10 h-[calc(100vh-64px)] w-full">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_73%_52%,rgba(0,189,125,0.22),transparent_40%)]" />

                        <section className="relative grid h-full w-full grid-cols-1 items-center gap-10 px-4 py-10 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:px-16 lg:py-12">
                            <div className="max-w-[700px]">
                                <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-[98px] lg:leading-[0.96]">
                                    <span className="bg-gradient-to-r from-white to-[#b8ffe8] bg-clip-text text-transparent">
                                        VAMOS PC
                                    </span>
                                </h1>

                                <p className="mt-5 max-w-[620px] text-4xl leading-[1.05] font-semibold text-white sm:text-5xl lg:text-[62px] lg:leading-[1.03]">
                                    custom high-performance
                                    <br />
                                    PC builds
                                </p>

                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Link
                                        href="/catalog"
                                        className="rounded-full bg-[#00bd7d] px-8 py-3 text-lg font-semibold text-white shadow-[0_0_25px_rgba(0,189,125,0.6)] transition hover:bg-[#02a96f]"
                                    >
                                        Browse Catalog
                                    </Link>
                                    <button
                                        type="button"
                                        className="rounded-full border border-[#00bd7d] px-8 py-3 text-lg font-semibold text-[#00bd7d] transition hover:bg-[#00bd7d]/10"
                                    >
                                        Learn More
                                    </button>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {[
                                        'Fast Build',
                                        'Warranty',
                                        'Stress Tested',
                                    ].map((item) => (
                                        <FeaturePill
                                            key={item}
                                            className="text-lg"
                                        >
                                            {item}
                                        </FeaturePill>
                                    ))}
                                </div>
                            </div>

                            <div
                                ref={modelAnchorRef}
                                className="relative mx-auto aspect-square w-full max-w-[640px]"
                            >
                                <div className="h-full w-full rounded-[34px] border border-[#00bd7d]/15 bg-[#07121f]/20" />
                            </div>
                        </section>
                    </main>

                    <section
                        ref={cardsSectionRef}
                        className="relative left-1/2 z-20 mt-[118vh] h-[calc(100vh-64px)] w-screen -translate-x-1/2"
                    >
                        <div className="sticky top-16 h-[calc(100vh-64px)]">
                            <div className="flex h-full w-full flex-col pt-3">
                                <div className="px-4 sm:px-8 lg:px-12">
                                    <p className="text-center text-xs tracking-[0.22em] text-slate-400 uppercase">
                                        THE PINNACLE OF CUSTOM GAMING RIGS.
                                        BUILT FOR YOU.
                                    </p>
                                </div>

                                <div className="mt-6 min-h-0 flex-1 px-4 sm:px-8 lg:px-12">
                                    <div
                                        ref={cardsViewportRef}
                                        className="h-full overflow-hidden"
                                    >
                                        <div
                                            ref={cardsRailRef}
                                            className="flex h-full items-start gap-5 will-change-transform"
                                            style={{
                                                transform: `translate3d(${cardsTranslateX}px, 0, 0)`,
                                            }}
                                        >
                                            {configurations.length ? (
                                                configurations.map(
                                                    (card, index) => {
                                                        const descriptionLines =
                                                            splitDescriptionLines(
                                                                card.description,
                                                            );

                                                        return (
                                                            <BuildCard
                                                                key={card.id}
                                                                title={
                                                                    <span className="block h-[4.5rem] line-clamp-2">
                                                                        {card.name}
                                                                    </span>
                                                                }
                                                                description={
                                                                    <span className="flex h-[3.75rem] flex-col overflow-hidden">
                                                                        <span className="block line-clamp-1">
                                                                            {
                                                                                descriptionLines.firstLine
                                                                            }
                                                                        </span>
                                                                        {descriptionLines.secondLine ? (
                                                                            <span className="mt-1 block line-clamp-1">
                                                                                {
                                                                                    descriptionLines.secondLine
                                                                                }
                                                                            </span>
                                                                        ) : null}
                                                                    </span>
                                                                }
                                                                titleClassName="text-4xl leading-[0.92] text-white"
                                                                descriptionClassName="w-full text-base leading-8 text-slate-300"
                                                                contentClassName="w-full"
                                                                footerClassName="w-full"
                                                                bodyClassName="h-[20rem] w-full shrink-0 sm:h-[21rem] lg:h-[22rem]"
                                                                className={`flex h-[720px] min-w-0 shrink-0 ${
                                                                    index ===
                                                                    modelTargetIndex
                                                                        ? 'border-[#00bd7d]/70 shadow-[0_0_28px_rgba(0,189,125,0.35)]'
                                                                        : 'border-white/12'
                                                                }`}
                                                                style={
                                                                    desktopCardWidth
                                                                        ? {
                                                                              width: `${desktopCardWidth}px`,
                                                                          }
                                                                        : {
                                                                              width: 'calc(100vw - 2rem)',
                                                                          }
                                                                }
                                                                media={
                                                                    <div
                                                                        ref={
                                                                            index ===
                                                                            modelTargetIndex
                                                                                ? targetCardRef
                                                                                : undefined
                                                                        }
                                                                        className="h-full w-full"
                                                                    >
                                                                        <ProductMediaBlock
                                                                            className="h-full w-full p-3 sm:p-4"
                                                                            aspectClassName="h-full w-full aspect-auto overflow-hidden rounded-[20px] border border-white/15 bg-[#0b1320]"
                                                                        >
                                                                            <>
                                                                                <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold tracking-[0.16em] text-[#9cf5d8]/75 uppercase">
                                                                                    {index ===
                                                                                    modelTargetIndex
                                                                                        ? 'Waiting for Model'
                                                                                        : 'PC Image Placeholder'}
                                                                                </div>

                                                                                {index ===
                                                                                    modelTargetIndex && (
                                                                                    <div
                                                                                        className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-[#00bd7d]/70 bg-[#07121f]/82 text-center text-xs font-semibold tracking-[0.16em] text-[#9cf5d8] uppercase transition-opacity duration-200"
                                                                                        style={{
                                                                                            opacity:
                                                                                                landingProgress,
                                                                                        }}
                                                                                    >
                                                                                        3D
                                                                                        Model
                                                                                        Inserted
                                                                                    </div>
                                                                                )}
                                                                            </>
                                                                        </ProductMediaBlock>
                                                                    </div>
                                                                }
                                                            >
                                                                <div className="border-t border-white/15 pt-4 text-center">
                                                                    <p className="text-2xl tracking-wide text-[#00bd7d] uppercase">
                                                                        STARTING AT{' '}
                                                                        <span className="font-bold text-[#00bd7d]">
                                                                            {formatPrice(
                                                                                card.price_in_cents,
                                                                            )}
                                                                        </span>
                                                                    </p>

                                                                    <Link
                                                                        href={`/gaming-pcs/${card.id}/configure`}
                                                                        className="mx-auto mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#00bd7d] via-[#19d99b] to-[#00aa72] px-7 py-3.5 text-sm font-black tracking-[0.18em] text-[#04120d] shadow-[0_14px_34px_rgba(0,189,125,0.34)] ring-1 ring-white/10 transition duration-200 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-[0_18px_38px_rgba(0,189,125,0.42)]"
                                                                    >
                                                                        CONFIGURE
                                                                    </Link>
                                                                </div>
                                                            </BuildCard>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-slate-300">
                                                    No configurations found.
                                                    Create one from Admin to
                                                    show it here.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="pointer-events-none fixed inset-0 z-40">
                    <div
                        className="absolute will-change-transform"
                        style={{
                            left: `${modelFrame.x - modelFrame.width / 2}px`,
                            top: `${modelFrame.y - modelFrame.height / 2}px`,
                            width: `${modelFrame.width}px`,
                            height: `${modelFrame.height}px`,
                            opacity: 1 - landingProgress,
                        }}
                    >
                        <div className="pointer-events-none absolute -inset-6 rounded-[42px] bg-[#00bd7d]/25 blur-3xl" />
                        <div className="relative flex h-full w-full items-center justify-center rounded-[30px] border-2 border-dashed border-[#00bd7d]/75 bg-[#07121f]/78 px-5 text-center text-sm font-semibold tracking-[0.18em] text-[#9cf5d8] uppercase sm:text-base">
                            3D Model Placeholder
                        </div>
                    </div>
                </div>
            </StoreLayout>
        </>
    );
}
