import createPalette from "@mui/material/styles/createPalette";
import {createTheme} from "@mui/material/styles";
import {styled, typographyClasses} from "@mui/material";
import {logo} from "./svg";
import * as React from "react";
import {AppProvider, AppProviderProps} from "@toolpad/core";

const palette = createPalette({
    mode: 'dark',
    primary: {
        main: '#BB86FC'
    },
    secondary: {
        main: '#03DAC5'
    },
    error: {
        main: '#CF6679'
    }
})

export const theme = createTheme({
    palette: palette,
    colorSchemes: {
        dark: true,
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 600,
            lg: 1200,
            xl: 1536,
        },
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    [`.${typographyClasses.h6}`]: {
                        fontWeight: 300,
                        fontSize: 32,
                        letterSpacing: -3,
                    }
                }
            }
        }
    }
});

const Logo = styled('img')(() => ({
    maxWidth: '100%',
    objectFit: 'contain'
}))

export const BrandedProvider = ({children}: Omit<AppProviderProps, 'branding' | 'theme'>) => <AppProvider
    branding={{
        logo: <Logo src={logo} alt="C0N9U17"/>,
        title: 'CONDUIT',
    }}
    theme={theme}>{children}</AppProvider>
