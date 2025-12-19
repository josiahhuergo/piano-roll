import type { FederatedPointerEvent } from "pixi.js";
import { useCallback, useEffect, useRef } from "react";

export function useWindowEvent<K extends keyof WindowEventMap>(
    event: K,
    handler: (event: WindowEventMap[K]) => void,
    deps: React.DependencyList = []
) {
    const callback = useCallback(handler, deps);

    useEffect(() => {
        window.addEventListener(event, callback);
        return () => {
            window.removeEventListener(event, callback);
        };
    }, [event, callback]);
}

export function useDoubleClick(
    handleSingleClick: (event: FederatedPointerEvent) => void,
    handleDoubleClick: (event: FederatedPointerEvent) => void,
    timeThreshold: number = 300
) {
    const time = useRef(0);

    const handlePointerDown = useCallback(
        (event: FederatedPointerEvent) => {
            const now = Date.now();
            const delta = now - time.current;

            if (delta < timeThreshold) {
                handleDoubleClick(event);
            } else {
                handleSingleClick(event);
                time.current = Date.now();
            }

            event.stopPropagation();
        },
        [handleSingleClick, handleDoubleClick]
    );

    return handlePointerDown;
}
