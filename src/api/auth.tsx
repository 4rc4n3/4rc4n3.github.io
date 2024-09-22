import {BehaviorSubject, distinctUntilChanged, firstValueFrom, of, switchMap} from "rxjs";
import {useEffect, useState} from "react";
import {API} from "./config";
import {useMutation, useSuspenseQuery} from "@tanstack/react-query";

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

export const access = (code: string) => fetch(`${API.aws.origin}/login/oauth/access_token?code=${code}&redirect_uri=${REDIRECT_URI}`, {
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

    state = this.pipe(switchMap((auth) => {
        if (auth.access.expires > Date.now()) {
            return of(auth);
        }

        return this.refresh(auth).catch(() => Authority.defaultState);
    }), distinctUntilChanged((a, b) => a.access.value === b.access.value && a.refresh.value === b.refresh.value));

    constructor(key: string) {
        super(JSON.parse(localStorage.getItem(key) || 'null') || Authority.defaultState);
        this.subscribe((auth) => {
            localStorage.setItem(key, JSON.stringify(auth));
        });
    }

    async authorize<T>(fn?: (auth: Auth) => T) {
        const auth = await this.getAuth();
        try {
            return fn?.(auth);
        } catch (e) {
            return fn?.(await this.refresh(auth));
        }
    }

    async refresh(auth: Auth) {
        if (auth.refresh.expires > Date.now()) {
            return refresh(auth.refresh.value).then((auth) => {
                this.next(auth);

                return auth;
            }).catch(() => {
                this.clear();
                return Promise.reject(Error('Not authenticated'))
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
    const [state, setState] = useState<Auth>(authority.getValue());

    const {mutateAsync: login, isPending} = useMutation({
        mutationFn: (code: string) => access(code).then(async (data) => {
            authority.next(data);
            return authority.authorize()
        })
    });

    useEffect(() => {
        const subscription = authority.state.subscribe(setState);

        return () => {
            subscription.unsubscribe();
        }
    }, []);

    useSuspenseQuery({
        queryKey: ['auth'],
        queryFn: () => authority.authorize((auth) => auth).catch(() => Authority.defaultState),
    })

    const status = !isPending && state.access.expires > Date.now();

    return {
        state,
        status,
        isPending: false,
        login,
    }
}

