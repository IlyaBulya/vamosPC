import { useEffect, useState } from 'react';
import { postCheck, type CheckResult } from '@/lib/configurator';

/**
 * Debounced server-side compatibility check for the current selection.
 * The server is the single source of truth for the rules; the client
 * only computes instant arithmetic (prices, deltas).
 */
export function useCompatibility(
    configurationId: number,
    selections: Record<string, number>,
) {
    const [check, setCheck] = useState<CheckResult | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const selectionsKey = JSON.stringify(selections);

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(() => {
            setIsChecking(true);
            postCheck(
                configurationId,
                JSON.parse(selectionsKey) as Record<string, number>,
                controller.signal,
            )
                .then((result) => {
                    setCheck(result);
                    setIsChecking(false);
                })
                .catch((error: unknown) => {
                    if (!(error instanceof DOMException && error.name === 'AbortError')) {
                        console.error(error);
                        setIsChecking(false);
                    }
                });
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [configurationId, selectionsKey]);

    return { check, isChecking };
}
