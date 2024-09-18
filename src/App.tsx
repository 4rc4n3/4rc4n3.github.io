import * as React from 'react';
import {DashboardLayout} from "@toolpad/core";
import {Installations} from "./Installations";
import {Providers} from "./Providers";

export const App = () => (
    <Providers>
        <DashboardLayout>
            <Installations/>
        </DashboardLayout>
    </Providers>
);
