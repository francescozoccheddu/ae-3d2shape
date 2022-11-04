import { combine, Dim, fill, map, Vec, Vec2, Vec3, Vec4 } from "./vec";

export type BVec2 = Vec2<boolean>;

export type BVec3 = Vec3<boolean>;

export type BVec4 = Vec4<boolean>;

export type BVec<TDim extends Dim> = Vec<boolean, TDim>;

export function bvec<TDim extends Dim>(dim: TDim, value: boolean = false): BVec<TDim> {
    const v = new Array<boolean>(dim) as BVec<TDim>;
    fill(v, value);
    return v;
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

export function and<TDim extends Dim>(a: Readonly<BVec<TDim>>, b: Readonly<BVec<TDim>> | boolean): BVec<TDim> {
    return combine(a, b, (a, b) => a && b);
}

export function or<TDim extends Dim>(a: Readonly<BVec<TDim>>, b: Readonly<BVec<TDim>> | boolean): BVec<TDim> {
    return combine(a, b, (a, b) => a || b);
}

export function not<TDim extends Dim>(v: Readonly<BVec<TDim>>): BVec<TDim> {
    return map(v, c => !c);
}