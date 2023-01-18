import parseColor from "parse-color";
import { all } from "../geometry/bvec";
import { isAlmNull, norm, RVec3 } from "../geometry/rvec";
import { deg2rad, polygonNormals } from "../geometry/utils";
import doing from "../utils/doing";
import "../utils/polyfills";
import { Defs, isRef } from "./definitions";
import { coerceArray, coerceBoolean, coerceEnum, coerceNumber, coerceObject, coerceString, isArray, isObject, isString, map, prop } from "./fundamentals";
import { AmbientLight, Camera, Color, DirectionalLight, Fit, Fov, FrameDimension, FrameSize, Keyframe, Keyframes, Light, LightKind, Lights, OrthographicProjection, PerspectiveProjection, PointLight, Polygon, Polygons, Project, Projection, ProjectionKind, Radius, Scale, Scene, Thickness, Time, Vector, Vertices, View } from "./project";

export function coerceColor(value: unknown, defs: Defs): Color {
    if (isRef(value)) {
        return defs.get("color", value as string);
    }
    if (isArray(value)) {
        const array = coerceArray(value, 3, 3);
        return map(array, c => coerceNumber(c, 0, 1)) as RVec3;
    }
    else if (isString(value)) {
        const hex = coerceString(value, /^#?(([0-9a-fA-F]{1,2}){3})$/);
        const rgb = parseColor(hex).rgb;
        if (rgb === undefined) {
            throw new Error(`Invalid hex color string "${hex}".`);
        }
        return rgb;
    }
    else if (isObject(value)) {
        const obj = coerceObject(value, ["r", "g", "b"] as const);
        return [
            prop(obj, "r", v => coerceNumber(v, 0, 1)),
            prop(obj, "g", v => coerceNumber(v, 0, 1)),
            prop(obj, "b", v => coerceNumber(v, 0, 1)),
        ];
    }
    else {
        throw new Error("Not a color array, object or hex string.");
    }
}

export function coerceVector(value: unknown, defs: Defs): Vector {
    if (isRef(value)) {
        return defs.get("vector", value);
    }
    if (isArray(value)) {
        const array = coerceArray(value, 3, 3);
        return map(array, v => coerceNumber(v)) as RVec3;
    }
    else if (isObject(value)) {
        const obj = coerceObject(value, ["x", "y", "z"] as const);
        return [
            prop(obj, "x", v => coerceNumber(v)),
            prop(obj, "y", v => coerceNumber(v)),
            prop(obj, "z", v => coerceNumber(v))
        ];
    }
    else {
        throw new Error("Not a vector array or object.");
    }
}

export function coerceDirection(value: unknown, defs: Defs): Vector {
    const vec = coerceVector(value, defs);
    if (all(isAlmNull(vec))) {
        throw new Error("Null direction vector.");
    }
    return norm<3>(vec);
}

export function coerceAmbientLight(value: unknown, defs: Defs): AmbientLight {
    const obj = coerceObject(value, ["color"] as const, ["kind"] as const);
    if (obj.kind !== "ambient") {
        throw new Error(`Unexpected kind "${obj.kind}".`);
    }
    return {
        kind: "ambient",
        color: prop(obj, "color", v => coerceColor(v, defs), defs.get("color", "$defaultLightColor"))
    };
}

export function coerceDirectionalLight(value: unknown, defs: Defs): DirectionalLight {
    const obj = coerceObject(value, ["color"] as const, ["direction", "kind"] as const);
    if (obj.kind !== "directional") {
        throw new Error(`Unexpected kind "${obj.kind}".`);
    }
    return {
        kind: "directional",
        color: prop(obj, "color", v => coerceColor(v, defs), defs.get("color", "$defaultLightColor")),
        direction: prop(obj, "direction", v => coerceDirection(v, defs))
    };
}

export function coerceRadius(value: unknown, defs: Defs): Radius {
    if (isRef(value)) {
        return defs.get("radius", value);
    }
    return coerceNumber(value, Number.MIN_VALUE);
}

export function coercePointLight(value: unknown, defs: Defs): PointLight {
    const obj = coerceObject(value, ["color"] as const, ["point", "radius", "kind"] as const);
    if (obj.kind !== "point") {
        throw new Error(`Unexpected kind "${obj.kind}".`);
    }
    return {
        kind: "point",
        color: prop(obj, "color", v => coerceColor(v, defs), defs.get("color", "$defaultLightColor")),
        point: prop(obj, "point", v => coerceVector(v, defs)),
        radius: prop(obj, "radius", v => coerceRadius(v, defs))
    };
}

export function coerceLight(value: unknown, defs: Defs): Light {
    if (isRef(value)) {
        return defs.get("light", value);
    }
    const obj = coerceObject(value, "any", ["kind"] as const);
    switch (coerceEnum<LightKind[]>(obj.kind, ["ambient", "directional", "point"])) {
        case "ambient":
            return doing("parsing ambient light", () => coerceAmbientLight(obj, defs));
        case "point":
            return doing("parsing point light", () => coercePointLight(obj, defs));
        case "directional":
            return doing("parsing directional light", () => coerceDirectionalLight(obj, defs));
    }
}

export function coerceLights(value: unknown, defs: Defs): Lights {
    if (isRef(value)) {
        return defs.get("lights", value);
    }
    return map(coerceArray(value), v => coerceLight(v, defs));
}

export function coerceView(value: unknown, defs: Defs): View {
    if (isRef(value)) {
        return defs.get("view", value);
    }
    const obj = coerceObject(value, ["up", "forward", "eye"] as const);
    return {
        up: prop(obj, "up", v => coerceDirection(v, defs)),
        forward: prop(obj, "forward", v => coerceDirection(v, defs)),
        eye: prop(obj, "eye", v => coerceVector(v, defs)),
    };
}

export function coerceScale(value: unknown, defs: Defs): Scale {
    if (isRef(value)) {
        return defs.get("scale", value);
    }
    return coerceNumber(value, 0);
}

export function coerceOrthographicProjection(value: unknown, defs: Defs): OrthographicProjection {
    const obj = coerceObject(value, ["scale"] as const, ["kind"] as const);
    if (obj.kind !== "orthographic") {
        throw new Error(`Unexpected kind "${obj.kind}".`);
    }
    return {
        kind: "orthographic",
        scale: prop(obj, "scale", v => coerceScale(v, defs), defs.get("scale", "$defaultProjectionScale"))
    };
}

export function coerceFov(value: unknown, defs: Defs): Fov {
    if (isRef(value)) {
        return defs.get("scale", value);
    }
    return coerceNumber(value, 10, 170);
}

export function coercePerspectiveProjection(value: unknown, defs: Defs): PerspectiveProjection {
    const obj = coerceObject(value, ["fov"] as const, ["kind"] as const);
    if (obj.kind !== "perspective") {
        throw new Error(`Unexpected kind "${obj.kind}".`);
    }
    return {
        kind: "perspective",
        fovRad: deg2rad(prop(obj, "fov", v => coerceFov(v, defs), defs.get("fov", "$defaultProjectionFov")))
    };
}

export function coerceProjection(value: unknown, defs: Defs): Projection {
    if (isRef(value)) {
        return defs.get("projection", value);
    }
    const obj = coerceObject(value, "any", ["kind"] as const);
    switch (coerceEnum<ProjectionKind[]>(obj.kind, ["perspective", "orthographic"])) {
        case "perspective":
            return doing("parsing perspective projection", () => coercePerspectiveProjection(obj, defs));
        case "orthographic":
            return doing("parsing orthographic projection", () => coerceOrthographicProjection(obj, defs));
    }
}

export function coerceCamera(value: unknown, defs: Defs): Camera {
    if (isRef(value)) {
        return defs.get("camera", value);
    }
    const obj = coerceObject(value, ["projection"] as const, ["view"] as const);
    return {
        view: prop(obj, "view", v => coerceView(v, defs)),
        projection: prop(obj, "projection", v => coerceProjection(v, defs), defs.get("projection", "$defaultProjection"))
    };
}

export function coerceName(value: unknown): string {
    const regex = new RegExp("^([ \\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}]*[\\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}][ \\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}]*)*$");
    return coerceString(value, regex);
}

export function coerceFrameDimension(value: unknown): FrameDimension {
    return coerceNumber(value, Number.MIN_VALUE);
}

export function coerceFrameSize(value: unknown): FrameSize {
    const obj = coerceObject(value, ["width", "height"] as const);
    return [
        prop(obj, "width", v => coerceFrameDimension(v)),
        prop(obj, "height", v => coerceFrameDimension(v))
    ];
}

export function coerceVertices(value: unknown, defs: Defs): Vertices {
    if (isRef(value)) {
        return defs.get("vertices", value);
    }
    return map(coerceArray(value, 3), v => coerceVector(v, defs));
}

export function coercePolygon(value: unknown, defs: Defs): Polygon {
    if (isRef(value)) {
        return defs.get("polygon", value);
    }
    const obj = coerceObject(value, ["color"] as const, ["vertices"] as const);
    const vertices = prop(obj, "vertices", v => coerceVertices(v, defs));
    return {
        vertices: vertices,
        normals: polygonNormals(vertices),
        color: prop(obj, "color", v => coerceColor(v, defs), defs.get("color", "$defaultPolygonColor"))
    };
}

export function coercePolygons(value: unknown, defs: Defs): Polygons {
    if (isRef(value)) {
        return defs.get("polygons", value);
    }
    return map(coerceArray(value), v => coercePolygon(v, defs));
}

export function coerceTime(value: unknown): Time {
    return coerceNumber(value, 0, 60 * 60 * 24);
}

export function coerceThickness(value: unknown, defs: Defs): Thickness {
    if (isRef(value)) {
        return defs.get("thickness", value);
    }
    return coerceNumber(value, 0, 65535);
}

export function coerceScene(value: unknown, defs: Defs): Scene {
    const obj = coerceObject(value, ["strokeColor", "strokeThickness", "lights", "anchorPoint"] as const, ["camera", "polygons"] as const);
    return {
        camera: prop(obj, "camera", v => coerceCamera(v, defs)),
        polygons: prop(obj, "polygons", v => coercePolygons(v, defs)),
        lights: prop(obj, "lights", v => coerceLights(v, defs), defs.get("lights", "$defaultLights")),
        strokeColor: prop(obj, "strokeColor", v => coerceColor(v, defs), defs.get("color", "$defaultStrokeColor")),
        strokeThickness: prop(obj, "strokeThickness", v => coerceThickness(v, defs), defs.get("thickness", "$defaultStrokeThickness"))
    };
}

export function coerceKeyframe(value: unknown, defs: Defs): Keyframe {
    const obj = coerceObject(value, ["time", "scene"] as const);
    return {
        time: prop(obj, "time", v => coerceTime(v)),
        scene: prop(obj, "scene", v => coerceScene(v, defs))
    };
}

export function coerceKeyframes(value: unknown, defs: Defs): Keyframes {
    const keyframes = map(coerceArray(value, 1), v => coerceKeyframe(v, defs));
    keyframes.sort((a, b) => a.time - b.time);
    map(keyframes, (k, i) => {
        if (i > 0 && k.time == keyframes[i - 1].time) {
            throw new Error(`Two keyframes at the same time ${k.time}.`);
        }
        if (k.scene.polygons.length != keyframes[0].scene.polygons.length) {
            throw new Error(`Polygon count mismatch between keyframes. Expected ${keyframes[0].scene.polygons.length} polygons, got ${k.scene.polygons.length}.`);
        }
        doing("validating polygons", () =>
            map(k.scene.polygons, (p, i) => {
                if (p.vertices.length != keyframes[0].scene.polygons[i].vertices.length) {
                    throw new Error(`Vertices count mismatch between keyframes. Expected ${keyframes[0].scene.polygons[i].vertices.length} vertices, got ${p.vertices.length}.`);
                }
            })
        );
    });
    return keyframes;
}

export function coerceFit(value: unknown): Fit {
    return coerceEnum<Fit[]>(value, ["height", "width", "min", "max"]);
}

export default function coerceProject(value: unknown, defs: Defs): Project {
    const obj = coerceObject(value, ["fit", "cullBack", "cullOutsideFrame", "name", "definitions", "cullBack", "frameSize"] as const, ["keyframes"]);
    return {
        fit: prop(obj, "fit", v => coerceFit(v), "min"),
        name: prop(obj, "name", v => coerceName(v), "ae-3d2shape"),
        frameSize: prop(obj, "frameSize", v => coerceFrameSize(v), [1, 1]),
        keyframes: prop(obj, "keyframes", v => coerceKeyframes(v, defs)),
        cullBack: prop(obj, "cullBack", v => coerceBoolean(v), true)
    };
}