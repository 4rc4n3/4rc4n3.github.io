import {DatePickerProps, PickerValidDate} from "@mui/x-date-pickers";

declare module '*.png' {
    const value: string;

    export default value;
}

declare module 'jsx:*.svg' {
    import {ComponentType, SVGProps} from "react";
    const value: ComponentType<SVGProps<SVGSVGElement>>;

    export default value;
}

declare module '*.svg' {
    const value: string;

    export default value;
}

declare module '@toolpad/core/PageContainer/PageContainerToolbar' {
    export interface PageContainerToolbarProps {
        shouldDisableMonth?: DatePickerProps<PickerValidDate>['shouldDisableMonth']
    }
}
