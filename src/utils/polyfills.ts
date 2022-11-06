import "@extendscript/aes.patch.array.indexof";
import "@extendscript/aes.patch.array.isarray";
import "@extendscript/aes.patch.array.map";
import "@extendscript/aes.patch.array.every";
import "@extendscript/aes.patch.array.some";
import "@extendscript/aes.patch.object.keys";
import "@extendscript/aes.patch.json";

export type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;

declare global {
    const JSON: {
        parse: (json: string) => object
    };
    interface ArrayConstructor {
        isArray(obj: unknown): boolean,
    }
    interface Array<T> {
        indexOf(val: T): number;
        map<T2>(map: (t: T, i: number) => T2): Array<T2>;
        every(f: (v: T, i: number) => boolean): boolean;
        some(f: (v: T, i: number) => boolean): boolean;
    }
    interface Object {
        keys<T extends object>(obj: object): readonly (keyof T)[];
    }
};