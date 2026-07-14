import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type PullStatus = 'idle' | 'pulling' | 'ready' | 'refreshing';

type TouchTracker = {
    axis: 'vertical' | null;
    distance: number;
    startX: number;
    startY: number;
    tracking: boolean;
};

const ACTIVATION_DISTANCE = 76;
const MAX_PULL_DISTANCE = 112;
const PULL_RESISTANCE = 0.48;
const REFRESH_HOLD_DISTANCE = 76;
const MINIMUM_REFRESH_ANIMATION_MS = 700;
const SETTLE_DURATION_MS = 280;
const REFRESH_SAFETY_TIMEOUT_MS = 12_000;

const isPhoneDevice = (): boolean =>
    window.matchMedia('(pointer: coarse)').matches &&
    Math.min(window.screen.width, window.screen.height) < 768;

const isIgnoredTarget = (target: EventTarget | null): boolean =>
    target instanceof Element &&
    Boolean(
        target.closest(
            'input, textarea, select, [contenteditable="true"], [data-pull-refresh-ignore]',
        ),
    );

const getStatusLabel = (status: PullStatus): string => {
    if (status === 'ready') {
        return 'Release to refresh';
    }

    if (status === 'refreshing') {
        return 'Refreshing';
    }

    return 'Pull to refresh';
};

