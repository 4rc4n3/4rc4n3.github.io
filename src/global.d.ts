import {DatePickerProps, PickerValidDate} from "@mui/x-date-pickers";

declare module '@toolpad/core/PageContainer/PageContainerToolbar' {
    export interface PageContainerToolbarProps {
        shouldDisableMonth?: DatePickerProps<PickerValidDate>['shouldDisableMonth']
    }
}
