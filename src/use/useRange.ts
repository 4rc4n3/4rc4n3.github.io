import {useMemo} from "react";
import {Interval} from "luxon";
import {useLocation} from "./useLocation";
import {invariant} from "../util";

export const useRange = () => {
    const {searchParams, replace, push} = useLocation();

    const value = useMemo(() => {
        const value = searchParams.get('range');
        const range = value ? Interval.fromISO(value) : null;

        if (range) {
            invariant(range.isValid, 'Invalid range');
        }
        return range;
    }, [searchParams]);

    return {
        value,
        push,
        replace
    }
}
