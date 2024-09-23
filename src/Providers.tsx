import * as React from "react";
import {PropsWithChildren, Suspense, useEffect} from "react";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterLuxon} from '@mui/x-date-pickers/AdapterLuxon'
import {Navigation, NavigationPageItem} from "@toolpad/core";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {logo} from "./assets";
import {theme} from "./theme";
import {QueryClientProvider, signInWithRedirect, signOut, useAuth, UserDTO} from "./api";
import {AppProvider} from "@toolpad/core/AppProvider";
import {useQuery} from "@tanstack/react-query";
import {Auth} from "./Auth";
import {SignIn} from "./SignIn";
import {useRouter, ensureURL} from "./use";
import {Loader} from "./Loader";
import {Image} from "./Image";
import {appBarClasses} from "@mui/material";

const NAVIGATION: Navigation = [
    {
        segment: 'dashboard',
        title: 'Dashboard',
        kind: 'page',
        icon: <DashboardIcon/>,
    },
];

const routes = NAVIGATION.filter((item): item is NavigationPageItem => item.kind === 'page').map((item) => `/${item.segment}`)

const ensureRoute = (path: URL | string): URL => {
    const url = ensureURL(path);
    return routes.includes(url.pathname) ? url : new URL(routes[0], window.location.origin)
}

const Layout = ({children}: PropsWithChildren<{}>) => {
    const auth = useAuth();
    const {data} = useQuery<UserDTO, void>({
        queryKey: ['github', 'user'],
        enabled: auth.status,
    });

    const router = useRouter('/dashboard');

    useEffect(() => {
        const ensured = ensureRoute(router.pathname);

        if (ensured.pathname !== router.pathname) {
            router.navigate(ensured);
        }
    }, [router.pathname, router.navigate]);

    return <LocalizationProvider dateAdapter={AdapterLuxon}>
        <AppProvider
            navigation={NAVIGATION}
            branding={{
                logo: <Image src={logo} sx={(theme) => ({
                    [`:not(.${appBarClasses.root} &)`]: {
                        filter: `drop-shadow(5px 5px 0px ${theme.palette.primary.main})`
                    }
                })} alt="CONDUIT"/>,
                title: 'CONDUIT',
            }}
            router={router}
            theme={theme}
            session={{
                user: {
                    id: `${data?.id}`,
                    name: data?.name,
                    image: data?.avatar_url,
                    email: data?.email,
                },
            }}
            authentication={{
                signIn: signInWithRedirect,
                signOut,
            }}
        >
            {children}
        </AppProvider>
    </LocalizationProvider>
}

export const Providers = ({children}: PropsWithChildren<{}>) => <QueryClientProvider>
    <Layout>
        <Suspense fallback={<Loader/>}>
            <Auth fallback={<SignIn/>}>{children}</Auth>
        </Suspense>
    </Layout>
</QueryClientProvider>
