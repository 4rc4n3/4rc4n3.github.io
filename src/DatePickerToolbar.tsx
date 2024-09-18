import {DatePicker, DatePickerProps, DatePickerSlotProps, PickerValidDate} from "@mui/x-date-pickers";
import {useInterval} from "./use";
import {PageContainerToolbar} from "@toolpad/core";
import {Interval} from "luxon";
import * as React from "react";

const fieldProps = {
    size: 'small',
} as DatePickerSlotProps<PickerValidDate, true>['field']

export const DatePickerToolbar = ({shouldDisableMonth}: Pick<DatePickerProps<PickerValidDate>, 'shouldDisableMonth'>) => {
    const {interval, push} = useInterval();

    return <PageContainerToolbar>
        <DatePicker
            label="Period"
            view="month"
            views={['month']}
            value={interval?.start}
            shouldDisableMonth={shouldDisableMonth}
            slotProps={{
                field: fieldProps
            }}
            onChange={(value) => {
                push((url) => {
                    if (value?.isValid) {
                        url.searchParams.set('interval', Interval.after(value.startOf('month'), {months: 1}).toISODate());
                    } else {
                        url.searchParams.delete('interval');
                    }

                    return url;
                })
            }}
        />
    </PageContainerToolbar>
}
