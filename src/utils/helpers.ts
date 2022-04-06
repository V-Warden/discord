export function combineRoles(oldRoles: string, newRoles: string) {
    // Takes a delimited role string and combines it, removing dupes
    const wipOldArr = oldRoles.split(';');
    const wipNewArr = newRoles.split(';');
    const combArr = wipOldArr.concat(wipNewArr.filter(item => wipOldArr.indexOf(item) < 0));

    return combArr;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function enumToMap(enumeration: any): Map<string, string | number> {
    const map = new Map<string, string | number>();
    for (const key in enumeration) {
        //TypeScript does not allow enum keys to be numeric
        if (!isNaN(Number(key))) continue;

        const val = enumeration[key] as string | number;

        //TypeScript does not allow enum value to be null or undefined
        if (val !== undefined && val !== null) map.set(key, val);
    }

    return map;
}
