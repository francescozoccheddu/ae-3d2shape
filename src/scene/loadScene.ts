import parseColor from "parse-color";
import doing from "../utils/doing";
import { deg2rad, polygonNormal } from "../geometry/trig";
import "../utils/polyfills";
import { AmbientLight, Camera, CameraProjection, CameraView, Color, DirectionalLight, FitMode, Keyframe, Keyframed, Light, OrthographicCameraProjection, PerspectiveCameraProjection, PointLight, Polygon, Polygons, Scene, Size } from "./scene";
import { RVec3, isAlmNull, norm } from "../geometry/rvec";
import { all } from "../geometry/bvec";

function isObject(value: unknown | undefined): boolean {
    return typeof value === "object" && !isArray(value) && value !== null;
}

function isString(value: unknown | undefined): boolean {
    return typeof value === "string" || value instanceof String;
}

function isNumber(value: unknown | undefined): boolean {
    return !isNaN(value as number);
}

function isArray(value: unknown | undefined): boolean {
    return Array.isArray(value);
}

function isBoolean(value: unknown | undefined): boolean {
    return typeof value === "boolean";
}

function prop<TObj extends object, T>(obj: TObj, key: keyof TObj, coerce: (v: unknown) => T, defaultValue: T | undefined = undefined): T {
    if (!(key in obj)) {
        if (defaultValue === undefined) {
            throw new Error(`Missing required property "${key.toString()}".`);
        }
        return defaultValue;
    }
    return doing(`parsing property "${key.toString()}"`, () => coerce(obj[key]));
}

function map<TIn, TOut>(array: readonly TIn[], f: (v: TIn) => TOut): readonly TOut[] {
    return array.map((v, i) => doing(`processing element with index "${i}"`, () => f(v)));
}

function coerceBoolean(value: unknown): boolean {
    if (!isBoolean(value)) {
        throw new Error("Not a boolean.");
    }
    return value as boolean;
}

function coerceNumber(value: unknown, min: number = -Infinity, max: number = Infinity): number {
    if (!isNumber(value)) {
        throw new Error("Not a number.");
    }
    const num = value as number;
    if (!isFinite(num)) {
        throw new Error("Number is infinite.");
    }
    if (num < min || num > max) {
        throw new Error(`Number not in range [${min}, ${max}].`);
    }
    return num;
}

function coerceString(value: unknown, regex: string | undefined = undefined): string {
    if (!isString(value)) {
        throw new Error("Expected a string.");
    }
    const str = value as string;
    if (regex !== undefined && !new RegExp(regex).test(str)) {
        throw new Error("Invalid pattern.");
    }
    return str;
}

function coerceObjectOptProps<TProps extends readonly string[]>(obj: object, keys: TProps): { readonly [key in TProps[number]]?: unknown } {
    for (const key in obj) {
        if (keys.indexOf(key) === -1) {
            throw new Error(`Unexpected property "${key}" in object.`);
        }
    }
    return obj as { readonly [key in TProps[number]]?: unknown };
}

function coerceObjectReqProps<TProps extends readonly string[]>(obj: object, keys: TProps): { readonly [key in TProps[number]]: unknown } {
    for (const key of keys) {
        if (!(key in obj)) {
            throw new Error(`Missing property "${key}" in object.`);
        }
    }
    return obj as { readonly [key in TProps[number]]: unknown };
}

function coerceObject<TOpt extends readonly string[], TReq extends string[]>(value: unknown, optionalProperties: TOpt, requiredProperties: TReq): { readonly [key in TReq[number]]: unknown } & { readonly [key in TOpt[number]]?: unknown };
function coerceObject<TReq extends readonly string[]>(value: unknown, requiredProperties: TReq, allKw: "all"): { readonly [key in TReq[number]]: unknown };
function coerceObject<TReq extends readonly string[]>(value: unknown, anyKw: "any", exactProperties: TReq): { readonly [key in TReq[number]]: unknown };
function coerceObject<TReq extends readonly string[]>(value: unknown, exactProperties: TReq): { readonly [key in TReq[number]]: unknown };
function coerceObject(value: unknown): object;

