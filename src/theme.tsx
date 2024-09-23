import createPalette from "@mui/material/styles/createPalette";
import {createTheme} from "@mui/material/styles";
import {typographyClasses} from "@mui/material";

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
                root: ({theme}) => ({
                    [`.${typographyClasses.h6}`]: {
                        fontWeight: 300,
                        fontSize: 32,
                        letterSpacing: -3,
                        [theme.breakpoints.down('sm')]: {
                            display: 'none'
                        }
                    }
                })
            }
        }
    }
});
