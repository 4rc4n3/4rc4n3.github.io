import {SignInPage} from "@toolpad/core";
import React from "react";
import {signInWithRedirect} from "./auth";
import {Layout} from "./Layout";

export const SignIn = () => <Layout>
    <SignInPage signIn={() => {
        return signInWithRedirect();
    }} providers={[{
        id: 'github',
        name: 'GitHub',
    }]}/>
</Layout>
