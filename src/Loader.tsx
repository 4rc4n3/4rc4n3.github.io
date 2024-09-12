import {CircularProgress, Stack} from "@mui/material";
import React from "react";

export const Loader = () => <Stack minHeight={250} alignItems="center" justifyContent="center" width="100%" height="100%">
    <CircularProgress />
</Stack>
