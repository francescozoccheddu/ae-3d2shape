export default function doing<T>(what: string, func: () => T): T {
    try {
        return func();
    } catch (e) {
        throw new Error(`${(e as Error).description}\n(while ${what})`);
    }
}