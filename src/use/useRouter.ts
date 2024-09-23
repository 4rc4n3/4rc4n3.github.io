import {useLocation} from "./useLocation";
import {useMemo} from "react";
import {Router} from "@toolpad/core"

export const ensureURL = (path: URL | string): URL => path instanceof URL ? path : new URL(path, window.location.origin)

export const useRouter = (initialState: string) => {
    const {pathname, push, replace, searchParams} = useLocation();

    return useMemo<Router>(() => {
        return {
            pathname,
            searchParams,
            navigate: (path, {history = 'push'} = {}) => {
                if (history === 'push') {
                    const url = ensureURL(path);
                    push((next) => {
                        next.pathname = url.pathname;
                        next.search = url.search;

                        return next;
                    })
                }
            },
        };
    }, [pathname, push, replace, searchParams]);
}
