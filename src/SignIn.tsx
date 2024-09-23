import {SignInPage, SignInPageProps} from "@toolpad/core";
import React from "react";
import {signInWithRedirect} from "./api";

const providers = [{
    id: 'github',
    name: 'GitHub',
}]

export const SignIn = (props: SignInPageProps) => <SignInPage
    signIn={signInWithRedirect}
    providers={providers}
    {...props}
/>
