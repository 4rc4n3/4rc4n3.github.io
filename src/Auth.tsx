import React, {ReactNode, useMemo} from "react";
import {useAuth} from "./api";
import {useLocation} from "./use";

export const Auth = ({children, fallback}: { children: ReactNode; fallback?: ReactNode }) => {
    const {replace, searchParams} = useLocation();
    const code = useMemo(() => searchParams.get('code'), [searchParams]);

    const {status, login} = useAuth();

    if (code) {
        throw login(code).then(() => {
            replace((next) => {
                next.searchParams.delete('code');
                return next;
            });
        })
    }

    if (!status) {
        return fallback
    }

    return <>{children}</>
}
