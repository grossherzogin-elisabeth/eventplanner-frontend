export class MapUtils {
    public static convertRecordToMap<K extends string, V>(record: Record<K, V>): Map<K, V> {
        const map = new Map<K, V>();
        Object.entries(record).forEach(([k, v]) => map.set(k as K, v as V));
        return map;
    }

    public static convertMapToRecord<K extends string, V>(map: Map<K, V>): Record<K, V> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const record: any = {};
        map.forEach((k, v) => (record[k] = v));
        return record as Record<K, V>;
    }
}
