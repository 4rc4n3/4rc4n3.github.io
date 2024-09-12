import {QueryClient, QueryClientProvider as _QueryClientProvider, QueryKey} from "@tanstack/react-query";
import React, {ReactNode} from "react";
import {tokenProvider} from "./auth";

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
    url: new URL(`${origin}`),
    body: undefined
});

const client = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
            queryFn: async ({queryKey, meta}) => {
                const {url, body} = serializeQueryKey(queryKey);

                const auth = await tokenProvider.getAuth();

                return fetch(url, {
                    body,
                    method: meta?.method || 'GET',
                    headers: {
                        Authorization: `Bearer ${auth.access.value}`
                    }
                }).then((res) => res.json())
            }
        },
    },
});

export const QueryClientProvider = ({children}: { children: ReactNode }) => <_QueryClientProvider
    client={client}>{children}</_QueryClientProvider>
