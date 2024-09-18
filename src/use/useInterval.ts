import {useEffect, useMemo} from "react";
import {DateTime, Interval} from "luxon";
import {useLocation} from "./useLocation";
import {invariant} from "../util";

export const useInterval = () => {
    const {searchParams, replace, push} = useLocation();

    const interval = useMemo(() => {
        const value = searchParams.get('interval');
        const interval = value && Interval.fromISO(value) || Interval.after(DateTime.utc().startOf('month'), {months: 1});

        invariant(interval.isValid, 'Invalid interval');
        return interval;
    }, [searchParams])

    useEffect(() => {
        replace((url) => {
            if (!url.searchParams.has('interval')) {
                url.searchParams.set('interval', Interval.after(DateTime.now().startOf('month'), {months: 1}).toISODate());
            }

            return url;
        })

        return () => {
            replace((url) => {
                url.searchParams.delete('interval');
                return url;
            })
        }
    }, [replace]);



    return {
        interval,
        push,
        replace
    }
}
