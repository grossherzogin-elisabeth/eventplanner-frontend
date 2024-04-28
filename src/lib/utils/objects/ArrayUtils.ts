export class ArrayUtils {
    public static filterDuplicates<T>(value: T, index: number, array: T[]): boolean {
        return array.indexOf(value) === index;
    }

    public static filterUndefined<T>(item: T | undefined): item is T {
        return !!item;
    }

    public static findEntryWithKey<T extends { key: K }, K>(array: T[], key: K): T | undefined {
        return array.find((it) => it.key === key);
    }

    public static flatten<T>(twoDimensional: T[][]): T[] {
        return twoDimensional.reduce((r, t) => r.concat(t), new Array<T>());
    }

    public static reduceFlatten<T>(result: T[], current: T[]): T[] {
        if (!result) {
            return current || [];
        }
        return result.concat(current);
    }
}
