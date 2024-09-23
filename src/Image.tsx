import {generateUtilityClasses} from "@mui/material";
import {styled} from "@mui/material/styles";

export const imageClasses = generateUtilityClasses('Image', ['root']);

export const Image = styled('img', {
    name: 'Image',
    slot: 'root',
})(() => ({
    maxWidth: '100%',
    minHeight: '100%',
    objectFit: 'contain',
}))
