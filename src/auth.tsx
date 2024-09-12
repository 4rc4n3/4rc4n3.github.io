import {SignInPage} from "@toolpad/core";
import {BehaviorSubject, firstValueFrom} from "rxjs";
import React, {ReactNode, useEffect, useMemo, useState} from "react";
import {Loader} from "./Loader";

declare module '@tanstack/react-query' {
    interface Register {
        queryMeta: {
            method?: RequestInit['method'];
        }
    }
}

const CLIENT_ID = 'Iv1.2a5ef27cea16aaca';
const REDIRECT_URI = window.location.origin;

export const signInWithRedirect = () => {
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`
}

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

const GH_AUTH_URL = 'https://7rvizobdjs7gx3ygmd5fi5lcwe0pnvey.lambda-url.us-east-1.on.aws';

const refresh = (refresh_token: string) => fetch(`${GH_AUTH_URL}/login/oauth/access_token?grant_type=refresh_token&refresh_token=${refresh_token}`, {
    method: 'POST'
}).then(res => res.json()).then(convertToAuth);

const access = (code: string) => fetch(`${GH_AUTH_URL}/login/oauth/access_token?code=${code}&redirect_uri=${REDIRECT_URI}`, {
    method: 'POST'
}).then(res => res.json()).then(convertToAuth);

class TokenProvider extends BehaviorSubject<Auth> {
    constructor(init: Auth = TokenProvider.stored) {
        super(init);
        this.subscribe((auth) => {
            localStorage.setItem('gh-auth', JSON.stringify(auth));
        });
    }

    static get stored() {
        return JSON.parse(localStorage.getItem('gh-auth') || 'null') || {
            access: {
                value: '',
                expires: 0
            },
            refresh: {
                value: '',
                expires: 0
            }
        };
    }

    store(auth: Auth) {
        this.next(auth);
    }

    async getAuth() {
        return firstValueFrom(this).then(((auth) => {
            if (auth.access.expires > Date.now()) {
                return auth;
            }

            if (auth.refresh.expires > Date.now()) {
                return refresh(auth.refresh.value).then((auth) => {
                    this.store(auth);

                    return auth;
                })
            }

            return Promise.reject(Error('Not authenticated'))
        }))
    }
}

export const tokenProvider = new TokenProvider();

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
        const subscription = tokenProvider.subscribe(setState);

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
                tokenProvider.store(data);
            }).finally(() => {
                setLoading(false);
            });
        } else {
            setLoading(false);
        }
    }, [code]);

    if (!auth.status) {
        return <SignInPage signIn={() => {
            return signInWithRedirect();
        }} providers={[{
            id: 'github',
            name: 'GitHub',
        }]}/>
    }

    if (loading) {
        return <Loader/>
    }

    return <>{children}</>
}
