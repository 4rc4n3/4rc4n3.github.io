import {DatePicker, DatePickerProps, DatePickerSlotProps, PickerValidDate} from "@mui/x-date-pickers";
import {useRange} from "./use";
import {PageContainerToolbar} from "@toolpad/core";
import {DateTime, Interval} from "luxon";
import * as React from "react";

const fieldProps: any = {
    size: 'small',
}

export const DatePickerToolbar = <TEnableAccessibleFieldDOMStructure extends boolean = false>(
    {
        slotProps: _slotProps,
        ...props
    }: Omit<DatePickerProps<PickerValidDate, TEnableAccessibleFieldDOMStructure>, 'value' | 'onChange'>
) => {
    const {value, push} = useRange();

    const slotProps: DatePickerSlotProps<PickerValidDate, TEnableAccessibleFieldDOMStructure> = {
        field: fieldProps,
        ..._slotProps
    }

    return <PageContainerToolbar>
        <DatePicker<PickerValidDate, TEnableAccessibleFieldDOMStructure>
            label="Period"
            view="month"
            views={['month']}
            value={value?.start ?? null}
            slotProps={slotProps}
            onChange={(value) => {
                push((url) => {
                    if (value?.isValid) {
                        const start = value.startOf('month')
                        const end = DateTime.min(start.endOf('month'), DateTime.now().startOf('day'));
                        const range = Interval.fromDateTimes(start, end);
                        if (range) {
                            url.searchParams.set('range', range.toISODate());
                        }
                    } else {
                        url.searchParams.delete('range');
                    }

                    return url;
                })
            }}
            {...props}
        />
    </PageContainerToolbar>
}
