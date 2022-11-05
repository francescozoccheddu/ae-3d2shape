import { BVec } from "./bvec";
import { addDim, combine, ConstVec, Dim, fill, map, remDim, Vec, Vec2, Vec3, Vec4 } from "./vec";

export type RVec2 = Vec2<number>;
export type RVec3 = Vec3<number>;
export type RVec4 = Vec4<number>;
export type RVec<TDim extends Dim> = Vec<number, TDim>;
export type ConstRVec<TDim extends Dim> = Readonly<RVec<TDim>>;

export type ConstRVec2 = ConstRVec<2>;
export type ConstRVec3 = ConstRVec<3>;
export type ConstRVec4 = ConstRVec<4>;

export function rvec<TDim extends Dim>(dim: TDim, value: number = 0): RVec<TDim> {
    const v = new Array<number>(dim) as RVec<TDim>;
    fill(v, value);
    return v;
}

export function add<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): RVec<TDim> {
    return combine<number, number, TDim, number>(a, b, (a, b) => a + b);
}

export function sub<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): RVec<TDim> {
    return combine<number, number, TDim, number>(a, b, (a, b) => a - b);
}

export function mul<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): RVec<TDim> {
    return combine<number, number, TDim, number>(a, b, (a, b) => a * b);
}

export function div<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): RVec<TDim> {
    return combine<number, number, TDim, number>(a, b, (a, b) => a / b);
}

export function lt<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): BVec<TDim> {
    return combine<number, number, TDim, boolean>(a, b, (a, b) => a < b);
}

export function gt<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): BVec<TDim> {
    return combine<number, number, TDim, boolean>(a, b, (a, b) => a > b);
}

export function le<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): BVec<TDim> {
    return combine<number, number, TDim, boolean>(a, b, (a, b) => a <= b);
}

export function ge<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): BVec<TDim> {
    return combine<number, number, TDim, boolean>(a, b, (a, b) => a >= b);
}

export function min<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): RVec<TDim>;

export function min<TDim extends Dim>(a: ConstRVec<TDim>): number;

export function min<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number | undefined = undefined): RVec<TDim> | number {
    if (b === undefined) {
        return Math.min(...a);
    }
    return combine(a, b, Math.min);
}

export function max<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number): RVec<TDim>;

export function max<TDim extends Dim>(a: ConstRVec<TDim>): number;

export function max<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim> | number | undefined = undefined): RVec<TDim> | number {
    if (b === undefined) {
        return Math.max(...a);
    }
    return combine(a, b, Math.max);
}

export function sqrLen<TDim extends Dim>(v: ConstRVec<TDim>): number {
    let res = 0;
    for (let d = 0; d < v.length; d++) {
        res += v[d] * v[d];
    }
    return res;
}

export function len<TDim extends Dim>(v: ConstRVec<TDim>): number {
    return Math.sqrt(sqrLen(v));
}

export function sqrDist<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim>): number {
    return sqrLen(sub(a, b));
}

export function dist<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim>): number {
    return Math.sqrt(sqrDist(a, b));
}

export function dot<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim>): number {
    let res = 0;
    for (let d = 0; d < a.length; d++) {
        res += a[d] * b[d];
    }
    return res;
}

export function cross(a: ConstRVec3, b: ConstRVec3): RVec3 {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[0] * b[2] - a[2] * b[0],
        a[0] * b[1] - a[1] * b[0]
    ];
}

export function neg<TDim extends Dim>(v: ConstRVec<TDim>): RVec<TDim> {
    return map<number, TDim, number>(v, c => -c);
}

export function norm<TDim extends Dim>(v: ConstRVec<TDim>): RVec<TDim> {
    return div<TDim>(v, len(v));
}

export function abs<TDim extends Dim>(v: ConstRVec<TDim>): RVec<TDim> {
    return map<number, TDim, number>(v, c => Math.abs(c));
}

export function isAlmNull<TDim extends Dim>(v: ConstRVec<TDim>, eps: number = 1e-6): BVec<TDim> {
    return map<number, TDim, boolean>(v, c => Math.abs(c) < eps);
}

export function areAlmEq<TDim extends Dim>(a: ConstRVec<TDim>, b: ConstRVec<TDim>, eps: number = 1e-6): BVec<TDim> {
    return isAlmNull(sub(a, b), eps);
}

export function isFin<TDim extends Dim>(v: ConstRVec<TDim>): BVec<TDim> {
    return map<number, TDim, boolean>(v, c => isFinite(c));
}

export function homog(v: ConstRVec3): RVec4 {
    return addDim<number, 3>(v, 1);
}

export function nonHomog(v: ConstRVec4): RVec3 {
    return div<3>(remDim<number, 4>(v), v[3]);
}

export function minc<TDim extends Dim>(v: ConstRVec<TDim>): number {
    return Math.min(...v);
}

export function maxc<TDim extends Dim>(v: ConstRVec<TDim>): number {
    return Math.max(...v);
} 