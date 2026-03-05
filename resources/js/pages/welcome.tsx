import { Head, Link } from '@inertiajs/react';
import StoreFooter from '@/components/store-footer';
import StoreHeader from '@/components/store-header';
import { useEffect, useRef, useState } from 'react';

type ModelFrame = {
    x: number;
    y: number;
    width: number;
    height: number;
};

type Card = {
    name: string;
    spec: string;
    price: string;
};

const MODEL_TARGET_INDEX = 1;
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

const cards: Card[] = [
    {
        name: 'VAMOS X',
        spec: 'CPU: Intel Core i9-14900K | GPU: NVIDIA GeForce RTX 4090 | RAM: 64GB DDR5-6400MHz',
        price: '$3,499',
    },
    {
        name: 'VAMOS Z',
        spec: 'CPU: AMD Ryzen 9 7950X3D | GPU: AMD Radeon RX 7900 XTX | RAM: 32GB DDR5-6000MHz',
        price: '$2,899',
    },
    {
        name: 'VAMOS PRO',
        spec: 'CPU: Intel Xeon W-3400 Series | GPU: Dual NVIDIA RTX 6000 Ada | RAM: 256GB ECC DDR5',
        price: '$8,999',
    },
    {
        name: 'VAMOS STRIKE',
        spec: 'CPU: Intel Core i7-14700KF | GPU: NVIDIA GeForce RTX 5070 Ti | RAM: 32GB DDR5-6000MHz',
        price: '$2,199',
    },
    {
        name: 'VAMOS FLOW',
        spec: 'CPU: AMD Ryzen 7 9800X3D | GPU: NVIDIA GeForce RTX 5080 | RAM: 32GB DDR5-6400MHz',
        price: '$3,099',
    },
    {
        name: 'VAMOS EDGE',
        spec: 'CPU: AMD Ryzen 5 9600X | GPU: AMD Radeon RX 7800 XT | RAM: 16GB DDR5-5600MHz',
        price: '$1,799',
    },
];

