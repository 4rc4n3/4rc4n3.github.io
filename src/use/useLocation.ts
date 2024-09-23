import {useCallback, useEffect, useMemo, useState} from "react";

const getLocation = (): URL => new URL(window.history.state?.location || window.location.href)

const HistoryTarget = new EventTarget();

export const useLocation = () => {
    const [state, setState] = useState(getLocation().href);

    const push = useCallback((url: (url: URL) => URL) => {
        const next = url(getLocation());
        if (next.href === location.href) return;
        window.history.pushState({location: next.href}, '', next);
        HistoryTarget.dispatchEvent(new Event('pushstate'));
    }, [])

    const replace = useCallback((url: (url: URL) => URL) => {
        const next = url(getLocation());
        if (next.href === location.href) return;
        window.history.replaceState({location: next.href}, '', next);
        HistoryTarget.dispatchEvent(new Event('replacestate'));
    }, [])

    useEffect(() => {
        const listener = () => setState(getLocation().href);
        window.addEventListener('popstate', listener);
        HistoryTarget.addEventListener('pushstate', listener);
        HistoryTarget.addEventListener('replacestate', listener);
        return () => {
            window.removeEventListener('popstate', listener);
            HistoryTarget.removeEventListener('pushstate', listener);
            HistoryTarget.removeEventListener('replacestate', listener);
        }
    }, []);

    return useMemo(() => {
        const url = new URL(state);
        return {
            pathname: url.pathname,
            searchParams: url.searchParams,
            hash: url.hash,
            url,
            push,
            replace
        }
    }, [state, push, replace])
}
