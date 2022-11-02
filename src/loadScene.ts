import parseColor from "parse-color";
import doing from "./doing";
import "./polyfills";
import { Camera, CameraProjection, CameraView, Color, FitMode, Keyframe, Keyframed, Light, Polygon, Scene, Size, Vector } from "./scene";

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
        throw new Error("Error while reading the scene file.");
    }
    try {
        return JSON.parse(json);
    } catch (e) {
        throw new Error("Error while parsing the scene file.");
    }
}

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

function coerceValue(value: unknown | undefined, defaultValue: unknown | undefined): unknown {
    if (value === undefined) {
        if (defaultValue === undefined) {
            throw new Error("Expected a value.");
        }
        return defaultValue;
    }
    return value;
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

function coerceObject<TOpt extends readonly string[], TReq extends string[]>(value: unknown | undefined, properties: TOpt, requiredProperties: TReq, defaultValue: object | undefined): { readonly [key in TReq[number]]: unknown } & { readonly [key in TOpt[number]]?: unknown };
function coerceObject<TOpt extends readonly string[], TReq extends string[]>(value: unknown | undefined, properties: TOpt, requiredProperties: TReq): { readonly [key in TReq[number]]: unknown } & { readonly [key in TOpt[number]]?: unknown };
function coerceObject<TReq extends readonly string[]>(value: unknown | undefined, properties: TReq): { readonly [key in TReq[number]]: unknown };

function coerceObject<TReq extends readonly string[]>(value: unknown | undefined, properties: TReq, requiredProperties: "all", defaultValue: object | undefined): { readonly [key in TReq[number]]: unknown };
function coerceObject<TReq extends readonly string[]>(value: unknown | undefined, properties: TReq, requiredProperties: "all"): { readonly [key in TReq[number]]: unknown };

function coerceObject<TReq extends readonly string[]>(value: unknown | undefined, properties: "any", requiredProperties: TReq, defaultValue: object | undefined): { readonly [key in TReq[number]]: unknown };
function coerceObject<TReq extends readonly string[]>(value: unknown | undefined, properties: "any", requiredProperties: TReq): { readonly [key in TReq[number]]: unknown };

function coerceObject(value: unknown | undefined, properties: readonly string[] | "any" = "any", requiredProperties: readonly string[] | "all" = "all", defaultValue: object | undefined = undefined): object {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as object;
    }
    if (!isObject(value)) {
        throw new Error("Expected an object.");
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

function coerceColor(value: unknown | undefined, defaultValue: Color | undefined = undefined): Color {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as Color;
    }
    let arrayColor: [unknown, unknown, unknown];
    if (isArray(value)) {
        const array = value as unknown[];
        if (array.length != 3) {
            throw new Error(`Color array must have size 3, not ${array.length}.`);
        }
        arrayColor = array as [unknown, unknown, unknown];
    }
    else if (isString(value)) {
        const hex = value as string;
        arrayColor = parseColor(hex).rgb;
        if (arrayColor === undefined) {
            throw new Error(`Invalid hex color string "${hex}".`);
        }
    }
    else if (isObject(value)) {
        const obj = coerceObject(value, ["r", "g", "b"] as const);
        arrayColor = [obj.r, obj.g, obj.b];
    }
    else {
        throw new Error("Expected a color array, object or hex string.");
    }
    return arrayColor.map(c => coerceNumber(c, 0, 1)) as Color;
}

function coerceVector(value: unknown | undefined, defaultValue: Vector | undefined = undefined): Vector {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as Vector;
    }
    let arrayVector: [unknown, unknown, unknown];
    if (isArray(value)) {
        const array = value as Array<unknown>;
        if (array.length != 3) {
            throw new Error(`Vector array must have size 3, not ${array.length}.`);
        }
        arrayVector = array as [unknown, unknown, unknown];
    }
    else if (isObject(value)) {
        const obj = coerceObject(value, ["x", "y", "z"] as const);
        arrayVector = [obj.x, obj.y, obj.z];
    }
    else {
        throw new Error("Expected a vector array or object.");
    }
    return arrayVector.map(coerceNumber) as Vector;
}

function coerceBoolean(value: unknown | undefined, defaultValue: boolean | undefined = undefined): boolean {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as boolean;
    }
    if (!isBoolean(value)) {
        throw new Error("Expected a boolean.");
    }
    return value as boolean;
}

function coerceNumber(value: unknown | undefined, min: number = -Infinity, max: number = Infinity, defaultValue: number | undefined = undefined): number {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as number;
    }
    if (!isNumber(value)) {
        throw new Error("Expected a number.");
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

function coerceArray(value: unknown | undefined, minLength: number = 0, maxLength: number = Infinity, defaultValue: unknown[] | undefined = undefined): unknown[] {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as unknown[];
    }
    if (!isArray(value)) {
        throw new Error("Expected an array.");
    }
    const array = value as unknown[];
    if (array.length < minLength || array.length > maxLength) {
        throw new Error(`Array length not in range [${minLength}, ${maxLength}].`);
    }
    return array;
}

