import "./polyfills";
import { Vector } from "./scene";

export type GVec2<T> = [T, T];

export type GVec3<T> = [T, T, T];

export type GVec4<T> = [T, T, T, T]

export type Dim = 2 | 3 | 4;

export type GVec<T, TDim extends Dim> = TDim extends 2 ? GVec2<T> : TDim extends 3 ? GVec3<T> : GVec4<T>;

export type Vec2 = GVec2<number>;

export type Vec3 = GVec3<number>;

export type Vec4 = GVec4<number>;

export type Vec<TDim extends Dim> = GVec<number, TDim>;

export type BVec2 = GVec2<boolean>;

export type BVec3 = GVec3<boolean>;

export type BVec4 = GVec4<boolean>;

export type BVec<TDim extends Dim> = GVec<boolean, TDim>;

export function fromVector(vector: Vector): Vec3 {
    return [vector[0], vector[1], vector[2]];
}

export function fill<T, TDim extends Dim>(v: GVec<T, TDim>, value: T): void {
    for (let d = 0; d < v.length; d++) {
        v[d] = value
    }
}

export function gvec<T, TDim extends Dim>(dim: TDim, value: T): GVec<T, TDim> {
    const v = new Array<T>(dim) as GVec<T, TDim>;
    fill(v, value);
    return v;
}

export function vec<TDim extends Dim>(dim: TDim, value: number = 0): Vec<TDim> {
    const v = new Array<number>(dim) as Vec<TDim>;
    fill(v, value);
    return v;
}

export function clone<T, TDim extends Dim>(v: Readonly<GVec<T, TDim>>): GVec<T, TDim> {
    const res = new Array<T>(v.length) as GVec<T, TDim>;
    for (let d = 0; d < v.length; d++) {
        res[d] = v[d];
    }
    return res;
}

export function addDim<T, TDim extends Dim>(v: Readonly<GVec<T, TDim>>, value: T): TDim extends 2 ? GVec3<T> : GVec4<T> {
    const res = new Array<T>(v.length + 1);
    for (let d = 0; d < v.length; d++) {
        res[d] = v[d];
    }
    res[v.length] = value;
    return res as any;
}

export function remDim<T, TDim extends Dim>(v: Readonly<GVec<T, TDim>>): TDim extends 3 ? GVec2<T> : GVec3<T> {
    const res = new Array<T>(v.length - 1);
    for (let d = 0; d < v.length - 1; d++) {
        res[d] = v[d];
    }
    return res as any;
}

export function map<T, TDim extends Dim, TOut>(v: Readonly<GVec<T, TDim>>, f: (v: T, i: number) => TOut): GVec<TOut, TDim> {
    const res = gvec<TOut, TDim>(v.length as TDim, undefined as TOut);
    for (let d = 0; d < v.length; d++) {
        res[d] = f(v[d], d);
    }
    return res;
}

export function any<TDim extends Dim>(v: Readonly<BVec<TDim>>): boolean {
    for (let d = 0; d < v.length; d++) {
        if (v[d]) {
            return true;
        }
    }
    return false;
}

export function all<TDim extends Dim>(v: Readonly<BVec<TDim>>): boolean {
    for (let d = 0; d < v.length; d++) {
        if (!v[d]) {
            return false;
        }
    }
    return true;
}

export function combine<TA, TB, TDim extends Dim, TOut>(a: Readonly<GVec<TA, TDim>>, b: Readonly<GVec<TB, TDim>> | TB, f: (a: TA, b: TB) => TOut): GVec<TOut, TDim> {
    const res = gvec<TOut, TDim>(a.length as TDim, undefined as TOut);
    for (let d = 0; d < a.length; d++) {
        res[d] = f(a[d], Array.isArray(b) ? (b as TB[])[d] : b as TB);
    }
    return res;
}

export function and<TDim extends Dim>(a: Readonly<BVec<TDim>>, b: Readonly<BVec<TDim>> | boolean): BVec<TDim> {
    return combine(a, b, (a, b) => a && b);
}

export function or<TDim extends Dim>(a: Readonly<BVec<TDim>>, b: Readonly<BVec<TDim>> | boolean): BVec<TDim> {
    return combine(a, b, (a, b) => a || b);
}

