export function deg2rad(deg: number): number {
    return deg / 180 * Math.PI;
}

export function rad2deg(rad: number): number {
    return rad / Math.PI * 180;
}

export function cot(angleRad: number): number {
    return 1 / Math.tan(angleRad);
}