import {MetricsDTO, UsageDTO} from "./api";
import {Interval} from "luxon";
import {getNumIntl, invariant} from "./util";
import {useRange} from "./use";
import {useSuspenseQuery} from "@tanstack/react-query";
import {PageContainer} from "@toolpad/core";
import {DatePickerToolbar} from "./DatePickerToolbar";
import {
    Alert,
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
    TableRow,
    Typography
} from "@mui/material";
import {GitHub, OpenInNew} from "@mui/icons-material";
import * as React from "react";
import {useEffect} from "react";

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
    TimePeriod: Interval<true>;
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
            const range = Interval.fromDateTimes(TimePeriod.Start, TimePeriod.End)
            invariant(range.isValid, 'Invalid range');

            const date = range.toISODate();

            const Record = groups[Repository][date] || {
                Repository,
                Total: {
                    Amount: 0,
                    Unit: Metrics.UnblendedCost.Unit
                },
                TimePeriod: range,
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

export const Usage = () => {
    const {value, replace} = useRange()
    const {data} = useSuspenseQuery<UsageDTO, void, RepositoryUsage[]>({
        queryKey: ['aws', 'usage'],
        select: selectUsage,
    });

    useEffect(() => {
        if (data.length) {
            replace((url) => {
                if (!url.searchParams.has('range')) {
                    url.searchParams.set('range', data[data.length - 1].TimePeriod.toISODate());
                }
                return url;
            })
        }
    }, [data, replace]);

    return <PageContainer slotProps={{
        toolbar: {
            shouldDisableMonth: (month) => !data.some(({TimePeriod}) => TimePeriod.contains(month)),
            disabled: !data.length
        }
    }} slots={{toolbar: DatePickerToolbar}}>
        {!data.length && <Stack sx={{flex: 1}}>
            <Stack sx={{alignItems: 'center', justifyContent: 'center', height: 250}}>
                <Typography variant="h6" color="textDisabled">No usage information available yet.</Typography>
            </Stack>
            <Alert severity="info">Keep in mind that usage may take up to 24 hours to process and appear here.</Alert>
        </Stack>}
        {data.filter(
            ({
                 TimePeriod
             }) => value?.overlaps(TimePeriod)
        ).map(({Repository, Entries, Total}) =>
            <Stack key={Repository}>
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
