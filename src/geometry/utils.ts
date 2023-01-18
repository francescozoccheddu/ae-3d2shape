import { ConstRVec3, cross, norm, RVec3, sub } from "./rvec";

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
    return norm<3>(cross(sub<3>(points[1], points[0]), sub<3>(points[2], points[0])));
}

export function polygonNormals(points: readonly ConstRVec3[], eps: number = 1e-6): RVec3[] {
    if (points.length < 3) {
        throw new Error("Not a polygon (less than 3 points).");
    }
    if (points.length == 3) {
        return [triangleNormal(points as [ConstRVec3, ConstRVec3, ConstRVec3])];
    }
    const normals: RVec3[] = [];
    for (let i = 3; i < points.length + 3; i++) {
        normals.push(triangleNormal([1, 2, 3].map(o => points[(i + o) % points.length]) as [ConstRVec3, ConstRVec3, ConstRVec3]));
    }
    return normals;
}