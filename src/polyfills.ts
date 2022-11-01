import "@extendscript/aes.patch.array.indexof";
import "@extendscript/aes.patch.array.isarray";
import "@extendscript/aes.patch.array.map";
import "json-js/json2.js";

declare global {
    const JSON: {
        parse: (json: string) => object
    };
    interface ArrayConstructor {
        isArray(obj: unknown): boolean,
    }
    interface Array<T> {
        indexOf(val: T): number;
        map<T2>(map: (t: T) => T2): Array<T2>;
    }
};