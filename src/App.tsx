import * as React from 'react';
import {createTheme} from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import {AppProvider} from '@toolpad/core/AppProvider';
import {DashboardLayout} from '@toolpad/core/DashboardLayout';
import {Navigation, Router} from '@toolpad/core';
import logo from './logo.png';
import createPalette from "@mui/material/styles/createPalette";
import {Auth} from "./auth";
import {useQuery} from "@tanstack/react-query";
import {Loader} from "./Loader";
import {InstallationsDTO, MetricsDTO, RepositoriesDTO, UsageDTO} from "./dto";
import {Box, Button, Stack, Table, TableBody, TableCell, TableFooter, TableHead, TableRow} from "@mui/material";
import {OpenInNew} from "@mui/icons-material";
import {QueryClientProvider} from "./data";

const NAVIGATION: Navigation = [
    {
        segment: 'home',
        title: 'Home',
        icon: <DashboardIcon/>,
    },
];

const palette = createPalette({
    mode: 'dark',
    primary: {
        main: '#BB86FC'
    },
    secondary: {
        main: '#03DAC5'
    },
    error: {
        main: '#CF6679'
    }
})

const theme = createTheme({
    palette: palette,
    colorSchemes: {
        dark: true,
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
});

interface UsageEntry extends MetricsDTO {
    Repository: string;
    Start: Date;
    End: Date;
}

interface RepositoryUsage {
    Repository: string;
    Total: {
        Amount: number;
        Unit: string;
    };
    Entries: UsageEntry[];
}

const dateIntl = new Intl.DateTimeFormat(navigator.language, {
    dateStyle: 'long',
})

const getNumIntl = (() => {
    const cache = new Map<string, Intl.NumberFormat>()

    return (currency: string) => {
        const intl = cache.get(currency) || new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency
        });
        cache.set(currency, intl)

        return intl
    }
})()

const Usage = ({repositories = []}: { repositories?: string[] }) => {
    const {data, isLoading} = useQuery<UsageDTO, void, RepositoryUsage[]>({
        queryKey: ['https://tvnwtesaytwqtvuzpw3pvsfbqi0lxlzt.lambda-url.us-east-1.on.aws', new URLSearchParams(repositories.map((repository) => ['repository', repository]))],
        select: (data) => {
            const groups: Record<string, RepositoryUsage> = {}

            for (const {Groups, TimePeriod} of data.ResultsByTime) {
                for (const {Metrics, Keys} of Groups) {
                    const [key] = Keys;
                    const [, Repository] = key.split('$');
                    if (!groups[Repository]) {
                        groups[Repository] = {
                            Repository,
                            Total: {
                                Amount: 0,
                                Unit: Metrics.UnblendedCost.Unit
                            },
                            Entries: []
                        }
                    }
                    groups[Repository].Entries.push({
                        Repository,
                        Start: new Date(TimePeriod.Start),
                        End: new Date(TimePeriod.End),
                        ...Metrics
                    })
                    groups[Repository].Total.Amount += parseFloat(Metrics.UnblendedCost.Amount)
                }
            }

            return Object.values(groups)
        }
    })

    if (isLoading) {
        return <Loader/>
    }

    return <Stack p={4}>{data?.map(({Repository, Entries, Total}) => <Box key={Repository}>
        <Table>
            <TableHead>
                <TableCell>
                    <Box m={-1}>
                        <Button
                            href={`https://github.com/${Repository}`}
                            target="_blank"
                            variant="text"
                            endIcon={<OpenInNew/>}
                        >{Repository}</Button>
                    </Box>
                </TableCell>
                <TableCell>Cost</TableCell>
            </TableHead>
            <TableBody>
                {Entries.map(
                    ({Start, End, UnblendedCost}) => <TableRow key={`${Start}${End}`}>
                        <TableCell>{dateIntl.formatRange(Start, End)}</TableCell>
                        <TableCell>{getNumIntl(UnblendedCost.Unit).format(parseFloat(UnblendedCost.Amount))}</TableCell>
                    </TableRow>
                )}
            </TableBody>
            <TableFooter>
                <TableCell>
                    Total
                </TableCell>
                <TableCell>
                    {getNumIntl(Total.Unit).format(Total.Amount)}
                </TableCell>
            </TableFooter>
        </Table>
    </Box>)}</Stack>
}

const Installation = ({id}: { id: number }) => {
    const {data: repositories, isLoading} = useQuery<RepositoriesDTO, void, string[]>({
        queryKey: ['https://api.github.com', 'user', 'installations', id, 'repositories'],
        select: (data) => data.repositories.map(({full_name}) => full_name)
    });

    if (isLoading) {
        return <Loader/>
    }

    return <Usage repositories={repositories}/>
}

function Installations() {
    const {data, isLoading} = useQuery<InstallationsDTO>({
        queryKey: ['https://api.github.com', 'user', 'installations']
    });

    if (isLoading) {
        return <Loader/>
    }

    return <Stack>
        {data?.installations.map(({id}) => <Installation key={id} id={id}/>)}
    </Stack>
}

export const App = () => {
    const [pathname, setPathname] = React.useState('/home');

    const router = React.useMemo<Router>(() => {
        return {
            pathname,
            searchParams: new URLSearchParams(),
            navigate: (path) => setPathname(String(path)),
        };
    }, [pathname]);

    return (
        <AppProvider
            navigation={NAVIGATION}
            branding={{
                logo: <img src={logo} alt="C0N9U17" style={{maxWidth: '100%'}}/>,
                title: 'CONDUIT'
            }}
            router={router}
            theme={theme}
        >
            <Auth>
                <QueryClientProvider>
                    <DashboardLayout>
                        <Installations/>
                    </DashboardLayout>
                </QueryClientProvider>
            </Auth>
        </AppProvider>
    );
}
