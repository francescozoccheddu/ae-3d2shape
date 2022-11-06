import { ConstRVec3, cross, dot, RVec3, sub } from "./rvec";

export function deg2rad(deg: number): number {
    return deg / 180 * Math.PI;
}

export function rad2deg(rad: number): number {
    return rad / Math.PI * 180;
}

export function cot(angleRad: number): number {
    return 1 / Math.tan(angleRad);
}

export function isAlmNull(value: number, eps: number = 1e-6) {
    return Math.abs(value) < eps;
}

export function triangleNormal(points: readonly [ConstRVec3, ConstRVec3, ConstRVec3]): RVec3 {
    return cross(sub<3>(points[1], points[0]), sub<3>(points[2], points[0]));
}

export function polygonNormal(points: readonly ConstRVec3[], eps: number = 1e-6): RVec3 {
    if (points.length < 3) {
        throw new Error("Not a polygon (less than 3 points).");
    }
    const normal = triangleNormal(points.slice(0, 3) as [ConstRVec3, ConstRVec3, ConstRVec3]);
    for (let i = 3; i < points.length; i++) {
        const angle = dot(sub(points[i], points[0]), normal);
        if (!isAlmNull(angle, eps)) {
            throw new Error("Polygon is not planar.");
        }
    }
    return normal;
}