import { Vec4 } from "./vec";

export type Mat = [Vec4, Vec4, Vec4, Vec4];

export function mul(a: Mat, b: Vec4): Vec4;
export function mul(a: Mat, b: Mat): Mat;

export function mul(a: Mat, b: Mat | Vec4): Mat | Vec4 {
    if (isNaN(b[0] as number)) {
        const bm: Mat = b as Mat;
    }
    else {
        const bv: Vec4 = b as Vec4;
    }
    throw new Error("not implemented");
}