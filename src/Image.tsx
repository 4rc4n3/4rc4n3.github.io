import {generateUtilityClasses} from "@mui/material";
import {styled} from "@mui/material/styles";
import * as React from "react";
import {DetailedHTMLProps, ImgHTMLAttributes, useRef} from "react";

const sizes = [100, 250, 500, 750, 1000];

export const imageClasses = {
    height: generateUtilityClasses('height', sizes.map(String)),
    width: generateUtilityClasses('width', sizes.map(String)),
}

export const Image = styled((props: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>) => {
    const ref = useRef<HTMLImageElement>(null);
    if (ref.current) {
        const {clientWidth, clientHeight} = ref.current;
        for (const size of sizes) {
            if (clientWidth >= size) {
                ref.current.classList.add(imageClasses.width[size]);
            } else {
                ref.current.classList.remove(imageClasses.width[size]);
            }
            if (clientHeight >= size) {
                ref.current.classList.add(imageClasses.height[size]);
            } else {
                ref.current.classList.remove(imageClasses.height[size]);
            }
        }
    }
    return <img {...props} alt={props.alt || ''} ref={ref}/>
})(() => ({
    maxWidth: '100%',
    minHeight: '100%',
    objectFit: 'contain',
}))
