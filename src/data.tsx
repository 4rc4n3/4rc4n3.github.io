import {QueryClient, QueryClientProvider as _QueryClientProvider, QueryKey} from "@tanstack/react-query";
import React, {ReactNode} from "react";
import {authority} from "./auth";
import {API} from "./config";

const isAlias = (origin: unknown): origin is keyof typeof API => typeof origin === 'string' && origin in API

const serializeQueryKey = ([origin, ...queryKey]: QueryKey) => queryKey.reduce((acc: {
    url: URL;
    body?: BodyInit
}, segment) => {
    if (segment instanceof URLSearchParams) {
        acc.url.search = new URLSearchParams(
            [
                ...acc.url.searchParams.entries(),
                ...segment.entries()
            ]
        ).toString();
    } else if (typeof segment === 'object') {
        acc.body = JSON.stringify(segment);
    } else {
        acc.url.pathname = `${acc.url.pathname.replace(/\/$/, '')}/${segment}`;
    }

    return acc;
}, {
    url: new URL(`${isAlias(origin) ? API[origin].origin : origin}`),
    body: undefined
});

const client = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            queryFn: async ({queryKey, meta}) => {
                const {url, body} = serializeQueryKey(queryKey);

                return authority.authorize(
                    ({access}) => fetch(url, {
                        body,
                        method: meta?.method || 'GET',
                        headers: {
                            Authorization: `Bearer ${access.value}`
                        }
                    }).then((res) => res.json())
                )
            }
        },
    },
});

export const QueryClientProvider = ({children}: { children: ReactNode }) => <_QueryClientProvider
    client={client}>{children}</_QueryClientProvider>
