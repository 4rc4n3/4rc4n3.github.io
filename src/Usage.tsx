import {MetricsDTO, UsageDTO} from "./api";
import {Interval} from "luxon";
import {getNumIntl, invariant} from "./util";
import {useInterval} from "./use";
import {useQuery} from "@tanstack/react-query";
import {Loader} from "./Loader";
import {PageContainer} from "@toolpad/core";
import {DatePickerToolbar} from "./DatePickerToolbar";
import {
    CardHeader,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TableRow
} from "@mui/material";
import {GitHub, OpenInNew} from "@mui/icons-material";
import * as React from "react";

interface UsageEntry extends MetricsDTO {
    Repository: string;
    Service: string;
}

interface RepositoryUsage {
    Repository: string;
    Total: {
        Amount: number;
        Unit: string;
    };
    Interval: Interval<true>;
    Entries: UsageEntry[];
}

const selectUsage = (data: UsageDTO) => {
    const groups: Record<string, Record<string, RepositoryUsage>> = {}

    for (const {Groups, TimePeriod} of data.ResultsByTime) {
        for (const {Metrics, Keys} of Groups) {
            const [Owner, Service] = Keys;
            const [, Repository] = Owner.split('$');
            if (!groups[Repository]) {
                groups[Repository] = {}
            }
            const interval = Interval.fromDateTimes(TimePeriod.Start, TimePeriod.End)
            invariant(interval.isValid, 'Invalid interval');

            const date = interval.toISODate();

            const Record = groups[Repository][date] || {
                Repository,
                Total: {
                    Amount: 0,
                    Unit: Metrics.UnblendedCost.Unit
                },
                Interval: interval,
                Entries: []
            }

            groups[Repository][date] = Record

            Record.Entries.push({
                Repository,
                Service,
                ...Metrics
            })
            Record.Total.Amount += parseFloat(Metrics.UnblendedCost.Amount)
        }
    }

    return Object.values(groups).flatMap((group) => Object.values(group))
}

export const Usage = ({repositories = []}: { repositories?: string[] }) => {
    const {interval} = useInterval()
    const {data, isLoading} = useQuery<UsageDTO, void, RepositoryUsage[]>({
        queryKey: ['aws', 'usage', new URLSearchParams(repositories.map((repository) => ['repository', repository]))],
        select: selectUsage,
    })

    if (isLoading) {
        return <Loader/>
    }

    return <PageContainer slotProps={{
        toolbar: {
            shouldDisableMonth: (month) => !data?.some(({Interval}) => Interval.contains(month))
        }
    }} slots={{toolbar: DatePickerToolbar}}>

        {data?.filter(
            ({
                 Interval
             }) => interval.overlaps(Interval)
        ).map(({Repository, Entries, Total}) =>
            <Stack>
                <CardHeader avatar={<GitHub/>} title={Repository} titleTypographyProps={{
                    variant: 'h6',
                    flex: 1,
                }} action={
                    <IconButton
                        color="primary"
                        href={`https://github.com/${Repository}`}
                        target="_blank"
                    >
                        <OpenInNew/>
                    </IconButton>
                }
                />
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Service</TableCell>
                                <TableCell>Cost</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Entries.map(
                                ({Service, UnblendedCost}) => <TableRow key={Service}>
                                    <TableCell>{Service}</TableCell>
                                    <TableCell>{getNumIntl(UnblendedCost.Unit).format(parseFloat(UnblendedCost.Amount))}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                        <TableFooter>
                            <TableRow sx={{'&:last-of-type td, &:last-of-type th': {border: 0}}}>
                                <TableCell variant="footer">
                                    Total
                                </TableCell>
                                <TableCell variant="footer">
                                    {getNumIntl(Total.Unit).format(Total.Amount)}
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Stack>
        )}
    </PageContainer>
}