export function add<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): Vec<TDim> {
    return combine(a, b, (a, b) => a + b);
}

export function sub<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): Vec<TDim> {
    return combine(a, b, (a, b) => a - b);
}

export function mul<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): Vec<TDim> {
    return combine(a, b, (a, b) => a * b);
}

export function div<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): Vec<TDim> {
    return combine(a, b, (a, b) => a / b);
}

export function lt<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): BVec<TDim> {
    return combine(a, b, (a, b) => a < b);
}

export function gt<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): BVec<TDim> {
    return combine(a, b, (a, b) => a > b);
}

export function le<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): BVec<TDim> {
    return combine(a, b, (a, b) => a <= b);
}

export function ge<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): BVec<TDim> {
    return combine(a, b, (a, b) => a >= b);
}

export function eq<T, TDim extends Dim>(a: Readonly<GVec<T, TDim>>, b: Readonly<GVec<T, TDim>> | T): BVec<TDim> {
    return combine(a, b, (a, b) => a == b);
}

export function ne<T, TDim extends Dim>(a: Readonly<GVec<T, TDim>>, b: Readonly<GVec<T, TDim>> | T): BVec<TDim> {
    return combine(a, b, (a, b) => a != b);
}

export function min<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): Vec<TDim>;

export function min<TDim extends Dim>(a: Readonly<Vec<TDim>>): number;

export function min<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number | undefined = undefined): Vec<TDim> | number {
    if (b === undefined) {
        return Math.min(...a);
    }
    return combine(a, b, Math.min);
}

export function max<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number): Vec<TDim>;

export function max<TDim extends Dim>(a: Readonly<Vec<TDim>>): number;

export function max<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>> | number | undefined = undefined): Vec<TDim> | number {
    if (b === undefined) {
        return Math.max(...a);
    }
    return combine(a, b, Math.max);
}

export function sqrLen<TDim extends Dim>(v: Readonly<Vec<TDim>>): number {
    let res = 0;
    for (let d = 0; d < v.length; d++) {
        res += v[d] * v[d];
    }
    return res;
}

export function len<TDim extends Dim>(v: Readonly<Vec<TDim>>): number {
    return Math.sqrt(sqrLen(v));
}

export function sqrDist<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>>): number {
    return sqrLen(sub(a, b));
}

export function dist<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>>): number {
    return Math.sqrt(sqrDist(a, b));
}

export function sqrDot<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>>): number {
    let res = 0;
    for (let d = 0; d < a.length; d++) {
        res += a[d] * b[d];
    }
    return res;
}

export function dot<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>>): number {
    return Math.sqrt(sqrDot(a, b));
}

export function cross(a: Readonly<Vec3>, b: Readonly<Vec3>): Vec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[0] * b[2] - a[2] * b[0],
        a[0] * b[1] - a[1] * b[0]
    ];
}

export function not<TDim extends Dim>(v: Readonly<BVec<TDim>>): BVec<TDim> {
    return map(v, c => !c);
}

export function neg<TDim extends Dim>(v: Readonly<Vec<TDim>>): Vec<TDim> {
    return map(v, c => -c);
}

export function abs<TDim extends Dim>(v: Readonly<Vec<TDim>>): Vec<TDim> {
    return map(v, c => Math.abs(c));
}

export function isAlmNull<TDim extends Dim>(v: Readonly<Vec<TDim>>, eps: number = 1e-6): BVec<TDim> {
    return map(v, c => Math.abs(c) < eps);
}

export function areAlmEq<TDim extends Dim>(a: Readonly<Vec<TDim>>, b: Readonly<Vec<TDim>>, eps: number = 1e-6): BVec<TDim> {
    return isAlmNull(sub(a, b), eps);
}

export function isFin<TDim extends Dim>(v: Readonly<Vec<TDim>>): BVec<TDim> {
    return map(v, c => isFinite(c));
}

export function homog(v: Readonly<Vec3>): Vec4 {
    return addDim<number, 3>(v, 1);
}

export function nonHomog(v: Readonly<Vec4>): Vec3 {
    return div<3>(remDim<number, 4>(v), v[3]);
}