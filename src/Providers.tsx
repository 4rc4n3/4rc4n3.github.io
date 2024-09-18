import * as React from "react";
import {PropsWithChildren, useState} from "react";
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterLuxon} from '@mui/x-date-pickers/AdapterLuxon'
import {Navigation, NavigationPageItem, Router} from "@toolpad/core";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {styled} from "@mui/material";
import {logo} from "./svg";
import {theme} from "./theme";
import {QueryClientProvider, signInWithRedirect, signOut, useAuth, UserDTO} from "./api";
import {AppProvider} from "@toolpad/core/AppProvider";
import {useQuery} from "@tanstack/react-query";
import {Auth} from "./Auth";
import {SignIn} from "./SignIn";

const NAVIGATION: Navigation = [
    {
        segment: 'dashboard',
        title: 'Dashboard',
        kind: 'page',
        icon: <DashboardIcon/>,
    },
];

const routes = NAVIGATION.filter((item): item is NavigationPageItem => item.kind === 'page').map((item) => `/${item.segment}`)

const ensureRoute = (path: URL | string): string => routes.includes(path.toString()) ? path.toString() : routes[0]

const Logo = styled('img')(() => ({
    maxWidth: '100%',
    objectFit: 'contain'
}))

const Layout = ({children}: PropsWithChildren<{}>) => {
    const auth = useAuth();
    const {data} = useQuery<UserDTO, void>({
        queryKey: ['github', 'user'],
        enabled: auth.status,
    });

    const [pathname, setPathname] = useState('/dashboard');

    const router = React.useMemo<Router>(() => {
        return {
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path) => setPathname(ensureRoute(path)),
        };
    }, [pathname]);

    return <LocalizationProvider dateAdapter={AdapterLuxon}>
        <AppProvider
            navigation={NAVIGATION}
            branding={{
                logo: <Logo src={logo} alt="C0N9U17"/>,
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
        <Auth fallback={<SignIn/>}>{children}</Auth>
    </Layout>
</QueryClientProvider>