function coerceObject(value: unknown, properties: readonly string[] | "any" = "any", requiredProperties: readonly string[] | "all" = "all"): object {
    if (!isObject(value)) {
        throw new Error("Not an object.");
    }
    const obj = value as object;
    if (properties !== "any") {
        coerceObjectOptProps(obj, requiredProperties === "all" ? properties : properties.concat(requiredProperties));
    }
    if (requiredProperties !== "all") {
        coerceObjectReqProps(obj, requiredProperties);
    }
    else if (properties !== "any") {
        coerceObjectReqProps(obj, properties);
    }
    return obj;
}

function coerceArray(value: unknown, minLength: number = 0, maxLength: number = Infinity): unknown[] {
    if (!isArray(value)) {
        throw new Error("Not an array.");
    }
    const array = value as unknown[];
    if (array.length < minLength || array.length > maxLength) {
        if (minLength == maxLength) {
            throw new Error(`Array length is not ${minLength}.`);
        }
        else {
            throw new Error(`Array length not in range [${minLength}, ${maxLength}].`);
        }
    }
    return array;
}

function coerceEnum<TEnums extends string[]>(value: unknown, entries: TEnums): TEnums[number] {
    const str = coerceString(value);
    if (entries.indexOf(str as TEnums[number]) === -1) {
        throw new Error(`"${str}" not in ${entries}.`);
    }
    return str as TEnums[number];
}

