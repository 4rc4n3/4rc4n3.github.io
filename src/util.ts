export function invariant(condition: any, message: string): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

export const getNumIntl = (() => {
    const cache = new Map<string, Intl.NumberFormat>()

    return (currency: string) => {
        const intl = cache.get(currency) || new Intl.NumberFormat(navigator.language, {
            style: 'currency',
            currency,
        });
        cache.set(currency, intl)

        return intl
    }
})()
