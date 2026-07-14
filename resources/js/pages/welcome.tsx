import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import BuildCard from '@/components/store/build-card';
import FeaturePill from '@/components/store/feature-pill';
import ProductMediaBlock from '@/components/store/product-media-block';
import StoreLayout from '@/layouts/store-layout';

type ConfigurationCard = {
    id: number;
    name: string;
    description: string;
    image: string | null;
    price_in_cents: number;
};

const CARDS_PER_VIEW = 3;
const CARD_GAP_PX = 20;
const MIN_CARD_WIDTH_PX = 280;

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
        const cardWidth = (availableWidth - CARD_GAP_PX * (count - 1)) / count;

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
    const cardsSectionRef = useRef<HTMLElement | null>(null);
    const cardsStickyRef = useRef<HTMLDivElement | null>(null);
    const cardsViewportRef = useRef<HTMLDivElement | null>(null);
    const cardsRailRef = useRef<HTMLDivElement | null>(null);
    const heroContentRef = useRef<HTMLElement | null>(null);
    const heroShadeRef = useRef<HTMLDivElement | null>(null);

    const [horizontalScrollDistance, setHorizontalScrollDistance] = useState(0);
    const [desktopCardWidth, setDesktopCardWidth] = useState<number | null>(
        null,
    );
    const maxCardsPerView = Math.min(
        CARDS_PER_VIEW,
        Math.max(configurations.length, 1),
    );

    useEffect(() => {
        let frameId: number | null = null;

        const update = () => {
            frameId = null;

            const visibleViewportWidth =
                cardsViewportRef.current?.clientWidth ?? 0;
            const isMobileViewport =
                window.innerWidth < 768 ||
                (window.innerHeight < 520 &&
                    window.matchMedia('(pointer: coarse)').matches);
            const cardsPerViewport = isMobileViewport
                ? 1
                : getCardsPerViewForWidth(
                      visibleViewportWidth,
                      maxCardsPerView,
                  );
            const nextDesktopCardWidth =
                visibleViewportWidth > 0
                    ? (visibleViewportWidth -
                          CARD_GAP_PX * (cardsPerViewport - 1)) /
                      cardsPerViewport
                    : null;
            setDesktopCardWidth((current) => {
                return current === nextDesktopCardWidth
                    ? current
                    : nextDesktopCardWidth;
            });

            const rail = cardsRailRef.current;
            const railWidth = cardsRailRef.current?.scrollWidth ?? 0;
            const maxHorizontalShift = Math.max(
                railWidth - visibleViewportWidth,
                0,
            );
            setHorizontalScrollDistance((current) =>
                Math.abs(current - maxHorizontalShift) < 0.5
                    ? current
                    : maxHorizontalShift,
            );

            const stickyTop = 64;
            const cardsSection = cardsSectionRef.current;
            const cardsSectionRect = cardsSection?.getBoundingClientRect();
            const stickyHeight =
                cardsStickyRef.current?.clientHeight ??
                window.innerHeight - stickyTop;
            const cardsScrollable = cardsSection
                ? Math.max(cardsSection.offsetHeight - stickyHeight, 1)
                : 1;
            const cardsScrolled = cardsSectionRect
                ? Math.min(
                      Math.max(stickyTop - cardsSectionRect.top, 0),
                      cardsScrollable,
                  )
                : 0;
            const cardsStageProgress = cardsScrolled / cardsScrollable;
            const translateX = -maxHorizontalShift * cardsStageProgress;
            const heroTransitionDistance = Math.max(
                window.innerHeight - stickyTop,
                1,
            );
            const heroTransitionProgress = cardsSectionRect
                ? Math.min(
                      Math.max(
                          (window.innerHeight - cardsSectionRect.top) /
                              heroTransitionDistance,
                          0,
                      ),
                      1,
                  )
                : 0;

            if (rail) {
                rail.style.transform = `translate3d(${translateX}px, 0, 0)`;
            }
            if (heroContentRef.current) {
                const maximumBlur = isMobileViewport ? 8 : 12;
                heroContentRef.current.style.filter = `blur(${heroTransitionProgress * maximumBlur}px)`;
                heroContentRef.current.style.opacity = `${1 - heroTransitionProgress * 0.72}`;
            }
            if (heroShadeRef.current) {
                heroShadeRef.current.style.opacity = `${heroTransitionProgress * 0.68}`;
            }
        };

        const scheduleUpdate = () => {
            if (frameId === null) {
                frameId = window.requestAnimationFrame(update);
            }
        };

        scheduleUpdate();
        window.addEventListener('scroll', scheduleUpdate, { passive: true });
        window.addEventListener('resize', scheduleUpdate);

        const resizeObserver = new ResizeObserver(scheduleUpdate);
        if (cardsSectionRef.current) {
            resizeObserver.observe(cardsSectionRef.current);
        }
        if (cardsStickyRef.current) {
            resizeObserver.observe(cardsStickyRef.current);
        }
        if (cardsViewportRef.current) {
            resizeObserver.observe(cardsViewportRef.current);
        }
        if (cardsRailRef.current) {
            resizeObserver.observe(cardsRailRef.current);
        }

        return () => {
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
            resizeObserver.disconnect();
            window.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
        };
    }, [configurations.length, maxCardsPerView]);

    return (
        <>
            <Head title="Welcome to VamosPC" />

            <StoreLayout
                canRegister={canRegister}
                contentClassName="relative max-w-none px-0 py-0 sm:px-0 lg:px-0"
                footerClassName="mt-0 sm:mt-6"
            >
                <div className="pointer-events-none absolute top-[18%] -left-20 h-72 w-72 rounded-full bg-[#00bd7d]/25 blur-3xl" />
                <div className="pointer-events-none absolute top-[14%] -right-24 hidden h-96 w-96 rounded-full bg-[#00bd7d]/20 blur-3xl sm:block" />
                <div className="pointer-events-none absolute bottom-0 left-0 hidden h-80 w-80 rounded-full bg-[#00bd7d]/25 blur-3xl sm:block" />

                <div className="relative">
                    <div className="sticky top-16 z-10 h-[calc(100dvh-64px)] w-full">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_73%_52%,rgba(0,189,125,0.22),transparent_40%)]" />

                        <section
                            ref={heroContentRef}
                            className="relative grid h-full w-full grid-cols-1 items-center gap-8 px-4 py-6 transition-[filter,opacity] duration-150 ease-out will-change-[filter,opacity] sm:px-8 sm:py-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10 lg:px-16 lg:py-12 [@media(max-height:500px)]:py-3"
                        >
                            <div className="max-w-[700px]">
                                <h1 className="text-[2.6rem] leading-none font-black tracking-tight min-[390px]:text-5xl sm:text-6xl lg:text-[98px] lg:leading-[0.96]">
                                    <span className="bg-gradient-to-r from-white to-[#b8ffe8] bg-clip-text text-transparent">
                                        VAMOS PC
                                    </span>
                                </h1>

                                <p className="mt-3 max-w-[620px] text-[1.55rem] leading-[1.12] font-semibold text-white min-[360px]:text-[1.75rem] min-[390px]:text-3xl sm:mt-5 sm:text-5xl lg:text-[62px] lg:leading-[1.03] [@media(max-height:500px)]:mt-2">
                                    custom high-performance
                                    <br />
                                    PC builds
                                </p>

                                <div className="mt-6 flex flex-col gap-3 min-[360px]:flex-row sm:mt-8 sm:flex-wrap sm:gap-4 lg:mt-10 [@media(max-height:500px)]:mt-3">
                                    <Link
                                        href="/catalog"
                                        className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[#00bd7d] px-5 py-2.5 text-base font-semibold text-white shadow-[0_0_25px_rgba(0,189,125,0.6)] transition hover:bg-[#02a96f] min-[360px]:w-auto sm:px-8 sm:py-3 sm:text-lg"
                                    >
                                        Browse Catalog
                                    </Link>
                                    <button
                                        type="button"
                                        className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#00bd7d] px-5 py-2.5 text-base font-semibold text-[#00bd7d] transition hover:bg-[#00bd7d]/10 min-[360px]:w-auto sm:px-8 sm:py-3 sm:text-lg"
                                    >
                                        Learn More
                                    </button>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-3 lg:mt-8 [@media(max-height:500px)]:hidden">
                                    {[
                                        'Fast Build',
                                        'Warranty',
                                        'Stress Tested',
                                    ].map((item) => (
                                        <FeaturePill
                                            key={item}
                                            className="px-3 py-1.5 text-sm sm:px-4 sm:py-2 sm:text-lg"
                                        >
                                            {item}
                                        </FeaturePill>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <div
                            ref={heroShadeRef}
                            className="will-change-opacity pointer-events-none absolute inset-0 z-10 bg-[#030712] opacity-0 transition-opacity duration-150 ease-out"
                        />
                    </div>

                    <section
                        ref={cardsSectionRef}
                        className="relative z-20 w-full"
                        style={{
                            height: `calc(100dvh - 64px + ${horizontalScrollDistance}px)`,
                        }}
                    >
                        <div
                            ref={cardsStickyRef}
                            className="sticky top-16 h-[calc(100dvh-64px)]"
                        >
                            <div className="flex h-full w-full flex-col pt-2 sm:pt-3">
                                <div className="px-4 sm:px-8 lg:px-12">
                                    <p className="text-center text-[0.65rem] leading-4 tracking-[0.16em] text-slate-400 uppercase sm:text-xs sm:tracking-[0.22em]">
                                        THE PINNACLE OF CUSTOM GAMING RIGS.
                                        BUILT FOR YOU.
                                    </p>
                                </div>

                                <div className="mt-3 min-h-0 flex-1 px-4 sm:mt-6 sm:px-8 lg:px-12 [@media(max-height:520px)]:mt-2">
                                    <div
                                        ref={cardsViewportRef}
                                        className="h-full overflow-hidden"
                                    >
                                        <div
                                            ref={cardsRailRef}
                                            className="flex h-full items-start gap-5 will-change-transform"
                                            style={{
                                                transform:
                                                    'translate3d(0, 0, 0)',
                                            }}
                                        >
                                            {configurations.length ? (
                                                configurations.map((card) => {
                                                    const descriptionLines =
                                                        splitDescriptionLines(
                                                            card.description,
                                                        );

                                                    return (
                                                        <BuildCard
                                                            key={card.id}
                                                            title={
                                                                <span className="line-clamp-2 block h-[3rem] sm:h-[4.5rem] [@media(max-height:520px)]:h-10">
                                                                    {card.name}
                                                                </span>
                                                            }
                                                            description={
                                                                <span className="flex h-[2.75rem] flex-col overflow-hidden sm:h-[3.75rem] [@media(max-height:520px)]:hidden">
                                                                    <span className="line-clamp-1 block">
                                                                        {
                                                                            descriptionLines.firstLine
                                                                        }
                                                                    </span>
                                                                    {descriptionLines.secondLine ? (
                                                                        <span className="mt-1 line-clamp-1 block">
                                                                            {
                                                                                descriptionLines.secondLine
                                                                            }
                                                                        </span>
                                                                    ) : null}
                                                                </span>
                                                            }
                                                            titleClassName="text-2xl leading-none text-white sm:text-3xl lg:text-4xl lg:leading-[0.92] [@media(max-height:520px)]:text-xl"
                                                            descriptionClassName="mt-2 w-full text-sm leading-5 text-slate-300 sm:mt-4 sm:text-base sm:leading-8"
                                                            contentClassName="w-full gap-3 p-4 sm:gap-6 sm:p-6 [@media(max-height:520px)]:gap-2 [@media(max-height:520px)]:p-3"
                                                            footerClassName="w-full pt-3 sm:pt-6 [@media(max-height:520px)]:pt-2"
                                                            bodyClassName="h-[clamp(7rem,27dvh,20rem)] w-full shrink-0 sm:h-[clamp(12rem,32dvh,21rem)] lg:h-[22rem] [@media(max-height:520px)]:h-24"
                                                            className="flex h-full max-h-[720px] min-w-0 shrink-0 rounded-[24px] border-white/12 sm:rounded-[30px]"
                                                            style={
                                                                desktopCardWidth
                                                                    ? {
                                                                          width: `${desktopCardWidth}px`,
                                                                      }
                                                                    : {
                                                                          width: '100%',
                                                                      }
                                                            }
                                                            media={
                                                                <div className="h-full w-full">
                                                                    <ProductMediaBlock
                                                                        className="h-full w-full p-2 sm:p-4"
                                                                        aspectClassName="h-full w-full aspect-auto overflow-hidden rounded-[20px] border border-white/15 bg-[#0b1320]"
                                                                    >
                                                                        {card.image ? (
                                                                            <img
                                                                                src={
                                                                                    card.image
                                                                                }
                                                                                alt={
                                                                                    card.name
                                                                                }
                                                                                className="absolute inset-0 h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="absolute inset-0 flex items-center justify-center text-center text-xs font-semibold tracking-[0.16em] text-[#9cf5d8]/75 uppercase">
                                                                                PC
                                                                                Image
                                                                                Placeholder
                                                                            </div>
                                                                        )}
                                                                    </ProductMediaBlock>
                                                                </div>
                                                            }
                                                        >
                                                            <div className="border-t border-white/15 pt-2 text-center sm:pt-4 [@media(max-height:520px)]:pt-2">
                                                                <p className="text-lg tracking-wide text-[#00bd7d] uppercase sm:text-2xl [@media(max-height:520px)]:text-base">
                                                                    STARTING AT{' '}
                                                                    <span className="font-bold text-[#00bd7d]">
                                                                        {formatPrice(
                                                                            card.price_in_cents,
                                                                        )}
                                                                    </span>
                                                                </p>

                                                                <Link
                                                                    href={`/gaming-pcs/${card.id}/configure`}
                                                                    className="mx-auto mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#00bd7d] via-[#19d99b] to-[#00aa72] px-5 py-2.5 text-sm font-black tracking-[0.16em] text-[#04120d] shadow-[0_14px_34px_rgba(0,189,125,0.34)] ring-1 ring-white/10 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(0,189,125,0.42)] hover:brightness-105 sm:mt-4 sm:px-7 sm:py-3.5 sm:tracking-[0.18em] [@media(max-height:520px)]:mt-1 [@media(max-height:520px)]:py-2"
                                                                >
                                                                    CONFIGURE
                                                                </Link>
                                                            </div>
                                                        </BuildCard>
                                                    );
                                                })
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
            </StoreLayout>
        </>
    );
}
