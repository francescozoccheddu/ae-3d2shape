import "../utils/polyfills";

export type Vec2<T> = [T, T];

export type Vec3<T> = [T, T, T];

export type Vec4<T> = [T, T, T, T]

export type Dim = 2 | 3 | 4;

export type Vec<T, TDim extends Dim> = TDim extends 2 ? Vec2<T> : TDim extends 3 ? Vec3<T> : Vec4<T>;

export function fill<T, TDim extends Dim>(v: Vec<T, TDim>, value: T): void {
    for (let d = 0; d < v.length; d++) {
        v[d] = value
    }
}

export function vec<T, TDim extends Dim>(dim: TDim, value: T): Vec<T, TDim> {
    const v = new Array<T>(dim) as Vec<T, TDim>;
    fill(v, value);
    return v;
}

export function clone<T, TDim extends Dim>(v: Readonly<Vec<T, TDim>>): Vec<T, TDim> {
    const res = new Array<T>(v.length) as Vec<T, TDim>;
    for (let d = 0; d < v.length; d++) {
        res[d] = v[d];
    }
    return res;
}

export function addDim<T, TDim extends Dim>(v: Readonly<Vec<T, TDim>>, value: T): TDim extends 2 ? Vec3<T> : Vec4<T> {
    const res = new Array<T>(v.length + 1);
    for (let d = 0; d < v.length; d++) {
        res[d] = v[d];
    }
    res[v.length] = value;
    return res as any;
}

export function remDim<T, TDim extends Dim>(v: Readonly<Vec<T, TDim>>): TDim extends 3 ? Vec2<T> : Vec3<T> {
    const res = new Array<T>(v.length - 1);
    for (let d = 0; d < v.length - 1; d++) {
        res[d] = v[d];
    }
    return res as any;
}

export function map<T, TDim extends Dim, TOut>(v: Readonly<Vec<T, TDim>>, f: (v: T, i: number) => TOut): Vec<TOut, TDim> {
    const res = vec<TOut, TDim>(v.length as TDim, undefined as TOut);
    for (let d = 0; d < v.length; d++) {
        res[d] = f(v[d], d);
    }
    return res;
}

export function combine<TA, TB, TDim extends Dim, TOut>(a: Readonly<Vec<TA, TDim>>, b: Readonly<Vec<TB, TDim>> | TB, f: (a: TA, b: TB) => TOut): Vec<TOut, TDim> {
    const res = vec<TOut, TDim>(a.length as TDim, undefined as TOut);
    for (let d = 0; d < a.length; d++) {
        res[d] = f(a[d], Array.isArray(b) ? (b as TB[])[d] : b as TB);
    }
    return res;
}

export function eq<T, TDim extends Dim>(a: Readonly<Vec<T, TDim>>, b: Readonly<Vec<T, TDim>> | T): Vec<boolean, TDim> {
    return combine(a, b, (a, b) => a == b);
}

export function ne<T, TDim extends Dim>(a: Readonly<Vec<T, TDim>>, b: Readonly<Vec<T, TDim>> | T): Vec<boolean, TDim> {
    return combine(a, b, (a, b) => a != b);
}