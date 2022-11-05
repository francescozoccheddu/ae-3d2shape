import { EmitAndSemanticDiagnosticsBuilderProgram, LiteralExpression } from "typescript";
import { perspectiveProjMat } from "../geometry/rmat4";
import { ConstRVec3, RVec3 } from "../geometry/rvec";
import { combine } from "../geometry/vec";
import { AmbientLight, Camera, CameraProjection, CameraView, DirectionalLight, Light, OrthographicCameraProjection, PerspectiveCameraProjection, PointLight, Polygon, Polygons } from "../scene/scene";

export function lerpNumber(from: number, to: number, progress: number): number {
    return from * (1 - progress) + to * progress;
}

export function lerpRVec3(from: ConstRVec3, to: ConstRVec3, progress: number): RVec3 {
    return combine<number, number, 3, number>(from, to, (a, b) => lerpNumber(a, b, progress));
}

function lerpCameraProjection(from: CameraProjection, to: CameraProjection, progress: number): CameraProjection {
    if (from.kind == "perspective") {
        return {
            kind: "perspective",
            fovRad: lerpNumber(from.fovRad, (to as PerspectiveCameraProjection).fovRad, progress)
        };
    }
    else {
        return {
            kind: "orthographic",
            scale: lerpNumber(from.scale, (to as OrthographicCameraProjection).scale, progress)
        };
    }
}

function lerpCameraView(from: CameraView, to: CameraView, progress: number): CameraView {
    return {
        up: lerpRVec3(from.up, to.up, progress),
        eye: lerpRVec3(from.eye, to.eye, progress),
        forward: lerpRVec3(from.forward, to.forward, progress)
    };
}

export function lerpCamera(from: Camera, to: Camera, progress: number): Camera {
    return {
        view: lerpCameraView(from.view, to.view, progress),
        projection: lerpCameraProjection(from.projection, to.projection, progress)
    };
}

function lerpAmbientLight(from: AmbientLight, to: AmbientLight, progress: number): AmbientLight {
    return {
        kind: "ambient",
        color: lerpRVec3(from.color, to.color, progress)
    };
}

function lerpPointLight(from: PointLight, to: PointLight, progress: number): PointLight {
    return {
        kind: "point",
        radius: lerpNumber(from.radius, to.radius, progress),
        point: lerpRVec3(from.point, to.point, progress),
        color: lerpRVec3(from.color, to.color, progress)
    };
}

function lerpDirectionalLight(from: DirectionalLight, to: DirectionalLight, progress: number): DirectionalLight {
    return {
        kind: "directional",
        direction: lerpRVec3(from.direction, to.direction, progress),
        color: lerpRVec3(from.color, to.color, progress)
    };
}

function lerpLight(from: Light, to: Light, progress: number): Light {
    switch (from.kind) {
        case "ambient":
            return lerpAmbientLight(from, to as AmbientLight, progress);
        case "directional":
            return lerpDirectionalLight(from, to as DirectionalLight, progress);
        case "point":
            return lerpPointLight(from, to as PointLight, progress);
    };
}

function lerpPolygon(from: Polygon, to: Polygon, progress: number): Polygon {
    return {
        normal: lerpRVec3(from.normal, to.normal, progress),
        verts: from.verts.map((v, i) => lerpRVec3(v, to.verts[i], progress))
    };
}

export function lerpPolygons(from: Polygons, to: Polygons, progress: number): Polygons {
    return from.map((p, i) => lerpPolygon(p, to[i], progress));
}

export function lerpLights(from: readonly Light[], to: readonly Light[], progress: number): Light[] {
    return from.map((p, i) => lerpLight(p, to[i], progress));
}