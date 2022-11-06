import doing from "../utils/doing";
import "../utils/polyfills";

export function isObject(value: unknown | undefined): value is object {
    return typeof value === "object" && !isArray(value) && value !== null;
}

export function isString(value: unknown | undefined): value is string {
    return typeof value === "string" || value instanceof String;
}

export function isNumber(value: unknown | undefined): value is number {
    return !isNaN(value as number);
}

export function isArray(value: unknown | undefined): value is any[] {
    return Array.isArray(value);
}

export function isBoolean(value: unknown | undefined): value is boolean {
    return typeof value === "boolean";
}

export function prop<TObj extends object, T>(obj: TObj, key: keyof TObj, coerce: (v: unknown) => T, defaultValue: T | undefined = undefined): T {
    if (!(key in obj)) {
        if (defaultValue === undefined) {
            throw new Error(`Missing required property "${key.toString()}".`);
        }
        return defaultValue;
    }
    return doing(`parsing property "${key.toString()}"`, () => coerce(obj[key]));
}

export function map<TIn, TOut>(array: readonly TIn[], f: (v: TIn, i: number) => TOut): readonly TOut[] {
    return array.map((v, i) => doing(`processing element with index "${i}"`, () => f(v, i)));
}

export function coerceBoolean(value: unknown): boolean {
    if (!isBoolean(value)) {
        throw new Error("Not a boolean.");
    }
    return value as boolean;
}

export function coerceNumber(value: unknown, min: number = -Infinity, max: number = Infinity): number {
    if (!isNumber(value)) {
        throw new Error("Not a number.");
    }
    const num = value as number;
    if (!isFinite(num)) {
        throw new Error("Number is infinite.");
    }
    if (num < min || num > max) {
        throw new Error(`Number not in range [${min}, ${max}].`);
    }
    return num;
}

export function coerceString(value: unknown, regex: RegExp | undefined = undefined): string {
    if (!isString(value)) {
        throw new Error("Expected a string.");
    }
    const str = value as string;
    if (regex !== undefined && !regex.test(str)) {
        throw new Error("Invalid pattern.");
    }
    return str;
}

export function coerceObjectOptProps<TProps extends readonly string[]>(obj: object, keys: TProps): { readonly [key in TProps[number]]?: unknown } {
    for (const key in obj) {
        if (keys.indexOf(key) === -1) {
            throw new Error(`Unexpected property "${key}" in object.`);
        }
    }
    return obj as { readonly [key in TProps[number]]?: unknown };
}

export function coerceObjectReqProps<TProps extends readonly string[]>(obj: object, keys: TProps): { readonly [key in TProps[number]]: unknown } {
    for (const key of keys) {
        if (!(key in obj)) {
            throw new Error(`Missing property "${key}" in object.`);
        }
    }
    return obj as { readonly [key in TProps[number]]: unknown };
}

export function coerceObject<TOpt extends readonly string[], TReq extends string[]>(value: unknown, optionalProperties: TOpt, requiredProperties: TReq): { readonly [key in TReq[number]]: unknown } & { readonly [key in TOpt[number]]?: unknown };
export function coerceObject<TReq extends readonly string[]>(value: unknown, requiredProperties: TReq, allKw: "all"): { readonly [key in TReq[number]]: unknown };
export function coerceObject<TReq extends readonly string[]>(value: unknown, anyKw: "any", exactProperties: TReq): { readonly [key in TReq[number]]: unknown };
export function coerceObject<TReq extends readonly string[]>(value: unknown, exactProperties: TReq): { readonly [key in TReq[number]]: unknown };
export function coerceObject(value: unknown): object;

export function coerceObject(value: unknown, properties: readonly string[] | "any" = "any", requiredProperties: readonly string[] | "all" = "all"): object {
    if (!isObject(value)) {
        throw new Error("Not an object.");
    }
    const obj = value as object;
    if (properties !== "any") {
        coerceObjectOptProps(obj, requiredProperties === "all" ? properties : properties.concat(requiredProperties));
    }
    if (requiredProperties !== "all") {
        coerceObjectReqProps(obj, requiredProperties);
    }
    else if (properties !== "any") {
        coerceObjectReqProps(obj, properties);
    }
    return obj;
}

export function coerceArray(value: unknown, minLength: number = 0, maxLength: number = Infinity): unknown[] {
    if (!isArray(value)) {
        throw new Error("Not an array.");
    }
    const array = value as unknown[];
    if (array.length < minLength || array.length > maxLength) {
        if (minLength == maxLength) {
            throw new Error(`Array length is not ${minLength}.`);
        }
        else {
            throw new Error(`Array length not in range [${minLength}, ${maxLength}].`);
        }
    }
    return array;
}

export function coerceEnum<TEnums extends string[]>(value: unknown, entries: TEnums): TEnums[number] {
    const str = coerceString(value);
    if (entries.indexOf(str as TEnums[number]) === -1) {
        throw new Error(`"${str}" not in ${entries}.`);
    }
    return str as TEnums[number];
}
