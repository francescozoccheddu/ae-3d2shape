import { RVec3 } from "../geometry/rvec";

export type Keyframe<TValue> = {
    readonly time: number,
    readonly value: TValue
};

export type Keyframed<TValue> = Keyframe<TValue>[];

export type Color = readonly [number, number, number];

export type Polygon = readonly RVec3[];

export type Polygons = readonly Polygon[];

export type LightKind = "point" | "ambient" | "directional";

export type AmbientLight = {
    readonly color: Color,
    readonly kind: "ambient";
};

export type DirectionalLight = {
    readonly direction: RVec3,
    readonly color: Color
    readonly kind: "directional";
};

export type PointLight = {
    readonly point: RVec3,
    readonly radius: number,
    readonly color: Color
    readonly kind: "point";
}

export type Light = DirectionalLight | PointLight | AmbientLight;

export type CameraProjectionKind = "orthographic" | "perspective";

export type OrthographicCameraProjection = {
    readonly scale: number,
    readonly kind: "orthographic"
};

export type PerspectiveCameraProjection = {
    readonly fovRad: number
    readonly kind: "perspective";
};

export type CameraProjection = OrthographicCameraProjection | PerspectiveCameraProjection;

export type CameraView = {
    readonly up: RVec3,
    readonly forward: RVec3,
    readonly eye: RVec3
};

export type Camera = {
    readonly view: CameraView,
    readonly projection: CameraProjection
};

export type FitMode = "width" | "height" | "min" | "max";

export type Size = {
    readonly width: number,
    readonly height: number
};

export type Scene = {
    readonly fillColor: Keyframed<Color>,
    readonly strokeColor: Keyframed<Color>,
    readonly strokeWidth: Keyframed<number>,
    readonly camera: Keyframed<Camera>,
    readonly lights: readonly Keyframed<Light>[],
    readonly polygons: Keyframed<Polygons>,
    readonly name: string,
    readonly cullOccluded: boolean,
    readonly cullBackFaces: boolean,
    readonly anchorPoint: Keyframed<RVec3>,
    readonly fit: FitMode,
    readonly size: Size,
    readonly extraRefreshes: number[]
};