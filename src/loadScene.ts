import parseColor from "parse-color";
import "./polyfills";
import { Camera, CameraProjection, CameraView, Color, FitMode, Keyframed, Light, Polygon, Scene, Vector } from "./scene";

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
    return typeof value === "object" && !Array.isArray(value) && value !== null;
}

function isString(value: unknown | undefined): boolean {
    return typeof value === "string" || value instanceof String;
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

function coerceObject(value: unknown | undefined, defaultValue: object | undefined = undefined, properties: string[] | "any" = "any", requiredProperties: string[] | "all" = "all"): object {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as object;
    }
    if (!isObject(value)) {
        throw new Error("Expected an object.");
    }
    const obj = value as object;
    const keys: string[] = [];
    for (const key in obj) {
        if (properties !== "any" && properties.indexOf(key) === -1) {
            throw new Error(`Unexpected property "${key}" in object.`);
        }
        keys.push(key);
    }
    if (requiredProperties !== "all" || properties !== "any") {
        if (requiredProperties === "all") {
            requiredProperties = properties as string[];
        }
        for (const requiredProperty of requiredProperties) {
            if (keys.indexOf(requiredProperty) === -1) {
                throw new Error(`Missing required property "${requiredProperty}" in object.`);
            }
        }
    }
    return obj;
}

function coerceColor(value: unknown | undefined, defaultValue: Color | undefined = undefined): Color {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as Color;
    }
    let arrayColor: [unknown, unknown, unknown];
    if (Array.isArray(value)) {
        const array = value as unknown[];
        if (array.length != 3) {
            throw new Error(`Color array must have size 3, not ${array.length}.`);
        }
        arrayColor = array as [unknown, unknown, unknown];
    }
    else if (isString(value)) {
        const hex = value as string;
        arrayColor = parseColor(hex).rgb;
    }
    else if (isObject(value)) {
        coerceObject(value, undefined, ["r", "g", "b"]);
        const obj = value as Readonly<{ r: unknown, g: unknown, b: unknown }>;
        arrayColor = [obj.r, obj.g, obj.b];
    }
    else {
        throw new Error("Expected a color array, object or hex string.");
    }
    return arrayColor.map(c => coerceNumber(c, undefined, 0, 1)) as Color;
}

function coerceVector(value: unknown | undefined, defaultValue: Vector | undefined = undefined): Vector {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as Vector;
    }
    let arrayVector: [unknown, unknown, unknown];
    if (Array.isArray(value)) {
        const array = value as Array<unknown>;
        if (array.length != 3) {
            throw new Error(`Vector array must have size 3, not ${array.length}.`);
        }
        arrayVector = array as [unknown, unknown, unknown];
    }
    else if (isObject(value)) {
        coerceObject(value, undefined, ["x", "y", "z"]);
        const obj = value as Readonly<{ x: unknown, y: unknown, z: unknown }>;
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
        return value as boolean;
    }
    if (typeof value !== "boolean") {
        throw new Error("Expected a boolean.");
    }
    return value as boolean;
}

function coerceNumber(value: unknown | undefined, defaultValue: number | undefined = undefined, min: number = -Infinity, max: number = Infinity): number {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as number;
    }
    if (isNaN(value as number)) {
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

function coerceArray(value: unknown | undefined, defaultValue: unknown[] | undefined = undefined, minLength: number = -Infinity, maxLength: number = Infinity): unknown[] {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as unknown[];
    }
    if (!Array.isArray(value)) {
        throw new Error("Expected an array.");
    }
    const array = value as unknown[];
    if (array.length < minLength || array.length > maxLength) {
        throw new Error(`Array length not in range [${minLength}, ${maxLength}].`);
    }
    return array;
}

function coerceLight(value: unknown | undefined, defaultValue: Light | undefined = undefined): Light {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as Light;
    }
    coerceObject(value, undefined, ["direction", "color", "point"], []);
    if ("direction" in (value as object)) {
        coerceObject(value, undefined, ["direction", "color"]);
        const obj = value as Readonly<{ direction: unknown, color: unknown }>;
        return {
            color: coerceColor(obj.color),
            direction: coerceVector(obj.direction)
        };
    }
    else if ("point" in (value as object)) {
        coerceObject(value, undefined, ["point", "radius", "color"]);
        const obj = value as Readonly<{ point: unknown, radius: unknown, color: unknown }>;
        return {
            color: coerceColor(obj.color),
            radius: coerceNumber(obj.radius, undefined, 0, 65535),
            point: coerceVector(obj.point)
        };
    }
    else {
        coerceObject(value, undefined, ["color"]);
        return {
            color: coerceColor((value as any).color)
        };
    }
}

