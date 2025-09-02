import { useCallback, useEffect } from "react";

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