const lerp = (from: number, to: number, t: number): number => from + (to - from) * t;

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
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

    useEffect(() => {
        const update = () => {
            const track = scrollTrackRef.current;
            const anchor = modelAnchorRef.current;

            if (!track || !anchor) {
                return;
            }

            const trackRect = track.getBoundingClientRect();
            const totalScrollable = Math.max(track.offsetHeight - window.innerHeight, 1);
            const scrolled = Math.min(Math.max(-trackRect.top, 0), totalScrollable);
            const progress = scrolled / totalScrollable;
            const heroProgress = Math.min(Math.max(progress / 0.3, 0), 1);

            const viewportWidth = cardsViewportRef.current?.clientWidth ?? 0;
            const railWidth = cardsRailRef.current?.scrollWidth ?? 0;
            const maxHorizontalShift = Math.max(railWidth - viewportWidth, 0);
            const stickyTop = 64;
            const cardsSection = cardsSectionRef.current;
            const cardsSectionRect = cardsSection?.getBoundingClientRect();
            const cardsScrollable = cardsSection
                ? Math.max(cardsSection.offsetHeight - (window.innerHeight - stickyTop), 1)
                : 1;
            const cardsScrolled = cardsSectionRect
                ? Math.min(Math.max(stickyTop - cardsSectionRect.top, 0), cardsScrollable)
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
                const cardsViewportRect = cardsViewportRef.current?.getBoundingClientRect();
                const contentCenterY = stickyTop + (window.innerHeight - stickyTop) / 2;
                if (cardsViewportRect) {
                    const cardsViewportCenterY =
                        cardsViewportRect.top + cardsViewportRect.height / 2;
                    landingLockYRef.current = Math.max(
                        currentScrollY + (cardsViewportCenterY - contentCenterY),
                        0,
                    );
                } else {
                    landingLockYRef.current = Math.max(
                        currentScrollY + (cardsSectionRect.top - stickyTop),
                        0,
                    );
                }
                horizontalDistanceRef.current = Math.max(maxHorizontalShift, 1);
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
                    cardsStageProgress >= HORIZONTAL_LOCK_START_PROGRESS &&
                    horizontalProgressRef.current < HORIZONTAL_UNLOCK_THRESHOLD &&
                    (crossedLockGoingDown ||
                        (isScrollingDown &&
                            Math.abs(currentScrollY - landingLockYRef.current) <=
                                LOCK_POSITION_TOLERANCE))
                ) {
                    scrollLockYRef.current = landingLockYRef.current;
                    window.scrollTo(0, landingLockYRef.current);
                }
                if (
                    canLock &&
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

            setCardsTranslateX(-maxHorizontalShift * horizontalProgressRef.current);
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
            const liveEndX = targetRect ? targetRect.left + targetRect.width / 2 : centerX;
            const liveEndY = targetRect ? targetRect.top + targetRect.height / 2 : centerY;
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
                Math.max(Math.max(landProgress, horizontalProgressRef.current), 0),
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
                centerY - centerY * MODEL_SHRINK_UPWARD_CENTER_RATIO * sizeProgress;

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

            if (scrollLockYRef.current === null) {
                const canLock = Date.now() >= lockCooldownUntilRef.current;
                if (
                    canLock &&
                    ((delta > 0 &&
                        horizontalProgressRef.current < HORIZONTAL_UNLOCK_THRESHOLD &&
                        Math.abs(window.scrollY - landingLockYRef.current) <=
                            LOCK_POSITION_TOLERANCE) ||
                        (delta < 0 &&
                            horizontalProgressRef.current > 0 &&
                            Math.abs(window.scrollY - landingLockYRef.current) <=
                                LOCK_POSITION_TOLERANCE))
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
                const viewportWidth = cardsViewportRef.current?.clientWidth ?? 0;
                const railWidth = cardsRailRef.current?.scrollWidth ?? 0;
                const maxHorizontalShift = Math.max(railWidth - viewportWidth, 0);
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
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <>
            <Head title="Welcome to VamosPC" />

            <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030712] text-slate-100">
                <div className="pointer-events-none absolute -left-20 top-[18%] h-72 w-72 rounded-full bg-[#00bd7d]/25 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 top-[14%] h-96 w-96 rounded-full bg-[#00bd7d]/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#00bd7d]/25 blur-3xl" />

                <StoreHeader canRegister={canRegister} />

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

                                <p className="mt-5 max-w-[620px] text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-[62px] lg:leading-[1.03]">
                                    custom high-performance
                                    <br />
                                    PC builds
                                </p>

                                <div className="mt-10 flex flex-wrap gap-4">
                                    <Link
                                        href="/gaming-pc"
                                        className="rounded-full bg-[#00bd7d] px-8 py-3 text-lg font-semibold text-white shadow-[0_0_25px_rgba(0,189,125,0.6)] transition hover:bg-[#02a96f]"
                                    >
                                        Build Yours Now
                                    </Link>
                                    <button
                                        type="button"
                                        className="rounded-full border border-[#00bd7d] px-8 py-3 text-lg font-semibold text-[#00bd7d] transition hover:bg-[#00bd7d]/10"
                                    >
                                        Learn More
                                    </button>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-3">
                                    {['Fast Build', 'Warranty', 'Stress Tested'].map(
                                        (item) => (
                                            <span
                                                key={item}
                                                className="inline-flex items-center gap-2 rounded-full border border-[#00bd7d]/40 bg-[#00bd7d]/10 px-4 py-2 text-lg text-[#9cf5d8]"
                                            >
                                                <span className="h-2.5 w-2.5 rounded-full bg-[#00bd7d]" />
                                                {item}
                                            </span>
                                        ),
                                    )}
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
                        className="relative z-20 mt-[118vh] h-[calc(100vh-64px)]"
                    >
                        <div className="sticky top-16 h-[calc(100vh-64px)]">
                            <div className="mx-auto flex h-full w-full max-w-[1540px] flex-col px-4 pt-3 sm:px-8 lg:px-12">
                                <p className="text-center text-xs uppercase tracking-[0.22em] text-slate-400">
                                    THE PINNACLE OF CUSTOM GAMING RIGS. BUILT FOR YOU.
                                </p>

                                <div
                                    ref={cardsViewportRef}
                                    className="mt-6 min-h-0 flex-1 overflow-hidden"
                                >
                                    <div
                                        ref={cardsRailRef}
                                        className="flex gap-5 will-change-transform"
                                        style={{
                                            transform: `translate3d(${cardsTranslateX}px, 0, 0)`,
                                        }}
                                    >
                                {cards.map((card, index) => (
                                    <article
                                        key={card.name}
                                        className={`w-[86vw] max-w-[420px] shrink-0 rounded-2xl border bg-[#0a1019]/95 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.5)] sm:w-[72vw] md:w-[58vw] lg:w-auto lg:max-w-none lg:basis-[calc((100%-2.5rem)/3)] ${
                                            index === MODEL_TARGET_INDEX
                                                ? 'border-[#00bd7d]/70 shadow-[0_0_28px_rgba(0,189,125,0.35)]'
                                                : 'border-white/12'
                                        }`}
                                    >
                                        <div
                                            ref={
                                                index === MODEL_TARGET_INDEX
                                                    ? targetCardRef
                                                    : undefined
                                            }
                                            className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/15 bg-[#0b1320]"
                                        >
                                            <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8]/75">
                                                {index === MODEL_TARGET_INDEX
                                                    ? 'Waiting for Model'
                                                    : 'PC Image Placeholder'}
                                            </div>

                                            {index === MODEL_TARGET_INDEX && (
                                                <div
                                                    className="absolute inset-0 flex items-center justify-center rounded-xl border-2 border-[#00bd7d]/70 bg-[#07121f]/82 text-center text-xs font-semibold uppercase tracking-[0.16em] text-[#9cf5d8] transition-opacity duration-200"
                                                    style={{
                                                        opacity: landingProgress,
                                                    }}
                                                >
                                                    3D Model Inserted
                                                </div>
                                            )}
                                        </div>

                                        <h3 className="mt-4 text-5xl font-black leading-none text-white">
                                            {card.name}
                                        </h3>

                                        <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-slate-300">
                                            {card.spec}
                                        </p>

                                        <div className="mt-4 border-t border-white/15 pt-4 text-center">
                                            <p className="text-2xl uppercase tracking-wide text-[#00bd7d]">
                                                STARTING AT{' '}
                                                <span className="font-bold text-[#00bd7d]">
                                                    {card.price}
                                                </span>
                                            </p>

                                            <button
                                                type="button"
                                                className="mt-4 w-full rounded-xl bg-[#00bd7d] px-7 py-3 text-base font-semibold text-[#04120d] transition hover:bg-[#18d99a]"
                                            >
                                                CONFIGURE
                                            </button>
                                        </div>
                                    </article>
                                ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                <StoreFooter className="mt-6" />

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
                        <div className="relative flex h-full w-full items-center justify-center rounded-[30px] border-2 border-dashed border-[#00bd7d]/75 bg-[#07121f]/78 px-5 text-center text-sm font-semibold uppercase tracking-[0.18em] text-[#9cf5d8] sm:text-base">
                            3D Model Placeholder
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
