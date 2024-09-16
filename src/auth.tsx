import {BehaviorSubject, firstValueFrom} from "rxjs";
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {Loader} from "./Loader";
import {SignIn} from "./SignIn";
import {API} from "./config";

declare module '@tanstack/react-query' {
    interface Register {
        queryMeta: {
            method?: RequestInit['method'];
        }
    }
}

const CLIENT_ID = 'Iv1.2a5ef27cea16aaca';
const REDIRECT_URI = window.location.origin;

interface Token {
    value: string;
    expires: number;
}

interface AuthDTO {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    refresh_token_expires_in: number;
    scope: string;
    token_type: 'bearer';
}

interface Auth {
    access: Token;
    refresh: Token;
}

const convertToAuth = ({access_token, expires_in, refresh_token, refresh_token_expires_in}: AuthDTO): Auth => ({
    access: {
        value: access_token,
        expires: Date.now() + expires_in * 1000
    },
    refresh: {
        value: refresh_token,
        expires: Date.now() + refresh_token_expires_in * 1000
    }
});

const refresh = (refresh_token: string) => fetch(`${API.aws.origin}/login/oauth/access_token?grant_type=refresh_token&refresh_token=${refresh_token}`, {
    method: 'POST'
}).then(res => res.json()).then(convertToAuth);

const access = (code: string) => fetch(`${API.aws.origin}/login/oauth/access_token?code=${code}&redirect_uri=${REDIRECT_URI}`, {
    method: 'POST'
}).then(res => res.json()).then(convertToAuth);

class Authority extends BehaviorSubject<Auth> {
    static readonly defaultState = {
        access: {
            value: '',
            expires: 0
        },
        refresh: {
            value: '',
            expires: 0
        }
    };

    constructor(key: string) {
        super(JSON.parse(localStorage.getItem(key) || 'null') || Authority.defaultState);
        this.subscribe((auth) => {
            localStorage.setItem(key, JSON.stringify(auth));
        });
    }

    async authorize<T>(fn: (auth: Auth) => T) {
        const auth = await this.getAuth();
        try {
            return fn(auth);
        } catch (e) {
            return fn(await this.refresh(auth));
        }
    }

    async refresh(auth: Auth) {
        if (auth.refresh.expires > Date.now()) {
            return refresh(auth.refresh.value).then((auth) => {
                this.next(auth);

                return auth;
            })
        }

        return Promise.reject(Error('Not authenticated'))
    }

    async getAuth() {
        return firstValueFrom(this).then(((auth) => {
            if (auth.access.expires > Date.now()) {
                return auth;
            }

            return this.refresh(auth);
        }))
    }

    clear() {
        this.next(Authority.defaultState);
    }
}

export const authority = new Authority('gh-auth');

export const signInWithRedirect = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`
}

export const signOut = () => {
    authority.clear();
}

export const useAuth = () => {
    const [state, setState] = useState<Auth>({
        access: {
            value: '',
            expires: 0
        },
        refresh: {
            value: '',
            expires: 0
        }
    });

    useEffect(() => {
        const subscription = authority.subscribe(setState);

        return () => {
            subscription.unsubscribe();
        }
    }, []);

    return {
        state,
        status: state.access.expires > Date.now(),
    }
}

export const Auth = ({children}: { children: ReactNode }) => {
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
        return <SignIn/>
    }

    return <>{children}</>
}
