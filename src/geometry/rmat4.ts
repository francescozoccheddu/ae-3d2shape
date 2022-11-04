import { cot } from "./trig";
import { cross, dot, rvec, RVec3, RVec4 } from "./rvec";

export type RMat4 = [RVec4, RVec4, RVec4, RVec4];

export function idt(): RMat4 {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];
}

export function nll(): RMat4 {
    return [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
    ];
}

export function mul(a: RMat4, b: RVec4): RVec4;
export function mul(a: RMat4, b: RMat4): RMat4;

export function mul(a: RMat4, b: RMat4 | RVec4): RMat4 | RVec4 {
    if (isNaN(b[0] as number)) {
        const bm: RMat4 = b as RMat4;
        const res: RMat4 = nll();
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                for (let i = 0; i < 4; i++) {
                    res[r][c] += a[r][i] * bm[i][c];
                }
            }
        }
        return res;
    }
    else {
        const bv: RVec4 = b as RVec4;
        const res: RVec4 = rvec(4);
        for (let r = 0; r < 4; r++) {
            for (let i = 0; i < 4; i++) {
                res[r] += a[r][i] * bv[i];
            }
        }
        return res;
    }
}

export function scaleMat(scale: RVec3): RMat4 {
    const mat = idt();
    for (let i = 0; i < 3; i++) {
        mat[i][i] = scale[i];
    }
    return mat;
}

export function translationMat(translation: RVec3): RMat4 {
    const mat = idt();
    for (let i = 0; i < 3; i++) {
        mat[i][3] = translation[i];
    }
    return mat;
}

export function rotationMat(axis: RVec3, angleRad: number): RMat4 {
    const u = axis[0];
    const v = axis[1];
    const w = axis[2];
    const rcos = Math.cos(angleRad);
    const rsin = Math.sin(angleRad);
    const mat = idt();
    mat[0][0] = rcos + u * u * (1 - rcos);
    mat[1][0] = w * rsin + v * u * (1 - rcos);
    mat[2][0] = -v * rsin + w * u * (1 - rcos);
    mat[0][1] = -w * rsin + u * v * (1 - rcos);
    mat[1][1] = rcos + v * v * (1 - rcos);
    mat[2][1] = u * rsin + w * v * (1 - rcos);
    mat[0][2] = v * rsin + u * w * (1 - rcos);
    mat[1][2] = -u * rsin + v * w * (1 - rcos);
    mat[2][2] = rcos + w * w * (1 - rcos);
    return mat;
}

export function perspectiveProjMat(fovRad: number): RMat4 {
    const scale = cot(fovRad / 2.0);
    return orthographicProjMat(scale);
}

export function orthographicProjMat(scale: number): RMat4 {
    return scaleMat([scale, scale, 1]);
}

export function viewMat(eye: RVec3, forward: RVec3, up: RVec3): RMat4 {
    const right = cross(forward, up);
    return [
        [right[0], right[1], right[2], -dot(right, eye)],
        [up[0], up[1], up[2], -dot(up, eye)],
        [forward[0], forward[1], forward[2], -dot(forward, eye)],
        [0, 0, 0, 1]
    ]
}