function coerceLight(value: unknown | undefined, defaultValue: Light | undefined = undefined): Light {
    const obj = coerceObject(value, ["direction", "color", "point"] as const, [] as const);
    if (obj === defaultValue) {
        return defaultValue as Light;
    }
    if ("direction" in obj) {
        const directional = coerceObject(obj, ["direction", "color"] as const);
        return {
            color: coerceColor(directional.color),
            direction: coerceVector(directional.direction),
            kind: "directional"
        };
    }
    else if ("point" in obj) {
        const point = coerceObject(obj, ["point", "radius", "color"] as const);
        return {
            color: coerceColor(point.color),
            radius: coerceNumber(point.radius, 0, 65535),
            point: coerceVector(point.point),
            kind: "point"
        };
    }
    else {
        const ambient = coerceObject(value, ["color"] as const);
        return {
            color: coerceColor(ambient.color),
            kind: "ambient"
        };
    }
}

function coerceCameraView(value: unknown | undefined, defaultValue: CameraView | undefined = undefined): CameraView {
    const obj = coerceObject(value, ["up", "forward", "eye"] as const);
    if (obj === defaultValue) {
        return defaultValue as CameraView;
    }
    return {
        up: coerceVector(obj.up),
        forward: coerceVector(obj.forward),
        eye: coerceVector(obj.eye)
    };
}

function coerceCameraProjection(value: unknown | undefined, defaultValue: CameraProjection | undefined = undefined): CameraProjection {
    const obj = coerceObject(value, ["horizontalFov", "verticalFov", "scale"] as const, ["kind"] as const);
    if (obj === defaultValue) {
        return defaultValue as CameraProjection;
    }
    if (obj.kind === "perspective") {
        const perspective = coerceObject(obj, ["horizontalFov", "verticalFov"] as const, ["kind"] as const);
        if ("horizontalFov" in perspective && "verticalFov" in perspective) {
            throw new Error("Only one of horizontalFov and verticalFov can be specified.");
        }
        if ("horizontalFov" in perspective) {
            return {
                kind: "perspective",
                horizontalFov: coerceNumber(perspective.horizontalFov, 10, 170)
            };
        }
        else if ("verticalFov" in perspective) {
            return {
                kind: "perspective",
                verticalFov: coerceNumber(perspective.verticalFov, 10, 170)
            };
        }
        else {
            return {
                kind: "perspective",
                verticalFov: 60
            };
        }
    } else {
        const orthographic = coerceObject(obj, ["kind", "scale"] as const);
        if (orthographic.kind !== "orthographic") {
            throw new Error("Unknown camera projection kind.");
        }
        return {
            kind: "orthographic",
            scale: coerceNumber(orthographic.scale, 0, 65535, 1)
        };
    }
}

function coerceCamera(value: unknown | undefined, defaultValue: Camera | undefined = undefined): Camera {
    const obj = coerceObject(value, ["view", "projection"] as const);
    if (obj === defaultValue) {
        return defaultValue as Camera;
    }
    return {
        view: coerceCameraView(obj.view),
        projection: coerceCameraProjection(obj.projection),
    };
}

function coerceKeyframe<TValue>(value: unknown | undefined, coerceSimpleValue: (value: unknown) => TValue, defaultValue: Keyframe<TValue> | undefined = undefined): Keyframe<TValue> {
    const obj = coerceObject(value, ["time", "value"] as const);
    if (obj === defaultValue) {
        return defaultValue as Keyframe<TValue>;
    }
    return {
        value: coerceSimpleValue(obj.value),
        time: coerceTime(obj.time)
    };
}

function coerceKeyframed<TValue>(value: unknown | undefined, coerceSimpleValue: (value: unknown) => TValue, defaultValue: TValue | undefined = undefined): Keyframed<TValue> {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return [{
            time: 0,
            value: defaultValue as TValue
        }];
    }
    if (isArray(value)) {
        const keyframes = coerceArray(value, undefined, 1).map(k => coerceKeyframe(k, coerceSimpleValue));
        keyframes.sort((a, b) => (b.time - a.time));
        for (let i = 1; i < keyframes.length; i++) {
            if (keyframes[i].time == keyframes[i - 1].time) {
                throw new Error("Multiple keyframes with the same time for the same property.");
            }
        }
        return keyframes;
    }
    else {
        return [{
            time: 0,
            value: coerceSimpleValue(value)
        }];
    }
}

function coerceString(value: unknown | undefined, defaultValue: string | undefined = undefined): string {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as string;
    }
    if (!isString(value)) {
        throw new Error("Expected a string.");
    }
    return value as string;
}

