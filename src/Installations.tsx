import {InstallationsDTO, MetricsDTO, RepositoriesDTO, UsageDTO} from "./dto";
import {useQuery} from "@tanstack/react-query";
import {Loader} from "./Loader";
import {Box, Button, Stack, Table, TableBody, TableCell, TableFooter, TableHead, TableRow} from "@mui/material";
import {OpenInNew} from "@mui/icons-material";
import * as React from "react";

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
        queryKey: ['aws', 'usage', new URLSearchParams(repositories.map((repository) => ['repository', repository]))],
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
                <TableRow>
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
                </TableRow>
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
                <TableRow>
                    <TableCell>
                        Total
                    </TableCell>
                    <TableCell>
                        {getNumIntl(Total.Unit).format(Total.Amount)}
                    </TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    </Box>)}</Stack>
}

const Installation = ({id}: { id: number }) => {
    const {data: repositories, isLoading} = useQuery<RepositoriesDTO, void, string[]>({
        queryKey: ['github', 'user', 'installations', id, 'repositories'],
        select: (data) => data.repositories.map(({full_name}) => full_name)
    });

    if (isLoading) {
        return <Loader/>
    }

    return <Usage repositories={repositories}/>
}

export const Installations = () => {
    const {data, isLoading} = useQuery<InstallationsDTO>({
        queryKey: ['github', 'user', 'installations']
    });

    if (isLoading) {
        return <Loader/>
    }

    return <Stack>
        {data?.installations.map(({id}) => <Installation key={id} id={id}/>)}
    </Stack>
}
