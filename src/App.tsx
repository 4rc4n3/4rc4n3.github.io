import * as React from 'react';
import {Suspense} from 'react';
import {DashboardLayout} from "@toolpad/core";
import {Providers} from "./Providers";
import {Loader} from "./Loader";
import {Usage} from "./Usage";

export const App = () => (
    <Providers>
        <DashboardLayout>
            <Suspense fallback={<Loader/>}>
                <Usage/>
            </Suspense>
        </DashboardLayout>
    </Providers>
);
