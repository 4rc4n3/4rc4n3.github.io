import {SignInPage} from "@toolpad/core";
import React from "react";
import {signInWithRedirect} from "./api";

export const SignIn = () => <SignInPage signIn={() => {
    return signInWithRedirect();
}} providers={[{
    id: 'github',
    name: 'GitHub',
}]}/>