function coerceName(value: unknown | undefined, defaultValue: string | undefined = undefined): string {
    value = coerceString(value, defaultValue);
    if (value === defaultValue) {
        return defaultValue as string;
    }
    if (!new RegExp("^([ \\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}]*[\\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}][ \\\\A-Z-a-z0-9\\+\\-\\*/=_\\.,!\\?\"'\\$%&@#\\(\\)\\[\\]\\{\\}]*)*$").test(value as string)) {
        throw new Error("Invalid name format.");
    }
    return value as string;
}

function coerceEnum<TEnum>(value: unknown | undefined, entries: TEnum[], defaultValue: string | undefined = undefined): TEnum {
    const str = coerceString(value, defaultValue);
    if (str === defaultValue) {
        return defaultValue as TEnum;
    }
    if (entries.indexOf(str as TEnum) === -1) {
        throw new Error(`Expected one of ${entries}.`);
    }
    return str as TEnum;
}

function coerceSize(value: unknown | undefined, defaultValue: Size | undefined = undefined): Size {
    const obj = coerceObject(value, ["width", "height"] as const, "all", defaultValue);
    if (obj === defaultValue) {
        return defaultValue as Size;
    }
    return {
        width: coerceNumber(obj.width, 0),
        height: coerceNumber(obj.height, 0)
    };
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

function coercePolygon(value: unknown | undefined, defaultValue: Polygon | undefined = undefined): Polygon {
    return coerceArray(value, 0, Infinity, defaultValue).map(coerceVector);
}

function coerceKeyframedCamera(value: unknown | undefined, defaultValue: Camera | undefined = undefined): Keyframed<Camera> {
    const keyframes = coerceKeyframed(value, coerceCamera, defaultValue);
    ensureKeyframeConsistency(keyframes, k => k.projection.kind);
    return keyframes;
}

function coerceKeyframedLight(value: unknown | undefined, defaultValue: Light | undefined = undefined): Keyframed<Light> {
    const keyframes = coerceKeyframed(value, coerceLight, defaultValue);
    ensureKeyframeConsistency(keyframes, k => k.kind);
    return keyframes;
}

function coerceKeyframedPolygon(value: unknown | undefined, defaultValue: Polygon | undefined = undefined): Keyframed<Polygon> {
    const keyframes = coerceKeyframed(value, coercePolygon, defaultValue);
    ensureKeyframeConsistency(keyframes, k => k.length);
    return keyframes;
}

function coerceTime(value: unknown | undefined, defaultValue: number | undefined = undefined): number {
    return coerceNumber(value, 0, 60 * 60 * 24, defaultValue);
}

function coerceScene(value: unknown | undefined, defaultValue: Scene | undefined = undefined): Scene {
    const obj = coerceObject(value, ["fillColor", "strokeColor", "strokeWidth", "lights", "fit", "cullOccluded", "cullBackFaces", "name", "anchorPoint", "extraRefreshes"] as const, ["camera", "polygons", "size"] as const);
    if (obj === defaultValue) {
        return defaultValue as Scene;
    }
    const scene: Scene = {
        anchorPoint: doing("reading anchorPoint", () => coerceKeyframed<Vector>(obj.anchorPoint, coerceVector, [0, 0, 0])),
        camera: doing("reading camera", () => coerceKeyframedCamera(obj.camera)),
        cullBackFaces: doing("reading cullBackFaces", () => coerceBoolean(obj.cullBackFaces, true)),
        cullOccluded: doing("reading cullOccluded", () => coerceBoolean(obj.cullOccluded, true)),
        fillColor: doing("reading fillColor", () => coerceKeyframed(obj.fillColor, coerceColor, [1, 1, 1])),
        strokeColor: doing("reading strokeColor", () => coerceKeyframed(obj.fillColor, coerceColor, [0, 0, 0])),
        strokeWidth: doing("reading strokeWidth", () => coerceKeyframed(obj.strokeWidth, v => coerceNumber(v, 0, 65535), 10)),
        fit: doing("reading fit", () => coerceEnum<FitMode>(obj.fit, ["width", "height", "max", "min"], "min")),
        lights: doing("reading lights", () => coerceArray(obj.lights, 0, Infinity, [{ color: [0.8, 0.8, 0.8], kind: 'ambient' }]).map(coerceKeyframedLight)),
        polygons: doing("reading polygons", () => coerceArray(obj.polygons).map(coerceKeyframedPolygon)),
        name: doing("reading name", () => coerceName(obj.name, "My 3D scene")),
        size: doing("reading size", () => coerceSize(obj.size)),
        extraRefreshes: doing("reading extraRefreshes", () => coerceArray(obj.extraRefreshes).map(coerceTime))
    };
    return scene;
}

export default function loadScene(): Scene | null {
    const json = loadFile();
    if (json === null) {
        return null;
    }
    return coerceScene(json);
}