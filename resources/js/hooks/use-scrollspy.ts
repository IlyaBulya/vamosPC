import { useEffect, useState } from 'react';

/**
 * Tracks which of the given sections is currently in view.
 * A section counts as active while its top edge is above the
 * scan line (`offset` px from the viewport top) and no later
 * section has crossed it yet.
 */
export function useScrollspy(ids: string[], offset = 160): string | null {
    const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null);

    useEffect(() => {
        if (!ids.length) {
            return;
        }

        let frame = 0;

        const update = () => {
            frame = 0;

            let current = ids[0];
            for (const id of ids) {
                const element = document.getElementById(id);
                if (!element) {
                    continue;
                }
                if (element.getBoundingClientRect().top <= offset) {
                    current = id;
                }
            }

            const scrolledToBottom =
                window.innerHeight + window.scrollY >=
                document.documentElement.scrollHeight - 2;
            if (scrolledToBottom) {
                current = ids[ids.length - 1];
            }

            setActiveId(current);
        };

        const schedule = () => {
            if (!frame) {
                frame = requestAnimationFrame(update);
            }
        };

        schedule();
        window.addEventListener('scroll', schedule, { passive: true });
        window.addEventListener('resize', schedule);

        return () => {
            if (frame) {
                cancelAnimationFrame(frame);
            }
            window.removeEventListener('scroll', schedule);
            window.removeEventListener('resize', schedule);
        };
    }, [ids, offset]);

    return activeId;
}