export default function MobilePullToRefresh() {
    const indicatorRef = useRef<HTMLDivElement | null>(null);
    const statusRef = useRef<PullStatus>('idle');
    const [status, setStatus] = useState<PullStatus>('idle');

    useEffect(() => {
        if (!isPhoneDevice()) {
            return;
        }

        const layout = indicatorRef.current?.closest(
            '[data-store-layout-root]',
        ) as HTMLElement | null;
        if (!layout) {
            return;
        }

        const root = document.documentElement;
        const tracker: TouchTracker = {
            axis: null,
            distance: 0,
            startX: 0,
            startY: 0,
            tracking: false,
        };
        let isMounted = true;
        let reloadTimerId: number | null = null;
        let finishTimerId: number | null = null;
        let safetyTimerId: number | null = null;
        let settleTimerId: number | null = null;
        let visualFrameId: number | null = null;
        let pendingVisual: { animate: boolean; distance: number } | null = null;

        root.classList.add('store-pull-refresh-enabled');

        const updateStatus = (nextStatus: PullStatus) => {
            if (statusRef.current === nextStatus) {
                return;
            }

            statusRef.current = nextStatus;
            setStatus(nextStatus);
        };

        const applyVisual = (distance: number, shouldAnimate: boolean) => {
            const indicator = indicatorRef.current;
            if (!indicator) {
                return;
            }

            const progress = Math.min(distance / ACTIVATION_DISTANCE, 1);
            const opacity = Math.min(distance / 34, 1);

            if (shouldAnimate) {
                indicator.dataset.settling = 'true';
            } else {
                delete indicator.dataset.settling;
            }

            indicator.style.setProperty('--pull-distance', `${distance}px`);
            indicator.style.setProperty('--pull-opacity', `${opacity}`);
            indicator.style.setProperty(
                '--pull-scale',
                `${0.84 + progress * 0.16}`,
            );
            indicator.style.setProperty(
                '--pull-rotation',
                `${progress * 150}deg`,
            );
        };

        const updateVisual = (distance: number, shouldAnimate = false) => {
            pendingVisual = { animate: shouldAnimate, distance };

            if (visualFrameId !== null) {
                return;
            }

            visualFrameId = window.requestAnimationFrame(() => {
                visualFrameId = null;
                if (!pendingVisual) {
                    return;
                }

                const visual = pendingVisual;
                pendingVisual = null;
                applyVisual(visual.distance, visual.animate);
            });
        };

        const clearSettleTimer = () => {
            if (settleTimerId !== null) {
                window.clearTimeout(settleTimerId);
                settleTimerId = null;
            }
        };

        const resetIndicator = () => {
            tracker.distance = 0;
            tracker.axis = null;
            tracker.tracking = false;
            updateStatus('idle');
            updateVisual(0, true);
            clearSettleTimer();
            settleTimerId = window.setTimeout(() => {
                delete indicatorRef.current?.dataset.settling;
                settleTimerId = null;
            }, SETTLE_DURATION_MS);
        };

        const startRefresh = () => {
            const refreshStartedAt = window.performance.now();

            tracker.distance = REFRESH_HOLD_DISTANCE;
            tracker.tracking = false;
            updateStatus('refreshing');
            updateVisual(REFRESH_HOLD_DISTANCE, true);
            safetyTimerId = window.setTimeout(() => {
                safetyTimerId = null;
                resetIndicator();
            }, REFRESH_SAFETY_TIMEOUT_MS);

            reloadTimerId = window.setTimeout(() => {
                reloadTimerId = null;
                router.reload({
                    showProgress: false,
                    onFinish: () => {
                        if (!isMounted || statusRef.current !== 'refreshing') {
                            return;
                        }

                        if (safetyTimerId !== null) {
                            window.clearTimeout(safetyTimerId);
                            safetyTimerId = null;
                        }
                        const elapsed =
                            window.performance.now() - refreshStartedAt;
                        finishTimerId = window.setTimeout(
                            resetIndicator,
                            Math.max(
                                220,
                                MINIMUM_REFRESH_ANIMATION_MS - elapsed,
                            ),
                        );
                    },
                });
            }, 180);
        };

        const handleTouchStart = (event: TouchEvent) => {
            if (
                statusRef.current === 'refreshing' ||
                event.touches.length !== 1 ||
                (document.scrollingElement?.scrollTop ?? window.scrollY) > 0 ||
                isIgnoredTarget(event.target)
            ) {
                return;
            }

            clearSettleTimer();
            delete indicatorRef.current?.dataset.settling;

            const touch = event.touches[0];
            tracker.startX = touch.clientX;
            tracker.startY = touch.clientY;
            tracker.distance = 0;
            tracker.axis = null;
            tracker.tracking = true;
        };

        const handleTouchMove = (event: TouchEvent) => {
            if (!tracker.tracking) {
                return;
            }

            if (event.touches.length !== 1) {
                resetIndicator();
                return;
            }

            const touch = event.touches[0];
            const deltaX = touch.clientX - tracker.startX;
            const deltaY = touch.clientY - tracker.startY;

            if (tracker.axis === null) {
                if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
                    return;
                }

                if (Math.abs(deltaX) > Math.abs(deltaY) || deltaY <= 0) {
                    tracker.tracking = false;
                    return;
                }

                tracker.axis = 'vertical';
                updateStatus('pulling');
            }

            if (
                deltaY <= 0 ||
                (document.scrollingElement?.scrollTop ?? window.scrollY) > 0
            ) {
                resetIndicator();
                return;
            }

            if (event.cancelable) {
                event.preventDefault();
            }

            tracker.distance = Math.min(
                deltaY * PULL_RESISTANCE,
                MAX_PULL_DISTANCE,
            );
            updateVisual(tracker.distance);
            updateStatus(
                tracker.distance >= ACTIVATION_DISTANCE ? 'ready' : 'pulling',
            );
        };

        const handleTouchEnd = () => {
            if (!tracker.tracking) {
                return;
            }

            if (tracker.distance >= ACTIVATION_DISTANCE) {
                startRefresh();
                return;
            }

            resetIndicator();
        };

        const handleTouchCancel = () => {
            if (tracker.tracking) {
                resetIndicator();
            }
        };

        layout.addEventListener('touchstart', handleTouchStart, {
            passive: true,
        });
        layout.addEventListener('touchmove', handleTouchMove, {
            passive: false,
        });
        layout.addEventListener('touchend', handleTouchEnd, {
            passive: true,
        });
        layout.addEventListener('touchcancel', handleTouchCancel, {
            passive: true,
        });

        return () => {
            isMounted = false;
            root.classList.remove('store-pull-refresh-enabled');
            layout.removeEventListener('touchstart', handleTouchStart);
            layout.removeEventListener('touchmove', handleTouchMove);
            layout.removeEventListener('touchend', handleTouchEnd);
            layout.removeEventListener('touchcancel', handleTouchCancel);

            if (visualFrameId !== null) {
                window.cancelAnimationFrame(visualFrameId);
            }

            if (reloadTimerId !== null) {
                window.clearTimeout(reloadTimerId);
            }
            if (finishTimerId !== null) {
                window.clearTimeout(finishTimerId);
            }
            if (safetyTimerId !== null) {
                window.clearTimeout(safetyTimerId);
            }
            clearSettleTimer();
        };
    }, []);

    return (
        <div
            ref={indicatorRef}
            className="mobile-pull-refresh"
            data-state={status}
            role="status"
            aria-atomic="true"
            aria-busy={status === 'refreshing'}
            aria-hidden={status === 'idle'}
        >
            <div className="mobile-pull-refresh__panel">
                <span
                    className="mobile-pull-refresh__logo-shell"
                    aria-hidden="true"
                >
                    <img
                        src="/images/VamosLogo.png"
                        alt=""
                        width={32}
                        height={32}
                        className="mobile-pull-refresh__logo"
                    />
                </span>
                <span className="mobile-pull-refresh__label">
                    {getStatusLabel(status)}
                </span>
            </div>
        </div>
    );
}
