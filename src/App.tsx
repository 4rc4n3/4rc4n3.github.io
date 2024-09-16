import * as React from 'react';
import {Auth} from "./auth";
import {QueryClientProvider} from "./data";
import {Layout} from "./Layout";
import {DashboardLayout} from "@toolpad/core";
import {Installations} from "./Installations";

export const App = () => (
    <QueryClientProvider>
        <Auth>
            <Layout>
                <DashboardLayout>
                    <Installations/>
                </DashboardLayout>
            </Layout>
        </Auth>
    </QueryClientProvider>
);
