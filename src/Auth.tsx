import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {Loader} from "./Loader";
import {access, authority, useAuth} from "./api";

export const Auth = ({children, fallback}: { children: ReactNode; fallback?: ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const code = useMemo(() => new URLSearchParams(window.location.search).get('code'), []);

    const auth = useAuth();

    useEffect(() => {
        if (code) {
            setLoading(true);
            history.replaceState({}, '', window.location.pathname);
            access(code).then((data) => {
                authority.next(data);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [code]);

    if (loading) {
        return <Loader/>
    }

    if (!auth.status) {
        return fallback
    }

    return <>{children}</>
}
