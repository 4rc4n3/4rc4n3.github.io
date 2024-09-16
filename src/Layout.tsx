import * as React from "react";
import {PropsWithChildren} from "react";
import {Navigation, Router} from "@toolpad/core";
import {AppProvider} from "@toolpad/core/AppProvider";
import {logo} from "./svg";
import {signInWithRedirect, signOut, useAuth} from "./auth";
import DashboardIcon from "@mui/icons-material/Dashboard";
import {styled} from "@mui/material";
import {theme} from "./theme";
import {useQuery} from "@tanstack/react-query";
import {UserDTO} from "./dto";

const NAVIGATION: Navigation = [
    {
        segment: 'home',
        title: 'Home',
        icon: <DashboardIcon/>,
    },
];

const Logo = styled('img')(() => ({
    maxWidth: '100%',
    objectFit: 'contain'
}))

export const Layout = ({children}: PropsWithChildren<{}>) => {
    const auth = useAuth();
    const {data, isLoading} = useQuery<UserDTO, void>({
        queryKey: ['https://api.github.com', 'user'],
        enabled: auth.status,
    });
    const [pathname, setPathname] = React.useState('/home');

    const router = React.useMemo<Router>(() => {
        return {
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path) => setPathname(String(path)),
        };
    }, [pathname]);

    return <AppProvider
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
}
