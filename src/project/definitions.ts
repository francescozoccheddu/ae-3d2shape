import { deg2rad } from "../geometry/utils";
import doing from "../utils/doing";
import { ReturnType } from "../utils/polyfills";
import { coerceCamera, coerceColor, coerceFov, coerceLight, coerceLights, coercePolygon, coercePolygons, coerceProjection, coerceRadius, coerceScale, coerceScene, coerceThickness, coerceVector, coerceVertices, coerceView } from "./coerceProject";
import { coerceEnum, coerceObject, coerceString, isArray, isObject, isString, prop } from "./fundamentals";

const coerceFuncs = {
    camera: coerceCamera,
    color: coerceColor,
    fov: coerceFov,
    light: coerceLight,
    lights: coerceLights,
    polygon: coercePolygon,
    polygons: coercePolygons,
    projection: coerceProjection,
    radius: coerceRadius,
    scale: coerceScale,
    scene: coerceScene,
    thickness: coerceThickness,
    vector: coerceVector,
    vertices: coerceVertices,
    view: coerceView
} as const;

type DefType = keyof typeof coerceFuncs;

type DefValue<TType extends DefType> = ReturnType<typeof coerceFuncs[TType]>;

type DefOf<TType extends DefType> = {
    readonly type: TType;
    readonly value: DefValue<TType>;
};

export interface Defs {
    get<TType extends DefType>(type: TType, key: string): DefValue<TType>;
};

type Def = DefOf<DefType>;

type DefDict = {
    [key: string]: Def
};

class ConcreteDefs implements Defs {

    _defs: Readonly<DefDict>;

    constructor(defs: Readonly<DefDict>) {
        this._defs = defs;
    }

    get<TType extends DefType>(type: TType, key: string): DefValue<TType> {
        if (!(key in this._defs)) {
            throw new Error(`No definition with key "${key}".`);
        }
        const def = this._defs[key];
        if (def.type != type) {
            throw new Error(`Definition "${key}" has type "${def.type}", not "${type}".`);
        }
        return def.value as DefValue<TType>;
    }

}

class SymbolicDef {

    readonly key: string;
    readonly type: DefType;

    constructor(key: string, type: DefType) {
        this.key = key;
        this.type = type;
    }

}

class SymbolicDefs implements Defs {

    constructor() { }

    get<TType extends DefType>(type: TType, key: string): DefValue<TType> {
        return new SymbolicDef(key, type) as unknown as DefValue<TType>;
    }

}

const refPattern = new RegExp("^\$[a-zA-Z0-9\-_]+$");

export function isRef(value: unknown): value is string {
    if (isString(value)) {
        return refPattern.test(value);
    }
    return false;
}

function coerceDefinition(value: unknown, defs: Defs): Def {
    const obj = coerceObject(value, ["value", "type"] as const);
    const type = coerceEnum<DefType[]>(value, Object.keys(coerceFuncs));
    return {
        type,
        value: prop(obj, "value", v => {
            if (isRef(v)) {
                throw new Error("Definition value cannot be a direct reference.");
            }
            return coerceFuncs[type](v, defs);
        })
    };
}

function coerceDefinitions(value: unknown, defs: Defs): DefDict {
    const obj = coerceObject(value);
    const dict: DefDict = {};
    for (const key of Object.keys(obj)) {
        doing(`parsing definition "${key}"`, () => {
            coerceString(key, refPattern);
            dict[key] = coerceDefinition(obj[key], defs);
        });
    }
    return dict;
}

function replaceSymbolicDefinitions(dict: Readonly<DefDict>): Defs {
    const defs = new ConcreteDefs(dict);
    const queue: object[] = [dict];
    while (queue.length > 0) {
        const obj = queue.pop()! as any;
        if (isObject(obj)) {
            for (const key of Object.keys(obj)) {
                const value = obj[key] as any;
                if (value instanceof SymbolicDef) {
                    (obj as any)[key] = defs.get(value.type, value.key);
                }
                else {
                    queue.push(value);
                }
            }
        }
        else if (isArray(obj)) {
            for (let i = 0; i < obj.length; i++) {
                const value = obj[i];
                if (value instanceof SymbolicDef) {
                    obj[i] = defs.get(value.type, value.key);
                }
                else {
                    queue.push(value);
                }
            }
        }
    }
    return defs;
}

export function buildDefinitions(value: unknown): Defs {
    let dict: DefDict = {}
    if (value !== undefined) {
        dict = coerceDefinitions(value, new SymbolicDefs());
    }
    dict = {
        ... {
            "$defaultProjection": {
                type: "projection",
                value: {
                    kind: "perspective",
                    fovRad: deg2rad(60)
                }
            },
            "$defaultLightColor": {
                type: "color",
                value: [1, 1, 1]
            },
            "$defaultPolygonColor": {
                type: "color",
                value: [1, 1, 1]
            },
            "$defaultProjectionScale": {
                type: "scale",
                value: 1
            },
            "$defaultProjectionFov": {
                type: "fov",
                value: deg2rad(60)
            },
            "$defaultStrokeColor": {
                type: "color",
                value: [0, 0, 0]
            },
            "$defaultStrokeThickness": {
                type: "thickness",
                value: 10
            },
            "$defaultLights": {
                type: "lights",
                value: [{
                    kind: "ambient",
                    color: [1, 1, 1]
                }]
            },
            "$defaultAnchorPoint": {
                type: "vector",
                value: [0, 0, 0]
            }
        },
        ...dict
    };
    return replaceSymbolicDefinitions(dict);
}