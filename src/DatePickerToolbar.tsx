import {DatePicker, DatePickerProps, DatePickerSlotProps, PickerValidDate} from "@mui/x-date-pickers";
import {useRange} from "./use";
import {PageContainerToolbar} from "@toolpad/core";
import {Interval} from "luxon";
import * as React from "react";

const fieldProps = {
    size: 'small',
} as DatePickerSlotProps<PickerValidDate, true>['field']

export const DatePickerToolbar = ({shouldDisableMonth, disabled}: Pick<DatePickerProps<PickerValidDate>, 'shouldDisableMonth' | 'disabled'>) => {
    const {value, push} = useRange();

    return <PageContainerToolbar>
        <DatePicker
            label="Period"
            view="month"
            views={['month']}
            value={value?.start ?? null}
            shouldDisableMonth={shouldDisableMonth}
            disabled={disabled}
            slotProps={{
                field: fieldProps
            }}
            onChange={(value) => {
                push((url) => {
                    if (value?.isValid) {
                        url.searchParams.set('range', Interval.after(value.startOf('month'), {months: 1}).toISODate());
                    } else {
                        url.searchParams.delete('range');
                    }

                    return url;
                })
            }}
        />
    </PageContainerToolbar>
}