function coerceCameraView(value: unknown | undefined, defaultValue: CameraView | undefined = undefined): CameraView {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as CameraView;
    }
    coerceObject(value, undefined, ["up", "forward", "eye"]);
    return {
        up: coerceVector((value as any).up),
        forward: coerceVector((value as any).forward),
        eye: coerceVector((value as any).eye)
    };
}

function coerceCameraProjection(value: unknown | undefined, defaultValue: CameraProjection | undefined = undefined): CameraProjection {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as CameraProjection;
    }
    coerceObject(value, undefined, ["kind", "horizontalFov", "verticalFov", "scale"], ["kind"]);
    if ((value as any).kind === "perspective") {
        coerceObject(value, undefined, ["kind", "horizontalFov", "verticalFov"], []);
        const obj = value as object;
        if ("horizontalFov" in obj && "verticalFov" in obj) {
            throw new Error("Only one of horizontalFov and verticalFov can be specified.");
        }
        if ("horizontalFov" in obj) {
            return {
                kind: "perspective",
                horizontalFov: coerceNumber((obj as any).horizontalFov, 90, 10, 170)
            };
        }
        else if ("verticalFov" in obj) {
            return {
                kind: "perspective",
                verticalFov: coerceNumber((obj as any).verticalFov, 60, 10, 170)
            };
        }
        else {
            return {
                kind: "perspective",
                verticalFov: 60
            };
        }
    } else {
        coerceObject(value, undefined, ["kind", "scale"]);
        if ((value as any).kind !== "orthographic") {
            throw new Error("Unknown camera projection kind.");
        }
        return {
            kind: "orthographic",
            scale: coerceNumber((value as any).scale, 1, 0, 65535)
        };
    }
}

function coerceCamera(value: unknown | undefined, defaultValue: Camera | undefined = undefined): Camera {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as Camera;
    }
    coerceObject(value, ["view", "projection"]);
    return {
        view: coerceCameraView((value as any).view),
        projection: coerceCameraProjection((value as any).projection),
    };
}

function coerceKeyframed<TValue>(value: unknown | undefined, coerceSimpleValue: (value: unknown) => TValue, defaultValue: Keyframed<TValue> | undefined = undefined): Keyframed<TValue> {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as Keyframed<TValue>;
    }
    if (isObject(value) && "time" in (value as object) && "value" in (value as object)) {
        coerceObject(value, ["time", "value"]);
        return {
            value: coerceSimpleValue((value as any).value),
            time: coerceNumber((value as any).time, undefined, 0, 60 * 60 * 24)
        };
    }
    else {
        return coerceSimpleValue(value);
    }
}

function coerceName(value: unknown | undefined, defaultValue: string | undefined = undefined): string {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as string;
    }
    if (!isString(value)) {
        throw new Error("Expected a string.");
    }
    if (!new RegExp("^[\w]+$").test(value as string)) { // TODO improve regex
        throw new Error("Invalid name format.");
    }
    return value as string;
}

function coerceEnum<TEnum>(value: unknown | undefined, entries: TEnum[], defaultValue: string | undefined = undefined): TEnum {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as TEnum;
    }
    if (!isString(value)) {
        throw new Error("Expected a string.");
    }
    if (entries.indexOf(value as TEnum) === -1) {
        throw new Error(`Expected one of ${entries}.`);
    }
    return value as TEnum;
}

function coerceScene(value: unknown | undefined, defaultValue: Scene | undefined = undefined): Scene {
    value = coerceValue(value, defaultValue);
    if (value === defaultValue) {
        return value as Scene;
    }
    coerceObject(value, undefined, ["fillColor", "strokeColor", "strokeWidth", "lights", "camera", "fit", "polygons", "cullOccluded", "cullBackFaces", "name", "anchorPoint"], ["camera", "polygons"]);
    const obj = value as any;
    const scene: Scene = {
        anchorPoint: coerceKeyframed<Vector>(obj.anchorPoint, coerceVector, [0, 0, 0]),
        camera: coerceKeyframed<Camera>(obj.camera, coerceCamera),
        cullBackFaces: coerceBoolean(obj.cullBackFaces, true),
        cullOccluded: coerceBoolean(obj.cullOccluded, true),
        fillColor: coerceKeyframed(obj.fillColor, coerceColor, [1, 1, 1]),
        strokeColor: coerceKeyframed(obj.fillColor, coerceColor, [0, 0, 0]),
        strokeWidth: coerceNumber(obj.strokeWidth, 10, 0, 65535),
        fit: coerceEnum<FitMode>(obj.fit, ["width", "height", "max", "min"], "min"),
        lights: coerceArray(obj.lights, [{ color: { r: 0.8, g: 0.8, b: 0.8 } }]).map(l => coerceKeyframed<Light>(l, coerceLight)),
        polygons: coerceArray(obj.polygons).map(p => coerceKeyframed<Polygon>(p, sp => coerceArray(sp).map(coerceVector))),
        name: coerceName(obj.name, "My 3D scene")
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