function coerceColor(value: unknown): Color {
    if (isArray(value)) {
        const array = coerceArray(value, 3, 3);
        return map(array, c => coerceNumber(c, 0, 1)) as Color;
    }
    else if (isString(value)) {
        const hex = coerceString(value, "^#?(([0-9a-fA-F]{1,2}){3})$");
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

function coerceVector(value: unknown): RVec3 {
    if (isArray(value)) {
        const array = coerceArray(value, 3, 3);
        return map(array, coerceNumber) as RVec3;
    }
    else if (isObject(value)) {
        const obj = coerceObject(value, ["x", "y", "z"] as const);
        return [
            prop(obj, "x", coerceNumber),
            prop(obj, "y", coerceNumber),
            prop(obj, "z", coerceNumber)
        ];
    }
    else {
        throw new Error("Not a vector array or object.");
    }
}

function coerceDirection(value: unknown): RVec3 {
    const vec = coerceVector(value);
    if (all(isAlmNull(vec))) {
        throw new Error("Null direction vector.");
    }
    return norm<3>(vec);
}

function coerceAmbientLight(value: unknown): AmbientLight {
    const obj = coerceObject(value, ["color"] as const);
    return {
        kind: "ambient",
        color: prop(obj, "color", coerceColor)
    };
}

function coerceDirectionalLight(value: unknown): DirectionalLight {
    const obj = coerceObject(value, ["color"] as const, ["direction"] as const);
    return {
        kind: "directional",
        color: prop(obj, "color", coerceColor, [1, 1, 1]),
        direction: prop(obj, "direction", coerceDirection),
    };
}

function coercePointLight(value: unknown): PointLight {
    const obj = coerceObject(value, ["color"] as const, ["point", "radius"] as const);
    return {
        kind: "point",
        color: prop(obj, "color", coerceColor, [1, 1, 1]),
        point: prop(obj, "point", coerceVector),
        radius: prop(obj, "radius", v => coerceNumber(v, 0))
    };
}

function coerceLight(value: unknown): Light {
    const obj = coerceObject(value, ["direction", "color", "point"] as const, [] as const);
    if ("direction" in obj) {
        return doing("parsing directional light", () => coerceDirectionalLight(obj));
    }
    else if ("point" in obj) {
        return doing("parsing point light", () => coercePointLight(obj));
    }
    else if ("color" in obj) {
        return doing("parsing ambient light", () => coerceAmbientLight(obj));
    }
    else {
        throw new Error("Not a directional, point or ambient light.");
    }
}

function coerceCameraView(value: unknown): CameraView {
    const obj = coerceObject(value, ["up", "forward", "eye"] as const);
    return {
        up: prop(obj, "up", coerceDirection),
        forward: prop(obj, "forward", coerceDirection),
        eye: prop(obj, "eye", coerceVector),
    };
}

function coerceOrthographicCameraProjection(value: unknown): OrthographicCameraProjection {
    const obj = coerceObject(value, ["scale"] as const, ["kind"] as const);
    if (obj.kind !== "orthographic") {
        throw new Error(`Unexpected kind "${obj.kind}".`);
    }
    return {
        kind: "orthographic",
        scale: prop(obj, "scale", v => coerceNumber(v, 0), 1)
    };
}

function coercePerspectiveCameraProjection(value: unknown): PerspectiveCameraProjection {
    const obj = coerceObject(value, ["fieldOfViewDegrees"] as const, ["kind"] as const);
    if (obj.kind !== "perspective") {
        throw new Error(`Unexpected kind "${obj.kind}".`);
    }
    return {
        kind: "perspective",
        fovRad: deg2rad(prop(obj, "fieldOfViewDegrees", v => coerceNumber(v, 10, 170), 60))
    };
}

function coerceCameraProjection(value: unknown): CameraProjection {
    const obj = coerceObject(value, "any", ["kind"] as const);
    if (obj.kind === "perspective") {
        return doing("parsing perspective projection", () => coercePerspectiveCameraProjection(obj));
    } else if (obj.kind === "orthohraphic") {
        return doing("parsing orthographic projection", () => coerceOrthographicCameraProjection(obj));
    }
    else {
        throw new Error(`Unknown kind "${obj.kind}".`);
    }
}

function coerceCamera(value: unknown): Camera {
    const obj = coerceObject(value, ["view", "projection"] as const);
    return {
        view: prop(obj, "view", coerceCameraView),
        projection: prop(obj, "projection", coerceCameraProjection)
    };
}

function coerceName(value: unknown): string {
    const regex = "^([ \\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}]*[\\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}][ \\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}]*)*$";
    return coerceString(value, regex);
}

function coerceSize(value: unknown): Size {
    const obj = coerceObject(value, ["width", "height"] as const);
    return {
        width: prop(obj, "width", v => coerceNumber(v, 0)),
        height: prop(obj, "height", v => coerceNumber(v, 0))
    };
}

function coercePolygon(value: unknown): Polygon {
    const points = map(coerceArray(value, 3), coerceVector);
    return {
        verts: points,
        normal: polygonNormal(points)
    };
}

function coercePolygons(value: unknown): Polygons {
    return map(coerceArray(value), coercePolygon);
}

function coerceTime(value: unknown): number {
    return coerceNumber(value, 0, 60 * 60 * 24);
}

function coerceKeyframe<TValue>(value: unknown, coerceValue: (value: unknown) => TValue): Keyframe<TValue> {
    const obj = coerceObject(value, ["time", "value"] as const);
    return {
        time: prop(obj, "time", coerceTime),
        value: prop(obj, "value", coerceValue)
    };
}

function singleKeyframe<TValue>(value: TValue): Keyframed<TValue> {
    return [{ time: 0, value: value }];
}

function coerceKeyframed<TValue>(value: unknown, coerceValue: (value: unknown) => TValue): Keyframed<TValue> {
    if (isArray(value)) {
        const array = coerceArray(value, 1);
        const keyframes = map(array, k => coerceKeyframe(k, coerceValue));
        keyframes.sort((a, b) => (b.time - a.time));
        for (let i = 1; i < keyframes.length; i++) {
            if (keyframes[i].time == keyframes[i - 1].time) {
                throw new Error("Multiple keyframes with the same time for the same property.");
            }
        }
        return keyframes;
    }
    else {
        return doing("parsing single keyframe value", () => singleKeyframe(coerceValue(value)));
    }
}

function ensureKeyframeConsistency<TValue, TProp>(keyframes: Keyframed<TValue>, prop: (value: TValue) => TProp): void {
    if (keyframes.length > 0) {
        const first = prop(keyframes[0].value);
        for (const keyframe of keyframes) {
            if (prop(keyframe.value) !== first) {
                throw new Error("Keyframes store non-intepolable properties.");
            }
        }
    }
}

function coerceKeyframedCamera(value: unknown): Keyframed<Camera> {
    const keyframes = coerceKeyframed(value, coerceCamera);
    ensureKeyframeConsistency(keyframes, k => k.projection.kind);
    return keyframes;
}

function coerceKeyframedLight(value: unknown): Keyframed<Light> {
    const keyframes = coerceKeyframed(value, coerceLight);
    ensureKeyframeConsistency(keyframes, k => k.kind);
    return keyframes;
}

function coerceKeyframedPolygons(value: unknown): Keyframed<Polygons> {
    const keyframes = coerceKeyframed(value, coercePolygons);
    ensureKeyframeConsistency(keyframes, k => k.length);
    return keyframes;
}

function coerceScene(value: unknown | undefined): Scene {
    const obj = coerceObject(value, ["fillColor", "strokeColor", "strokeWidth", "lights", "fit", "cullOccluded", "cullBackFaces", "cullOutsideFrame", "name", "anchorPoint"] as const, ["camera", "polygons", "size"] as const);
    const scene: Scene = {
        anchorPoint: prop(obj, "anchorPoint", v => coerceKeyframed<RVec3>(v, coerceVector), singleKeyframe([0, 0, 0])),
        camera: prop(obj, "camera", coerceKeyframedCamera),
        cullBackFaces: prop(obj, "cullBackFaces", coerceBoolean, true),
        cullOccluded: prop(obj, "cullOccluded", coerceBoolean, true),
        cullOutsideFrame: prop(obj, "cullOutsideFrame", coerceBoolean, false),
        fillColor: prop(obj, "fillColor", v => coerceKeyframed(v, coerceColor), singleKeyframe([1, 1, 1])),
        strokeColor: prop(obj, "strokeColor", v => coerceKeyframed(v, coerceColor), singleKeyframe([0, 0, 0])),
        strokeWidth: prop(obj, "strokeWidth", v => coerceKeyframed(v, v2 => coerceNumber(v2, 0)), singleKeyframe(0)),
        fit: prop(obj, "fit", v => coerceEnum<FitMode[]>(v, ["width", "height", "max", "min"]), "min"),
        lights: prop(obj, "lights", v => map(coerceArray(v), coerceKeyframedLight), [singleKeyframe({ kind: "ambient", color: [0.8, 0.8, 0.8] })]),
        polygons: prop(obj, "polygons", coerceKeyframedPolygons),
        name: prop(obj, "name", coerceName, "My 3D scene"),
        size: prop(obj, "size", coerceSize)
    };
    return scene;
}

function loadFile(): object | null {
    const file = File.openDialog("Load a scene", "JSON files:*.json,All files:*.*", false);
    if (file === null) {
        return null;
    }
    let json: string;
    try {
        file.open("r");
        json = file.read();
        file.close();
    } catch (e) {
        throw new Error("File access error.");
    }
    try {
        return JSON.parse(json);
    } catch (e) {
        throw new Error("JSON error.");
    }
}

export default function loadScene(): Scene | null {
    const json = doing("reading scene file", loadFile);
    if (json === null) {
        return null;
    }
    return doing("parsing scene", () => coerceScene(json));
}